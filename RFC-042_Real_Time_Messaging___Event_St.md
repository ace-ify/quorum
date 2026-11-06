# RFC-042: RFC-042: Real-Time Messaging & Event Streaming Architecture

**Status:** `APPROVED WITH CONDITIONS`  
**Date:** 2026-11-06  
**Author / Lead:** LeadArchitect  
**Council Reviewers:** Athena, Aegis, Vanguard, Ledger, Titan  

---

## 1. Executive Summary & Blind Scorecard

| Dimension | Specialist | Score (1-10) | Verdict |
| :--- | :--- | :---: | :--- |
| **Security & Threat Modeling** | Aegis | 7/10 | ⚠️ CONDITIONAL |
| **Scalability, Latency & Resilience** | Vanguard | 9/10 | ✅ APPROVED |
| **FinOps, Cloud Cost & Infrastructure ROI** | Ledger | 6/10 | ⚠️ CONDITIONAL |
| **Data Consistency, Indexing & Storage Engines** | Titan | 7/10 | ⚠️ CONDITIONAL |

---

## 2. Context & Proposed Architecture
# RFC-042: Real-Time Messaging & Event Streaming Architecture

**Author:** Staff Platform Engineer  
**Target Date:** Q1 2027  
**Status:** Under Council Review  
**Traffic Target:** 100,000 Concurrent WebSocket Connections (peak 25,000 msg/sec)

---

## 1. Problem Statement
Our current HTTP long-polling infrastructure is exhausting server memory, creating 450ms p99 message delivery latency, and d...

---

## 3. Independent Specialist Findings

### 🔍 Aegis — Security & Threat Modeling
**Score:** 7/10 — **Verdict:** `CONDITIONAL`

**Critical Risks Identified:**
- ⚠️ In-band WebSocket token refresh creates a session hijacking window if a socket is kept alive indefinitely without revocation checks.
- ⚠️ Default AWS KMS key allows any IAM role with basic KMS access to decrypt message buffers.

**Key Recommendations:**
- 💡 Implement Redis token revocation blacklist check on heartbeat.
- 💡 Adopt customer-managed KMS key (CMK) with strict key policy and envelope encryption.

### 🔍 Vanguard — Scalability, Latency & Resilience
**Score:** 9/10 — **Verdict:** `APPROVED`

**Critical Risks Identified:**
- ⚠️ Single Redis cluster partition could cause broadcast drops across orphaned EKS pods.

**Key Recommendations:**
- 💡 Enforce Redis Sentinel / Multi-AZ cluster topology with automatic failover.
- 💡 Add client-side backoff and reconnect jitter to prevent thundering herd on gateway restarts.

### 🔍 Ledger — FinOps, Cloud Cost & Infrastructure ROI
**Score:** 6/10 — **Verdict:** `CONDITIONAL`

**Critical Risks Identified:**
- ⚠️ 12-node dedicated Redis Enterprise cluster is heavily over-provisioned for initial phase ($3,500/mo waste).
- ⚠️ Egress traffic fees across multi-AZ EKS pods without VPC endpoints could add unexpected $1,800/mo.

**Key Recommendations:**
- 💡 Downsize initial Redis cluster to 4-node cluster with auto-sharding triggers, saving $2,100/mo ($25,200/yr).
- 💡 Route all internal inter-service traffic via AWS PrivateLink VPC endpoints to eliminate egress charges.

### 🔍 Titan — Data Consistency, Indexing & Storage Engines
**Score:** 7/10 — **Verdict:** `CONDITIONAL`

**Critical Risks Identified:**
- ⚠️ Dual-write race condition: Writing to Redis Stream and Aurora without an Outbox pattern risks ghost messages during worker crashes.
- ⚠️ Missing composite index on (channel_id, created_at DESC) will degrade message history fetch times as table exceeds 50M rows.

**Key Recommendations:**
- 💡 Adopt Transactional Outbox pattern or Kafka Debezium CDC for zero-loss Redis-to-Aurora replication.
- 💡 Enforce declarative BRIN or composite B-tree partitioning on message timestamp columns.

---

## 4. Key Architectural Trade-Offs & Human Decisions

### ⚖️ Redis Cluster Sizing (Cost vs Scale)
**Tension:** 12-node cluster ($3,500/mo) vs 4-node cluster ($1,400/mo)
**Executive Resolution:** Adopted 4-node cluster with auto-scaling triggers at 75% memory, saving $25,200 annually while maintaining p99 < 15ms.

### ⚖️ Token Revocation Check (Security vs Latency)
**Tension:** Central DB lookup on heartbeat causes latency spikes vs unverified in-band token renewal
**Executive Resolution:** Implemented Redis Bloom filter for <1ms revocation checks without database load.

---

## 5. Action Items & Pre-Deployment Checklist

- [ ] Deploy 4-node cluster with auto-scaling triggers at 75% memory threshold.
- [ ] Integrate Bloom filter middleware for WebSocket heartbeat revocation check (<1ms latency).
- [ ] Enforce Customer-Managed KMS Key (CMK) with envelope encryption.
- [ ] Adopt Crypto-Shredding per user to satisfy GDPR Article 17 Right to Erasure in event logs.
- [ ] Configure AWS PrivateLink VPC endpoints for inter-service traffic to eliminate egress fees.

*Generated collaboratively by BlindCouncil on Switch AI.*