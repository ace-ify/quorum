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
from typing import Optional, List, Dict
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from .review.models import RFCProposal
from .review.ingestion import IngestionEngine
from .llm.client import LLMClient
from .switch.mock_client import MockSwitchClient
from .switch.discord_client import DiscordLiveClient
from .agents.chair_agent import ChairAgent
from .agents.specialist import SpecialistAgent
from .agents.specialist_factory import SpecialistFactory
from .engine.council_coordinator import CouncilCoordinator

console = Console(highlight=False)

def load_chair_config():
    path = Path("config/specialists.yaml")
    if not path.exists():
        path = Path(__file__).parent.parent / "config" / "specialists.yaml"
    with open(path, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    return cfg["chair"]

async def run_simulation(
    sample_name: Optional[str] = "realtime_chat",
    file_path: Optional[str] = None,
    specialist_mode: str = "auto",
    custom_specialist_str: Optional[str] = None,
    use_online_llm: bool = False
):
    console.print(Panel.fit(
        "[bold cyan]🏛️ BLINDCOUNCIL: MULTI-AGENT BLIND ARCHITECTURE REVIEW DESK[/bold cyan]\n"
        "[italic magenta]Powered by Switch AI's Server-Enforced Room Isolation[/italic magenta]",
        border_style="cyan"
    ))

    # 1. Ingest RFC Proposal
    if file_path:
        rfc = IngestionEngine.load_file(file_path)
    else:
        rfc = IngestionEngine.load_sample(sample_name or "realtime_chat")

    switch_mock = MockSwitchClient(workspace_id="blindcouncil-eng")
    llm = LLMClient() if use_online_llm else LLMClient(use_mock=True)

    # 2. Terminal printer hook
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
        elif sender == "database":
            color = "bold cyan"
        elif sender == "compliance":
            color = "bold magenta"

        tag = f"[{room.upper()}]"
        console.print(f"[dim]{tag:<24}[/dim] [{color}]{sender.upper()}:[/{color}] {content}\n")

    # 3. Chair Agent
    chair_cfg = load_chair_config()
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

    # 4. Specialists Selection via SpecialistFactory
    catalog = SpecialistFactory.load_catalog(switch_mock, llm)
    
    if specialist_mode == "all":
        specialists = catalog
    elif specialist_mode == "core":
        specialists = [s for s in catalog if s.agent_id in ["security", "scalability", "finops"]]
    else: # auto-select based on RFC topic
        specialists = SpecialistFactory.auto_select_for_rfc(rfc.content, catalog)

    # Dynamic custom specialist injection if requested
    if custom_specialist_str:
        parts = custom_specialist_str.split(":")
        c_name = parts[0].strip()
        c_title = parts[1].strip() if len(parts) > 1 else f"Specialist in {c_name}"
        c_dim = parts[2].strip() if len(parts) > 2 else c_name
        custom_spec = SpecialistFactory.create_custom_specialist(
            name=c_name,
            title=c_title,
            dimension=c_dim,
            system_prompt="",
            switch_client=switch_mock,
            llm_client=llm
        )
        specialists.append(custom_spec)

    for s in specialists:
        await switch_mock.register_agent(s.agent_id, s.on_event_received)

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
    console.print(f"[bold green]✓ Convened Specialists ({len(specialists)}):[/bold green] " + ", ".join(f"[yellow]{s.name}[/yellow] ({s.dimension})" for s in specialists))
    console.print("[dim]Executing 5-Phase Delphi Blind Review Lifecycle...[/dim]\n")

    await coordinator.run_review()

    # Verify & display Room-Level Isolation Proof dynamically across all specialists
    table = Table(title="🛡️ Switch Server-Enforced Room Isolation Audit Log", style="cyan")
    table.add_column("Specialist", style="bold")
    table.add_column("Target Isolated Chamber", style="yellow")
    table.add_column("Packets Received", justify="center")
    table.add_column("Blind Isolation Status", style="bold green")

    for s in specialists:
        for other_s in specialists:
            if s.agent_id != other_s.agent_id:
                other_chamber = f"audit-{other_s.agent_id}"
                is_isolated = switch_mock.verify_isolation(s.agent_id, other_chamber)
                table.add_row(
                    f"{s.name} ({s.agent_id})",
                    f"#{other_chamber}",
                    "0",
                    "✅ 100% BLIND ISOLATION" if is_isolated else "❌ LEAKED"
                )

    console.print("\n")
    console.print(table)

    clean_title = "".join(c if c.isalnum() else "_" for c in rfc.title.split(":")[-1].strip()).strip("_")[:30]
    adr_id = rfc.rfc_id if rfc.rfc_id else "ADR-042"
    console.print(f"\n[bold green]🎉 BlindCouncil Review complete![/bold green]")
    console.print(f"📄 Architecture Decision Record: [bold cyan]{adr_id}_{clean_title}.md[/bold cyan]")
    console.print(f"💬 GitHub PR Review Comment:    [bold cyan]PR_COMMENT_{adr_id}_{clean_title}.md[/bold cyan]\n")

async def run_live(
    sample_name: Optional[str] = "realtime_chat",
    file_path: Optional[str] = None,
    specialist_mode: str = "auto"
):
    console.print(Panel.fit(
        "[bold cyan]🏛️ BLINDCOUNCIL: LIVE DISCORD REVIEW DESK[/bold cyan]\n"
        "[italic magenta]Multi-Agent Blind Architecture Review with Switch Discord Bot[/italic magenta]",
        border_style="cyan"
    ))

    # 1. Ingest RFC Proposal
    if file_path:
        rfc = IngestionEngine.load_file(file_path)
    else:
        rfc = IngestionEngine.load_sample(sample_name or "realtime_chat")

    discord_client = DiscordLiveClient()
    await discord_client.initialize()
    console.print(f"[bold green]✓ Connected to Discord Guild ID:[/bold green] [cyan]{discord_client.guild_id}[/cyan]")

    llm = LLMClient()

    # 2. Register Character Webhook Profiles
    chair_cfg = load_chair_config()
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

    catalog = SpecialistFactory.load_catalog(discord_client, llm)
    if specialist_mode == "all":
        specialists = catalog
    elif specialist_mode == "core":
        specialists = [s for s in catalog if s.agent_id in ["security", "scalability", "finops"]]
    else:
        specialists = SpecialistFactory.auto_select_for_rfc(rfc.content, catalog)

    for s in specialists:
        discord_client.register_character_profile(
            agent_id=s.agent_id,
            name=f"{s.name} [{s.title}]",
            avatar_url=s.avatar_url or f"https://api.dicebear.com/7.x/bottts/svg?seed={s.name}"
        )

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
    console.print(f"[bold green]✓ Active Council Members ({len(specialists)}):[/bold green] " + ", ".join(f"[yellow]{s.name}[/yellow]" for s in specialists))
    console.print(f"[italic cyan]👉 Open Discord: Channel #review-desk is live! Chat naturally, steer the specialists, or say 'approve' when ready.[/italic cyan]\n")

    try:
        await coordinator.run_review()
    finally:
        await discord_client.close()

    clean_title = "".join(c if c.isalnum() else "_" for c in rfc.title.split(":")[-1].strip()).strip("_")[:30]
    adr_id = rfc.rfc_id if rfc.rfc_id else "ADR-042"
    console.print(f"\n[bold green]🎉 Live Council Review completed![/bold green]")
    console.print(f"📄 Architecture Decision Record: [bold cyan]{adr_id}_{clean_title}.md[/bold cyan]")
    console.print(f"💬 GitHub PR Review Comment:    [bold cyan]PR_COMMENT_{adr_id}_{clean_title}.md[/bold cyan]\n")

def main():
    parser = argparse.ArgumentParser(description="BlindCouncil: Multi-Agent Blind Architecture Review Desk")
    parser.add_argument("--simulate", action="store_true", help="Run instant zero-dependency simulation")
    parser.add_argument("--live", action="store_true", help="Connect to live Switch Gateway & Discord")
    parser.add_argument("--online", action="store_true", help="Use live LLM API calls in simulation mode")
    parser.add_argument("--sample", type=str, default="realtime_chat", help="Benchmark sample RFC ('realtime_chat' or 'database_migration')")
    parser.add_argument("--file", type=str, default=None, help="Path to custom RFC file (.md, .txt, .sql)")
    parser.add_argument("--specialists", type=str, default="auto", choices=["auto", "all", "core"], help="Specialist roster selection")
    parser.add_argument("--add-specialist", type=str, default=None, help="Dynamic custom specialist 'Name:Title:Dimension'")
    args = parser.parse_args()

    if args.live:
        asyncio.run(run_live(
            sample_name=args.sample,
            file_path=args.file,
            specialist_mode=args.specialists
        ))
    else:
        asyncio.run(run_simulation(
            sample_name=args.sample,
            file_path=args.file,
            specialist_mode=args.specialists,
            custom_specialist_str=args.add_specialist,
            use_online_llm=args.online
        ))

if __name__ == "__main__":
    main()
