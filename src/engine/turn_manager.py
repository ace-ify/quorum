"""
Turn Manager for smooth conversation pacing and loop prevention.
"""
from typing import List, Dict, Optional, Set

class TurnManager:
    def __init__(self, housemate_ids: List[str], max_turns_per_agent: int = 3):
        self.housemate_ids = list(housemate_ids)
        self.max_turns_per_agent = max_turns_per_agent
        self.turn_counts: Dict[str, int] = {hid: 0 for hid in housemate_ids}

    def reset_turns(self):
        self.turn_counts = {hid: 0 for hid in self.housemate_ids}

    def can_speak(self, agent_id: str) -> bool:
        if agent_id not in self.turn_counts:
            return True
        return self.turn_counts[agent_id] < self.max_turns_per_agent

    def record_speech(self, agent_id: str):
        if agent_id in self.turn_counts:
            self.turn_counts[agent_id] += 1

    def extract_mentions(self, content: str) -> Set[str]:
        mentions = set()
        for hid in self.housemate_ids:
            if f"@{hid}" in content.lower():
                mentions.add(hid)
        return mentions

