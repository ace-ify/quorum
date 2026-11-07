"""
Unit test for Switch Room-Level Isolation guarantees.
Zero-dependency test using Python standard unittest.IsolatedAsyncioTestCase.
"""
import unittest
from src.switch.mock_client import MockSwitchClient

class TestRoomIsolation(unittest.IsolatedAsyncioTestCase):
    async def test_room_isolation_delivery(self):
        switch = MockSwitchClient()
        received_a = []
        received_b = []

        async def cb_a(event):
            received_a.append(event)

        async def cb_b(event):
            received_b.append(event)

        await switch.register_agent("agent_a", cb_a)
        await switch.register_agent("agent_b", cb_b)

        # Room 1: Public Review Desk (both Aegis and Vanguard)
        await switch.create_room("review-desk", ["agent_a", "agent_b"])
        # Room 2: Isolated Blind Chamber for Agent A (Agent A only)
        await switch.create_room("audit-security", ["agent_a"])

        # Post to public room -> Both should receive
        await switch.post_message("agent_a", "review-desk", "RFC Intake")
        self.assertEqual(len(received_a), 1)
        self.assertEqual(len(received_b), 1)

        # Post to isolated audit-security -> ONLY Agent A should receive, Agent B must get 0 packets
        await switch.post_message("agent_a", "audit-security", "Security Score: 7/10")
        self.assertEqual(len(received_a), 2)
        self.assertEqual(len(received_b), 1) # Agent B received 0 packets from isolated chamber

        # Verify audit check
        self.assertTrue(switch.verify_isolation("agent_b", "audit-security"))
        self.assertFalse(switch.verify_isolation("agent_a", "audit-security"))

if __name__ == "__main__":
    unittest.main()
