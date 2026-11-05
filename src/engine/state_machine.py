"""
State machine for episode phase progression.
"""
from enum import Enum
from typing import List, Dict, Optional, Any

class Phase(Enum):
    INIT = "init"
    BRIEFING = "briefing"
    TASK = "task"
    LEAK = "leak"
    CONFESSION = "confession"
    EVICTION = "eviction"
    COMPLETED = "completed"

class EpisodeStateMachine:
    PHASE_ORDER = [
        Phase.BRIEFING,
        Phase.TASK,
        Phase.LEAK,
        Phase.CONFESSION,
        Phase.EVICTION,
        Phase.COMPLETED,
    ]

    def __init__(self, timers: Optional[Dict[str, int]] = None):
        self.current_phase = Phase.INIT
        self.is_paused = False
        self.timers = timers or {
            "briefing": 30,
            "task": 120,
            "leak": 45,
            "confession": 90,
            "eviction": 60,
        }
        self.active_players: List[str] = []
        self.evicted_players: List[str] = []
        self.submitted_budget_items: List[str] = []

    def set_active_players(self, player_ids: List[str]):
        self.active_players = list(player_ids)

    def advance_phase(self) -> Phase:
        """
        Advances to the next logical phase in order.
        """
        if self.current_phase == Phase.INIT:
            self.current_phase = Phase.BRIEFING
            return self.current_phase

        idx = self.PHASE_ORDER.index(self.current_phase)
        if idx < len(self.PHASE_ORDER) - 1:
            self.current_phase = self.PHASE_ORDER[idx + 1]
        else:
            self.current_phase = Phase.COMPLETED
        return self.current_phase

    def reset(self):
        self.current_phase = Phase.INIT
        self.is_paused = False
        self.submitted_budget_items = []

