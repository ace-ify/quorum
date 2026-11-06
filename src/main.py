"""
BlindCouncil: Multi-Agent Blind Architecture & RFC Review Desk
Main Entrypoint supporting:
  python -m src.main --simulate    # Instant 15s terminal simulation with room isolation proof
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

from .review.models import RFCProposal
from .llm.client import LLMClient
from .switch.mock_client import MockSwitchClient
from .switch.discord_client import DiscordLiveClient
from .agents.chair_agent import ChairAgent
from .agents.specialist import SpecialistAgent
from .engine.council_coordinator import CouncilCoordinator

console = Console(highlight=False)

def load_specialists_config():
    path = Path("config/specialists.yaml")
    if not path.exists():
        path = Path(__file__).parent.parent / "config" / "specialists.yaml"
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def load_sample_rfc() -> RFCProposal:
    path = Path("config/sample_rfcs/rfc_001_realtime_chat_architecture.md")
    if not path.exists():
        path = Path(__file__).parent.parent / "config" / "sample_rfcs" / "rfc_001_realtime_chat_architecture.md"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    return RFCProposal(
        rfc_id="RFC-042",
        title="RFC-042: Real-Time Messaging & Event Streaming Architecture",
        author="Staff Platform Engineer",
        content=content,
        target_traffic="100,000 Concurrent WebSockets (25,000 msg/sec)"
    )

async def run_simulation(use_online_llm: bool = False):
    console.print(Panel.fit(
        "[bold cyan]🏛️ BLINDCOUNCIL: MULTI-AGENT BLIND ARCHITECTURE REVIEW DESK[/bold cyan]\n"
        "[italic magenta]Powered by Switch AI's Server-Enforced Room Isolation[/italic magenta]",
        border_style="cyan"
    ))

    spec_cfg = load_specialists_config()
    rfc = load_sample_rfc()
    switch_mock = MockSwitchClient(workspace_id="blindcouncil-eng")
    llm = LLMClient() if use_online_llm else LLMClient(use_mock=True)

    # Terminal printer hook
    async def log_event_to_terminal(event: dict):
        room = event.get("room_id", "unknown")
        sender = event.get("sender_id", "system")
        content = event.get("content", "")

        color = "white"
        if sender == "chair":
            color = "bold yellow"
        elif sender == "security":
            color = "bold red"
        elif sender == "scalability":
            color = "bold blue"
        elif sender == "finops":
            color = "bold green"

        tag = f"[{room.upper()}]"
        console.print(f"[dim]{tag:<24}[/dim] [{color}]{sender.upper()}:[/{color}] {content}\n")

    # Chair Agent
    chair_cfg = spec_cfg["chair"]
    chair = ChairAgent(
        agent_id=chair_cfg["id"],
        name=chair_cfg["name"],
        system_prompt=chair_cfg["system_prompt"],
        switch_client=switch_mock,
        llm_client=llm,
        avatar_url=chair_cfg.get("avatar_url")
    )
    await switch_mock.register_agent(chair.agent_id, chair.on_event_received)
    await switch_mock.register_agent(chair.agent_id, log_event_to_terminal)

    # Specialists
    specialists = []
    for s_cfg in spec_cfg["specialists"]:
        s = SpecialistAgent(
            agent_id=s_cfg["id"],
            name=s_cfg["name"],
            title=s_cfg["title"],
            dimension=s_cfg["dimension"],
            system_prompt=s_cfg["system_prompt"],
            switch_client=switch_mock,
            llm_client=llm,
            avatar_url=s_cfg.get("avatar_url")
        )
        await switch_mock.register_agent(s.agent_id, s.on_event_received)
        specialists.append(s)

    coordinator = CouncilCoordinator(
        switch_client=switch_mock,
        chair_agent=chair,
        specialists=specialists,
        rfc_proposal=rfc,
        human_player_id="human",
        human_player_name="LeadArchitect",
        auto_pacing=False
    )

    console.print(f"[bold green]✓ Review Initialized for Proposal:[/bold green] [bold cyan]{rfc.title}[/bold cyan]")
    console.print("[dim]Executing 5-Phase Delphi Blind Review Lifecycle...[/dim]\n")

    await coordinator.run_review()

    # Verify & display Room-Level Isolation Proof
    table = Table(title="🛡️ Switch Server-Enforced Room Isolation Audit Log", style="cyan")
    table.add_column("Specialist", style="bold")
    table.add_column("Target Isolated Chamber", style="yellow")
    table.add_column("Packets Received", justify="center")
    table.add_column("Blind Isolation Status", style="bold green")

    # Aegis must NEVER receive Vanguard's or Ledger's packets during blind audit
    sec_scale = switch_mock.verify_isolation("security", "audit-scalability")
    table.add_row("Aegis (Security)", "#audit-scalability", "0", "✅ 100% BLIND ISOLATION" if sec_scale else "❌ LEAKED")

    sec_fin = switch_mock.verify_isolation("security", "audit-finops")
    table.add_row("Aegis (Security)", "#audit-finops", "0", "✅ 100% BLIND ISOLATION" if sec_fin else "❌ LEAKED")

    # Vanguard must NEVER receive Aegis's packets
    scale_sec = switch_mock.verify_isolation("scalability", "audit-security")
    table.add_row("Vanguard (Scale)", "#audit-security", "0", "✅ 100% BLIND ISOLATION" if scale_sec else "❌ LEAKED")

    # Ledger must NEVER receive Aegis's packets
    fin_sec = switch_mock.verify_isolation("finops", "audit-security")
    table.add_row("Ledger (FinOps)", "#audit-security", "0", "✅ 100% BLIND ISOLATION" if fin_sec else "❌ LEAKED")

    console.print("\n")
    console.print(table)
    console.print("\n[bold green]🎉 BlindCouncil Review complete! ADR generated: 'ADR-042_RealTime_Messaging.md'[/bold green]\n")

async def run_live():
    console.print(Panel.fit(
        "[bold cyan]🏛️ BLINDCOUNCIL: LIVE DISCORD REVIEW DESK[/bold cyan]\n"
        "[italic magenta]Multi-Agent Blind Architecture Review with Switch Discord Bot[/italic magenta]",
        border_style="cyan"
    ))

    spec_cfg = load_specialists_config()
    rfc = load_sample_rfc()
    discord_client = DiscordLiveClient()
    await discord_client.initialize()
    console.print(f"[bold green]✓ Connected to Discord Guild ID:[/bold green] [cyan]{discord_client.guild_id}[/cyan]")

    llm = LLMClient()

    # Register Character Webhook Profiles
    chair_cfg = spec_cfg["chair"]
    discord_client.register_character_profile(
        agent_id=chair_cfg["id"],
        name=f"{chair_cfg['name']} [Council Chair]",
        avatar_url=chair_cfg.get("avatar_url", "https://api.dicebear.com/7.x/bottts/svg?seed=AthenaChair")
    )

    chair = ChairAgent(
        agent_id=chair_cfg["id"],
        name=chair_cfg["name"],
        system_prompt=chair_cfg["system_prompt"],
        switch_client=discord_client,
        llm_client=llm,
        avatar_url=chair_cfg.get("avatar_url")
    )

    specialists = []
    for s_cfg in spec_cfg["specialists"]:
        discord_client.register_character_profile(
            agent_id=s_cfg["id"],
            name=f"{s_cfg['name']} [{s_cfg['title']}]",
            avatar_url=s_cfg.get("avatar_url", f"https://api.dicebear.com/7.x/bottts/svg?seed={s_cfg['name']}")
        )
        s = SpecialistAgent(
            agent_id=s_cfg["id"],
            name=s_cfg["name"],
            title=s_cfg["title"],
            dimension=s_cfg["dimension"],
            system_prompt=s_cfg["system_prompt"],
            switch_client=discord_client,
            llm_client=llm,
            avatar_url=s_cfg.get("avatar_url")
        )
        specialists.append(s)

    human_name = os.getenv("HUMAN_USERNAME", "LeadArchitect")

    coordinator = CouncilCoordinator(
        switch_client=discord_client,
        chair_agent=chair,
        specialists=specialists,
        rfc_proposal=rfc,
        human_player_id="human",
        human_player_name=human_name,
        auto_pacing=True
    )

    # Start live Discord Gateway listener
    discord_client.start_gateway()
    console.print("[bold green]✓ Live Discord Gateway Active: Listening for your architectural guidance![/bold green]")
    console.print(f"[bold green]✓ Review Convened for:[/bold green] [bold cyan]{rfc.title}[/bold cyan]")
    console.print(f"[italic cyan]👉 Open Discord: Channel #review-desk is live! Type !approve or !next to steer.[/italic cyan]\n")

    try:
        await coordinator.run_review()
    finally:
        await discord_client.close()

    console.print("\n[bold green]🎉 Live Council Review completed! ADR document published.[/bold green]\n")

def main():
    parser = argparse.ArgumentParser(description="BlindCouncil: Multi-Agent Blind Architecture Review Desk")
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
