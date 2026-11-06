"""
Multi-Input Ingestion Engine for BlindCouncil.
Supports ingesting RFCs from predefined samples, local file paths (.md, .txt, .sql),
raw text pastes, and Discord attachments.
"""
import re
from pathlib import Path
from typing import Optional, Dict, List
from .models import RFCProposal

SAMPLES_DIR = Path("config/sample_rfcs")
if not SAMPLES_DIR.exists():
    SAMPLES_DIR = Path(__file__).parent.parent.parent / "config" / "sample_rfcs"

AVAILABLE_SAMPLES = {
    "realtime_chat": {
        "file": "rfc_001_realtime_chat_architecture.md",
        "description": "Distributed WebSocket cluster for real-time chat with Redis Streams and Aurora (Scale, Security, FinOps)"
    },
    "database_migration": {
        "file": "rfc_002_postgres_to_dynamo_migration.md",
        "description": "Zero-downtime Aurora Postgres to DynamoDB migration with Global Tables (Database, Compliance, FinOps)"
    }
}

class IngestionEngine:
    @staticmethod
    def list_samples() -> Dict[str, Dict[str, str]]:
        return AVAILABLE_SAMPLES

    @staticmethod
    def load_sample(sample_name: str) -> RFCProposal:
        """
        Loads a curated benchmark RFC sample.
        """
        key = sample_name.lower().replace("-", "_")
        # fuzzy matching
        matched_key = None
        for k in AVAILABLE_SAMPLES:
            if key in k or k in key:
                matched_key = k
                break

        if not matched_key:
            matched_key = "realtime_chat"

        sample_info = AVAILABLE_SAMPLES[matched_key]
        sample_path = SAMPLES_DIR / sample_info["file"]
        if not sample_path.exists():
            sample_path = Path(__file__).parent.parent.parent / "config" / "sample_rfcs" / sample_info["file"]

        with open(sample_path, "r", encoding="utf-8") as f:
            content = f.read()

        return IngestionEngine.parse_rfc_markdown(content, default_id=f"RFC-{matched_key.upper()}")

    @staticmethod
    def load_file(file_path: str) -> RFCProposal:
        """
        Loads an RFC or architecture spec from any local file.
        """
        p = Path(file_path)
        if not p.exists():
            raise FileNotFoundError(f"RFC file not found: {file_path}")

        with open(p, "r", encoding="utf-8") as f:
            content = f.read()

        return IngestionEngine.parse_rfc_markdown(content, default_id=f"RFC-{p.stem.upper()}")

    @staticmethod
    def load_text(raw_text: str, title: Optional[str] = None, author: Optional[str] = None) -> RFCProposal:
        """
        Loads an RFC from direct text or Discord chat paste.
        """
        return IngestionEngine.parse_rfc_markdown(
            raw_text,
            default_id="RFC-CUSTOM",
            default_title=title,
            default_author=author
        )

    @staticmethod
    def parse_rfc_markdown(
        content: str,
        default_id: str = "RFC-001",
        default_title: Optional[str] = None,
        default_author: Optional[str] = None
    ) -> RFCProposal:
        """
        Extracts RFC metadata from markdown headings or frontmatter.
        """
        title = default_title
        author = default_author or "Platform Engineering Lead"
        traffic = "100k Concurrent Users / High Throughput"
        rfc_id = default_id

        # Check for # RFC-XXX: Title
        first_heading = re.search(r"^#\s+(RFC-[\w\d]+)?[:\s]*(.*)$", content, re.MULTILINE)
        if first_heading:
            matched_id = first_heading.group(1)
            matched_title = first_heading.group(2).strip()
            if matched_id:
                rfc_id = matched_id
            if matched_title:
                title = f"{rfc_id}: {matched_title}"

        if not title:
            first_line = content.strip().split("\n")[0]
            title = first_line[:60] if first_line else "Architectural Proposal"

        # Check for author
        author_match = re.search(r"\*\*Author:\*\*\s*(.*)", content, re.IGNORECASE)
        if author_match:
            author = author_match.group(1).strip()

        # Check for traffic / scale
        traffic_match = re.search(r"\*\*(Traffic Target|Target Scale):\*\*\s*(.*)", content, re.IGNORECASE)
        if traffic_match:
            traffic = traffic_match.group(2).strip()

        return RFCProposal(
            rfc_id=rfc_id,
            title=title,
            author=author,
            content=content,
            target_traffic=traffic
        )

