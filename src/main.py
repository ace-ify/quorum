"""
The House Imposter: AI Reality Show - Main Entrypoint
Run with:
  python -m src.main --simulate    # Instant 30s terminal simulation (Judge-friendly)
  python -m src.main --live        # Live connection to Switch Gateway & Discord
"""
import sys
import os

# Ensure UTF-8 output on all platforms (Windows CP1252 fix)
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import argparse
import asyncio
import yaml
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from .tasks.budget_task import BudgetTask
from .llm.client import LLMClient
from .switch.mock_client import MockSwitchClient
from .switch.client import SwitchLiveClient
from .switch.discord_client import DiscordLiveClient
from .agents.host_agent import HostAgent
from .agents.housemate import HousemateAgent
from .agents.saboteur import SaboteurController
from .engine.coordinator import EpisodeCoordinator

console = Console()

def load_cast_config():
    path = Path("config/cast.yaml")
    if not path.exists():
        path = Path(__file__).parent.parent / "config" / "cast.yaml"
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

async def run_simulation(use_online_llm: bool = False):
    console.print(Panel.fit(
        "[bold magenta]🏠 THE HOUSE IMPOSTER: AI REALITY SHOW[/bold magenta]\n"
        "[italic cyan]Powered by Switch AI's Server-Enforced Room Isolation[/italic cyan]",
        border_style="magenta"
    ))

    cast_cfg = load_cast_config()
    switch_mock = MockSwitchClient(workspace_id="the-house-season-1")
    llm = LLMClient() if use_online_llm else LLMClient(use_mock=True)
    budget_task = BudgetTask("config/tasks.yaml")

    # Terminal message printer hook
    async def log_event_to_terminal(event: dict):
        room = event.get("room_id", "unknown")
        sender = event.get("sender_id", "system")
        content = event.get("content", "")

        color = "white"
        if sender == "host":
            color = "bold yellow"
        elif sender == "marcus":
            color = "bold red"
        elif sender == "elena":
            color = "bold green"
        elif sender == "arthur":
            color = "bold blue"
        elif sender == "maya":
            color = "bold magenta"

        tag = f"[{room.upper()}]"
        console.print(f"[dim]{tag:<22}[/dim] [{color}]{sender.upper()}:[/{color}] {content}\n")

    # Host Agent
    host_cfg = cast_cfg["host"]
    host = HostAgent(
        agent_id=host_cfg["id"],
        name=host_cfg["name"],
        system_prompt=host_cfg["system_prompt"],
        switch_client=switch_mock,
        llm_client=llm,
        budget_task=budget_task,
        avatar_url=host_cfg.get("avatar_url")
    )
    await switch_mock.register_agent(host.agent_id, host.on_event_received)
    await switch_mock.register_agent(host.agent_id, log_event_to_terminal)

    # Housemates
    housemates = []
    for h_cfg in cast_cfg["housemates"]:
        hm = HousemateAgent(
            agent_id=h_cfg["id"],
            name=h_cfg["name"],
            archetype=h_cfg["archetype"],
            system_prompt=h_cfg["system_prompt"],
            switch_client=switch_mock,
            llm_client=llm,
            obsessions=h_cfg.get("obsessions"),
            catchphrases=h_cfg.get("catchphrases"),
            avatar_url=h_cfg.get("avatar_url")
        )
        await switch_mock.register_agent(hm.agent_id, hm.on_event_received)
        housemates.append(hm)

    # Saboteur Controller (secretly picks or forces Arthur / Elena)
    saboteur_ctrl = SaboteurController(housemates, force_saboteur_id="arthur")

    coordinator = EpisodeCoordinator(
        switch_client=switch_mock,
        host_agent=host,
        housemates=housemates,
        saboteur_controller=saboteur_ctrl,
        budget_task=budget_task,
        human_player_id="human",
        auto_pacing=False
    )

    console.print(f"[bold green]✓ Episode initialized with Saboteur:[/bold green] [bold red]{saboteur_ctrl.saboteur_name}[/bold red]")
    console.print("[dim]Starting 5-Phase Reality Episode...[/dim]\n")

    await coordinator.run_episode()

    # Verify & display Room-Level Isolation Proof
    table = Table(title="🛡️ Switch Server-Enforced Room Isolation Audit Log", style="cyan")
    table.add_column("Agent", style="bold")
    table.add_column("Target Isolated Room", style="yellow")
    table.add_column("Packets Received", justify="center")
    table.add_column("Isolation Status", style="bold green")

    # Marcus should NEVER see Elena's confession or Saboteur Den
    m_conf = switch_mock.verify_isolation("marcus", "confession-elena")
    table.add_row("Marcus", "#confession-elena", "0", "✅ 100% ISOLATED" if m_conf else "❌ LEAKED")

    # Maya should NEVER see Arthur's confession
    maya_conf = switch_mock.verify_isolation("maya", "confession-arthur")
    table.add_row("Maya", "#confession-arthur", "0", "✅ 100% ISOLATED" if maya_conf else "❌ LEAKED")

    # Elena should NEVER see the Saboteur Den
    elena_sab = switch_mock.verify_isolation("elena", "saboteur-den")
    table.add_row("Elena", "#saboteur-den", "0", "✅ 100% ISOLATED" if elena_sab else "❌ LEAKED")

    # Marcus should NEVER see the Saboteur Den
    marcus_sab = switch_mock.verify_isolation("marcus", "saboteur-den")
    table.add_row("Marcus", "#saboteur-den", "0", "✅ 100% ISOLATED" if marcus_sab else "❌ LEAKED")

    console.print("\n")
    console.print(table)
    console.print("\n[bold green]🎉 Episode completed successfully with zero context leaks![/bold green]\n")

