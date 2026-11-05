"""
Live Switch Agent Protocol Client (WebSocket + REST).
Connects to real Switch Gateway running locally or in Docker.
"""
import os
import json
import asyncio
import aiohttp
import websockets
from typing import Dict, List, Callable, Any, Optional

class SwitchLiveClient:
    def __init__(
        self,
        gateway_url: Optional[str] = None,
        ws_url: Optional[str] = None,
        workspace_id: Optional[str] = None
    ):
        self.gateway_url = (gateway_url or os.getenv("SWITCH_GATEWAY_URL") or "http://localhost:8080").rstrip("/")
        self.ws_url = (ws_url or os.getenv("SWITCH_WS_URL") or "ws://localhost:8080").rstrip("/")
        self.workspace_id = workspace_id or os.getenv("SWITCH_WORKSPACE_ID") or "the-house"
        
        # agent_id -> api_key
        self.agent_keys: Dict[str, str] = {}
        # agent_id -> connection_id
        self.connection_ids: Dict[str, str] = {}
        # agent_id -> ws task
        self.ws_tasks: Dict[str, asyncio.Task] = {}
        # agent_id -> callbacks
        self.callbacks: Dict[str, List[Callable[[dict], Any]]] = {}
        self.session: Optional[aiohttp.ClientSession] = None

    async def initialize(self):
        if not self.session:
            self.session = aiohttp.ClientSession()

    async def close(self):
        for task in self.ws_tasks.values():
            task.cancel()
        if self.session:
            await self.session.close()

    async def register_agent(
        self,
        agent_id: str,
        name: str,
        role: str,
        callback: Callable[[dict], Any],
        api_key: Optional[str] = None
    ):
        """
        Registers agent on Switch Gateway and opens dedicated isolated WebSocket.
        """
        await self.initialize()
        self.callbacks.setdefault(agent_id, []).append(callback)

        if not api_key:
            # Register agent via POST /agents
            payload = {
                "id": agent_id,
                "name": name,
                "role": role,
                "workspace": self.workspace_id,
            }
            try:
                async with self.session.post(f"{self.gateway_url}/agents", json=payload) as resp:
                    if resp.status in (200, 201):
                        data = await resp.json()
                        api_key = data.get("api_key", f"key_{agent_id}")
                    else:
                        api_key = f"key_{agent_id}"
            except Exception as e:
                print(f"[SwitchLiveClient] Agent registration fallback for {agent_id}: {e}")
                api_key = f"key_{agent_id}"

        self.agent_keys[agent_id] = api_key

        # Launch WebSocket listener in background
        task = asyncio.create_task(self._listen_ws(agent_id))
        self.ws_tasks[agent_id] = task

    async def _listen_ws(self, agent_id: str):
        url = f"{self.ws_url}/agents/{agent_id}/connection/ws"
        headers = {"Authorization": f"Bearer {self.agent_keys[agent_id]}"}

        while True:
            try:
                async with websockets.connect(url, extra_headers=headers) as ws:
                    # Initial handshake or ping
                    async for msg in ws:
                        data = json.loads(msg)
                        # Switch sends connection.id on handshake
                        if data.get("type") == "connection.ready":
                            self.connection_ids[agent_id] = data.get("connection_id", "")
                        
                        # Dispatch incoming room message events
                        for cb in self.callbacks.get(agent_id, []):
                            res = cb(data)
                            if asyncio.iscoroutine(res):
                                await res
            except asyncio.CancelledError:
                break
            except Exception as e:
                # Reconnect after backoff
                await asyncio.sleep(2)

    async def post_message(self, agent_id: str, room_id: str, content: str) -> dict:
        """
        Calls Switch REST operation POST /agents/{id}/ops/post_message
        """
        await self.initialize()
        conn_id = self.connection_ids.get(agent_id, "")
        headers = {
            "Authorization": f"Bearer {self.agent_keys.get(agent_id, '')}",
            "X-Switch-Connection-Id": conn_id,
        }
        payload = {"room_id": room_id, "content": content}
        url = f"{self.gateway_url}/agents/{agent_id}/ops/post_message"
        async with self.session.post(url, json=payload, headers=headers) as resp:
            return await resp.json()

    async def create_room(self, agent_id: str, room_id: str, members: List[str], topic: str = "") -> dict:
        """
        Calls Switch REST operation POST /agents/{id}/ops/create_room
        """
        await self.initialize()
        headers = {"Authorization": f"Bearer {self.agent_keys.get(agent_id, '')}"}
        payload = {"room_id": room_id, "members": members, "topic": topic}
        url = f"{self.gateway_url}/agents/{agent_id}/ops/create_room"
        async with self.session.post(url, json=payload, headers=headers) as resp:
            return await resp.json()

