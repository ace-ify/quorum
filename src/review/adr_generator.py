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

        lines.append("\n*Generated collaboratively by BlindCouncil on Switch AI.*")
        return "\n".join(lines)
