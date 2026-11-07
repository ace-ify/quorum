# Quorum Operational Invariants & Formal Verification

This document defines the formal operational invariants enforced by **Quorum** during architecture reviews, human-in-the-loop steering, and autonomous handoffs to terminal coding agents (Claude Code / Codex).

---

## 1. Architectural Invariant Matrix

| Invariant ID | Domain | Target Threshold | Specialist Enforcer | Failure Mode Prevented |
| :--- | :--- | :--- | :--- | :--- |
| **INV-SEC-01** | Security & Auth | $\tau_{\text{revocation}} < 1\text{ms}$ | Aegis (#audit-security) | 15-minute token hijacking window after account revocation |
| **INV-SCALE-02** | Distributed Scale | $p99 < 18\text{ms}$ at $100\text{k}$ Conns | Vanguard (#audit-scalability) | Database connection pool exhaustion during pod rollouts |
| **INV-FIN-03** | Cloud Economics | Off-peak compute waste $< 25\%$ | Ledger (#audit-finops) | Over-provisioned $42,000/yr idle Redis memory allocation |
| **INV-DATA-04** | State & Consistency | $0$ message loss ($At-Least-Once$) | Titan (#audit-database) | Dual-write split-brain during worker process crash |
| **INV-ISO-05** | Protocol Security | $0$ cross-chamber bytes | Switch Core Gateway | Multi-agent sycophancy & anchor bias context contamination |

---

## 2. Invariant Specifications

### 2.1 INV-SEC-01: Sub-Millisecond Revocation Invariant
* **Formal Definition:**
  $$\forall s \in \mathcal{S}_{\text{active}}, \quad t_{\text{revoke}}(u) \implies \text{Drop}(s, u) \quad \text{within} \quad \Delta t \le 1.0\text{ms}$$
* **Constraint:** A revoked user session $u$ must have its WebSocket frames terminated within 1 millisecond.
* **Mechanism:** Ingress edge middleware queries an in-memory **Redis Bloom Filter** bitset during socket heartbeat frame processing.
* **Prohibited Anti-Pattern:** Relying on in-band JWT expiration windows (e.g. 15-minute TTL without revocation verification) or querying relational databases synchronously on high-frequency heartbeats.

---

### 2.2 INV-SCALE-02: Zero-DB Reconnection Invariant
* **Formal Definition:**
  $$\left(\frac{\partial Q_{\text{Postgres}}}{\partial N_{\text{reconnect}}}\right) = 0 \quad \text{for} \quad N_{\text{reconnect}} \le 100,000$$
* **Constraint:** A thundering herd of 100,000 simultaneous client reconnections following an EKS pod rolling restart must incur **zero synchronous queries** against the persistent relational store.
* **Mechanism:** Ephemeral session lookup and authorization bitsets reside strictly within cluster memory.
* **Prohibited Anti-Pattern:** Direct `SELECT * FROM sessions WHERE token = ?` during WebSocket upgrade handshakes.

---

### 2.3 INV-FIN-03: Cloud Economics Pareto Invariant
* **Formal Definition:**
  $$\mathcal{C}_{\text{infra}} \le \mathcal{C}_{\text{baseline}} \times \left(1 + \frac{\text{Traffic}_{\text{peak}} - \text{Traffic}_{\text{baseline}}}{\text{Traffic}_{\text{peak}}}\right) \quad \text{with} \quad \text{Utilization} \ge 70\%$$
* **Constraint:** Infrastructure compute resources must scale dynamically with workload demand, eliminating idle over-provisioning during off-peak hours.
* **Mechanism:** Cluster downsized from 12 static provisioned nodes ($3,500/mo) to 4 primary nodes ($1,400/mo) equipped with AWS CloudWatch 75% memory autoscaling alarms.
* **Net ROI:** Direct cost reduction of **$25,200 annually**.

---

### 2.4 INV-DATA-04: Atomicity & CDC Invariant
* **Formal Definition:**
  $$\text{Commit}(T_{\text{state}}) \iff \text{Emit}(E_{\text{outbox}}) \quad \text{under} \quad \text{Fail-Stop Failure Model}$$
* **Constraint:** Broadcasted chat and event streams must guarantee atomicity with database persistence, preventing orphaned notifications or lost records.
* **Mechanism:** **Transactional Outbox Pattern**. Application workers commit business events into a local `outbox_events` relational table within the same ACID transaction. An asynchronous **Debezium CDC** connector tails the write-ahead log (WAL) and publishes ordered events to Apache Kafka.
* **Prohibited Anti-Pattern:** Direct dual-writing to Redis Pub/Sub followed by database `INSERT`.

---

### 2.5 INV-ISO-05: Protocol-Enforced Room Isolation Invariant
* **Formal Definition:**
  $$\forall m \in \mathcal{M}_{\text{chamber}_A}, \quad \text{Visible}(m, \text{Agent}_B) = 0 \quad \text{where} \quad \text{Agent}_B \notin \mathcal{A}_{\text{invited}}(\text{chamber}_A)$$
* **Constraint:** An agent running in audit chamber $A$ has mathematically zero visibility of messages, scores, or prompt tokens in chamber $B$.
* **Mechanism:** Switch Core server-enforced network boundaries. WebSockets and REST tokens authenticate per-agent and filter packets at the network transport layer before LLM context ingestion.
* **Outcome:** Eliminates prompt-level sycophancy, premature anchoring, and groupthink.

---

## 3. Automated Verification Harness

All 5 invariants are asserted automatically via the Quorum regression suite:
```bash
# Execute formal invariant verification suite
python tests/run_tests.py
```

Expected output:
```
============================= test session starts =============================
tests/test_invariants.py::test_inv_sec_01_bloom_revocation PASSED         [ 20%]
tests/test_invariants.py::test_inv_scale_02_zero_db_reconnect PASSED      [ 40%]
tests/test_invariants.py::test_inv_fin_03_cluster_autoscaling PASSED      [ 60%]
tests/test_invariants.py::test_inv_data_04_transactional_outbox PASSED    [ 80%]
tests/test_invariants.py::test_inv_iso_05_switch_room_boundary PASSED     [100%]
============================== 5 passed in 0.010s ==============================
```

