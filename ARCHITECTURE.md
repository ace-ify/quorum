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

## 2. Key Architectural Invariants

Quorum enforces five core operational invariants (defined formally in [docs/invariants.md](docs/invariants.md)):
1. **INV-SEC-01 (Security Invariant):** Sub-millisecond token revocation verification ($\tau_{\text{revocation}} < 1\text{ms}$) via Redis Bloom filter at ingress edge.
2. **INV-SCALE-02 (Scalability Invariant):** Zero synchronous relational database lookups during 100k connection reconnection bursts ($p99 < 18\text{ms}$).
3. **INV-FIN-03 (FinOps Invariant):** Infrastructure compute right-sizing with autoscaling triggers, saving $25,200 annually.
4. **INV-DATA-04 (Data Invariant):** Transactional Outbox pattern with Debezium CDC for zero lost messages under worker failure.
5. **INV-ISO-05 (Protocol Invariant):** Zero cross-room token leakage ($P(\text{leak}) = 0$) enforced by Switch Core 0.31.0 network ACLs.

---

## 3. Autonomous Implementation Bridge

Upon human approval (`approve`), Quorum generates the Section 6 implementation manifest and triggers autonomous terminal coding agents (Claude Code / Codex):
```bash
claude -p "Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."
```
