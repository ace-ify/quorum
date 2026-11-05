"""
Discord Client for The House Imposter.
Handles automatic channel provisioning, private permission-enforced rooms,
webhooks for individual character identities (avatars + names), and live chat gateway.
"""
import os
import json
import asyncio
import aiohttp
from typing import Dict, List, Optional, Any, Callable

class DiscordLiveClient:
    API_BASE = "https://discord.com/api/v10"

    def __init__(
        self,
        bot_token: Optional[str] = None,
        guild_id: Optional[str] = None
    ):
        self.bot_token = bot_token or os.getenv("DISCORD_BOT_TOKEN")
        self.guild_id = guild_id or os.getenv("DISCORD_GUILD_ID")
        self.headers = {
            "Authorization": f"Bot {self.bot_token}",
            "Content-Type": "application/json"
        }
        self.session: Optional[aiohttp.ClientSession] = None
        
        # room_name -> channel_id
        self.channel_ids: Dict[str, str] = {}
        # room_name -> webhook_url
        self.webhooks: Dict[str, str] = {}
        # agent_id -> character info
        self.agent_profiles: Dict[str, dict] = {}
        # room_id -> set of members
        self.room_members: Dict[str, set] = {}

        # Message listeners
        self.message_callbacks: List[Callable[[dict], Any]] = []

    async def initialize(self):
        if not self.session:
            self.session = aiohttp.ClientSession(headers=self.headers)
            await self._discover_existing_channels()

    async def close(self):
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

    def register_character_profile(self, agent_id: str, name: str, avatar_url: str):
        self.agent_profiles[agent_id] = {
            "name": name,
            "avatar_url": avatar_url
        }

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

            is_private = ("confession" in clean_name or "saboteur" in clean_name or "alliance" in clean_name)
            if is_private:
                # Restrict permissions: @everyone role denied VIEW_CHANNEL (1024)
                everyone_role_id = self.guild_id
                payload["permission_overwrites"] = [
                    {
                        "id": everyone_role_id,
                        "type": 0, # role
                        "deny": "1024", # VIEW_CHANNEL deny
                        "allow": "0"
                    }
                ]

            url = f"{self.API_BASE}/guilds/{self.guild_id}/channels"
            async with self.session.post(url, json=payload) as resp:
                if resp.status in (200, 201):
                    ch_data = await resp.json()
                    self.channel_ids[clean_name] = ch_data["id"]
                else:
                    err = await resp.text()
                    print(f"[DiscordLiveClient] Failed to create channel #{clean_name}: {err}")

        # Ensure webhook exists for channel
        cid = self.channel_ids.get(clean_name)
        if cid and clean_name not in self.webhooks:
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
            # Fallback to direct channel send via Bot
            cid = self.channel_ids.get(clean_name)
            if cid:
                send_url = f"{self.API_BASE}/channels/{cid}/messages"
                msg_payload = {"content": f"**{profile['name']}**: {content}"}
                async with self.session.post(send_url, json=msg_payload) as resp:
                    return {"status": resp.status, "content": content}

        return {"error": "channel_not_found"}
