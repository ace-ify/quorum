"""
Base interface for tasks in The House Imposter.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseTask(ABC):
    def __init__(self, task_id: str, name: str, description: str):
        self.task_id = task_id
        self.name = name
        self.description = description

    @abstractmethod
    def evaluate(self, submission: Any) -> Dict[str, Any]:
        """
        Evaluate the submitted task output.
        Returns a dictionary with at least:
        - success: bool
        - total_score / cost: int or float
        - breakdown: dict or str
        - reason: str
        """
        pass

    @abstractmethod
    def format_discord_card(self, evaluation: Dict[str, Any]) -> str:
        """
        Return a clean markdown card for Discord / chat.
        """
        pass

