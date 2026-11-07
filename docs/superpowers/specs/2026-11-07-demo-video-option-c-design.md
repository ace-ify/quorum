# BlindCouncil Demo Video Specification: Option C (Discord Focus + Live Deliverables Reveal)

**Date:** 2026-11-07  
**Track:** WeMakeDevs x DevTools Academy Flip the Switch Hackathon — Track 01 ($2,000)  
**Deliverable:** 1080p Master Demo Video (`blindcouncil_final_demo.mp4`, ~2m 05s) with Voiceover Narration Script

---

## 1. Problem & Value Proposition
Standard multi-agent LLM systems suffer from **sycophancy, context pollution, and groupthink**—agents agree with the user or echo each other's biases.  
**BlindCouncil** eliminates this failure mode using **Switch AI's server-enforced room isolation**:
1. Autonomous AI specialists (Security, Scalability, FinOps, Database, Compliance) audit proposals in private, soundproof chambers (`#audit-*`) with zero cross-token leakage.
2. Specialists convene on the public floor (`#review-desk`) where Council Chair Athena synthesizes orthogonal friction into a Conflict Matrix.
3. Multi-turn heated technical debates resolve trade-offs with mathematical rigor and real invariants.
4. Human lead architect steers in natural language or fast commands (`!summary`, `!diagram`, `!manifest`, `approve`).
5. `!diagram` renders an actual visual architecture diagram (PNG/SVG with glowing nodes, not raw markdown text).
6. Consensus produces an official Michael Nygard `ADR-042.md`, GitHub `PR_COMMENT.md`, and hands off a concrete Section 6 Implementation Manifest to `@ClaudeCode` in `#dev-implementation`.

---

## 2. Multi-Turn Heated Debate Design (00:00 - 01:30)

### Phase 1: Intake & Soundproof Chambers (00:00 - 00:25)
- **Channel:** `#review-desk` & Soundproof Chambers Overview
- **Action:** Athena convenes review desk for `RFC-042: Scalable Real-Time WebSocket Messaging Cluster (100k Concurrent Conns)`.
- **Chambers:**
  - `#audit-security`: Aegis detects in-band heartbeat JWT vulnerability.
  - `#audit-scalability`: Vanguard detects DB connection pool exhaustion during pod rollouts.
  - `#audit-finops`: Ledger detects $3,500/mo over-provisioned 12-node cluster waste.
  - `#audit-database`: Titan detects dual-write race condition between Redis and Postgres.

### Phase 2: The Multi-Turn Conflict Floor (00:25 - 01:05)
- **Channel:** `#review-desk`
- **Conflict Matrix:**
  Athena publishes the 4-quadrant trade-off matrix.
- **The Debate:**
  1. **Aegis:** *“🚨 BLOCKING: In-band heartbeat token validation permits 15m revoked token window. Active CVE risk under SOC2 Article 4.”*
  2. **Vanguard:** *“⚡ HOLD ON AEGIS: Synchronous DB lookups on 100k WebSockets will exhaust connection pools and crash the database! p99 latency will spike past 140ms.”*
  3. **Aegis:** *“I’m not asking for raw DB queries, Vanguard! We need a distributed, sub-millisecond revocation layer at the gateway edge.”*
  4. **Vanguard:** *“Then a Redis Bloom Filter with an in-memory bitset is the only viable path. Sub-0.2ms lookups with zero database hits.”*
  5. **Ledger:** *“💰 CHECK YOUR BUDGET BOTH OF YOU: The author spec'd a 12-node provisioned MemoryDB cluster at $3,500/mo for a 20k off-peak baseline. Launch with 4 nodes and 75% memory autoscale. That saves $25,200/year while meeting burst traffic.”*
  6. **Titan:** *“🏛️ Dual-writing directly to Redis Pub/Sub and Postgres causes message loss. Enforce Transactional Outbox pattern with Debezium CDC for guaranteed delivery.”*
  7. **Athena:** *“📊 Consensus synthesized: Redis Bloom Filter adopted, 4-node cluster with autoscaling locked, Transactional Outbox enforced.”*

### Phase 3: Human Steering & Rendered Visual Architecture Diagram (01:05 - 01:30)
- **Channel:** `#review-desk`
- **Human Action:** `@izigriss` runs `!diagram`.
- **Bot Response:** Athena attaches an ultra-crisp, **rendered visual architecture diagram image** (dark mode graphic with connected colored blocks: Clients ➔ NLB ➔ 4-Node Cluster ➔ Redis Bloom Filter ➔ Transactional Outbox ➔ Kafka).
- **Human Action:** `@izigriss` runs `!manifest`.
- **Bot Response:** Athena outputs Section 6 file list and Claude Code terminal bash command.

---

## 3. Live Deliverables & Claude Code Bridge Reveal (01:30 - 02:05)

### Phase 4: Consensus & ADR Publication (01:30 - 01:45)
- **Human Action:** `@izigriss` types `approve`.
- **Bot Response:** Athena locks consensus and renders:
  - Michael Nygard format `ADR-042.md`
  - GitHub PR review comment format `PR_COMMENT.md`

### Phase 5: Autonomous Implementer Handoff (01:45 - 02:05)
- **Channel:** `#dev-implementation`
- **Athena Handoff to `@ClaudeCode`**:
  - Target Branch: `feat/adr-042-impl`
  - Verification: `pytest tests/ -v`
  - Files to Implement:
    1. `src/middleware/bloom_revocation.py`
    2. `src/cluster/config.yaml`
    3. `src/db/outbox_producer.py`
  - CLI Launch:
    ```bash
    claude -p "Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement files in '.'. Run 'pytest tests/ -v' until passing."
    ```

---

## 4. Video Assets & Generation Pipeline
1. **Visual Diagram Generator**: Script to generate a high-DPI visual SVG/PNG architecture diagram.
2. **HTML Frame Renders**: 5 distinct dynamic scenes with Discord dark theme, rendered diagram image embed, and real deliverables.
3. **Audio Master**: Clean synced narration track with segment duration metadata.
4. **FFmpeg Compilation**: Render at 1080p 25fps, mux with AAC audio, output `blindcouncil_final_demo.mp4`.

