"""
Episode Coordinator: Orchestrates game phases, rooms, and agents.
"""
import asyncio
from typing import Dict, List, Optional, Any
from .state_machine import EpisodeStateMachine, Phase
from .turn_manager import TurnManager
from .admin_handler import AdminCommandHandler
from ..agents.host_agent import HostAgent
from ..agents.housemate import HousemateAgent
from ..agents.saboteur import SaboteurController
from ..tasks.budget_task import BudgetTask

class EpisodeCoordinator:
    def __init__(
        self,
        switch_client: Any,
        host_agent: HostAgent,
        housemates: List[HousemateAgent],
        saboteur_controller: SaboteurController,
        budget_task: BudgetTask,
        human_player_id: str = "human",
        auto_pacing: bool = True
    ):
        self.switch_client = switch_client
        self.host = host_agent
        self.housemates = housemates
        self.housemate_by_id = {h.agent_id: h for h in housemates}
        self.saboteur_ctrl = saboteur_controller
        self.budget_task = budget_task
        self.human_id = human_player_id
        self.auto_pacing = auto_pacing

        self.state_machine = EpisodeStateMachine()
        self.turn_manager = TurnManager(list(self.housemate_by_id.keys()))
        self.admin_handler = AdminCommandHandler(self)

        # Rooms
        self.public_room = "living-room"
        self.saboteur_den = "saboteur-den"
        self.confession_rooms: Dict[str, str] = {}
        self.evicted_lounge = "evicted-lounge"

    async def setup_rooms(self):
        """
        Creates all required rooms with proper Switch room-level isolation.
        """
        all_contestant_ids = list(self.housemate_by_id.keys()) + [self.human_id]
        self.state_machine.set_active_players(all_contestant_ids)

        # 1. Public #living-room
        public_members = [self.host.agent_id] + all_contestant_ids
        await self.switch_client.create_room(self.public_room, public_members, "The House Living Room")

        # 2. Isolated #saboteur-den (Host + Saboteur ONLY)
        sab_members = [self.host.agent_id, self.saboteur_ctrl.saboteur_id]
        await self.switch_client.create_room(self.saboteur_den, sab_members, "Secret Saboteur Mission Den")

        # 3. Isolated #confession-<player> (Host + Player ONLY)
        for pid in all_contestant_ids:
            c_room = f"confession-{pid}"
            self.confession_rooms[pid] = c_room
            await self.switch_client.create_room(c_room, [self.host.agent_id, pid], f"Confession Room: {pid}")

        # 4. Isolated #evicted-lounge (Host only initially)
        await self.switch_client.create_room(self.evicted_lounge, [self.host.agent_id], "Evicted Lounge")

    async def run_episode(self):
        """
        Runs the full 5-phase episode loop.
        """
        await self.setup_rooms()

        # Phase 1: Briefing
        await self.advance_phase()

        # Phase 2: Task Debate
        await self.advance_phase()

        # Phase 3: Leak & Evaluation
        await self.advance_phase()

        # Phase 4: Confession Nominations
        await self.advance_phase()

        # Phase 5: Eviction Ceremony
        await self.advance_phase()

    async def advance_phase(self) -> Phase:
        new_phase = self.state_machine.advance_phase()
        
        if new_phase == Phase.BRIEFING:
            await self._run_briefing()
        elif new_phase == Phase.TASK:
            await self._run_task_phase()
        elif new_phase == Phase.LEAK:
            await self._run_leak_phase()
        elif new_phase == Phase.CONFESSION:
            await self._run_confession_phase()
        elif new_phase == Phase.EVICTION:
            await self._run_eviction_phase()

        return new_phase

    async def _run_briefing(self):
        # Host announces briefing in #living-room and pings Saboteur in #saboteur-den
        await self.host.announce_briefing(
            public_room=self.public_room,
            saboteur_den=self.saboteur_den,
            saboteur_id=self.saboteur_ctrl.saboteur_id
        )
        # Saboteur formulates internal plan in #saboteur-den
        await self.saboteur_ctrl.formulate_sabotage_plan(self.saboteur_den)

    async def _run_task_phase(self):
        self.turn_manager.reset_turns()
        # Each active AI housemate debates in #living-room
        for hm in self.housemates:
            if hm.agent_id in self.state_machine.active_players:
                await hm.debate_task(self.public_room)
                self.turn_manager.record_speech(hm.agent_id)
                if self.auto_pacing:
                    await asyncio.sleep(0.5)

    async def _run_leak_phase(self):
        # Determine items submitted
        # Saboteur's subtle effect: includes high-cost luxury or drops staples
        chosen_items = [
            "flour_rice", "lentils_dal", "oil_spices", # essentials
            "whey_protein",       # Marcus obsession (250)
            "imported_espresso",  # Elena obsession (200)
            "spa_salts",          # Maya obsession (200)
            "wifi_pass",          # Arthur luxury (250) -> Total 1,250! (Busted!)
        ]
        self.state_machine.submitted_budget_items = chosen_items
        await self.host.evaluate_budget_and_leak(self.public_room, chosen_items)

    async def _run_confession_phase(self):
        # Summon each active housemate to their private confession room
        for hm in self.housemates:
            if hm.agent_id in self.state_machine.active_players:
                c_room = self.confession_rooms.get(hm.agent_id)
                if c_room:
                    await self.host.summon_confession(hm.agent_id, c_room)
                    nomination_response = await hm.cast_nomination_confession(
                        c_room, self.state_machine.active_players
                    )
                    # Record nomination
                    # Extract nominee from text or pick opposite personality
                    nominee = "arthur" if hm.agent_id in ("marcus", "maya") else "marcus"
                    await self.host.record_nomination(hm.agent_id, nominee, nomination_response)
                    if self.auto_pacing:
                        await asyncio.sleep(0.5)

    async def _run_eviction_phase(self):
        res = await self.host.execute_eviction(
            public_room=self.public_room,
            saboteur_id=self.saboteur_ctrl.saboteur_id
        )
        evicted = res["evicted_player"]
        if evicted in self.state_machine.active_players:
            self.state_machine.active_players.remove(evicted)
            self.state_machine.evicted_players.append(evicted)
            if hasattr(self.switch_client, "add_member"):
                await self.switch_client.add_member(self.evicted_lounge, evicted)

    async def trigger_leak(self):
        await self.host.speak(
            self.public_room,
            "🚨 **[ADMIN LEAK]** The Big Voice exposes: One of you has been secretly plotting treason in the corridors!"
        )

    async def reset(self):
        self.state_machine.reset()
        await self.setup_rooms()

