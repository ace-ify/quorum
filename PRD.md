# Product Requirements Document (PRD)

## Project: BlindCouncil — Multi-Agent Blind Architecture & RFC Review Desk
**Track:** Track 01 — Best Business Workflow ($2,000)  
**Hackathon:** Flip the Switch (WeMakeDevs x DevTools Academy, powered by Switch AI)  
**Version:** 2.0.0  
**Status:** Approved Specification  

---

## 1. Executive Summary & Problem Statement

### 1.1 The Problem
In modern software engineering, evaluating a major **System Design RFC (Request for Comments)**, **Architecture Proposal**, or **Database Migration** requires multiple senior specialists:
- **Security & Threat Modeling Engineer**
- **Distributed Systems & Performance Architect**
- **Cloud Economics & FinOps Specialist**

In real organizations, getting three senior staff engineers into a room to rigorously review a 10-page architecture takes **1 to 2 weeks of meeting fatigue**.

When developers turn to AI for code and architecture review, existing solutions fail catastrophically:
1. **Single-Prompt Superficiality:** Pasting an RFC into ChatGPT yields a generic 3-paragraph summary with zero rigorous threat modeling or cost calculations.
2. **LLM Sycophancy & Context Pollution (The Groupthink Problem):** If multiple AI agents are in a shared group chat, **they anchor on the first posted opinion**. If Agent 1 says *"Looks reasonable!"*, Agent 2 and 3 praise the proposal and ignore fatal latency or cloud-cost traps.

### 1.2 The Solution: BlindCouncil
**BlindCouncil** is an enterprise-grade Architecture & RFC Review Desk powered by **Switch AI's Server-Enforced Room Isolation**.

When a developer submits an RFC or system design proposal to `#review-desk`, Switch automatically spawns **three strictly isolated, blind audit chambers**:
- **`#audit-security` (Aegis):** Unbiased threat modeling (OWASP, AuthZ, PII exposure, data leakage).
- **`#audit-scalability` (Vanguard):** Deep performance modeling (p99 latency, DB lock contention, concurrency bottlenecks).
- **`#audit-finops` (Ledger):** Cloud economics modeling (AWS/GCP resource pricing, egress bills, cost runaway risks).

**Because Switch enforces room isolation at the protocol layer, none of the three specialists can see each other's analysis or scores during the audit.** Cross-agent sycophancy is mathematically eliminated.

Once blind evaluations are locked into Switch Room Documents, the Council Chair convenes the **Council Debate in `#review-desk`**. The specialists present their independent findings—and **clash over real trade-offs** (e.g. Security demands multi-region HSM encryption, while FinOps flags that it 5x's monthly AWS spend).

The human lead negotiates and makes the final executive decisions in chat. Switch compiles the consensus into a production-grade **Architecture Decision Record (`ADR-001.md`)** ready to commit to Git!

---

## 2. Hackathon Alignment & Competitive Differentiation

| Hackathon Criterion | How BlindCouncil Wins |
| :--- | :--- |
| **1. Centrality of Switch** | **The Delphi Review Method physically requires server-enforced room isolation.** Without Switch, agents share context, triggering LLM groupthink and destroying the independence of the review. Switch room documents securely store blind rubrics before the public reveal. |
| **2. Real Task Done Together** | A human engineer and three AI specialists collaboratively analyze a real architectural specification, resolve conflicting constraints, and author an official `ADR.md`. |
| **3. Technical Execution** | Async Python engine with live Discord webhooks & Gateway WebSocket + instant zero-dependency terminal simulation (`--simulate`) for judges. |
| **4. Target Audience Alignment** | WeMakeDevs and DevTools Academy judges are software engineers and architects. They evaluate RFCs and pull requests every single day. |

---

## 3. The 5-Phase Review Lifecycle

```
[Phase 1: RFC Submission]
         │  (Human submits spec to #review-desk)
         ▼
[Phase 2: Isolated Blind Audits]
         │  (#audit-security, #audit-scalability, #audit-finops)
         │  *Switch strictly prevents cross-agent context leakage*
         ▼
[Phase 3: Conflict & Trade-off Synthesis]
         │  (Council Chair detects orthogonal clashes: Cost vs Security vs Latency)
         ▼
[Phase 4: Joint Council Debate & Human Decision]
         │  (Specialists debate in #review-desk; Human makes decisive trade-offs)
         ▼
[Phase 5: ADR Generation & Sign-Off]
         │  (Formal ADR-001.md compiled, signed, and published)
         ▼
     [Complete]
```

---

## 4. Room & Channel Architecture

| Room Name | Scope | Participants | Purpose |
| :--- | :--- | :--- | :--- |
| **`#review-desk`** | Public | Human Lead, Council Chair, All Specialists | Submission intake, cross-specialist trade-off debate, human executive steering, final ADR publication. |
| **`#audit-security`** | Isolated Blind | Security Auditor (Aegis) + Council Chair | Unbiased threat modeling, CVE check, data exposure audit. **Zero visibility of other audits.** |
| **`#audit-scalability`** | Isolated Blind | Performance Architect (Vanguard) + Council Chair | Concurrency, DB lock contention, p99 latency analysis. **Zero visibility of other audits.** |
| **`#audit-finops`** | Isolated Blind | FinOps Specialist (Ledger) + Council Chair | Cloud pricing, monthly run-rate modeling, resource waste analysis. **Zero visibility of other audits.** |

---

## 5. Cast of Specialists

1. **The Council Chair (Moderator & Synthesizer — "Athena")**:
   - Neutral, rigorous, institutional. Orchestrates phase transitions, enforces review rubrics, identifies sharp trade-off conflicts between specialists, and drafts the final ADR document.
2. **Aegis (Security & Compliance Auditor)**:
   - Paranoid, thorough, conservative. Evaluates authentication, authorization, token lifecycles, injection risks, data sovereignty, and compliance standards (SOC2, GDPR).
3. **Vanguard (Distributed Systems & Scale Architect)**:
   - Pragmatic, latency-obsessed, highly quantitative. Evaluates system boundaries, single points of failure, database indexing/sharding, cache coherence, and failover topologies.
4. **Ledger (Cloud Economics & FinOps Specialist)**:
   - Frugal, ROI-driven, analytical. Breaks down AWS/GCP instance costs, egress penalties, over-provisioning, serverless execution unit pricing, and annual run-rate forecasts.
5. **The Human Architect (You / The Engineer)**:
   - Evaluates the conflicting recommendations, pushes back on unreasonable constraints, decides the organizational trade-offs, and issues final sign-off.

---

## 6. Real Deliverable: Architecture Decision Record (`ADR-001.md`)

The workflow culminates in an official, Git-ready markdown document adhering to the Michael Nygard ADR standard:
- **Title & Metadata:** Date, Author, Reviewers, Status (`Approved` / `Approved with Conditions` / `Rejected`).
- **Context:** Summary of proposed architecture.
- **Blind Scorecard:** Quantitative scores (1-10) across Security, Scalability, and FinOps.
- **Key Architectural Trade-offs & Human Decisions:** Formal record of resolved clashes (e.g. why the team chose asynchronous encryption to save $8,000/mo while mitigating risk via KMS envelopes).
- **Actionable Mitigation Checklist:** Concrete tasks for the development team before production deployment.

