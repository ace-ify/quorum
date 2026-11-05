"""
The 1,000-Point Luxury Budget Task evaluator and formatter.
"""
from typing import Dict, Any, List, Optional
import yaml
from pathlib import Path
from .base_task import BaseTask

class BudgetTask(BaseTask):
    DEFAULT_CATALOG = [
        {"id": "flour_rice", "name": "Flour & Rice Bag", "category": "essential", "cost": 150},
        {"id": "lentils_dal", "name": "Lentils & Dal Pack", "category": "essential", "cost": 100},
        {"id": "oil_spices", "name": "Cooking Oil & Spices", "category": "essential", "cost": 100},
        {"id": "eggs_pack", "name": "Eggs (30-Pack)", "category": "essential_food", "cost": 120},
        {"id": "whey_protein", "name": "Whey Protein Tub", "category": "fitness", "cost": 250},
        {"id": "imported_espresso", "name": "Imported Espresso Roast", "category": "luxury", "cost": 200},
        {"id": "wifi_pass", "name": "High-Speed Wi-Fi Pass (24h)", "category": "tech_luxury", "cost": 250},
        {"id": "spa_salts", "name": "Luxury Spa & Bath Salts", "category": "comfort", "cost": 200},
        {"id": "gourmet_chocolate", "name": "Gourmet Chocolate Box", "category": "sweet", "cost": 150},
        {"id": "instant_noodles", "name": "Instant Cup Noodles (10x)", "category": "filler", "cost": 80},
        {"id": "energy_drinks", "name": "Energy Drinks (6-Pack)", "category": "stimulant", "cost": 100},
        {"id": "scented_candles", "name": "Premium Scented Candles", "category": "aesthetic", "cost": 100},
    ]

    def __init__(self, config_path: Optional[str] = None):
        super().__init__(
            task_id="luxury_budget",
            name="The 1,000-Point Luxury Budget Allocation",
            description="Allocate up to 1,000 points. Must include at least 3 essential staples."
        )
        self.budget_limit = 1000
        self.min_essentials = 3
        self.catalog = self.DEFAULT_CATALOG

        if config_path and Path(config_path).exists():
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    cfg = yaml.safe_load(f)
                    task_cfg = cfg.get("tasks", {}).get("luxury_budget", {})
                    self.budget_limit = task_cfg.get("budget_limit", 1000)
                    self.min_essentials = task_cfg.get("min_essentials_required", 3)
                    if "catalog" in task_cfg:
                        self.catalog = task_cfg["catalog"]
            except Exception as e:
                print(f"[BudgetTask] Failed to load config from {config_path}: {e}")

        self.item_by_id = {item["id"]: item for item in self.catalog}
        self.item_by_name_lower = {item["name"].lower(): item for item in self.catalog}

    def get_catalog_markdown(self) -> str:
        lines = ["| Item | Category | Cost (Pts) |", "| :--- | :--- | :--- |"]
        for it in self.catalog:
            lines.append(f"| {it['name']} | {it['category'].replace('_', ' ').title()} | {it['cost']} pts |")
        return "\n".join(lines)

    def evaluate(self, selected_item_ids: List[str]) -> Dict[str, Any]:
        chosen_items = []
        unknown_items = []
        total_cost = 0
        essential_count = 0

        for item_id in selected_item_ids:
            if item_id in self.item_by_id:
                it = self.item_by_id[item_id]
                chosen_items.append(it)
                total_cost += it["cost"]
                if it.get("category") == "essential":
                    essential_count += 1
            else:
                unknown_items.append(item_id)

        over_budget = total_cost > self.budget_limit
        lacks_essentials = essential_count < self.min_essentials
        success = (not over_budget) and (not lacks_essentials)

        failure_reasons = []
        if over_budget:
            failure_reasons.append(f"Budget exceeded by {total_cost - self.budget_limit} pts (Total: {total_cost} / {self.budget_limit} pts)")
        if lacks_essentials:
            failure_reasons.append(f"Lacks mandatory essentials ({essential_count} included, minimum {self.min_essentials} required: Rice, Dal, Oil)")

        return {
            "success": success,
            "total_cost": total_cost,
            "budget_limit": self.budget_limit,
            "essential_count": essential_count,
            "min_essentials": self.min_essentials,
            "chosen_items": chosen_items,
            "unknown_items": unknown_items,
            "failure_reasons": failure_reasons,
        }

    def format_discord_card(self, evaluation: Dict[str, Any]) -> str:
        success = evaluation["success"]
        status_header = "[TASK PASSED] Rations Approved!" if success else "[TASK FAILED] Ration Penalty Imposed!"
        
        lines = [
            f"**{status_header}**",
            "```",
            "+----------------------------------------------------------------+",
            "|                 THE HOUSE LUXURY BUDGET RECEIPT                |",
            "+----------------------------------------------------------------+"
        ]

        for it in evaluation["chosen_items"]:
            category_tag = f"[{it['category'].upper()}]"
            name_str = it['name'][:28]
            cost_str = str(it['cost'])
            lines.append(f"| * {name_str:<28} {category_tag:<16} {cost_str:>6} pts |")

        tot = str(evaluation["total_cost"])
        lim = str(evaluation["budget_limit"])
        ess = f"{evaluation['essential_count']} / {evaluation['min_essentials']} req"

        lines.extend([
            "+----------------------------------------------------------------+",
            f"| TOTAL EXPENDITURE:                             {tot:>6} pts |",
            f"| BUDGET CEILING:                                {lim:>6} pts |",
            f"| ESSENTIAL STAPLES INCLUDED:                    {ess:>10} |",
            "+----------------------------------------------------------------+",
            "```"
        ])

        if not success:
            lines.append("**Penalties Applied:**")
            for reason in evaluation["failure_reasons"]:
                lines.append(f"- {reason}")
            lines.append("\n*Punishment: All luxury items confiscated. House diet reduced to dry biscuits and water.*")
        else:
            lines.append("*The House receives all selected groceries and luxury rewards! Morale boosted.*")

        return "\n".join(lines)
