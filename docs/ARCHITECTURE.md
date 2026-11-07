# Quorum 2.0 System Architecture & Technical Specification

**Project:** Quorum — Multi-Agent Blind Architecture Review Desk  
**Hackathon Track:** Track 01: Best Business Workflow ($2,000 Prize)  
**Target Environment:** Switch Core 0.31.0, Discord API / Gateway Webhooks, Terminal Coding Agents (Claude Code / Codex)  
**Specification Version:** 2.0.0 (Production Enterprise Standard)

---

## 1. High-Level Architecture Topology

```mermaid
flowchart TD
    subgraph UI ["User & Delivery Surfaces"]
        Studio["Quorum Studio (web/index.html)"]
        Discord["Discord Engineering Review Desk"]
        CLI["Quorum CLI (python src/main.py)"]
    end

    subgraph Switch ["Switch Core 0.31.0 (Isolation Gateway)"]
        SW_Router["Switch Message Router & ACL Policy Engine"]
        SW_WS["Per-Agent Isolated WebSockets"]
        SW_Rooms["Room State & Boundary Isolation"]
        
        SW_Router --- SW_WS
        SW_Router --- SW_Rooms
    end

    subgraph Chambers ["Isolated Blind Specialist Chambers (Zero Cross-Leakage)"]
        ChSec["#audit-security\nAegis (Staff Security Auditor)"]
        ChScale["#audit-scalability\nVanguard (Distributed Systems)"]
        ChFin["#audit-finops\nLedger (Lead Cloud Economics)"]
        ChData["#audit-database\nTitan (Data & State Reliability)"]
    end

    subgraph CouncilFloor ["Public Council Deliberation Floor"]
        Chair["Athena (Council Chair)"]
        ConflictEngine["Trade-Off Conflict Detection Engine"]
        PublicFloor["#review-desk (Public Floor)"]
        Human["izigriss (Lead Architect / Human Lead)"]
    end

    subgraph Downstream ["Autonomous Implementation Pipeline"]
        ADR["Michael Nygard Standard ADR-042.md"]
        PRComment["GitHub PR Sticky Comment & Scorecard"]
        ClaudeCode["Claude Code / Codex Autonomous Agent"]
    end

    UI <--> Switch
    Switch --> ChSec
    Switch --> ChScale
    Switch --> ChFin
    Switch --> ChData

    ChSec --> PublicFloor
    ChScale --> PublicFloor
    ChFin --> PublicFloor
    ChData --> PublicFloor

    PublicFloor <--> Chair
    PublicFloor <--> ConflictEngine
    PublicFloor <--> Human

    Human -- "approve / steer" --> Chair
    Chair --> ADR
    Chair --> PRComment
    Chair --> ClaudeCode
```

---

## 2. Dual-Phase Deliberation Protocol

Quorum executes an architectural review in two distinct phases:

### Phase 1: Isolated Blind Assessment (Zero-Leakage Invariant)
1. **RFC Ingestion:** A technical proposal (e.g. `RFC-042`) is submitted via GitHub PR, Webhook, CLI, or the Studio UI.
2. **Soundproof Dispatch:** Council Chair Athena distributes the identical RFC specification simultaneously into 4 soundproof Switch chambers:
   - `#audit-security` (Aegis)
   - `#audit-scalability` (Vanguard)
   - `#audit-finops` (Ledger)
   - `#audit-database` (Titan)
3. **Independent Analysis:** Each specialist inspects the design strictly against its domain invariants without visibility into other specialists' findings.
4. **Scorecard Submission:** Specialists generate a 1–10 score, explicit failure modes, and non-negotiable architectural mandates.

### Phase 2: Public Council Floor & Conflict Resolution
1. **Matrix Publication:** Athena compiles all independent findings and posts the initial Assessment Matrix to `#review-desk`.
2. **Orthogonal Clashes:** When specialists' recommendations conflict (e.g. Aegis demanding synchronous token verification vs Vanguard requiring sub-18ms reconnect latency), specialists actively clash and defend their positions.
3. **Chair Synthesis:** Athena identifies technical convergence points (e.g. edge Redis Bloom filter).
4. **Human Steering:** The human Lead Architect steers trade-offs using natural directives or quick slash commands (`!summary`, `!diagram`, `!manifest`, `approve`).
5. **Autonomous Scaffolding Handoff:** Upon approval, Athena generates:
   - A Michael Nygard format Architecture Decision Record (`ADR-042.md`).
   - A markdown GitHub PR sticky comment.
   - Section 6 file scaffolding manifests.
   - A one-shot terminal command triggering **Claude Code** or **Codex** to execute the changes in git.

---

## 3. Sequence Diagram: RFC Deliberation to Autonomous Handoff

```mermaid
sequenceDiagram
    autonumber
    actor Human as Lead Architect (Human)
    participant Chair as Athena (Council Chair)
    participant Switch as Switch Core Gateway
    participant Sec as Aegis (#audit-security)
    participant Scale as Vanguard (#audit-scalability)
    participant Fin as Ledger (#audit-finops)
    participant Desk as #review-desk (Public Floor)
    participant Claude as Claude Code (Terminal Agent)

    Human->>Desk: Submit RFC-042 (100k WebSockets)
    Desk->>Chair: Trigger Quorum Deliberation
    
    par Phase 1: Blind Isolated Audit
        Chair->>Switch: Dispatch RFC-042 to #audit-security
        Switch->>Sec: Enforce ACL & Stream RFC
        Sec-->>Switch: Score: 4.5/10 (BLOCK: Token Revocation)
    and
        Chair->>Switch: Dispatch RFC-042 to #audit-scalability
        Switch->>Scale: Enforce ACL & Stream RFC
        Scale-->>Switch: Score: 6.8/10 (Bottleneck: DB Thundering Herd)
    and
        Chair->>Switch: Dispatch RFC-042 to #audit-finops
        Switch->>Fin: Enforce ACL & Stream RFC
        Fin-->>Switch: Score: 6.0/10 (Compute Waste: 12-Node Redis)
    end

    Note over Desk: Phase 2: Public Floor Deliberation
    Chair->>Desk: Post Conflict Matrix
    Sec->>Desk: "BLOCK: 15m unrevoked token window fails SOC2!"
    Scale->>Desk: "Synchronous DB check will crash Postgres in 12s!"
    Fin->>Desk: "12 nodes wastes $25,200/yr. Downsize to 4 nodes."
    Chair->>Desk: Synthesize: Edge Redis Bloom Filter + 4-Node Autoscale
    
    Human->>Desk: approve
    Chair->>Desk: Council Consensus Locked!
    Chair->>Claude: Autonomous Handoff: git checkout -b feat/adr-042-impl
    Claude-->>Human: Scaffolded files created & verified via pytest tests/ -v
```

---

## 4. Trust Boundaries & Security Model

1. **Chamber Isolation:** Switch Core ensures that no uninvited agent token possesses read permissions on `#audit-*` channels.
2. **Deterministic Handoff:** The Section 6 scaffolding manifest specifies exact target file paths, preventing hallucinations during terminal coding agent invocation.
3. **Zero-Knowledge Token Security:** Authentication tokens and database credentials are never injected into LLM chat payloads; cryptographic envelope encryption is mandated.
