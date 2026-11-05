"""
Zero-dependency test runner using Python's built-in unittest framework.
"""
import unittest
import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.tasks.budget_task import BudgetTask
from src.switch.mock_client import MockSwitchClient
from src.engine.state_machine import EpisodeStateMachine, Phase
from src.engine.admin_handler import AdminCommandHandler

class TestBudgetTask(unittest.TestCase):
    def test_budget_pass(self):
        task = BudgetTask()
        items = ["flour_rice", "lentils_dal", "oil_spices", "whey_protein", "imported_espresso"]
        res = task.evaluate(items)
        self.assertTrue(res["success"])
        self.assertEqual(res["total_cost"], 800)
        self.assertEqual(res["essential_count"], 3)

    def test_budget_fail_over_limit(self):
        task = BudgetTask()
        items = ["flour_rice", "lentils_dal", "oil_spices", "whey_protein", "imported_espresso", "wifi_pass", "spa_salts"]
        res = task.evaluate(items)
        self.assertFalse(res["success"])
        self.assertEqual(res["total_cost"], 1250)
        self.assertTrue(any("Budget exceeded" in r for r in res["failure_reasons"]))

    def test_budget_fail_missing_essentials(self):
        task = BudgetTask()
        items = ["flour_rice", "whey_protein"]
        res = task.evaluate(items)
        self.assertFalse(res["success"])
        self.assertEqual(res["essential_count"], 1)
        self.assertTrue(any("Lacks mandatory essentials" in r for r in res["failure_reasons"]))

class TestSwitchIsolation(unittest.TestCase):
    def test_room_isolation(self):
        async def run_test():
            switch = MockSwitchClient()
            received_a = []
            received_b = []

            async def cb_a(event):
                received_a.append(event)

            async def cb_b(event):
                received_b.append(event)

            await switch.register_agent("agent_a", cb_a)
            await switch.register_agent("agent_b", cb_b)

            await switch.create_room("living-room", ["agent_a", "agent_b"])
            await switch.create_room("confession-a", ["agent_a"])

            # Post to public room
            await switch.post_message("agent_a", "living-room", "Hello all!")
            self.assertEqual(len(received_a), 1)
            self.assertEqual(len(received_b), 1)

            # Post to isolated confession-a
            await switch.post_message("agent_a", "confession-a", "Secret confession!")
            self.assertEqual(len(received_a), 2)
            self.assertEqual(len(received_b), 1) # B received NOTHING

            self.assertTrue(switch.verify_isolation("agent_b", "confession-a"))
            self.assertFalse(switch.verify_isolation("agent_a", "confession-a"))

        asyncio.run(run_test())

class TestStateMachineAndAdmin(unittest.TestCase):
    def test_phase_progression(self):
        sm = EpisodeStateMachine()
        self.assertEqual(sm.current_phase, Phase.INIT)
        self.assertEqual(sm.advance_phase(), Phase.BRIEFING)
        self.assertEqual(sm.advance_phase(), Phase.TASK)
        self.assertEqual(sm.advance_phase(), Phase.LEAK)
        self.assertEqual(sm.advance_phase(), Phase.CONFESSION)
        self.assertEqual(sm.advance_phase(), Phase.EVICTION)
        self.assertEqual(sm.advance_phase(), Phase.COMPLETED)

    def test_admin_commands(self):
        async def run_admin():
            class DummyCoord:
                def __init__(self):
                    self.state_machine = EpisodeStateMachine()
                    self.leak_called = False
                async def advance_phase(self):
                    return self.state_machine.advance_phase()
                async def trigger_leak(self):
                    self.leak_called = True
                async def reset(self):
                    self.state_machine.reset()

            coord = DummyCoord()
            handler = AdminCommandHandler(coord)

            res = await handler.handle_message("living-room", "admin", "!next")
            self.assertIn("BRIEFING", res)
            self.assertEqual(coord.state_machine.current_phase, Phase.BRIEFING)

            await handler.handle_message("living-room", "admin", "!pause")
            self.assertTrue(coord.state_machine.is_paused)
            await handler.handle_message("living-room", "admin", "!resume")
            self.assertFalse(coord.state_machine.is_paused)

            await handler.handle_message("living-room", "admin", "!leak")
            self.assertTrue(coord.leak_called)

        asyncio.run(run_admin())

if __name__ == "__main__":
    unittest.main()
