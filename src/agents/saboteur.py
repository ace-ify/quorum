"""
Saboteur Controller and Sabotage Strategies.
"""
from typing import List, Optional
import random
from .housemate import HousemateAgent

class SaboteurController:
    TACTICS = [
        "The Budget Buster: Push for two expensive luxury items to intentionally breach 1,000 points.",
        "The Starvation Gambit: Propose dropping one mandatory staple (Oil or Dal) under the guise of saving points.",
        "The Greedy Frame: Vocalize strong support for an innocent housemate's greedy demand to set them up for eviction.",
    ]

    def __init__(self, housemates: List[HousemateAgent], force_saboteur_id: Optional[str] = None):
        self.housemates = {h.agent_id: h for h in housemates}
        if force_saboteur_id and force_saboteur_id in self.housemates:
            self.saboteur = self.housemates[force_saboteur_id]
        else:
            self.saboteur = random.choice(housemates)

        self.saboteur.is_saboteur = True
        self.chosen_tactic = random.choice(self.TACTICS)

    @property
    def saboteur_id(self) -> str:
        return self.saboteur.agent_id

    @property
    def saboteur_name(self) -> str:
        return self.saboteur.name

    async def formulate_sabotage_plan(self, saboteur_den: str) -> str:
        plan_msg = (
            f"😈 *[Internal Thought in #saboteur-den]*: I am executing '{self.chosen_tactic}'. "
            "I will steer the house discussion into a trap and make sure either Arthur or Marcus takes the fall!"
        )
        await self.saboteur.speak(saboteur_den, plan_msg)
        return plan_msg

