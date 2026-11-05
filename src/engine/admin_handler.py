"""
Admin Command Handler for live demo recordings and testing.
Supported commands: !next, !leak, !pause, !resume, !reset, !status
"""
from typing import Optional, Any

class AdminCommandHandler:
    def __init__(self, coordinator: Any):
        self.coordinator = coordinator

    async def handle_message(self, room_id: str, sender_id: str, content: str) -> Optional[str]:
        text = content.strip()
        if not text.startswith("!"):
            return None

        parts = text.split()
        cmd = parts[0].lower()

        if cmd == "!next":
            new_phase = await self.coordinator.advance_phase()
            return f"⏩ **[ADMIN]** Advanced to Phase: `{new_phase.value.upper()}`."

        elif cmd == "!leak":
            await self.coordinator.trigger_leak()
            return "🚨 **[ADMIN]** Forced confidential leak triggered!"

        elif cmd == "!pause":
            self.coordinator.state_machine.is_paused = True
            return "⏸️ **[ADMIN]** Episode timers paused."

        elif cmd == "!resume":
            self.coordinator.state_machine.is_paused = False
            return "▶️ **[ADMIN]** Episode timers resumed."

        elif cmd == "!reset":
            await self.coordinator.reset()
            return "🔄 **[ADMIN]** Episode reset to Phase 1."

        elif cmd == "!status":
            sm = self.coordinator.state_machine
            return (
                f"ℹ️ **[STATUS]**\n"
                f"• Current Phase: `{sm.current_phase.value}`\n"
                f"• Paused: `{sm.is_paused}`\n"
                f"• Active Players: {sm.active_players}\n"
                f"• Evicted: {sm.evicted_players}\n"
            )

        return None

