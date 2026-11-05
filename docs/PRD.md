# Product Requirements Document (PRD)

## Project: The House Imposter: AI Reality Show
**Track:** Track 02 — Best Personal or Creative Workflow ($2,000)  
**Hackathon:** Flip the Switch (WeMakeDevs x DevTools Academy, powered by Switch AI)  
**Version:** 1.0.0  
**Status:** Approved Specification  

---

## 1. Executive Summary & Vision

### 1.1 The Concept
**The House Imposter: AI Reality Show** is the world's first multi-agent social deduction reality game played entirely within a team chat platform (Discord) via **Switch**. 

The experience fuses the high-stakes collaborative tension of **Among Us** with the dramatic interpersonal politics, secret confessions, and scandalous betrayals of **Bigg Boss / Big Brother**. 

A human player moves into a virtual house alongside 4 diverse, autonomous AI housemates governed by a mysterious, omniscient Host known as **"The Big Voice"**. Among the housemates lurks **one secret Saboteur (The Imposter)** whose mission is to subtly derail the house's weekly tasks without getting caught.

### 1.2 The "Why Switch?" Breakthrough: Server-Enforced Room Isolation
Standard LLM group chats suffer from a fatal flaw: **there are no true secrets**. In a standard LLM chat or single-prompt setup, every participant shares the same prompt history or sees the same stream. Agents can only *pretend* not to know what someone said behind their back.

**The House Imposter leverages Switch's fundamental architectural superpower: Server-Enforced Room Isolation.**
- Switch verifies membership on every WebSocket subscription event.
- When a housemate steps into `#confession-<player>` to conspire with the Host, **Switch physically withholds those events from every other agent's connection**.
- When two contestants scheme in a secret `#alliance-p1-p2` channel, the target of their plot has **0% contextual knowledge** of the conspiracy.
- **Without Switch, this game is architecturally impossible in a team chat environment.**

---

## 2. Hackathon Alignment & Target Audience

### 2.1 Track Selection
- **Target:** **Track 02 — Best Personal or Creative Workflow ($2,000)**.
- **Strategic Competitive Advantage:**
  - 85%+ of hackathon competitors are crowded into Track 01 (Incident response bots, PR review bots, DevOps desks).
  - Track 02 is wide open. "The House Imposter" stands out immediately as fun, deeply engaging, visually cinematic, and technically rigorous.

### 2.2 Hackathon Criteria Mapping
| Judging Criterion | How "The House Imposter" Wins |
| :--- | :--- |
| **1. Centrality of Switch** | Switch's server-enforced room isolation, dynamic room creation, per-agent identities via Discord webhooks, and exclusive roles are the core gameplay engine. The game ceases to function without Switch. |
| **2. Technical Execution & Reproducibility** | Full Python async architecture with **Dual Mode**: runs live on Switch/Discord OR in a zero-dependency CLI simulation mode (`--simulate`) allowing judges to clone and experience a full game in 30 seconds. |
| **3. Creativity & Impact** | First real combination of reality TV drama and social deduction powered by isolated autonomous agents and human collaboration. |
| **4. Presentation & Delivery** | 2-minute cinematic gameplay video, clear Discord webhook avatars, formatted budget receipts, and an exhaustive README. |

---

## 3. Core Gameplay Loop

An episode of *The House Imposter* progresses through 5 sequential phases:

```
[Phase 1: Morning Briefing]
         │
         ▼
[Phase 2: Luxury Budget Task & Secret Sabotage]
         │
         ▼
[Phase 3: The Big Voice's Dramatic Leak]
         │
         ▼
[Phase 4: Confession Room Nominations]
         │
         ▼
[Phase 5: Weekend Ka Vaar / Eviction Ceremony]
```

### 3.1 Phase 1: Morning Briefing & Secret Mission Delivery
1. **Loudspeaker Call**: The Host ("Big Voice") pings all housemates in `#living-room` announcing the day's challenge: **The 1,000-Point Luxury Budget Allocation**.
2. **Secret Saboteur Ping**: The Host secretly messages the designated Saboteur inside `#saboteur-den`:
   - *Target:* Subtly manipulate the budget so it exceeds 1,000 points or drops essential food rations, while deflecting suspicion onto another housemate.

### 3.2 Phase 2: Luxury Budget Task & Interpersonal Dynamics
1. **Collaborative Planning**: In `#living-room`, housemates discuss, propose, and negotiate items from the official House Catalog (Rice, Coffee, Spa Pass, Wi-Fi Hours, Protein, etc.).
2. **Individual Agendas**: Each housemate has personal cravings (e.g. The Fitness Buff demands Protein; The Influencer demands Coffee).
3. **The Sabotage**: The Saboteur introduces deceptive math, swaps items at the last second, or pushes for budget-busting splurges.
4. **Secret Whispers**: Players can invite each other into private `#alliance-<p1>-<p2>` rooms to coordinate votes or discuss who seems suspicious.