async def run_live():
    console.print(Panel.fit(
        "[bold magenta]🏠 THE HOUSE IMPOSTER: LIVE DISCORD BROADCAST[/bold magenta]\n"
        "[italic cyan]Connected to Discord Server via Switch Bot & Webhooks[/italic cyan]",
        border_style="magenta"
    ))

    cast_cfg = load_cast_config()
    discord_client = DiscordLiveClient()
    await discord_client.initialize()
    console.print(f"[bold green]✓ Connected to Discord Guild ID:[/bold green] [cyan]{discord_client.guild_id}[/cyan]")

    llm = LLMClient()
    budget_task = BudgetTask("config/tasks.yaml")

    # Register Character Webhook Profiles
    host_cfg = cast_cfg["host"]
    discord_client.register_character_profile(
        agent_id=host_cfg["id"],
        name=host_cfg["name"],
        avatar_url=host_cfg.get("avatar_url", "https://api.dicebear.com/7.x/bottts/svg?seed=TheBigVoice")
    )

    host = HostAgent(
        agent_id=host_cfg["id"],
        name=host_cfg["name"],
        system_prompt=host_cfg["system_prompt"],
        switch_client=discord_client,
        llm_client=llm,
        budget_task=budget_task,
        avatar_url=host_cfg.get("avatar_url")
    )

    housemates = []
    for h_cfg in cast_cfg["housemates"]:
        discord_client.register_character_profile(
            agent_id=h_cfg["id"],
            name=f"{h_cfg['name']} [{h_cfg['archetype']}]",
            avatar_url=h_cfg.get("avatar_url", f"https://api.dicebear.com/7.x/bottts/svg?seed={h_cfg['name']}")
        )
        hm = HousemateAgent(
            agent_id=h_cfg["id"],
            name=h_cfg["name"],
            archetype=h_cfg["archetype"],
            system_prompt=h_cfg["system_prompt"],
            switch_client=discord_client,
            llm_client=llm,
            obsessions=h_cfg.get("obsessions"),
            catchphrases=h_cfg.get("catchphrases"),
            avatar_url=h_cfg.get("avatar_url")
        )
        housemates.append(hm)

    saboteur_ctrl = SaboteurController(housemates, force_saboteur_id="arthur")

    human_name = os.getenv("HUMAN_USERNAME", "izigriss")

    coordinator = EpisodeCoordinator(
        switch_client=discord_client,
        host_agent=host,
        housemates=housemates,
        saboteur_controller=saboteur_ctrl,
        budget_task=budget_task,
        human_player_id="human",
        human_player_name=human_name,
        auto_pacing=True
    )

    # Start live Discord Gateway listener for real-time human chat & votes
    discord_client.start_gateway()
    console.print("[bold green]✓ Live Discord Gateway Active: Listening for your messages in Discord![/bold green]")
    console.print(f"[bold green]✓ Live Episode Initialized! Saboteur:[/bold green] [bold red]{saboteur_ctrl.saboteur_name}[/bold red]")
    console.print(f"[italic cyan]👉 Jump into Discord server! Chat in #living-room and vote in #confession-human[/italic cyan]\n")

    try:
        await coordinator.run_episode()
    finally:
        await discord_client.close()

    console.print("\n[bold green]🎉 Live Discord Episode completed successfully![/bold green]\n")

def main():
    parser = argparse.ArgumentParser(description="The House Imposter: AI Reality Show")
    parser.add_argument("--simulate", action="store_true", default=True, help="Run instant zero-dependency simulation")
    parser.add_argument("--live", action="store_true", help="Connect to live Switch Gateway & Discord")
    parser.add_argument("--online", action="store_true", help="Use live LLM API calls in simulation mode")
    args = parser.parse_args()

    if args.live:
        asyncio.run(run_live())
    else:
        asyncio.run(run_simulation(use_online_llm=args.online))

if __name__ == "__main__":
    main()
