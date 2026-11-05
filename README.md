# 🏠 The House Imposter: AI Reality Show

> **The world's first multi-agent social deduction reality show played inside Discord, powered by Switch's server-enforced room isolation.**  
> *Bigg Boss meets Among Us in team chat.*

[![Track](https://img.shields.io/badge/Track-02%20Best%20Personal%2FCreative%20Workflow-FF5722?style=for-the-badge)](https://www.wemakedevs.org/hackathons/switch)
[![Powered By](https://img.shields.io/badge/Powered%20By-Switch%20AI-6C5CE7?style=for-the-badge)](https://github.com/sandbox-quantum/switch)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)](LICENSE)

---

## 📺 2-Minute Demo Video

🎥 **[Watch the 2-Minute Gameplay & Architecture Demo](https://youtu.be/placeholder)** *(Recorded in Discord with live autonomous housemates and human player)*

---

## 🌟 What is "The House Imposter"?

Imagine moving into a digital mansion with four distinct AI personalities:
- **Marcus**: The protein-obsessed fitness fanatic who calls everyone out.
- **Elena**: The sweet influencer whose smile hides ruthless political scheming.
- **Arthur**: The cold, statistical analyst who calculates vote probabilities.
- **Maya**: The melodramatic queen who turns grocery budgeting into an emotional crisis.
- **The Big Voice**: The enigmatic, omniscient Host monitoring your every word.

Together, the housemates must cooperate with you (the human player) to pass the weekly **1,000-Point Luxury Budget Task**. 

**The catch?** One of the housemates is secretly **The Saboteur (The Imposter)**, whose secret objective is to subtly bust the budget, drop essential rations, and frame innocent housemates during the weekend eviction ceremony!

---

## ⚡ Why Switch is Indispensable ("The Switch Superpower")

Standard multi-agent frameworks (LangGraph, AutoGen, CrewAI) suffer from a fatal flaw when building social games: **there are no true secrets**. In flat group chats, all agents share the same prompt buffer or can inspect other agents' messages. An agent can only *pretend* not to know what someone said behind their back.

**The House Imposter is architecturally impossible without Switch's Server-Enforced Room Isolation.**

| Game Mechanic | Without Switch (Standard AI Group Chat) | With Switch ("The House Imposter") |
| :--- | :--- | :--- |
| **Confession Room** | Impossible. Every agent's prompt history leaks what was confessed. | **True Secrecy.** Switch enforces membership on every WebSocket subscription. Non-members never receive the network packets. |
| **Secret Alliances** | Fake. Target agent has to be prompted with "please pretend you didn't see this message". | **Real Asymmetric Knowledge.** Two players can whisper in `#alliance-marcus-human`. The target has literally zero contextual bytes. |
| **Saboteur Den** | Impossible. Imposter identity is exposed in the shared event stream. | **Isolated Mission Channel.** Only the Saboteur receives sabotage targets from The Big Voice. |
| **The Dramatic Leak** | Flat text generation. | **Real intercepted evidence.** The Host intercepts raw text from an isolated channel and drops it into `#living-room` as a live bombshell. |

---

## 🗺️ Channel & Room Architecture

```
                    ┌────────────────────────────────────────┐
                    │          #living-room (Public)         │
                    │  All Housemates + Human + Big Voice    │
                    └───────────────────┬────────────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│ #confession-maya │           │  #saboteur-den   │           │ #alliance-arthur │
│ (Maya + Host)    │           │ (Imposter + Host)│           │ (Arthur + Human) │
│ Secret voting &  │           │ Secret sabotage  │           │ Secret scheming  │
│ uncensored rants │           │ instructions     │           │ & vote plotting  │
└──────────────────┘           └──────────────────┘           └──────────────────┘
```

---

## 🔄 The 5-Phase Episode Loop

1. **Morning Briefing**: The Big Voice announces the **1,000-Point Luxury Budget Allocation Task** in `#living-room` and secretly pings the Saboteur inside `#saboteur-den`.
2. **Task & Secret Scheming**: Housemates debate grocery staples vs luxury cravings in `#living-room` while secretly forming side alliances. The Saboteur subtly manipulates calculations.
3. **The Big Voice's Dramatic Leak**: The Big Voice evaluates the submitted budget (mathematically verified). Then, at peak tension, The Big Voice leaks an intercepted quote from a private room into `#living-room`!
4. **Confession Room Nominations**: Each housemate is summoned into their private `#confession-<name>` room to cast a secret eviction vote with uncensored justifications.
5. **Weekend Eviction Ceremony**: The house gathers on the couch. The Big Voice reveals the votes, dramatically reveals whether the evicted housemate was Innocent or the Saboteur, and moves them to `#evicted-lounge`.

---

## 🚀 Quickstart & Reproduction Guide

We built The House Imposter with **Dual-Mode Architecture** so hackathon judges can verify and experience the game in seconds.

### Mode 1: Instant 30-Second Terminal Simulation (Judge Friendly)
No Discord bot, no Docker, zero configuration required!

```bash
# 1. Clone repository
git clone https://github.com/your-username/the-house-imposter.git
cd the-house-imposter

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure API key
cp .env.example .env
# Add your GEMINI_API_KEY or OPENAI_API_KEY in .env

# 4. Run instant simulation
python -m src.main --simulate
```
*Observe the full 5-phase episode unfold in rich, colorized terminal output with true room-isolated memory logs.*

---

### Mode 2: Full Live Discord Experience with Switch
To experience the game live in Discord with real webhooks and private channels:

1. **Start Switch Console / Server**:
   Ensure Switch Gateway is running on `http://localhost:8080`.
2. **Connect Discord**:
   Follow Switch's Discord integration guide to add your bot with `Manage Channels`, `Manage Roles`, and `Manage Webhooks`.
3. **Launch The House Engine**:
   ```bash
   python -m src.main --live
   ```
4. Jump into your Discord server's `#living-room` and start playing alongside the AI housemates!

---

## 🎮 Admin Commands for Video Recording

When recording live demos or steering the pace, use these admin commands in `#living-room`:
- `!next` — Instantly advance to the next phase (skip waiting for phase timers).
- `!leak` — Force The Big Voice to immediately leak a confidential quote.
- `!pause` / `!resume` — Pause or resume phase clocks.
- `!reset` — Restart the episode from Phase 1.

---

## 📂 Project Structure

```
├── PRD.md                  # Comprehensive Product Requirements Document
├── ARCHITECTURE.md         # System design, state machine, sequence diagrams
├── GAME_DESIGN.md          # Complete game rules, catalog, character profiles
├── config/
│   ├── cast.yaml           # YAML character archetypes, prompts, avatars
│   ├── tasks.yaml          # 1,000-Point Budget catalog & sabotage objectives
│   └── game_rules.yaml     # Room templates, phase timers, admin commands
└── src/
    ├── main.py             # CLI entrypoint (--live or --simulate)
    ├── engine/             # State machine, turn controller, admin handler
    ├── agents/             # The Big Voice, Housemate agents, Saboteur logic
    ├── tasks/              # Budget task validator & receipt generator
    ├── switch/             # Switch WS/REST client & local in-memory simulator
    └── llm/                # Unified Gemini / OpenAI client
```

---

## 👥 Authors & Acknowledgements

Created for the **Flip the Switch Hackathon** (November 2026) powered by **Switch AI** and **WeMakeDevs**.

