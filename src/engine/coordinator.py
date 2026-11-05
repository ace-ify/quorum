"""
Episode Coordinator: Orchestrates game phases, rooms, agents,
and real-time interactive human player input.
"""
import asyncio
import random
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
        human_player_name: str = "izigriss",
        auto_pacing: bool = True
    ):
        self.switch_client = switch_client
        self.host = host_agent
        self.housemates = housemates
        self.housemate_by_id = {h.agent_id: h for h in housemates}
        self.saboteur_ctrl = saboteur_controller
        self.budget_task = budget_task
        self.human_id = human_player_id
        self.human_name = human_player_name
        self.auto_pacing = auto_pacing

        self.state_machine = EpisodeStateMachine()
        self.turn_manager = TurnManager(list(self.housemate_by_id.keys()))
        self.admin_handler = AdminCommandHandler(self)
        self.human_voted_event = asyncio.Event()

        # Rooms
        self.public_room = "living-room"
        self.saboteur_den = "saboteur-den"
        self.confession_rooms: Dict[str, str] = {}
        self.evicted_lounge = "evicted-lounge"

        # Register human message handler if supported (e.g. Discord Live Client)
        if hasattr(self.switch_client, "register_human_message_handler"):
            self.switch_client.register_human_message_handler(self.handle_human_message)

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

        # Phase 2: Task Debate & Live Human Interaction
        await self.advance_phase()

        # Phase 3: Leak & Evaluation
        await self.advance_phase()

        # Phase 4: Confession Nominations (Waiting for Human Vote)
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
        # AI housemates open the debate
        for hm in self.housemates:
            if hm.agent_id in self.state_machine.active_players:
                await hm.debate_task(self.public_room)
                self.turn_manager.record_speech(hm.agent_id)
                if self.auto_pacing:
                    await asyncio.sleep(1.0)

        # Prompt human player in Discord
        human_invite = (
            f"💬 **THE FLOOR IS OPEN FOR NEGOTIATION!** 💬\n"
            f"@{self.human_name}, you have the floor in `#living-room`! Propose items, challenge your housemates' math, "
            f"or accuse someone of sabotaging. (Type `!next` whenever you are ready to conclude the task)."
        )
        await self.host.speak(self.public_room, human_invite)

        # Allow time for human to participate (up to 45 seconds or until !next)
        if self.auto_pacing:
            for _ in range(45):
                if self.state_machine.current_phase != Phase.TASK:
                    break
                await asyncio.sleep(1)

    async def _run_leak_phase(self):
        # Default sabotage list unless human customized
        chosen_items = [
            "flour_rice", "lentils_dal", "oil_spices", # essentials
            "whey_protein",       # Marcus obsession (250)
            "imported_espresso",  # Elena obsession (200)
            "spa_salts",          # Maya obsession (200)
            "wifi_pass",          # Arthur luxury (250) -> Total 1,250! (Busted!)
        ]
        self.state_machine.submitted_budget_items = chosen_items
        await self.host.evaluate_budget_and_leak(self.public_room, chosen_items)
        if self.auto_pacing:
            await asyncio.sleep(5)

    async def _run_confession_phase(self):
        self.human_voted_event.clear()
        
        # Summon each active AI housemate to their private confession room
        for hm in self.housemates:
            if hm.agent_id in self.state_machine.active_players:
                c_room = self.confession_rooms.get(hm.agent_id)
                if c_room:
                    await self.host.summon_confession(hm.agent_id, c_room)
                    nomination_response = await hm.cast_nomination_confession(
                        c_room, self.state_machine.active_players
                    )
                    nominee = "arthur" if hm.agent_id in ("marcus", "maya") else "marcus"
                    await self.host.record_nomination(hm.agent_id, nominee, nomination_response)

        # Summon Human to #confession-human
        human_c_room = self.confession_rooms.get(self.human_id, "confession-human")
        human_summon = (
            f"🚪 **THE CONFESSION ROOM IS SUMMONING YOU** 🚪\n"
            f"@{self.human_name}, step into `#confession-human` immediately!\n"
            "Tell The Big Voice: Who do you nominate for eviction this week (Arthur, Marcus, Elena, Maya), and what is your reason?"
        )
        await self.host.speak(self.public_room, human_summon)
        await self.host.summon_confession(self.human_name, human_c_room)

        # Wait for human to vote (up to 45 seconds or until human_voted_event is set)
        if self.auto_pacing:
            try:
                await asyncio.wait_for(self.human_voted_event.wait(), timeout=45.0)
            except asyncio.TimeoutError:
                # Fallback if human didn't vote in time
                if self.human_id not in self.host.nominations:
                    await self.host.record_nomination(self.human_id, "arthur", "Automated tie-break nomination.")

    async def _run_eviction_phase(self):
        res = await self.host.execute_eviction(
            public_room=self.public_room,
            saboteur_id=self.saboteur_ctrl.saboteur_id
        )
        evicted = res["evicted_player"]
        if evicted in self.state_machine.active_players:
            self.state_machine.active_players.remove(evicted)
            self.state_machine.evicted_players.append(evicted)

    async def handle_human_message(self, room_name: str, author_id: str, author_name: str, content: str):
        """
        Handles real-time human input from Discord Gateway.
        """
        # 1. Admin Commands
        if content.startswith("!"):
            admin_reply = await self.admin_handler.handle_message(room_name, author_name, content)
            if admin_reply:
                await self.host.speak(room_name, admin_reply)
            return

        # 2. Confession Room Human Vote
        if "confession-human" in room_name:
            content_lower = content.lower()
            nominee = None
            for hid in self.housemate_by_id.keys():
                if hid in content_lower:
                    nominee = hid
                    break
            if not nominee:
                nominee = "arthur"

            await self.host.record_nomination(self.human_id, nominee, content)
            ack = (
                f"✅ **[CONFESSION RECORDED]**\n"
                f"Thank you, {author_name}. Your secret eviction vote against **{nominee.capitalize()}** has been locked into the vault.\n"
                "Return to `#living-room` for the eviction ceremony!"
            )
            await self.host.speak(room_name, ack)
            self.human_voted_event.set()
            return

        # 3. Living Room Human Chat
        if "living-room" in room_name:
            # Add message to all housemates' isolated memory of living room
            event = {
                "room_id": self.public_room,
                "sender_id": author_name,
                "content": content
            }
            for hm in self.housemates:
                hm.on_event_received(event)

            # Trigger dynamic AI response
            content_lower = content.lower()
            chosen_responder = None
            if any(k in content_lower for k in ["protein", "egg", "gym", "marcus"]):
                chosen_responder = self.housemate_by_id.get("marcus")
            elif any(k in content_lower for k in ["coffee", "espresso", "vibe", "elena"]):
                chosen_responder = self.housemate_by_id.get("elena")
            elif any(k in content_lower for k in ["math", "sum", "budget", "stats", "arthur"]):
                chosen_responder = self.housemate_by_id.get("arthur")
            elif any(k in content_lower for k in ["spa", "salt", "drama", "toxic", "maya"]):
                chosen_responder = self.housemate_by_id.get("maya")
            else:
                available = [h for h in self.housemates if self.turn_manager.can_speak(h.agent_id)]
                if available:
                    chosen_responder = random.choice(available)

            if chosen_responder and self.state_machine.current_phase == Phase.TASK:
                await asyncio.sleep(1.2)
                await chosen_responder.debate_task(
                    self.public_room,
                    context_notes=f"The human player ({author_name}) just said: '{content}'. Respond to them directly!"
                )
                self.turn_manager.record_speech(chosen_responder.agent_id)

    async def trigger_leak(self):
        await self.host.speak(
            self.public_room,
            "🚨 **[ADMIN LEAK]** The Big Voice exposes: One of you has been secretly plotting treason in the corridors!"
        )

    async def reset(self):
        self.state_machine.reset()
        await self.setup_rooms()
