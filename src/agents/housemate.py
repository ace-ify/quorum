"""
Housemate Agent implementation.
Represents autonomous contestants (Marcus, Elena, Arthur, Maya) with distinct personalities.
"""
from typing import List, Optional, Any
from .base_agent import BaseAgent

class HousemateAgent(BaseAgent):
    def __init__(
        self,
        agent_id: str,
        name: str,
        archetype: str,
        system_prompt: str,
        switch_client: Any,
        llm_client: Any,
        obsessions: Optional[List[str]] = None,
        catchphrases: Optional[List[str]] = None,
        avatar_url: Optional[str] = None
    ):
        super().__init__(
            agent_id=agent_id,
            name=name,
            role="contestant",
            system_prompt=system_prompt,
            switch_client=switch_client,
            llm_client=llm_client,
            avatar_url=avatar_url
        )
        self.archetype = archetype
        self.obsessions = obsessions or []
        self.catchphrases = catchphrases or []

    async def debate_task(self, room_id: str, context_notes: str = "") -> str:
        """
        Generates in-character debate comment about the budget task.
        """
        response = await self.generate_thought(
            room_id=room_id,
            context_notes=f"Phase: Task Debate. Defend your interests ({', '.join(self.obsessions)}). {context_notes}",
            phase="task"
        )
        await self.speak(room_id, response)
        return response

    async def cast_nomination_confession(self, confession_room: str, active_players: List[str]) -> str:
        """
        Generates secret nomination in the confession room.
        """
        candidates = [p for p in active_players if p != self.agent_id]
        context = f"Phase: Confession Nomination. Pick ONE housemate from {candidates} to evict and explain why."
        response = await self.generate_thought(
            room_id=confession_room,
            context_notes=context,
            phase="confession"
        )
        await self.speak(confession_room, response)
        return response

