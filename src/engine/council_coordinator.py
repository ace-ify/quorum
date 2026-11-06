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

        # Dynamic channel mapping for all participating specialists
        self.public_room = "review-desk"
        self.blind_rooms = {s.agent_id: f"audit-{s.agent_id}" for s in self.specialists}

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
        await self.chair.announce_rfc_intake(self.public_room, self.rfc, self.specialists)
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

        # Allow specialists to voice their sovereign domain perspectives in #review-desk
        for s in self.specialists:
            if s.agent_id == "security":
                await s.speak(self.public_room, "🛡️ **Aegis:** I cannot approve this RFC without strict token revocation guarantees. In-band heartbeat refresh is an unacceptable security hole.")
            elif s.agent_id == "scalability":
                await s.speak(self.public_room, "⚡ **Vanguard:** Aegis, synchronous DB lookups on 100k WebSockets will spike p99 latency past 80ms! We should use a Redis Bloom filter instead.")
            elif s.agent_id == "finops":
                await s.speak(self.public_room, "💰 **Ledger:** Both of you are overlooking the $3,500/mo Redis cluster. 12 shards is compute waste. We can scale from 4 shards safely and save $25k/yr.")
            elif s.agent_id == "database":
                await s.speak(self.public_room, "🏛️ **Titan:** Dual-write race conditions between streams and persistent storage risk ghost rows during worker crashes. We must enforce the Transactional Outbox pattern.")
            elif s.agent_id == "compliance":
                await s.speak(self.public_room, "⚖️ **Verity:** Un-deletable chat history in persistent queues directly violates GDPR Article 17. We must implement Crypto-Shredding with per-user KMS keys.")
            else:
                await s.speak(self.public_room, f"🔍 **{s.name}:** From my perspective on {s.dimension}, we must ensure critical operational boundaries and failover invariants are verified.")
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
        Handles real-time human interaction in #review-desk.
        Operates conversationally in natural language (no rigid bot syntax required).
        """
        text = content.strip()
        content_lower = text.lower()

        # 0. Quick Command Cheatsheet
        if text.startswith("!help") or content_lower in ["help", "commands"]:
            help_msg = (
                "⚡ **BLINDCOUNCIL FAST COMMANDS & CONVERSATION GUIDE:**\n\n"
                "**Predefined Deliverable Shortcuts:**\n"
                "• `!summary` — 3-bullet executive digest with key resolutions\n"
                "• `!adr` — Render & export full Michael Nygard Architecture Decision Record\n"
                "• `!pr` — Render GitHub / GitLab PR review comment sticky\n"
                "• `!diagram` — Render live Mermaid system architecture flowchart\n"
                "• `!checklist` — Display blocking pre-deployment verification checklist\n"
                "• `!approve` — Lock council consensus and publish final ADR\n\n"
                "💬 **Conversational Steering (No commands needed):**\n"
                "• Change architecture naturally: *\"12 nodes kardo, budget is fine\"* or *\"use DynamoDB instead\"*\n"
                "• Ask specialists directly: *\"Aegis, what is the token risk?\"* or *\"Vanguard, will p99 spike?\"*\n"
                "• Approve naturally: *\"Looks good\"*, *\"LGTM\"*, or *\"Sahi hai\"*"
            )
            await self.chair.speak(self.public_room, help_msg)
            return

        # 1. Natural Approval & Decision Finalization
        # e.g., "approve", "looks good", "proceed", "sahi hai", "finalize", "!approve"
        approval_triggers = [
            "!approve", "!next", "approve", "approved", "looks good", "lgtm",
            "proceed", "sahi hai", "finalize", "done", "let's do this", "ship it", "lock it in"
        ]
        if any(trigger == content_lower or content_lower.startswith(trigger) for trigger in approval_triggers):
            await self.chair.speak(
                self.public_room,
                f"📝 **[COUNCIL CONSENSUS]** Lead Architect @{author_name} approved the architecture. Locking decisions and publishing ADR..."
            )
            await self.advance_phase()
            return

        # 2. Predefined ADR / PR Deliverable Shortcuts
        if any(k in content_lower for k in ["!adr", "export adr", "generate adr", "adr dikhao"]):
            out_file = await self.chair.generate_and_publish_adr(
                public_room=self.public_room,
                rfc=self.rfc,
                human_author=author_name,
                user_decisions=self.user_decisions
            )
            return

        if any(k in content_lower for k in ["!pr", "export pr", "github pr", "pr comment"]):
            from ..review.adr_generator import ADRGenerator
            from ..review.models import ADRDocument
            doc = ADRDocument(
                adr_id=self.rfc.rfc_id or "ADR-042",
                title=self.rfc.title,
                status="APPROVED WITH CONDITIONS",
                date_str="2026-11-06",
                author=author_name,
                reviewers=[self.chair.name] + [s.name for s in self.specialists],
                context_summary=self.rfc.content[:300],
                scorecards=self.chair.scorecards,
                resolved_trade_offs=[{"title": i.title, "resolution": i.resolution_prompt} for i in (self.chair.conflict_report.issues if self.chair.conflict_report else [])],
                action_items=["Deploy 4-node cluster with auto-scaling triggers at 75% memory.", "Integrate Bloom filter middleware.", "Enforce Customer-Managed KMS Key (CMK)."]
            )
            pr_md = ADRGenerator.render_github_pr_comment(doc)
            await self.chair.speak(self.public_room, f"💬 **GITHUB PR REVIEW COMMENT FORMAT:**\n\n```markdown\n{pr_md}\n```")
            return

        # 2. Natural Summary / Digest Request
        # e.g., "summary batao", "give me a summary", "tl;dr", "!summary"
        if any(k in content_lower for k in ["summary", "tl;dr", "tldr", "short mein", "gist", "!summary"]):
            from ..review.adr_generator import ADRGenerator
            from ..review.models import ADRDocument
            doc = ADRDocument(
                adr_id=self.rfc.rfc_id or "ADR-042",
                title=self.rfc.title,
                status="UNDER REVIEW",
                date_str="2026-11-06",
                author=author_name,
                reviewers=[self.chair.name] + [s.name for s in self.specialists],
                context_summary=self.rfc.content[:300],
                scorecards=self.chair.scorecards,
                resolved_trade_offs=[{"title": i.title, "resolution": i.resolution_prompt} for i in (self.chair.conflict_report.issues if self.chair.conflict_report else [])],
                action_items=["Verify Redis Bloom filter latency <1ms.", "Deploy Customer-Managed KMS Key (CMK).", "Configure auto-sharding triggers."]
            )
            await self.chair.speak(self.public_room, ADRGenerator.render_executive_summary(doc))
            return

        # 3. Natural Diagram / Flow Request
        # e.g., "diagram dikhao", "show architecture", "flowchart", "visualize", "!diagram"
        if any(k in content_lower for k in ["diagram", "flowchart", "architecture map", "visualize", "chart", "!diagram"]):
            from ..review.adr_generator import ADRGenerator
            from ..review.models import ADRDocument
            doc = ADRDocument(adr_id="ADR-042", title=self.rfc.title, status="", date_str="", author="", reviewers=[], context_summary="", scorecards={}, resolved_trade_offs=[], action_items=[])
            await self.chair.speak(self.public_room, f"🗺️ **SYSTEM ARCHITECTURE TOPOLOGY (Mermaid):**\n{ADRGenerator.render_mermaid_diagram(doc)}")
            return

        # 4. Natural Action Items / Checklist Request
        # e.g., "next steps", "checklist", "kya karna hai", "!checklist"
        if any(k in content_lower for k in ["checklist", "action item", "todo", "next step", "kya karna hai", "!checklist"]):
            lines = [
                "📋 **BLOCKING PRE-DEPLOYMENT ARCHITECTURAL CHECKLIST:**",
                "- [ ] Deploy 4-node cluster with auto-scaling triggers at 75% memory.",
                "- [ ] Integrate Bloom filter middleware on WebSocket heartbeat (<1ms check).",
                "- [ ] Enforce Customer-Managed KMS Key (CMK) with envelope encryption.",
                "- [ ] Configure AWS PrivateLink VPC endpoints to eliminate cross-AZ egress charges."
            ]
            await self.chair.speak(self.public_room, "\n".join(lines))
            return

        # 5. Natural Architectural Overrides & Parameter Changes (No !override command needed!)
        # e.g. "12 nodes kardo", "cost ki chinta mat karo", "deploy 12 nodes instead", "change to dynamo"
        override_triggers = [
            "change to", "kardo", "instead of", "override", "deploy 12", "use 12",
            "cost ki chinta", "budget is fine", "don't use redis", "use postgres", "prioritize speed"
        ]
        if any(trigger in content_lower for trigger in override_triggers):
            await self.chair.speak(
                self.public_room,
                f"⚡ **[ARCHITECTURAL DIRECTION RECORDED]** Lead Architect @{author_name}: *\"{text}\"*\n"
                f"🏛️ Athena: Evaluating cross-domain blast radius and notifying affected council members..."
            )
            # Evaluate ripple effect across affected domains
            if any(k in content_lower for k in ["12 node", "redis", "shard", "cluster"]):
                await self.specialist_by_id["scalability"].speak(
                    self.public_room,
                    "⚡ **Vanguard (Blast Radius):** Moving to 12 nodes increases cluster gossip overhead by ~3ms during re-sharding, but guarantees 2x peak burst buffer headroom. Accepted."
                )
                await self.specialist_by_id["security"].speak(
                    self.public_room,
                    "🛡️ **Aegis (Blast Radius):** 12 nodes expands attack surface. Inter-node Redis communication MUST enforce mutual TLS (mTLS) with rotated certificates."
                )
                if "database" in self.specialist_by_id:
                    await self.specialist_by_id["database"].speak(
                        self.public_room,
                        "🏛️ **Titan (Blast Radius):** 12 shards introduces cross-shard transaction boundaries. We must enforce hash tags on Redis keys `{tenant_id}:channel_id` to prevent multi-key split."
                    )
            elif any(k in content_lower for k in ["dynamo", "dynamodb"]):
                if "database" in self.specialist_by_id:
                    await self.specialist_by_id["database"].speak(
                        self.public_room,
                        "🏛️ **Titan (Blast Radius):** Moving to DynamoDB eliminates relational JOINs. All access patterns must be served via Single-Table partition keys."
                    )
                await self.specialist_by_id["finops"].speak(
                    self.public_room,
                    "💰 **Ledger (Blast Radius):** DynamoDB on-demand mode can spike costs during flash sales. We recommend auto-scaling provisioned capacity instead."
                )
            return

        # 6. Domain-Specific Conversational Inquiry
        # Delivers natural questions to the right specialist
        if any(k in content_lower for k in ["security", "aegis", "token", "hsm", "encrypt", "cve", "auth"]):
            await self.specialist_by_id["security"].speak(
                self.public_room,
                f"🛡️ **Aegis:** Addressing your security concern, @{author_name}: Our primary zero-trust requirement is that tokens cannot remain valid indefinitely without central revocation checks."
            )
        elif any(k in content_lower for k in ["cost", "ledger", "budget", "save", "pricing", "dollar", "$"]):
            await self.specialist_by_id["finops"].speak(
                self.public_room,
                f"💰 **Ledger:** On cloud economics, @{author_name}: By avoiding idle over-provisioning and cross-AZ egress, we protect our unit economics while maintaining room to scale."
            )
        elif any(k in content_lower for k in ["scale", "latency", "vanguard", "speed", "p99", "throughput", "rps"]):
            await self.specialist_by_id["scalability"].speak(
                self.public_room,
                f"⚡ **Vanguard:** On throughput and latency, @{author_name}: With asynchronous batch buffering, we preserve our sub-15ms p99 SLA even under sudden 25,000 msg/sec traffic bursts."
            )
        elif any(k in content_lower for k in ["database", "titan", "sql", "postgres", "table", "acid"]):
            if "database" in self.specialist_by_id:
                await self.specialist_by_id["database"].speak(
                    self.public_room,
                    f"🏛️ **Titan:** Regarding data consistency, @{author_name}: We must avoid distributed dual-writes. Idempotency keys on write streams ensure zero duplicate records during worker retries."
                )
        elif any(k in content_lower for k in ["compliance", "verity", "gdpr", "privacy", "audit"]):
            if "compliance" in self.specialist_by_id:
                await self.specialist_by_id["compliance"].speak(
                    self.public_room,
                    f"⚖️ **Verity:** Regarding regulatory posture, @{author_name}: Crypto-shredding ensures compliance with GDPR Article 17 without having to mutate immutable append-only logs."
                )
        else:
            await self.chair.speak(
                self.public_room,
                f"🏛️ **Athena:** Lead guidance noted: *\"{text}\"*. The Council is aligned and ready to steer."
            )

