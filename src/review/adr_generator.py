"""
ADR (Architecture Decision Record) Generator adhering to the Michael Nygard standard.
"""
from typing import Dict, Any
from .models import ADRDocument

class ADRGenerator:
    @staticmethod
    def render_markdown(doc: ADRDocument) -> str:
        lines = [
            f"# {doc.adr_id}: {doc.title}",
            "",
            f"**Status:** `{doc.status.upper()}`  ",
            f"**Date:** {doc.date_str}  ",
            f"**Author / Lead:** {doc.author}  ",
            f"**Council Reviewers:** {', '.join(doc.reviewers)}  ",
            "",
            "---",
            "",
            "## 1. Executive Summary & Blind Scorecard",
            "",
            "| Dimension | Specialist | Score (1-10) | Verdict |",
            "| :--- | :--- | :---: | :--- |"
        ]

        for sid, sc in doc.scorecards.items():
            status_emoji = "✅" if sc.score >= 8 else ("⚠️" if sc.score >= 6 else "❌")
            lines.append(f"| **{sc.dimension}** | {sc.specialist_name} | {sc.score}/10 | {status_emoji} {sc.verdict} |")

        lines.extend([
            "",
            "---",
            "",
            "## 2. Context & Proposed Architecture",
            doc.context_summary.strip(),
            "",
            "---",
            "",
            "## 3. Independent Specialist Findings",
            ""
        ])

        for sid, sc in doc.scorecards.items():
            lines.append(f"### 🔍 {sc.specialist_name} — {sc.dimension}")
            lines.append(f"**Score:** {sc.score}/10 — **Verdict:** `{sc.verdict}`\n")
            if sc.critical_risks:
                lines.append("**Critical Risks Identified:**")
                for r in sc.critical_risks:
                    lines.append(f"- ⚠️ {r}")
                lines.append("")
            if sc.recommendations:
                lines.append("**Key Recommendations:**")
                for rec in sc.recommendations:
                    lines.append(f"- 💡 {rec}")
                lines.append("")

        lines.extend([
            "---",
            "",
            "## 4. Key Architectural Trade-Offs & Human Decisions",
            ""
        ])

        if doc.resolved_trade_offs:
            for item in doc.resolved_trade_offs:
                lines.append(f"### ⚖️ {item.get('title', 'Architectural Compromise')}")
                lines.append(f"**Tension:** {item.get('tension', '')}")
                lines.append(f"**Executive Resolution:** {item.get('resolution', '')}\n")
        else:
            lines.append("*All specialists aligned on proposed baseline without unresolved trade-offs.*\n")

        lines.extend([
            "---",
            "",
            "## 5. Action Items & Pre-Deployment Checklist",
            ""
        ])

        for item in doc.action_items:
            lines.append(f"- [ ] {item}")

        # Section 6: Scaffolding Spec & Implementation Manifest for Coding Agents (Claude Code / Codex)
        target_branch = doc.target_branch or f"feat/{doc.adr_id.lower().replace('_', '-')}-implementation"
        target_dir = doc.target_directory or "."
        verify_cmd = doc.test_verification_command or "pytest tests/ -v"

        lines.extend([
            "",
            "---",
            "",
            "## 6. Implementation Manifest & Scaffolding Spec",
            "> 🤖 *Autonomous handoff contract for terminal coding agents (Claude Code, Codex, Cursor).*  ",
            f"**Target Workspace:** `{target_dir}`  ",
            f"**Target Git Branch:** `git checkout -b {target_branch}`  ",
            f"**Verification Test Command:** `{verify_cmd}`  ",
            "",
            "### 📂 File Scaffolding Action Matrix",
            "",
            "| File Path | Action | Mandated By | Purpose |",
            "| :--- | :---: | :--- | :--- |"
        ])

        if doc.implementation_manifest:
            for item in doc.implementation_manifest:
                lines.append(f"| `{item.file_path}` | `{item.action}` | {item.mandated_by} | {item.purpose} |")

            lines.extend([
                "",
                "### 🧩 Code Contracts & Interface Signatures",
                ""
            ])
            for item in doc.implementation_manifest:
                if item.interface_contract:
                    lines.append(f"#### `{item.file_path}` (`{item.action}`)")
                    lines.append(f"```python\n{item.interface_contract.strip()}\n```\n")

            lines.extend([
                "### ⚡ Terminal Coding Agent Handoff Command",
                "Execute the following CLI command to initiate autonomous repository implementation:",
                "```bash",
                f'claude -p "Implement ADR {doc.adr_id} according to Section 6 Implementation Manifest. Work on branch \'{target_branch}\' and verify with \'{verify_cmd}\' before completion."',
                "```",
                ""
            ])
        else:
            lines.append("*No files specified in scaffolding manifest.*\n")

        lines.append("\n*Generated collaboratively by BlindCouncil on Switch AI.*")
        return "\n".join(lines)

    @staticmethod
    def render_executive_summary(doc: ADRDocument) -> str:
        """
        Renders a 3-bullet executive digest suitable for instant chat display.
        """
        lines = [
            f"📋 **EXECUTIVE ARCHITECTURAL DIGEST: {doc.adr_id}**",
            f"**Verdict:** `{doc.status}` | **Author:** {doc.author} | **Council:** {', '.join(doc.reviewers)}",
            "",
            "**Core Architectural Decisions:**"
        ]
        if doc.resolved_trade_offs:
            for item in doc.resolved_trade_offs:
                lines.append(f"• **{item.get('title', 'Decision')}:** {item.get('resolution', '')}")
        else:
            lines.append("• Standard architecture approved without trade-off contention.")

        lines.append("\n**Actionable Pre-Merge Items:**")
        for item in doc.action_items[:3]:
            lines.append(f"• [ ] {item}")

        return "\n".join(lines)

    @staticmethod
    def render_mermaid_diagram(doc: ADRDocument) -> str:
        """
        Generates a clean architectural flow diagram in Mermaid syntax.
        """
        return (
            "```mermaid\n"
            "graph TD\n"
            "    Client[Clients: Web & Mobile] -->|WSS / TLS 1.3| Edge[Edge Gateway: EKS Pods]\n"
            "    Edge -->|Heartbeat Auth <1ms| Bloom[Redis Bloom Filter Cache]\n"
            "    Edge -->|Pub/Sub Streams 25k msg/s| Shards[Redis Enterprise: 4 Nodes]\n"
            "    Shards -->|Transactional Outbox| DB[(AWS Aurora Serverless v2)]\n"
            "    KMS[Customer-Managed KMS CMK] -.->|Envelope Encryption| Edge\n"
            "    Shards -.->|Crypto-Shredding on Delete| Vault[GDPR Compliance Vault]\n"
            "```"
        )

    @staticmethod
    def render_github_pr_comment(doc: ADRDocument) -> str:
        """
        Renders a high-impact, PR-ready markdown comment with collapsible specialist audits
        and actionable merge checklists for GitHub / GitLab Pull Requests.
        """
        verdict_badge = "🟢 **APPROVED**" if "APPROVED" in doc.status and "CONDITIONS" not in doc.status else (
            "🟡 **APPROVED WITH CONDITIONS**" if "CONDITIONS" in doc.status else "🔴 **REJECTED**"
        )

        lines = [
            f"## 🏛️ BlindCouncil Architecture Review Report",
            f"**Decision Verdict:** {verdict_badge} | **ADR ID:** `{doc.adr_id}`",
            "",
            "> 🔒 *This review was conducted using server-enforced blind isolation to eliminate LLM sycophancy and groupthink.*",
            "",
            "### 📊 Council Blind Scorecard Matrix",
            "",
            "| Dimension | Specialist | Score | Verdict |",
            "| :--- | :--- | :---: | :--- |"
        ]

        for sid, sc in doc.scorecards.items():
            status_emoji = "✅" if sc.score >= 8 else ("⚠️" if sc.score >= 6 else "❌")
            lines.append(f"| {sc.dimension} | **{sc.specialist_name}** | `{sc.score}/10` | {status_emoji} {sc.verdict} |")

        lines.extend([
            "",
            "### ⚖️ Architectural Trade-Offs & Human Resolutions",
            ""
        ])

        if doc.resolved_trade_offs:
            for item in doc.resolved_trade_offs:
                lines.append(f"- **{item.get('title', 'Trade-off')}:** {item.get('resolution', '')}")
        else:
            lines.append("- *All domain constraints satisfied without unresolved conflicts.*")

        lines.extend([
            "",
            "### 📋 Blocking Pre-Merge Checklist",
            ""
        ])

        for item in doc.action_items:
            lines.append(f"- [ ] {item}")

        lines.extend([
            "",
            "### 🚀 Implementer Handoff & Scaffolding Manifest",
            f"- **Target Branch:** `{doc.target_branch or 'feat/' + doc.adr_id.lower().replace('_', '-')}`",
            f"- **Verification Test Command:** `{doc.test_verification_command or 'pytest tests/ -v'}`",
            f"- **Files to Scaffold:** `{len(doc.implementation_manifest)} files`"
        ])

        if doc.implementation_manifest:
            for item in doc.implementation_manifest[:4]:
                lines.append(f"  - `{item.action}` `{item.file_path}` — *{item.purpose}*")

        lines.extend([
            "",
            "<details>",
            "<summary>🔍 <b>Click to expand full specialist findings & raw blind analysis</b></summary>",
            ""
        ])

        for sid, sc in doc.scorecards.items():
            lines.append(f"#### {sc.specialist_name} ({sc.dimension}) — `{sc.score}/10`")
            if sc.critical_risks:
                lines.append("**Critical Risks:**")
                for r in sc.critical_risks:
                    lines.append(f"- ⚠️ {r}")
            if sc.recommendations:
                lines.append("**Recommendations:**")
                for rec in sc.recommendations:
                    lines.append(f"- 💡 {rec}")
            if sc.raw_analysis:
                lines.append(f"\n*Analysis Summary:* {sc.raw_analysis}\n")

        lines.extend([
            "</details>",
            "",
            "---",
            f"*Reviewed by BlindCouncil on Switch AI • Decision recorded in [`{doc.adr_id}.md`](./{doc.adr_id}.md)*"
        ])

        return "\n".join(lines)



