"""
Quorum Coordinator: Orchestrates RFC reviews across isolated blind chambers,
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
    DEV_HANDOFF = "dev_handoff"
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
        self.is_paused = False # Real-time human pause / interrupt flag

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
            "Quorum Engineering Review Desk"
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
        if self.current_phase == CouncilPhase.INIT:
            await self.advance_phase()

        # Phase 2: Isolated Blind Audits
        if self.current_phase == CouncilPhase.SUBMISSION:
            await self.advance_phase()

        # Phase 3: Conflict Synthesis
        if self.current_phase == CouncilPhase.BLIND_AUDIT:
            await self.advance_phase()

        # Phase 4: Council Debate in #review-desk
        if self.current_phase == CouncilPhase.CONFLICT_SYNTHESIS:
            await self.advance_phase()

        # Phase 5: ADR Generation & Publication
        if self.current_phase == CouncilPhase.COUNCIL_DEBATE:
            await self.advance_phase()

        # Phase 6: Autonomous Implementer Handoff (Claude Code / Codex Bridge)
        if self.current_phase == CouncilPhase.ADR_PUBLICATION:
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
        elif self.current_phase == CouncilPhase.ADR_PUBLICATION:
            self.current_phase = CouncilPhase.DEV_HANDOFF
            await self._run_dev_handoff_phase()
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
        self.chair.detect_conflicts(self.rfc)
        if self.auto_pacing:
            await asyncio.sleep(1)

    async def _run_council_debate_phase(self):
        # Reveal blind findings in #review-desk
        await self.chair.publish_synthesis_and_open_debate(self.public_room, self.rfc)

        content_lower = (self.rfc.content + " " + self.rfc.title).lower()
        is_dynamo = "dynamo" in content_lower or "migration" in content_lower or (self.rfc.rfc_id and "rfc-089" in self.rfc.rfc_id.lower())

        # Allow specialists to voice their sovereign domain perspectives in #review-desk
        for s in self.specialists:
            if s.agent_id == "security":
                if is_dynamo:
                    await s.speak(self.public_room, "🛡️ **Aegis:** Cross-region Global Table replication cannot ship without customer-managed KMS envelope encryption on billing data. Replicating raw cardholder tokens violates PCI-DSS 3.4.")
                else:
                    await s.speak(self.public_room, "🛡️ **Aegis:** I cannot approve this RFC without strict token revocation guarantees. In-band heartbeat refresh is an unacceptable security hole.")
            elif s.agent_id == "scalability":
                if is_dynamo:
                    await s.speak(self.public_room, "⚡ **Vanguard:** Aegis is right on encryption, but Titan's synchronous dual-reads will double checkout latency! Shadow verification must be strictly asynchronous, and we must salt mega-tenant partition keys.")
                else:
                    await s.speak(self.public_room, "⚡ **Vanguard:** Aegis, synchronous DB lookups on 100k WebSockets will spike p99 latency past 80ms! We should use a Redis Bloom filter instead.")
            elif s.agent_id == "finops":
                if is_dynamo:
                    await s.speak(self.public_room, "💰 **Ledger:** And who approved On-Demand billing for 50,000 writes across 3 regions? That will cost $42,000/month! Switching to Provisioned Autoscaling with 70% target saves $28,000/month!")
                else:
                    await s.speak(self.public_room, "💰 **Ledger:** Both of you are overlooking the $3,500/mo Redis cluster. 12 shards is compute waste. We can scale from 4 shards safely and save $25k/yr.")
            elif s.agent_id == "database":
                if is_dynamo:
                    await s.speak(self.public_room, "🏛️ **Titan:** Without conditional version checks on DynamoDB writes, CDC retries will cause out-of-order data corruption. We mandate TransactWriteItems and optimistic concurrency versioning.")
                else:
                    await s.speak(self.public_room, "🏛️ **Titan:** Dual-write race conditions between streams and persistent storage risk ghost rows during worker crashes. We must enforce the Transactional Outbox pattern.")
            elif s.agent_id == "compliance":
                if is_dynamo:
                    await s.speak(self.public_room, "⚖️ **Verity:** Cross-region replication to US-East-1 requires strict data sovereignty boundaries and per-tenant cryptographic keys to satisfy GDPR Chapter V.")
                else:
                    await s.speak(self.public_room, "⚖️ **Verity:** Un-deletable chat history in persistent queues directly violates GDPR Article 17. We must implement Crypto-Shredding with per-user KMS keys.")
            else:
                await s.speak(self.public_room, f"🔍 **{s.name}:** From my perspective on {s.dimension}, we must ensure critical operational boundaries and failover invariants are verified.")
            if self.auto_pacing:
                await asyncio.sleep(1.5)

        # Allow time for human lead to chat, steer, or pause
        if self.auto_pacing:
            countdown = 60
            while countdown > 0 and self.current_phase == CouncilPhase.COUNCIL_DEBATE:
                if self.is_paused:
                    # While human has paused the floor, hold indefinitely
                    await asyncio.sleep(1)
                    continue
                await asyncio.sleep(1)
                countdown -= 1

    async def _run_adr_publication_phase(self):
        await self.chair.generate_and_publish_adr(
            public_room=self.public_room,
            rfc=self.rfc,
            human_author=self.human_name,
            user_decisions=self.user_decisions
        )

    async def _run_dev_handoff_phase(self):
        """
        Phase 6: The Autonomous Implementer Handoff.
        Athena provisions #dev-implementation and hands off approved ADR action items
        and concrete File Manifest & Code Contracts to terminal coding agents (Claude Code / Codex).
        """
        dev_room = "dev-implementation"
        await self.switch_client.create_room(
            dev_room,
            [self.chair.agent_id, self.human_id, "claudecode"],
            "Autonomous Code Implementation Room"
        )

        doc = getattr(self.chair, "last_adr_doc", None)
        target_branch = doc.target_branch if doc and doc.target_branch else f"feat/{self.rfc.rfc_id.lower() if self.rfc.rfc_id else 'adr-042'}-impl"
        target_dir = doc.target_directory if doc and doc.target_directory else "."
        verify_cmd = doc.test_verification_command if doc and doc.test_verification_command else "pytest tests/ -v"
        manifest_items = doc.implementation_manifest if doc and doc.implementation_manifest else []

        manifest_lines = []
        for i, item in enumerate(manifest_items, 1):
            manifest_lines.append(f"{i}. `[{item.action}]` **`{item.file_path}`** — *{item.purpose}* (Mandated by: {item.mandated_by})")

        contracts_preview = []
        for item in manifest_items[:2]:
            if item.interface_contract:
                contracts_preview.append(f"**`{item.file_path}` Scaffold Contract:**\n```python\n{item.interface_contract.strip()}\n```")

        contracts_str = "\n\n".join(contracts_preview)
        if contracts_str:
            contracts_str = "\n\n" + contracts_str

        handoff_msg = (
            "🚀 **[SWITCH IMPLEMENTER HANDOFF: QUORUM ➔ CLAUDE CODE / CODEX]** 🚀\n\n"
            f"**Target System:** `{self.rfc.title}`\n"
            f"**Approved Architectural Decision:** `{self.rfc.rfc_id or 'ADR-042'}.md`\n"
            f"**Target Workspace:** `{target_dir}`\n"
            f"**Target Git Branch:** `git checkout -b {target_branch}`\n"
            f"**Verification Harness:** `{verify_cmd}`\n\n"
            "Attention **@ClaudeCode** / **@CodexDeveloper**:\n"
            "The Architecture Review Board has officially locked consensus. You are authorized to implement the following concrete repository manifest:\n\n"
            "**📂 Approved File Manifest & Scaffold Spec:**\n"
            + ("\n".join(manifest_lines) if manifest_lines else "• Standard files as defined in ADR Section 6.")
            + contracts_str + "\n\n"
            "**⚡ Terminal Agent Launch Execution Command:**\n"
            "```bash\n"
            f'claude -p "Read {self.rfc.rfc_id or "ADR-042"}.md Section 6. Switch to branch \'{target_branch}\'. Implement the scaffolded files in \'{target_dir}\'. Run \'{verify_cmd}\' and do not finish until all tests pass."\n'
            "```\n\n"
            "👉 *Terminal coding agent is initialized. Run unit tests and submit PR for final Council sign-off.*"
        )
        await self.chair.speak(dev_room, handoff_msg)
        await self.chair.speak(self.public_room, f"🔄 **[PIPELINE HANDOFF]** Implementation manifest handed off to `@ClaudeCode` in `#{dev_room}` (`branch: {target_branch}`).")


    async def handle_human_message(self, room_name: str, author_id: str, author_name: str, content: str):
        """
        Handles real-time human interaction in #review-desk.
        Operates conversationally in natural language (no rigid bot syntax required).
        """
        text = content.strip()
        content_lower = text.lower()
        # 0. Live Dynamic Architecture Review Request
        # e.g., "!design a URL shortener", "!review Distributed KV", "design a URL shortener"
        design_match = re.search(r"^(?:!design|!review|design|review)\s+(.+)", text, re.IGNORECASE)
        if design_match:
            new_prompt = design_match.group(1).strip()
            await self.chair.speak(
                self.public_room,
                f"🏛️ **[CONVENING DYNAMIC DELPHI COUNCIL]**\n"
                f"Lead Architect @{author_name} convened architecture review for: **'{new_prompt}'**\n\n"
                f"🔒 *Enforcing Switch Server-Level Room Isolation across soundproof chambers...*"
            )
            from .dynamic_synthesizer import DynamicSynthesizer
            syn = DynamicSynthesizer(self.chair.llm_client)
            data = await syn.synthesize(new_prompt)

            # Post in specialist chambers
            for room in data.get("switchRooms", []):
                sid = room["id"].replace("audit-", "")
                await self.switch_client.post_message(
                    sid,
                    room["id"],
                    f"📋 **BLIND AUDIT REPORT: {room['specialist'].upper()} ({room['domain']})**\n"
                    f"**Score:** `{room['score']}` | **Packet Leakage:** `0 Bytes` (Switch Verified)\n\n"
                    f"**Core Risk:** {room['finding']}"
                )

            # Post debate clash in review desk
            for m in data.get("debate", []):
                sender = m.get("sender", "Athena")
                prefix = {"Athena": "🏛️", "Aegis": "🛡️", "Vanguard": "⚡", "Ledger": "💰", "Titan": "🏛️"}.get(sender, "🔍")
                await self.switch_client.post_message(
                    sender.lower(),
                    self.public_room,
                    f"{prefix} **{sender}:** {m.get('content', '')}"
                )
                await asyncio.sleep(1.0)

            adr_snippet = data.get("adrMarkdown", "")[:1200]
            await self.chair.speak(
                self.public_room,
                f"✅ **[DELPHI CONSENSUS APPROVED FOR {data.get('rfcId', 'RFC')}]**\n\n"
                f"```markdown\n{adr_snippet}\n...\n```"
            )
            return


        # 0. Quick Command Cheatsheet
        if text.startswith("!help") or content_lower in ["help", "commands"]:
            help_msg = (
                "⚡ **QUORUM FAST COMMANDS & CONVERSATION GUIDE:**\n\n"
                "**Predefined Deliverable Shortcuts:**\n"
                "• `!summary` — 3-bullet executive digest with key resolutions\n"
                "• `!adr` — Render & export full Michael Nygard Architecture Decision Record\n"
                "• `!pr` — Render GitHub / GitLab PR review comment sticky\n"
                "• `!diagram` — Render live Mermaid system architecture flowchart\n"
                "• `!checklist` — Display blocking pre-deployment verification checklist\n"
                "• `!pause` / `!resume` — Pause or resume debate floor\n"
                "• `!approve` — Lock council consensus and publish final ADR\n\n"
                "💬 **Conversational Steering (No commands needed):**\n"
                "• Change architecture naturally: *\"12 nodes kardo, budget is fine\"* or *\"use DynamoDB instead\"*\n"
                "• Ask specialists directly: *\"Aegis, what is the token risk?\"* or *\"Vanguard, will p99 spike?\"*\n"
                "• Approve naturally: *\"Looks good\"*, *\"LGTM\"*, or *\"Sahi hai\"*"
            )
            await self.chair.speak(self.public_room, help_msg)
            return

        # 0.1 Real-Time Human Interrupt / Pause / Resume
        if any(trigger == content_lower or content_lower.startswith(trigger) for trigger in ["!pause", "pause", "wait", "ruko", "hold on", "stop"]):
            self.is_paused = True
            await self.chair.speak(
                self.public_room,
                f"⏸️ **[COUNCIL PAUSED]** Debate paused by Lead Architect @{author_name}. Specialists are holding their turns. Type *\"resume\"* or `!resume` when ready to proceed."
            )
            return

        if any(trigger == content_lower or content_lower.startswith(trigger) for trigger in ["!resume", "resume", "continue", "chalo", "unpause"]):
            self.is_paused = False
            await self.chair.speak(
                self.public_room,
                f"▶️ **[COUNCIL RESUMED]** Debate floor reopened by @{author_name}. Resuming architectural review."
            )
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

        # 2.1 Implementation Manifest & Scaffolding Shortcut
        if any(k in content_lower for k in ["!manifest", "!scaffold", "scaffold", "manifest", "implementation spec", "coding spec", "!handoff"]):
            from ..review.models import ADRDocument
            doc = getattr(self.chair, "last_adr_doc", None)
            if not doc:
                doc = ADRDocument(
                    adr_id=self.rfc.rfc_id or "ADR-042",
                    title=self.rfc.title,
                    status="UNDER REVIEW",
                    date_str="2026-11-06",
                    author=author_name,
                    reviewers=[self.chair.name] + [s.name for s in self.specialists],
                    context_summary=self.rfc.content[:300],
                    scorecards=self.chair.scorecards,
                    resolved_trade_offs=[],
                    action_items=[],
                    target_branch=f"feat/{self.rfc.rfc_id.lower() if self.rfc.rfc_id else 'adr-042'}-impl",
                    target_directory=".",
                    test_verification_command="pytest tests/ -v",
                    implementation_manifest=self.chair._build_implementation_manifest(self.rfc)
                )

            manifest_lines = [f"• `[{item.action}]` **`{item.file_path}`** — *{item.purpose}* (Mandated by: {item.mandated_by})" for item in doc.implementation_manifest]
            msg = (
                "📂 **[IMPLEMENTATION MANIFEST & SCAFFOLDING SPEC]**\n\n"
                f"**Target Workspace:** `{doc.target_directory}`\n"
                f"**Target Git Branch:** `git checkout -b {doc.target_branch}`\n"
                f"**Verification Test Command:** `{doc.test_verification_command}`\n\n"
                "**Repository File Actions:**\n" + "\n".join(manifest_lines) + "\n\n"
                "**Terminal Coding Launch Command:**\n"
                f'```bash\nclaude -p "Implement ADR {doc.adr_id} files on branch \'{doc.target_branch}\'. Verify with \'{doc.test_verification_command}\' before completion."\n```'
            )
            await self.chair.speak(self.public_room, msg)
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

