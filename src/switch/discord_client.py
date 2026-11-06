"""
Discord Client for The House Imposter.
Handles automatic channel provisioning, private permission-enforced rooms,
webhooks for individual character identities (avatars + names), and a live Gateway WebSocket
for real-time interactive human player participation.
"""
import os
import json
import asyncio
import aiohttp
import websockets
from typing import Dict, List, Optional, Any, Callable

class DiscordLiveClient:
    API_BASE = "https://discord.com/api/v10"
    GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json"

    def __init__(
        self,
        bot_token: Optional[str] = None,
        guild_id: Optional[str] = None,
        human_user_id: Optional[str] = None,
    ):
        self.bot_token = bot_token or os.getenv("DISCORD_BOT_TOKEN")
        self.guild_id = guild_id or os.getenv("DISCORD_GUILD_ID")
        self.human_user_id = human_user_id or os.getenv("HUMAN_USER_ID")
        self.bot_user_id: Optional[str] = None

        self.headers = {
            "Authorization": f"Bot {self.bot_token}",
            "Content-Type": "application/json"
        }
        self.session: Optional[aiohttp.ClientSession] = None
        
        # room_name -> channel_id
        self.channel_ids: Dict[str, str] = {}
        # channel_id -> room_name
        self.channel_names: Dict[str, str] = {}
        # room_name -> webhook_url
        self.webhooks: Dict[str, str] = {}
        # agent_id -> character info
        self.agent_profiles: Dict[str, dict] = {}
        # room_id -> set of members
        self.room_members: Dict[str, set] = {}

        # Human message listeners: Callable[[room_name, author_id, author_name, content], Any]
        self.human_message_handlers: List[Callable[[str, str, str, str], Any]] = []

        # Background tasks
        self._gw_task: Optional[asyncio.Task] = None
        self._heartbeat_task: Optional[asyncio.Task] = None
        self._ws = None
        self._running = False

    async def initialize(self):
        if not self.session:
            self.session = aiohttp.ClientSession(headers=self.headers)
            await self._fetch_bot_identity()
            await self._discover_existing_channels()

    async def _fetch_bot_identity(self):
        try:
            async with self.session.get(f"{self.API_BASE}/users/@me") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    self.bot_user_id = data.get("id")
        except Exception as e:
            print(f"[DiscordLiveClient] Could not fetch bot user info: {e}")

    async def close(self):
        self._running = False
        if self._gw_task:
            self._gw_task.cancel()
        if self._heartbeat_task:
            self._heartbeat_task.cancel()
        if self._ws:
            await self._ws.close()
        if self.session:
            await self.session.close()

    async def _discover_existing_channels(self):
        """Discovers existing channels in the guild to avoid duplicate creation."""
        url = f"{self.API_BASE}/guilds/{self.guild_id}/channels"
        async with self.session.get(url) as resp:
            if resp.status == 200:
                channels = await resp.json()
                for ch in channels:
                    name = ch.get("name", "")
                    cid = ch.get("id", "")
                    if ch.get("type") == 0: # text channel
                        self.channel_ids[name] = cid
                        self.channel_names[cid] = name

    def register_character_profile(self, agent_id: str, name: str, avatar_url: str):
        self.agent_profiles[agent_id] = {
            "name": name,
            "avatar_url": avatar_url
        }

    def register_human_message_handler(self, handler: Callable[[str, str, str, str], Any]):
        self.human_message_handlers.append(handler)

    async def create_room(self, room_id: str, members: List[str], topic: str = "") -> dict:
        """
        Creates a Discord text channel. If private, restricts access to specified members.
        """
        await self.initialize()
        self.room_members[room_id] = set(members)

        clean_name = room_id.lower().replace("#", "").replace(" ", "-")

        # Check if channel already exists
        if clean_name not in self.channel_ids:
            payload: Dict[str, Any] = {
                "name": clean_name,
                "type": 0, # Text channel
                "topic": topic
            }

            # BlindCouncil private chambers (#audit-* and #dev-*) are strictly locked
            is_private = ("audit" in clean_name or "dev" in clean_name or "blind" in clean_name or "confession" in clean_name)
            if is_private:
                # Deny VIEW_CHANNEL (1024) to @everyone
                overwrites = [
                    {
                        "id": self.guild_id,
                        "type": 0, # role (@everyone)
                        "deny": "1024",
                        "allow": "0"
                    }
                ]

                # Explicitly allow Bot
                if self.bot_user_id:
                    overwrites.append({
                        "id": self.bot_user_id,
                        "type": 1, # member
                        "allow": "3072", # VIEW_CHANNEL | SEND_MESSAGES
                        "deny": "0"
                    })

                # If confession room is for Human, grant Human access!
                if "confession-human" in clean_name and self.human_user_id:
                    overwrites.append({
                        "id": self.human_user_id,
                        "type": 1, # member
                        "allow": "3072", # VIEW_CHANNEL | SEND_MESSAGES
                        "deny": "0"
                    })

                payload["permission_overwrites"] = overwrites

            url = f"{self.API_BASE}/guilds/{self.guild_id}/channels"
            async with self.session.post(url, json=payload) as resp:
                if resp.status in (200, 201):
                    ch_data = await resp.json()
                    cid = ch_data["id"]
                    self.channel_ids[clean_name] = cid
                    self.channel_names[cid] = clean_name
                else:
                    err = await resp.text()
                    print(f"[DiscordLiveClient] Failed to create channel #{clean_name}: {err}")

        # Ensure webhook exists for channel
        cid = self.channel_ids.get(clean_name)
        if cid:
            self.channel_names[cid] = clean_name
            if clean_name not in self.webhooks:
                await self._ensure_webhook(clean_name, cid)

        return {"room_id": clean_name, "channel_id": cid}

    async def _ensure_webhook(self, room_name: str, channel_id: str):
        """Fetches or creates a webhook for character-based posting."""
        wh_url = f"{self.API_BASE}/channels/{channel_id}/webhooks"
        async with self.session.get(wh_url) as resp:
            if resp.status == 200:
                hooks = await resp.json()
                if hooks:
                    self.webhooks[room_name] = hooks[0]["url"]
                    return

        # Create new webhook if none exist
        async with self.session.post(wh_url, json={"name": f"House-{room_name}"}) as resp:
            if resp.status in (200, 201):
                hook = await resp.json()
                self.webhooks[room_name] = hook["url"]

    async def post_message(self, agent_id: str, room_id: str, content: str) -> dict:
        """
        Posts message via Discord Webhook using character's custom name and avatar.
        """
        await self.initialize()
        clean_name = room_id.lower().replace("#", "").replace(" ", "-")
        webhook_url = self.webhooks.get(clean_name)

        profile = self.agent_profiles.get(agent_id, {
            "name": agent_id.capitalize(),
            "avatar_url": f"https://api.dicebear.com/7.x/bottts/svg?seed={agent_id}"
        })

        if webhook_url:
            payload = {
                "username": profile["name"],
                "avatar_url": profile["avatar_url"],
                "content": content
            }
            async with self.session.post(webhook_url, json=payload) as resp:
                return {"status": resp.status, "content": content}
        else:
            cid = self.channel_ids.get(clean_name)
            if cid:
                send_url = f"{self.API_BASE}/channels/{cid}/messages"
                msg_payload = {"content": f"**{profile['name']}**: {content}"}
                async with self.session.post(send_url, json=msg_payload) as resp:
                    return {"status": resp.status, "content": content}

        return {"error": "channel_not_found"}

    # =========================================================================
    # Real-Time Discord Gateway WebSocket Listener for Human Player Messages
    # =========================================================================

    def start_gateway(self):
        """Starts background WebSocket gateway task."""
        if not self._gw_task or self._gw_task.done():
            self._running = True
            self._gw_task = asyncio.create_task(self._gateway_loop())

    async def _gateway_loop(self):
        while self._running:
            try:
                async with websockets.connect(self.GATEWAY_URL) as ws:
                    self._ws = ws
                    # Step 1: Receive Hello
                    hello = json.loads(await ws.recv())
                    heartbeat_interval = hello["d"]["heartbeat_interval"] / 1000.0
                    
                    if self._heartbeat_task:
                        self._heartbeat_task.cancel()
                    self._heartbeat_task = asyncio.create_task(self._heartbeat_loop(ws, heartbeat_interval))

                    # Step 2: Identify
                    identify_payload = {
                        "op": 2,
                        "d": {
                            "token": self.bot_token,
                            "intents": 37377, # GUILDS | GUILD_MESSAGES | DIRECT_MESSAGES | MESSAGE_CONTENT
                            "properties": {
                                "os": "windows",
                                "browser": "the-house",
                                "device": "the-house"
                            }
                        }
                    }
                    await ws.send(json.dumps(identify_payload))

                    # Step 3: Listen for Dispatches
                    async for raw in ws:
                        data = json.loads(raw)
                        op = data.get("op")
                        t = data.get("t")
                        d = data.get("d")

                        if op == 0 and t == "MESSAGE_CREATE" and d:
                            author = d.get("author", {})
                            is_bot = author.get("bot", False)
                            # Ignore messages posted by bots / webhooks
                            if not is_bot:
                                cid = d.get("channel_id")
                                room_name = self.channel_names.get(cid, "unknown")
                                author_id = author.get("id", "")
                                author_name = author.get("username", "Human")
                                content = d.get("content", "").strip()

                                # Dispatch to registered handlers
                                for handler in self.human_message_handlers:
                                    try:
                                        res = handler(room_name, author_id, author_name, content)
                                        if asyncio.iscoroutine(res):
                                            await res
                                    except Exception as e:
                                        print(f"[DiscordGateway] Error in message handler: {e}")

            except asyncio.CancelledError:
                break
            except Exception as e:
                # Gateway reconnect backoff
                await asyncio.sleep(3)

    async def _heartbeat_loop(self, ws, interval: float):
        try:
            while self._running:
                await asyncio.sleep(interval)
                await ws.send(json.dumps({"op": 1, "d": None}))
        except asyncio.CancelledError:
            pass
        except Exception:
            pass
