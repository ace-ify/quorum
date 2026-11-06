"""
Specialist Factory for BlindCouncil.
Loads pre-configured specialists from catalog, spawns custom specialists dynamically,
and auto-selects required council members based on RFC topic analysis.
"""
import yaml
import re
from pathlib import Path
from typing import List, Dict, Optional, Any
from .specialist import SpecialistAgent

class SpecialistFactory:
    @staticmethod
    def load_catalog(
        switch_client: Any,
        llm_client: Any,
        config_path: Optional[Path] = None
    ) -> List[SpecialistAgent]:
        """
        Loads all predefined specialists from config/specialists.yaml.
        """
        if config_path is None:
            config_path = Path("config/specialists.yaml")
            if not config_path.exists():
                config_path = Path(__file__).parent.parent.parent / "config" / "specialists.yaml"

        with open(config_path, "r", encoding="utf-8") as f:
            cfg = yaml.safe_load(f)

        specialists = []
        for s_cfg in cfg.get("specialists", []):
            agent = SpecialistAgent(
                agent_id=s_cfg["id"],
                name=s_cfg["name"],
                title=s_cfg["title"],
                dimension=s_cfg["dimension"],
                system_prompt=s_cfg["system_prompt"],
                switch_client=switch_client,
                llm_client=llm_client,
                avatar_url=s_cfg.get("avatar_url")
            )
            specialists.append(agent)

        return specialists

    @staticmethod
    def create_custom_specialist(
        name: str,
        title: str,
        dimension: str,
        system_prompt: str,
        switch_client: Any,
        llm_client: Any,
        agent_id: Optional[str] = None,
        avatar_url: Optional[str] = None
    ) -> SpecialistAgent:
        """
        Spawns a new custom specialist on the fly.
        """
        clean_id = agent_id or re.sub(r"[^a-zA-Z0-9_]", "_", name.lower())
        avatar = avatar_url or f"https://api.dicebear.com/7.x/bottts/svg?seed={name}"
        
        prompt = system_prompt or (
            f"You are {name}, a {title}. You hold sovereign domain authority on '{dimension}'. "
            f"Audit the provided architectural RFC with rigorous domain expertise. Provide a score (1-10), "
            f"verdict (APPROVED, CONDITIONAL, REJECTED), critical risks, and concrete actionable recommendations."
        )

        return SpecialistAgent(
            agent_id=clean_id,
            name=name,
            title=title,
            dimension=dimension,
            system_prompt=prompt,
            switch_client=switch_client,
            llm_client=llm_client,
            avatar_url=avatar
        )

    @staticmethod
    def auto_select_for_rfc(
        rfc_content: str,
        all_specialists: List[SpecialistAgent]
    ) -> List[SpecialistAgent]:
        """
        Intelligently selects relevant specialists based on RFC domain triggers.
        Foundational triad (Security, Scalability, FinOps) is always active.
        Database and Compliance are dynamically summoned when relevant keywords appear.
        """
        content_lower = rfc_content.lower()
        selected = []
        spec_map = {s.agent_id: s for s in all_specialists}

        # Foundational triad always included
        for core_id in ["security", "scalability", "finops"]:
            if core_id in spec_map:
                selected.append(spec_map[core_id])

        # Database Architect (Titan) triggers
        db_keywords = ["database", "postgres", "sql", "nosql", "dynamodb", "aurora", "redis", "schema", "cdc", "outbox", "acid", "write amplification"]
        if any(k in content_lower for k in db_keywords):
            if "database" in spec_map and spec_map["database"] not in selected:
                selected.append(spec_map["database"])

        # Compliance & Privacy (Verity) triggers
        compliance_keywords = ["gdpr", "hipaa", "compliance", "privacy", "soc2", "retention", "audit", "pii", "right to erasure", "ccpa", "regulatory"]
        if any(k in content_lower for k in compliance_keywords):
            if "compliance" in spec_map and spec_map["compliance"] not in selected:
                selected.append(spec_map["compliance"])

        return selected

