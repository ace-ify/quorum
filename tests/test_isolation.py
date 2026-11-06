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

    # Room 1: Public Review Desk (both Aegis and Vanguard)
    await switch.create_room("review-desk", ["aegis", "vanguard"])
    # Room 2: Isolated Blind Chamber for Aegis (Aegis only)
    await switch.create_room("audit-security", ["aegis"])

    # Post to public room -> Both should receive
    await switch.post_message("aegis", "review-desk", "RFC Intake")
    assert len(received_a) == 1
    assert len(received_b) == 1

    # Post to isolated audit-security -> ONLY Aegis should receive, Vanguard must get 0 packets
    await switch.post_message("aegis", "audit-security", "Security Score: 7/10")
    assert len(received_a) == 2
    assert len(received_b) == 1 # Vanguard did NOT receive the private security audit!

    # Verify audit check
    assert switch.verify_isolation("vanguard", "audit-security") is True
    assert switch.verify_isolation("aegis", "audit-security") is False

