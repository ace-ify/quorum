"""
Base Agent with strictly isolated room memory.
"""
import asyncio
from typing import Dict, List, Optional, Any
from ..llm.client import LLMClient

class BaseAgent:
    def __init__(
        self,
        agent_id: str,
        name: str,
        role: str,
        system_prompt: str,
        switch_client: Any,
        llm_client: LLMClient,
        avatar_url: Optional[str] = None
    ):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.system_prompt = system_prompt
        self.switch_client = switch_client
        self.llm_client = llm_client
        self.avatar_url = avatar_url or ""
        
        # Isolated memory buffers: room_id -> list of message events
        self.room_histories: Dict[str, List[dict]] = {}

    def on_event_received(self, event: dict):
        """
        Receives an event from Switch.
        Crucial: Switch only sends events for rooms this agent belongs to!
        """
        room_id = event.get("room_id")
        if room_id:
            if room_id not in self.room_histories:
                self.room_histories[room_id] = []
            self.room_histories[room_id].append({
                "sender": event.get("sender_id"),
                "content": event.get("content", ""),
            })

    async def speak(self, room_id: str, content: str):
        """
        Posts message to a room via Switch.
        """
        if hasattr(self.switch_client, "post_message"):
            # Check whether signature takes agent_id first (Live) or sender_id (Mock)
            if hasattr(self.switch_client, "delivered_events"):
                await self.switch_client.post_message(self.agent_id, room_id, content)
            else:
                await self.switch_client.post_message(self.agent_id, room_id, content)

    async def generate_thought(self, room_id: str, context_notes: str = "", phase: str = "") -> str:
        """
        Builds prompt exclusively from this room's isolated memory and calls LLM.
        """
        history = self.room_histories.get(room_id, [])
        sys_prompt = self.system_prompt
        if context_notes:
            sys_prompt += f"\n[CURRENT CONTEXT]\n{context_notes}"

        response = await self.llm_client.generate_response(
            system_prompt=sys_prompt,
            messages=history,
            character_id=self.agent_id,
            phase=phase,
        )
        return response

