"""
BlindCouncil Coordinator: Orchestrates RFC reviews across isolated blind chambers,
synthesizes conflicts, facilitates human-in-the-loop debates, and generates ADRs.
"""
import asyncio
import os
from enum import Enum
from typing import Dict, List, Optional, Any
from ..review.models import RFCProposal, AuditScorecard, ConflictReport
from ..agents.chair_agent import ChairAgent
from ..agents.specialist import SpecialistAgent

class CouncilPhase(Enum):
    INIT = "init"
    SUBMISSION = "submission"
    BLIND_AUDIT = "blind_audit"
    CONFLICT_SYNTHESIS = "conflict_synthesis"
    COUNCIL_DEBATE = "council_debate"
    ADR_PUBLICATION = "adr_publication"
    COMPLETED = "completed"

class CouncilCoordinator:
    def __init__(
        self,
        switch_client: Any,
        chair_agent: ChairAgent,
        specialists: List[SpecialistAgent],
        rfc_proposal: RFCProposal,
        human_player_id: str = "human",
        human_player_name: str = "LeadArchitect",
        auto_pacing: bool = True
    ):
        self.switch_client = switch_client
        self.chair = chair_agent
        self.specialists = specialists
        self.specialist_by_id = {s.agent_id: s for s in specialists}
        self.rfc = rfc_proposal
        self.human_id = human_player_id
        self.human_name = human_player_name
        self.auto_pacing = auto_pacing

        self.current_phase = CouncilPhase.INIT
        self.user_decisions: List[Dict[str, str]] = []
        self.review_finished_event = asyncio.Event()

        # Channel mapping
        self.public_room = "review-desk"
        self.blind_rooms = {
            "security": "audit-security",
            "scalability": "audit-scalability",
            "finops": "audit-finops"
        }

        # Register message listener if client supports it (e.g. Discord Live Client)
        if hasattr(self.switch_client, "register_human_message_handler"):
            self.switch_client.register_human_message_handler(self.handle_human_message)

    async def setup_rooms(self):
        """
        Provisions Discord channels / Switch rooms with strict isolation.
        """
        all_participants = [self.chair.agent_id] + list(self.specialist_by_id.keys()) + [self.human_id]
        
        # 1. Public #review-desk
        await self.switch_client.create_room(
            self.public_room,
            all_participants,
            "BlindCouncil Engineering Review Desk"
        )

        # 2. Isolated Blind Audit Chambers (Specialist + Chair ONLY)
        for sid, room_id in self.blind_rooms.items():
            await self.switch_client.create_room(
                room_id,
                [self.chair.agent_id, sid],
                f"Blind Architectural Audit Chamber: {sid.upper()}"
            )

    async def run_review(self):
        """
        Executes full 5-phase Delphi architectural review.
        """
        await self.setup_rooms()

        # Phase 1: Intake
        await self.advance_phase()

        # Phase 2: Isolated Blind Audits
        await self.advance_phase()

        # Phase 3: Conflict Synthesis
        await self.advance_phase()

        # Phase 4: Council Debate in #review-desk
        await self.advance_phase()

        # Phase 5: ADR Generation & Publication
        await self.advance_phase()

    async def advance_phase(self) -> CouncilPhase:
        if self.current_phase == CouncilPhase.INIT:
            self.current_phase = CouncilPhase.SUBMISSION
            await self._run_submission_phase()
        elif self.current_phase == CouncilPhase.SUBMISSION:
            self.current_phase = CouncilPhase.BLIND_AUDIT
            await self._run_blind_audit_phase()
        elif self.current_phase == CouncilPhase.BLIND_AUDIT:
            self.current_phase = CouncilPhase.CONFLICT_SYNTHESIS
            await self._run_conflict_synthesis_phase()
        elif self.current_phase == CouncilPhase.CONFLICT_SYNTHESIS:
            self.current_phase = CouncilPhase.COUNCIL_DEBATE
            await self._run_council_debate_phase()
        elif self.current_phase == CouncilPhase.COUNCIL_DEBATE:
            self.current_phase = CouncilPhase.ADR_PUBLICATION
            await self._run_adr_publication_phase()
        else:
            self.current_phase = CouncilPhase.COMPLETED

        return self.current_phase

    async def _run_submission_phase(self):
        await self.chair.announce_rfc_intake(self.public_room, self.rfc)
        if self.auto_pacing:
            await asyncio.sleep(2)

    async def _run_blind_audit_phase(self):
        # Dispatch audit tasks to isolated rooms simultaneously
        tasks = []
        for sid, specialist in self.specialist_by_id.items():
            room_id = self.blind_rooms[sid]
            tasks.append(self._run_single_blind_audit(specialist, room_id))

        scorecards = await asyncio.gather(*tasks)
        for sc in scorecards:
            await self.chair.record_scorecard(sc)

        if self.auto_pacing:
            await asyncio.sleep(2)

    async def _run_single_blind_audit(self, specialist: SpecialistAgent, room_id: str) -> AuditScorecard:
        return await specialist.conduct_blind_audit(room_id, self.rfc)

    async def _run_conflict_synthesis_phase(self):
        self.chair.detect_conflicts()
        if self.auto_pacing:
            await asyncio.sleep(1)

    async def _run_council_debate_phase(self):
        # Reveal blind findings in #review-desk
        await self.chair.publish_synthesis_and_open_debate(self.public_room, self.rfc)

        # Allow specialists to voice short statements in #review-desk
        for s in self.specialists:
            if s.agent_id == "security":
                await s.speak(self.public_room, "🛡️ **Aegis:** I cannot approve this RFC without strict token revocation guarantees. In-band heartbeat refresh is an unacceptable security hole.")
            elif s.agent_id == "scalability":
                await s.speak(self.public_room, "⚡ **Vanguard:** Aegis, synchronous DB lookups on 100k WebSockets will spike p99 latency past 80ms! We should use a Redis Bloom filter instead.")
            elif s.agent_id == "finops":
                await s.speak(self.public_room, "💰 **Ledger:** Both of you are overlooking the $3,500/mo Redis cluster. 12 shards is compute waste. We can scale from 4 shards safely and save $25k/yr.")
            if self.auto_pacing:
                await asyncio.sleep(1.5)

        # Allow time for human lead to chat / resolve (up to 45s or until !approve / !next)
        if self.auto_pacing:
            for _ in range(45):
                if self.current_phase != CouncilPhase.COUNCIL_DEBATE:
                    break
                await asyncio.sleep(1)

    async def _run_adr_publication_phase(self):
        await self.chair.generate_and_publish_adr(
            public_room=self.public_room,
            rfc=self.rfc,
            human_author=self.human_name,
            user_decisions=self.user_decisions
        )

    async def handle_human_message(self, room_name: str, author_id: str, author_name: str, content: str):
        """
        Handles real-time human comments and commands from Discord.
        """
        text = content.strip()

        # Commands
        if text.startswith("!next") or text.startswith("!approve"):
            await self.chair.speak(self.public_room, f"📝 **[COUNCIL ACTION]** Lead Architect @{author_name} signaled approval. Finalizing ADR...")
            await self.advance_phase()
            return

        if text.startswith("!status"):
            await self.chair.speak(room_name, f"ℹ️ **Current Phase:** `{self.current_phase.value}` | **RFC:** `{self.rfc.title}`")
            return

        # Discussion in #review-desk
        if "review-desk" in room_name:
            # Deliver to specialists
            content_lower = text.lower()
            if any(k in content_lower for k in ["security", "aegis", "token", "hsm", "encrypt"]):
                await self.specialist_by_id["security"].speak(
                    self.public_room,
                    f"🛡️ **Aegis:** Understood, @{author_name}. As long as token revocation is checked via Redis Bloom filter, I will sign off."
                )
            elif any(k in content_lower for k in ["cost", "ledger", "budget", "save", "redis", "node"]):
                await self.specialist_by_id["finops"].speak(
                    self.public_room,
                    f"💰 **Ledger:** Excellent call, @{author_name}. Downsizing to 4 nodes with auto-sharding protects the annual cloud budget."
                )
            elif any(k in content_lower for k in ["scale", "latency", "vanguard", "speed", "p99"]):
                await self.specialist_by_id["scalability"].speak(
                    self.public_room,
                    f"⚡ **Vanguard:** Agreed, @{author_name}. A 4-node Redis cluster with Bloom filters keeps p99 under 15ms effortlessly."
                )
            else:
                await self.chair.speak(
                    self.public_room,
                    f"🏛️ **Athena:** Lead input recorded: *\"{text}\"*. Resolving architectural conflicts accordingly."
                )