### 3.3 Phase 3: Evaluation & The Dramatic Confession Leak
1. **Mathematical Verification**: The Host evaluates the final submitted budget. If total cost > 1,000 points or essentials are missing $\rightarrow$ **TASK FAILED**.
2. **The Dramatic Leak (The Bigg Boss Signature)**:
   - The Host drops an intercepted quote into `#living-room`:
   > *"Attention Housemates: The Big Voice sees everything. Earlier today, someone entered a private room and whispered: 'Let's let the task fail so we can blame Arthur!' Explain yourselves."*
3. Chaos and public accusations erupt across `#living-room`.

### 3.4 Phase 4: Confession Room Nominations (Secret Voting)
1. **One-on-One Summoning**: The Host summons each housemate one-by-one into their private `#confession-<player>` channel.
2. **The Nomination**:
   - Host: *"Who do you nominate for eviction this week, and what is your reason?"*
   - Player casts secret vote and vents real suspicions without anyone outside knowing.

### 3.5 Phase 5: Eviction Ceremony (Weekend Ka Vaar)
1. **Gathering**: All housemates assemble in `#living-room`.
2. **The Tally**: The Host announces the nomination counts with dramatic suspense.
3. **The Reveal**: The contestant with the most votes is evicted:
   - *"Arthur, by decision of the house, you are evicted. The Big Voice reveals... Arthur was INNOCENT! The Saboteur is still among you."*
4. **Spectator Transition**: The evicted player's write access to `#living-room` is revoked; they are moved to `#evicted-lounge` to watch the aftermath.

---

## 4. Room & Channel Architecture

| Room Name | Scope | Members | Purpose |
| :--- | :--- | :--- | :--- |
| **`#living-room`** | Public | All Housemates, Human Player, Host | General banter, task negotiations, public arguments, eviction ceremony. |
| **`#confession-<name>`** | Isolated (1:1) | 1 Player + Host | Private therapy, true suspicions, secret eviction nominations. |
| **`#saboteur-den`** | Isolated (1:1) | Saboteur + Host | Secret sabotage instructions, sabotage triggers. |
| **`#alliance-<a>-<b>`** | Dynamic Private | 2 Collaborating Players | Secret backroom plotting, pact-making, vote trading. |
| **`#evicted-lounge`** | Spectator | Evicted Players + Host | After-show reactions, commentary, spectator viewing. |

---

## 5. Cast & Character Archetypes

The game ships with 4 diverse AI archetypes plus the Host, fully customizable via `config/cast.yaml`:

1. **The Big Voice (Host)**: Omniscient, authoritative, witty, neutral narrator. Enforces rules, calculates budget math, drops leaks.
2. **Marcus "The Fitness Buff" (Loud & Direct)**: Aggressive, focused on food/protein rations, impatient with over-analyzers, easily agitated.
3. **Elena "The Sweet Influencer" (Diplomatic & Cunning)**: Polite and sweet in public, hyper-protective of luxuries, gossips ruthlessly in confession.
4. **Arthur "The Cold Analyst" (Logical & Calculative)**: Speaks in statistics and probabilities, keeps spreadsheets of everyone's votes, suspicious of emotional outbursts.
5. **Maya "The Drama Queen" (Volatile & Vocal)**: Takes every remark personally, creates grand scenes, shifts blame immediately when accused.
6. **The Human Player (You)**: Moves in as an equal housemate, chats, schemes, proposes budget items, and votes in confession.

---

## 6. Functional Requirements

### 6.1 Game Engine & Pacing
- **FR-1**: Engine must maintain distinct game state machines for Episode, Phase, and Task status.
- **FR-2**: Autonomous progression on phase timers (configurable, default 120s per phase).
- **FR-3**: Admin command overrides for video capture (`!next`, `!leak`, `!pause`, `!reset`).

### 6.2 Task & Sabotage Engine
- **FR-4**: Mathematical parser for the 1,000-Point Luxury Budget Task.
- **FR-5**: Automatic validation of mandatory staples (Rice/Flour, Cooking Oil, Dal) and total sum verification.
- **FR-6**: Automatic generation of Discord-formatted receipt breakdown.

### 6.3 Switch Protocol Integration
- **FR-7**: Dedicated WebSocket connection per agent maintaining independent session tokens and room boundaries.
- **FR-8**: Strict context separation: housemate LLM prompts must contain ONLY messages received in rooms that agent is a member of.
- **FR-9**: REST API usage for `post_message`, `create_room`, `send_targeted_message`, and `create_room_document`.

### 6.4 Zero-Dependency Simulation Mode
- **FR-10**: Support `--simulate` CLI flag to run the entire game loop in terminal without requiring Docker, Switch, or Discord tokens.

---

## 7. Success Metrics
1. **Zero Context Leakage**: Proof in logs that no AI agent received context from rooms they are not members of.
2. **Flawless 2-Minute Demo Recording**: Clean execution of one full round from briefing to eviction with zero human glitches.
3. **10-Second Reproduction**: Any hackathon judge running `python main.py --simulate` observes the full drama, sabotage, and eviction in terminal within 30 seconds.

