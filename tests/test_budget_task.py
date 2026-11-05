"""
Unit tests for the 1,000-Point Luxury Budget Task evaluator.
"""
import pytest
from src.tasks.budget_task import BudgetTask

def test_budget_task_pass():
    task = BudgetTask()
    # 3 essentials (350 pts) + Whey Protein (250 pts) + Espresso (200 pts) = 800 pts
    items = ["flour_rice", "lentils_dal", "oil_spices", "whey_protein", "imported_espresso"]
    res = task.evaluate(items)
    assert res["success"] is True
    assert res["total_cost"] == 800
    assert res["essential_count"] == 3

def test_budget_task_fail_over_limit():
    task = BudgetTask()
    # 3 essentials (350 pts) + Protein (250) + Espresso (200) + Wifi (250) + Spa (200) = 1250 pts
    items = ["flour_rice", "lentils_dal", "oil_spices", "whey_protein", "imported_espresso", "wifi_pass", "spa_salts"]
    res = task.evaluate(items)
    assert res["success"] is False
    assert res["total_cost"] == 1250
    assert any("Budget exceeded" in r for r in res["failure_reasons"])

def test_budget_task_fail_missing_essentials():
    task = BudgetTask()
    # Only 1 essential (Flour 150) + Protein (250) = 400 pts (Under limit, but lacks 3 essentials)
    items = ["flour_rice", "whey_protein"]
    res = task.evaluate(items)
    assert res["success"] is False
    assert res["essential_count"] == 1
    assert any("Lacks mandatory essentials" in r for r in res["failure_reasons"])

