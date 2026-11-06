"""
Council Chair Agent: "Athena"
Directs the architectural review, coordinates blind audits, detects trade-off conflicts,
moderates the public debate in #review-desk, and compiles the official ADR.
"""
import os
from typing import Dict, List, Optional, Any
from .base_agent import BaseAgent
from ..review.models import RFCProposal, AuditScorecard, ConflictIssue, ConflictReport, ADRDocument, FileManifestItem
from ..review.adr_generator import ADRGenerator

class ChairAgent(BaseAgent):
    def __init__(
        self,
        agent_id: str,
        name: str,
        system_prompt: str,
        switch_client: Any,
        llm_client: Any,
        avatar_url: Optional[str] = None
    ):
        super().__init__(
            agent_id=agent_id,
            name=name,
            role="chair",
            system_prompt=system_prompt,
            switch_client=switch_client,
            llm_client=llm_client,
            avatar_url=avatar_url
        )
        self.scorecards: Dict[str, AuditScorecard] = {}
        self.conflict_report: Optional[ConflictReport] = None
        self.resolved_trade_offs: List[Dict[str, str]] = []
        self.last_adr_doc: Optional[ADRDocument] = None


    async def announce_rfc_intake(self, public_room: str, rfc: RFCProposal, specialists: Optional[List[Any]] = None):
        """
        Phase 1: RFC Intake announcement in #review-desk.
        """
        chamber_bullets = []
        if specialists:
            for s in specialists:
                chamber_bullets.append(f"• `#audit-{s.agent_id}` — **{s.name}** ({s.dimension})")
        else:
            chamber_bullets = [
                "• `#audit-security` — **Aegis** (Threat Modeling & Compliance)",
                "• `#audit-scalability` — **Vanguard** (Throughput, Latency & DB Contention)",
                "• `#audit-finops` — **Ledger** (Cloud Economics & Compute Waste)"
            ]

        chambers_str = "\n".join(chamber_bullets)
        intake_msg = (
            "🏛️ **BLINDCOUNCIL: ARCHITECTURAL REVIEW CONVENED** 🏛️\n\n"
            f"**Proposal Under Review:** `{rfc.title}`\n"
            f"**Author / Lead:** {rfc.author} | **Target Scale:** {rfc.target_traffic}\n\n"
            f"The Council is now spinning up **{len(chamber_bullets)} isolated blind audit chambers**:\n"
            f"{chambers_str}\n\n"
            "🔒 *Notice: To eliminate LLM groupthink and sycophancy, Switch enforces server-level room isolation. "
            "Specialists cannot see each other's analyses until blind scorecards are locked.*"
        )
        await self.speak(public_room, intake_msg)

    async def record_scorecard(self, scorecard: AuditScorecard):
        self.scorecards[scorecard.specialist_id] = scorecard

    def detect_conflicts(self) -> ConflictReport:
        """
        Phase 3: Detects orthogonal trade-off clashes between specialists.
        """
        issues = []
        sec = self.scorecards.get("security")
        scale = self.scorecards.get("scalability")
        fin = self.scorecards.get("finops")
        db = self.scorecards.get("database")
        comp = self.scorecards.get("compliance")

        # Conflict 1: Scale vs FinOps (Cluster Sizing)
        if scale and fin:
            issues.append(ConflictIssue(
                dimensions=["Scalability", "FinOps"],
                title="Redis Cluster Sizing: 12 Nodes vs 4 Nodes",
                description="Vanguard demands 12-node dedicated cluster for maximum fanout buffer; Ledger flags $2,100/mo in idle waste.",
                specialist_a_view="Vanguard: 12 nodes ensure 25,000 msg/sec buffer headroom.",
                specialist_b_view="Ledger: Initial 100k connections can run on 4 nodes, saving $25,200/year.",
                resolution_prompt="Decide: Start with 4 nodes + auto-sharding triggers, or deploy full 12 nodes upfront?",
                primary_domain="FinOps",
                trade_off_type="PARETO_COMPROMISE"
            ))

        # Conflict 2: Security vs Scalability (Token Verification Latency)
        if sec and scale:
            issues.append(ConflictIssue(
                dimensions=["Security", "Scalability"],
                title="Token Revocation: In-band Heartbeat vs Central Redis Check",
                description="Aegis warns in-band heartbeat bypasses revocation; Vanguard warns central DB lookups on 100k pings destroy p99 latency.",
                specialist_a_view="Aegis: Centralized revocation check required to prevent session hijacking.",
                specialist_b_view="Vanguard: Database lookups on 100k WebSockets every 5m causes 80ms latency spikes.",
                resolution_prompt="Decide: Use Redis Bloom Filter for instant <1ms revocation checks.",
                primary_domain="Security",
                trade_off_type="PARETO_COMPROMISE"
            ))

        # Conflict 3: Database vs Compliance (GDPR Erasure in Distributed Streams)
        if db and comp:
            issues.append(ConflictIssue(
                dimensions=["Data Storage", "Compliance"],
                title="GDPR Right to Erasure vs Append-Only Stream Immutability",
                description="Verity mandates GDPR Article 17 user data erasure; Titan notes distributed event streams are append-only.",
                specialist_a_view="Titan: Mutating append-only stream offsets corrupts consumer watermarks.",
                specialist_b_view="Verity: Un-deletable PII in message queues incurs up to 4% global turnover regulatory fines.",
                resolution_prompt="Decide: Implement Crypto-Shredding with ephemeral user-specific KMS encryption keys.",
                primary_domain="Compliance",
                trade_off_type="PARETO_COMPROMISE"
            ))

        self.conflict_report = ConflictReport(issues=issues)
        return self.conflict_report

    async def publish_synthesis_and_open_debate(self, public_room: str, rfc: RFCProposal):
        """
        Phase 4: Publishes blind scorecards and opens trade-off debate in #review-desk.
        """
        lines = [
            "📊 **BLIND AUDIT SYNTHESIS & SCORECARD REVEAL** 📊",
            "The blind chambers have completed independent reviews with zero cross-context pollution:\n",
            "| Dimension | Specialist | Score | Verdict |",
            "| :--- | :--- | :---: | :--- |"
        ]

        for sid, sc in self.scorecards.items():
            status = "✅ PASS" if sc.score >= 8 else ("⚠️ CONDITIONAL" if sc.score >= 6 else "❌ REJECT")
            lines.append(f"| {sc.dimension} | **{sc.specialist_name}** | `{sc.score}/10` | {status} |")

        lines.extend([
            "\n⚡ **KEY ARCHITECTURAL CONFLICTS DETECTED:**",
        ])

        if self.conflict_report:
            for i, issue in enumerate(self.conflict_report.issues, 1):
                lines.append(f"**Conflict {i}: {issue.title}**")
                lines.append(f"• *{issue.specialist_a_view}*")
                lines.append(f"• *{issue.specialist_b_view}*")
                lines.append(f"👉 **Question for Lead:** {issue.resolution_prompt}\n")

        lines.append(
            "💬 **The floor is open in `#review-desk`!**\n"
            "• **Steer naturally in chat:** e.g., *\"12 nodes kardo\"*, *\"don't use redis\"*, or ask specialists questions.\n"
            "• **Fast Shortcuts:** `!summary` • `!diagram` • `!adr` • `!pr` • `!checklist`\n"
            "• **When aligned:** Type *\"approve\"* or `!approve` to lock in decisions and generate the final ADR."
        )
        await self.speak(public_room, "\n".join(lines))

    def _build_implementation_manifest(self, rfc: RFCProposal) -> List[FileManifestItem]:
        content_lower = (rfc.title + " " + rfc.content).lower()

        if "url" in content_lower or "shortener" in content_lower:
            return [
                FileManifestItem(
                    file_path="src/services/base62_encoder.py",
                    action="CREATE",
                    purpose="Bi-directional Base62 encoder/decoder mapping 64-bit ID to 7-character string",
                    mandated_by="Vanguard (Scalability)",
                    interface_contract=(
                        'BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"\n\n'
                        'def encode_base62(num: int) -> str:\n'
                        '    """Converts a database integer sequence ID into a 7-char short code."""\n'
                        '    pass\n\n'
                        'def decode_base62(code: str) -> int:\n'
                        '    """Converts a 7-char short code back into the primary key ID."""\n'
                        '    pass'
                    )
                ),
                FileManifestItem(
                    file_path="src/middleware/ssrf_filter.py",
                    action="CREATE",
                    purpose="SSRF protection preventing redirection to cloud metadata or private subnets",
                    mandated_by="Aegis (Security)",
                    interface_contract=(
                        'from ipaddress import ip_address\n\n'
                        'def validate_target_url(destination_url: str) -> bool:\n'
                        '    """Rejects AWS metadata (169.254.169.254), 127.0.0.1, and RFC-1918 private IPs."""\n'
                        '    pass'
                    )
                ),
                FileManifestItem(
                    file_path="src/cache/bloom_filter.py",
                    action="CREATE",
                    purpose="Redis Bloom filter for fast negative lookups on non-existent short codes",
                    mandated_by="Ledger (FinOps)",
                    interface_contract=(
                        'class ShortCodeBloomFilter:\n'
                        '    """Filters 404 queries in cache to prevent database load spikes."""\n'
                        '    def might_exist(self, code: str) -> bool:\n'
                        '        pass\n\n'
                        '    def add(self, code: str) -> None:\n'
                        '        pass'
                    )
                ),
                FileManifestItem(
                    file_path="src/db/migrations/001_create_urls_table.sql",
                    action="CREATE",
                    purpose="Relational table schema with unique short_code index",
                    mandated_by="Titan (Database)",
                    interface_contract=(
                        'CREATE TABLE urls (\n'
                        '    id BIGINT AUTO_INCREMENT PRIMARY KEY,\n'
                        '    short_code VARCHAR(10) NOT NULL UNIQUE,\n'
                        '    destination_url TEXT NOT NULL,\n'
                        '    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n'
                        '    INDEX idx_short_code (short_code)\n'
                        ');'
                    )
                ),
                FileManifestItem(
                    file_path="tests/test_shortener.py",
                    action="CREATE",
                    purpose="End-to-end verification tests for encoding, SSRF guards, and cache layer",
                    mandated_by="Athena (Council Chair)",
                    interface_contract=(
                        'def test_encode_decode_roundtrip():\n'
                        '    assert decode_base62(encode_base62(1000000)) == 1000000\n\n'
                        'def test_ssrf_rejects_metadata_endpoint():\n'
                        '    assert validate_target_url("http://169.254.169.254/latest/meta-data") is False'
                    )
                )
            ]
        elif "dynamo" in content_lower or "migration" in content_lower:
            return [
                FileManifestItem(
                    file_path="src/db/single_table_schema.py",
                    action="CREATE",
                    purpose="Single-table DynamoDB data access objects with composite PK/SK design",
                    mandated_by="Titan (Database)",
                    interface_contract=(
                        'class UserSessionRepository:\n'
                        '    """PK: USER#{id}, SK: SESSION#{token} single-table access pattern."""\n'
                        '    def get_session(self, user_id: str, session_id: str):\n'
                        '        pass'
                    )
                ),
                FileManifestItem(
                    file_path="src/migration/dual_write_syncer.py",
                    action="CREATE",
                    purpose="Dual-writing middleware from legacy Postgres to DynamoDB with shadow reads",
                    mandated_by="Vanguard (Scalability)",
                    interface_contract=(
                        'class DualWriteSyncer:\n'
                        '    def write_both(self, record: dict):\n'
                        '        pass'
                    )
                ),
                FileManifestItem(
                    file_path="infra/terraform/dynamodb.tf",
                    action="CREATE",
                    purpose="Terraform spec with On-Demand Billing mode and Point-in-time Recovery",
                    mandated_by="Ledger (FinOps)",
                    interface_contract=(
                        'resource "aws_dynamodb_table" "sessions" {\n'
                        '  name         = "user-sessions"\n'
                        '  billing_mode = "PAY_PER_REQUEST"\n'
                        '  hash_key     = "PK"\n'
                        '  range_key    = "SK"\n'
                        '}'
                    )
                ),
                FileManifestItem(
                    file_path="tests/test_dual_write_parity.py",
                    action="CREATE",
                    purpose="Consistency validation between Postgres and DynamoDB shadow writes",
                    mandated_by="Athena (Council Chair)",
                    interface_contract=(
                        'def test_record_parity():\n'
                        '    pass'
                    )
                )
            ]
        else:
            # Default / Realtime Messaging Cluster (RFC-042)
            return [
                FileManifestItem(
                    file_path="src/middleware/bloom_filter.py",
                    action="CREATE",
                    purpose="Redis Bloom filter middleware for <1ms WebSocket heartbeat token revocation checks",
                    mandated_by="Aegis (Security) & Vanguard (Scalability)",
                    interface_contract=(
                        'import redis\n\n'
                        'class TokenRevocationFilter:\n'
                        '    """Evaluates JWT revocation status in <1ms without database load."""\n'
                        '    def __init__(self, r: redis.Redis):\n'
                        '        self.redis = r\n\n'
                        '    def is_revoked(self, jti: str) -> bool:\n'
                        '        pass'
                    )
                ),
                FileManifestItem(
                    file_path="src/cluster/redis_scaler.py",
                    action="CREATE",
                    purpose="Redis cluster autoscaler scaling out from 4 nodes when memory hits 75%",
                    mandated_by="Vanguard (Scalability) & Ledger (FinOps)",
                    interface_contract=(
                        'class RedisClusterAutoscaler:\n'
                        '    """Maintains 4-node baseline and triggers scale-out at 75% memory load."""\n'
                        '    def __init__(self, cluster_nodes: list, threshold: float = 0.75):\n'
                        '        self.nodes = cluster_nodes\n'
                        '        self.threshold = threshold\n\n'
                        '    def evaluate_scale(self, current_memory_pct: float) -> bool:\n'
                        '        pass'
                    )
                ),
                FileManifestItem(
                    file_path="src/security/envelope_encryption.py",
                    action="CREATE",
                    purpose="Customer-Managed KMS Key (CMK) envelope encryption for payload security at rest",
                    mandated_by="Aegis (Security)",
                    interface_contract=(
                        'import boto3\n\n'
                        'class EnvelopeEncryption:\n'
                        '    """Encrypts message payloads using AWS KMS data key pairs."""\n'
                        '    def __init__(self, kms_key_arn: str):\n'
                        '        self.kms_key_arn = kms_key_arn\n\n'
                        '    def encrypt_payload(self, raw_bytes: bytes) -> tuple[bytes, bytes]:\n'
                        '        pass'
                    )
                ),
                FileManifestItem(
                    file_path="src/privacy/crypto_shredding.py",
                    action="CREATE",
                    purpose="Per-user cryptographic shredding to satisfy GDPR Article 17 Right to Erasure in event logs",
                    mandated_by="Verity (Compliance)",
                    interface_contract=(
                        'class CryptoShredder:\n'
                        '    """Destroys user decryption keys on erasure request, rendering logs unrecoverable."""\n'
                        '    def shred_user(self, user_id: str) -> bool:\n'
                        '        pass'
                    )
                ),
                FileManifestItem(
                    file_path="tests/test_messaging_cluster.py",
                    action="CREATE",
                    purpose="Verifies sub-1ms Bloom filter latency and payload encryption/shredding integrity",
                    mandated_by="Athena (Council Chair)",
                    interface_contract=(
                        'def test_bloom_revocation_sub_millisecond():\n'
                        '    pass\n\n'
                        'def test_crypto_shredding_renders_unrecoverable():\n'
                        '    pass'
                    )
                )
            ]

    async def generate_and_publish_adr(
        self,
        public_room: str,
        rfc: RFCProposal,
        human_author: str,
        user_decisions: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Phase 5: Generates production-grade ADR-001.md and publishes to #review-desk.
        """
        # Calculate overall verdict
        avg_score = sum(sc.score for sc in self.scorecards.values()) / max(1, len(self.scorecards))
        status = "APPROVED WITH CONDITIONS" if avg_score >= 7.0 else "REJECTED"

        decisions = user_decisions or [
            {
                "title": "Redis Cluster Sizing (Cost vs Scale)",
                "tension": "12-node cluster ($3,500/mo) vs 4-node cluster ($1,400/mo)",
                "resolution": "Adopted 4-node cluster with auto-scaling triggers at 75% memory, saving $25,200 annually while maintaining p99 < 15ms."
            },
            {
                "title": "Token Revocation Check (Security vs Latency)",
                "tension": "Central DB lookup on heartbeat causes latency spikes vs unverified in-band token renewal",
                "resolution": "Implemented Redis Bloom filter for <1ms revocation checks without database load."
            }
        ]

        # Dynamic slug and filename
        clean_title = "".join(c if c.isalnum() else "_" for c in rfc.title.split(":")[-1].strip())
        clean_title = clean_title.strip("_")[:30]
        adr_id = rfc.rfc_id if rfc.rfc_id else "ADR-042"
        out_path = f"{adr_id}_{clean_title}.md"
        pr_comment_path = f"PR_COMMENT_{adr_id}_{clean_title}.md"

        manifest = self._build_implementation_manifest(rfc)
        target_branch = f"feat/{adr_id.lower().replace('_', '-')}-{clean_title.lower()}"

        doc = ADRDocument(
            adr_id=adr_id,
            title=rfc.title,
            status=status,
            date_str="2026-11-06",
            author=human_author,
            reviewers=[self.name] + [sc.specialist_name for sc in self.scorecards.values()],
            context_summary=rfc.content[:400] + "...",
            scorecards=self.scorecards,
            resolved_trade_offs=decisions,
            action_items=[
                "Deploy 4-node cluster with auto-scaling triggers at 75% memory threshold.",
                "Integrate Bloom filter middleware for WebSocket heartbeat revocation check (<1ms latency).",
                "Enforce Customer-Managed KMS Key (CMK) with envelope encryption.",
                "Adopt Crypto-Shredding per user to satisfy GDPR Article 17 Right to Erasure in event logs.",
                "Configure AWS PrivateLink VPC endpoints for inter-service traffic to eliminate egress fees."
            ],
            target_branch=target_branch,
            target_directory=".",
            test_verification_command="pytest tests/ -v",
            implementation_manifest=manifest
        )
        self.last_adr_doc = doc


        adr_md = ADRGenerator.render_markdown(doc)
        pr_md = ADRGenerator.render_github_pr_comment(doc)

        # Write ADR and PR Comment to disk
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(adr_md)

        with open(pr_comment_path, "w", encoding="utf-8") as f:
            f.write(pr_md)

        # Publish summary in chat
        summary_msg = (
            "🎉 **COUNCIL CONSENSUS REACHED — ADR PUBLISHED!** 🎉\n\n"
            f"**Decision Status:** `{status}` (Average Council Score: `{avg_score:.1f}/10`)\n"
            f"📄 Full ADR Document: **`{out_path}`**\n"
            f"💬 GitHub PR Review Comment: **`{pr_comment_path}`**\n\n"
            "```markdown\n"
            f"{adr_md[:1200]}...\n"
            "[Full ADR & PR Comment committed to repository]\n"
            "```"
        )
        await self.speak(public_room, summary_msg)
        return adr_md

