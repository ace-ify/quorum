"""
Unit test for State Machine and Admin commands.
"""
import pytest
from src.engine.state_machine import EpisodeStateMachine, Phase
from src.engine.admin_handler import AdminCommandHandler

class DummyCoordinator:
    def __init__(self):
        self.state_machine = EpisodeStateMachine()
        self.leak_called = False

    async def advance_phase(self):
        return self.state_machine.advance_phase()

    async def trigger_leak(self):
        self.leak_called = True

    async def reset(self):
        self.state_machine.reset()

def test_phase_progression():
    sm = EpisodeStateMachine()
    assert sm.current_phase == Phase.INIT

    assert sm.advance_phase() == Phase.BRIEFING
    assert sm.advance_phase() == Phase.TASK
    assert sm.advance_phase() == Phase.LEAK
    assert sm.advance_phase() == Phase.CONFESSION
    assert sm.advance_phase() == Phase.EVICTION
    assert sm.advance_phase() == Phase.COMPLETED

@pytest.mark.asyncio
async def test_admin_commands():
    coord = DummyCoordinator()
    handler = AdminCommandHandler(coord)

    # Test !next
    res = await handler.handle_message("living-room", "admin", "!next")
    assert "BRIEFING" in res
    assert coord.state_machine.current_phase == Phase.BRIEFING

    # Test !pause and !resume
    await handler.handle_message("living-room", "admin", "!pause")
    assert coord.state_machine.is_paused is True
    await handler.handle_message("living-room", "admin", "!resume")
    assert coord.state_machine.is_paused is False

    # Test !leak
    await handler.handle_message("living-room", "admin", "!leak")
    assert coord.leak_called is True

