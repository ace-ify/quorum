# 🏛️ BlindCouncil: Multi-Agent Blind Architecture & RFC Review Desk

> **The world's first multi-agent architecture review desk that eliminates LLM groupthink and sycophancy using Switch's server-enforced room isolation.**  
> *Independent domain audits $\rightarrow$ Cross-specialist trade-off debate $\rightarrow$ Production-ready Architecture Decision Records (`ADR.md`).*

[![Track](https://img.shields.io/badge/Track-01%20Best%20Business%20Workflow-00B894?style=for-the-badge)](https://www.wemakedevs.org/hackathons/switch)
[![Powered By](https://img.shields.io/badge/Powered%20By-Switch%20AI-6C5CE7?style=for-the-badge)](https://github.com/sandbox-quantum/switch)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)](LICENSE)

---

## 📺 2-Minute Demo Video

🎥 **[Watch the 2-Minute BlindCouncil Demonstration](https://youtu.be/placeholder)**  
*(Demonstrating simultaneous blind chamber audits, real-time trade-off conflict detection in Discord, and automated ADR publishing).*

---

## ⚡ The Problem: Why AI Architecture & Code Reviews Fail Today

When developers paste an **RFC (Request for Comments)**, **System Design**, or **Infrastructure Spec** into ChatGPT or Claude, they run into two fatal problems:

1. **Superficial Single-Prompt Reviews:** A single prompt cannot deeply audit orthogonal engineering domains (security, distributed scale, and cloud economics) simultaneously.
2. **The LLM Sycophancy & Groupthink Trap:** If you put multiple AI agents into a single shared chat channel, **they anchor on the first opinion posted**. If Agent 1 says *"Looks good to me!"*, Agent 2 and 3 praise the proposal and overlook critical $25k/year cloud waste or token session-hijacking holes.

Real institutional engineering teams (Google, Amazon, Meta) solve this using the **Delphi Method**: specialists conduct **independent, blind evaluations without cross-contamination**, then meet to debate conflicting trade-offs.

---

## 🛡️ Why Switch is Indispensable ("The Switch Superpower")

Standard multi-agent frameworks (LangGraph, AutoGen, CrewAI) operate on shared event buses where every agent can inspect the global context. 

**BlindCouncil is architecturally impossible without Switch's Server-Enforced Room Isolation.**

| Feature | Without Switch (Flat AI Group Chat) | With Switch ("BlindCouncil") |
| :--- | :--- | :--- |
| **Blind Chamber Isolation** | Impossible. Agents share memory buffers or channel history, causing LLM anchoring. | **Protocol-Enforced Blindness.** Switch verifies membership on every WebSocket event. `#audit-security` bytes are physically never sent to the FinOps or Scale agents. |
| **Independent Scoring** | Biased. Later agents adjust their scores to match earlier agents. | **Pure Independent Rubrics.** Each specialist evaluates the RFC in isolation, locking their score into private Switch Room Documents. |
| **Cross-Domain Conflict Detection** | Flat, generic compromises. | **Real Orthogonal Tensions.** The Chair reveals conflicting findings (e.g. Security's HSM encryption vs. FinOps' 400% budget breach) at `#review-desk`. |
| **Human in the Loop** | Passive reader. | **Executive Lead.** The human architect negotiates and resolves trade-offs live in Discord, generating a formal `ADR.md`. |

---

## 🗺️ Channel & Room Architecture

```
                    ┌────────────────────────────────────────┐
                    │          #review-desk (Public)         │
                    │   Human Lead + Athena (Chair) + Council│
                    └───────────────────┬────────────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│ #audit-security  │           │#audit-scalability│           │  #audit-finops   │
│ Aegis + Chair    │           │ Vanguard + Chair │           │  Ledger + Chair  │
│ Threat modeling, │           │ Concurrency, p99 │           │ Cloud waste, AWS │
│ OWASP & auth     │           │ latency & locks  │           │ pricing & ROI    │
└──────────────────┘           └──────────────────┘           └──────────────────┘
```

---

## 🔄 The 5-Phase Delphi Review Lifecycle

1. **RFC Intake**: Human Lead submits an architectural proposal to `#review-desk`.
2. **Isolated Blind Audits**: Switch spawns 3 isolated chambers (`#audit-security`, `#audit-scalability`, `#audit-finops`). Specialists independently review without context pollution.
3. **Conflict Synthesis**: The Council Chair (`Athena`) aggregates the blind scorecards and detects cross-domain trade-off clashes.
4. **Council Debate in `#review-desk`**: Blind findings are revealed publicly. Specialists debate tensions (Cost vs Security vs Latency) with the Human Lead.
5. **ADR Generation & Sign-Off**: The Council compiles the consensus into an official Michael Nygard-standard **Architecture Decision Record (`ADR-042.md`)** committed to the repository!

---

## 🚀 Quickstart & Reproduction Guide

We built BlindCouncil with **Dual-Mode Architecture** so hackathon judges can verify and experience the entire workflow in seconds.

### Mode 1: Instant 15-Second Terminal Simulation (Judge Friendly)
Zero Docker, zero Discord bot, zero API configuration required!

```bash
# 1. Clone repository
git clone https://github.com/your-username/blindcouncil.git
cd blindcouncil

# 2. Run instant simulation
python -m src.main --simulate
```
*Observe the full 5-phase Delphi review, inspect the room isolation audit log, and view the generated `ADR-042_RealTime_Messaging.md`!*

---

### Mode 2: Live Discord Integration with Switch
Experience BlindCouncil live in Discord with real webhooks and private channels:

1. **Configure `.env`**:
   ```env
   DISCORD_BOT_TOKEN=your_bot_token_here
   DISCORD_GUILD_ID=your_guild_id_here
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
2. **Launch BlindCouncil**:
   ```bash
   python -m src.main --live
   ```
3. Open Discord, watch `#review-desk` convene, and guide the architectural decisions!

---

## 🧪 Automated Test Suite

Run the built-in zero-dependency test suite:

```bash
python tests/run_tests.py
```
```
...
----------------------------------------------------------------------
Ran 3 tests in 0.004s

OK (Verifying Room Isolation Guarantees, Conflict Detection, and ADR Generation)
```

---

## 👥 Authors & Acknowledgements

Created for the **Flip the Switch Hackathon** (November 2026) powered by **Switch AI** and **WeMakeDevs**.
