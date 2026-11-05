"""
Unit test for Switch Room-Level Isolation guarantees.
"""
import pytest
from src.switch.mock_client import MockSwitchClient

@pytest.mark.asyncio
async def test_room_isolation_delivery():
    switch = MockSwitchClient()
    received_a = []
    received_b = []

    async def cb_a(event):
        received_a.append(event)

    async def cb_b(event):
        received_b.append(event)

    await switch.register_agent("agent_a", cb_a)
    await switch.register_agent("agent_b", cb_b)

    # Room 1: Public (both A and B)
    await switch.create_room("living-room", ["agent_a", "agent_b"])
    # Room 2: Private Confession for A (A only)
    await switch.create_room("confession-a", ["agent_a"])

    # Post to public room -> Both should receive
    await switch.post_message("agent_a", "living-room", "Hello all!")
    assert len(received_a) == 1
    assert len(received_b) == 1

    # Post to isolated confession-a -> ONLY Agent A should receive, Agent B must get 0 packets
    await switch.post_message("agent_a", "confession-a", "My secret confession!")
    assert len(received_a) == 2
    assert len(received_b) == 1 # Agent B did NOT receive the confession!

    # Verify audit check
    assert switch.verify_isolation("agent_b", "confession-a") is True
    assert switch.verify_isolation("agent_a", "confession-a") is False

