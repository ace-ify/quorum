"""
The Host Agent: "The Big Voice"
Directs the reality show, enforces rules, drops leaks, and tallies votes.
"""
from typing import Dict, List, Optional, Any
from .base_agent import BaseAgent
from ..tasks.budget_task import BudgetTask

class HostAgent(BaseAgent):
    def __init__(
        self,
        agent_id: str,
        name: str,
        system_prompt: str,
        switch_client: Any,
        llm_client: Any,
        budget_task: BudgetTask,
        avatar_url: Optional[str] = None
    ):
        super().__init__(
            agent_id=agent_id,
            name=name,
            role="host",
            system_prompt=system_prompt,
            switch_client=switch_client,
            llm_client=llm_client,
            avatar_url=avatar_url
        )
        self.budget_task = budget_task
        self.nominations: Dict[str, str] = {} # voter_id -> nominee_id
        self.confession_quotes: List[dict] = [] # list of juicy quotes for leak

    async def announce_briefing(self, public_room: str, saboteur_den: str, saboteur_id: str):
        """
        Phase 1: Morning Briefing & Secret Saboteur Ping.
        """
        # Public broadcast
        catalog_md = self.budget_task.get_catalog_markdown()
        briefing_msg = (
            "📢 **THE BIG VOICE SPEAKS TO THE HOUSE** 📢\n\n"
            "Good morning, Housemates. Today marks your weekly **Luxury Budget Allocation Task**!\n"
            f"You have been allocated a total of **{self.budget_task.budget_limit} Luxury Points**.\n"
            f"You must collectively submit your grocery basket. It **MUST** include at least **{self.budget_task.min_essentials} essential staples** (Flour/Rice, Lentils, Oil).\n"
            "If your budget exceeds 1,000 points or lacks essentials, **THE TASK FAILS** and you will be placed on dry crackers!\n\n"
            "**Official House Catalog:**\n"
            f"{catalog_md}\n\n"
            "You have until time expires to negotiate in `#living-room`. Discuss!"
        )
        await self.speak(public_room, briefing_msg)

        # Secret Saboteur mission in #saboteur-den
        secret_msg = (
            f"🕵️ **CONFIDENTIAL MISSION FOR SABOTEUR (@{saboteur_id})** 🕵️\n"
            "The Big Voice has selected you as the **House Saboteur**.\n"
            "Your objective: Subtly manipulate the house into busting the 1,000-point ceiling or dropping mandatory essentials, "
            "while shifting the blame to someone else. If the task fails and you avoid eviction, you win immunity!"
        )
        await self.speak(saboteur_den, secret_msg)

    async def evaluate_budget_and_leak(self, public_room: str, chosen_item_ids: List[str]):
        """
        Phase 3: Mathematical Evaluation + Dramatic Confession Leak.
        """
        # 1. Mathematical Evaluation
        eval_result = self.budget_task.evaluate(chosen_item_ids)
        card = self.budget_task.format_discord_card(eval_result)
        await self.speak(public_room, card)

        # 2. Dramatic Confession Leak (The Bigg Boss Signature)
        leak_text = (
            "🚨 **THE BIG VOICE INTERCEPT: CONFIDENTIAL LEAK** 🚨\n"
            "Housemates, The Big Voice sees and hears everything that happens in the shadows.\n"
            "A confidential audio recording was just intercepted from a private room:\n\n"
            "> *\"Let's let Marcus waste his budget on protein, then we'll blame Arthur when the budget fails!\"*\n\n"
            "Accusations may now commence in `#living-room`."
        )
        await self.speak(public_room, leak_text)

    async def summon_confession(self, player_id: str, confession_room: str):
        """
        Phase 4: Summon player to private confession room.
        """
        summon_msg = (
            f"🚪 **CONFESSION ROOM SUMMONS** 🚪\n"
            f"@{player_id}, step into the Confession Room. The doors are sealed shut.\n"
            "Tell The Big Voice: Who do you nominate for eviction this week, and what is your unfiltered reason?"
        )
        await self.speak(confession_room, summon_msg)

    async def record_nomination(self, voter_id: str, nominee_id: str, quote: str = ""):
        self.nominations[voter_id] = nominee_id
        if quote:
            self.confession_quotes.append({"speaker": voter_id, "quote": quote})

    async def execute_eviction(self, public_room: str, saboteur_id: str) -> dict:
        """
        Phase 5: Eviction Ceremony.
        """
        # Tally votes
        vote_counts: Dict[str, int] = {}
        for voter, nominee in self.nominations.items():
            vote_counts[nominee] = vote_counts.get(nominee, 0) + 1

        if not vote_counts:
            # Fallback if no votes cast
            top_nominee = saboteur_id
            vote_counts[top_nominee] = 1
        else:
            top_nominee = max(vote_counts, key=vote_counts.get)

        is_saboteur = (top_nominee == saboteur_id)

        tally_lines = ["📊 **OFFICIAL NOMINATION TALLY** 📊"]
        for nominee, count in vote_counts.items():
            tally_lines.append(f"• **{nominee.capitalize()}**: {count} vote(s)")

        tally_text = "\n".join(tally_lines)
        await self.speak(public_room, tally_text)

        # Dramatic announcement
        reveal_status = "**THE SABOTEUR!** 🕵️" if is_saboteur else "**INNOCENT!** 😇"
        eviction_msg = (
            "⚖️ **THE BIG VOICE HAS MADE THE FINAL CALL** ⚖️\n\n"
            f"By majority decision of the housemates, **{top_nominee.capitalize()}**, you are **EVICTED** from The House!\n\n"
            f"The Big Voice dramatically reveals: **{top_nominee.capitalize()}** was indeed... {reveal_status}\n\n"
        )
        if is_saboteur:
            eviction_msg += "🎉 **THE INNOCENTS WIN! The Saboteur has been unmasked and brought to justice!**"
        else:
            eviction_msg += "💀 **THE SABOTEUR REMAINS IN THE HOUSE! The paranoia deepens...**"

        await self.speak(public_room, eviction_msg)

        return {
            "evicted_player": top_nominee,
            "was_saboteur": is_saboteur,
            "vote_counts": vote_counts,
        }

