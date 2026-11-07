/**
 * Quorum Studio — Autonomous Architecture Review Board
 * Complete interactive workbench logic for visual topology, live agent tool traces,
 * soundproof isolation chambers, council floor debate, tension matrix, and code scaffolding.
 */

let deliberationMode = "live"; // "live" or "instant"
let isDeliberating = false;
let deliberationTimer = null;
let currentProposalKey = "rfc042";
let currentPhase = 4;
let flowAnimationActive = true;
let selectedTopologyNode = null;

const PROPOSALS = {
  rfc042: {
    id: "RFC-042",
    headline: "100,000 WebSocket Messaging Fabric",
    subline: "Interactive service topology — click any node to inspect chamber invariants and scaffolded code",
    targetScale: "100k Sockets (peak 25k msg/s)",
    targetBranch: "feat/adr-042-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."`,
    specialists: [
      { key: "sec", name: "Aegis", domain: "Threat Modeling & Auth", score: "4.5/10", tag: "sec", role: "Staff Security Auditor", avatar: "A" },
      { key: "scale", name: "Vanguard", domain: "Concurrency & p99 Latency", score: "6.8/10", tag: "scale", role: "Principal Systems Architect", avatar: "V" },
      { key: "fin", name: "Ledger", domain: "Cloud Economics & ROI", score: "6.0/10", tag: "fin", role: "Lead Cloud Economics", avatar: "L" },
      { key: "data", name: "Titan", domain: "State Consistency & ACID", score: "7.2/10", tag: "data", role: "Data Reliability Architect", avatar: "T" }
    ],
    invariants: [
      { id: "INV-SEC-01", desc: "Revocation <1ms (Edge Bloom bitset)" },
      { id: "INV-SCALE-02", desc: "Zero-DB Reconnect (100k Sockets)" },
      { id: "INV-FIN-03", desc: "Compute -$25.2k/yr (4-Node Autoscale)" },
      { id: "INV-DATA-04", desc: "Outbox CDC Atomicity (Debezium -> Kafka)" },
      { id: "INV-ISO-05", desc: "Switch Room Isolation (0 Leaked Bytes)" }
    ],
    chambers: [
      { id: "audit-security", specialist: "Aegis", domain: "Security & Threat Modeling", score: "4.5/10", tag: "sec", token: "sw_sec_live_9921b", acl: "['athena', 'aegis']", leak: "0 Bytes", finding: "In-band heartbeat token refresh creates a 15-minute hijacking window without revocation checks. Mandates sub-ms Redis Bloom filter." },
      { id: "audit-scalability", specialist: "Vanguard", domain: "Concurrency & p99 Latency", score: "6.8/10", tag: "scale", token: "sw_scale_live_4412a", acl: "['athena', 'vanguard']", leak: "0 Bytes", finding: "Synchronous DB queries on 100k reconnections crashes Postgres pool in 11.8s. Mandates zero-DB RAM lookups." },
      { id: "audit-finops", specialist: "Ledger", domain: "Cloud Economics & ROI", score: "6.0/10", tag: "fin", token: "sw_fin_live_8834c", acl: "['athena', 'ledger']", leak: "0 Bytes", finding: "12 dedicated Redis shards burns $42k/yr on 16% off-peak load. Mandates 4-node autoscale cluster, saving $25,200/yr." },
      { id: "audit-database", specialist: "Titan", domain: "Data Consistency & Storage", score: "7.2/10", tag: "data", token: "sw_data_live_1120f", acl: "['athena', 'titan']", leak: "0 Bytes", finding: "Dual-writing to Redis Streams and Aurora without Outbox causes 1.84% message loss on crashes. Mandates Debezium CDC." }
    ],
    debateMessages: [
      { sender: "Athena", role: "Council Chair", tag: "chair", content: "Convening Quorum for RFC-042: Scalable Real-Time WebSocket Messaging Cluster. All 4 specialist chambers have completed blind assessments with zero context leakage." },
      { sender: "Aegis", role: "Staff Security Auditor", tag: "sec", content: "I am placing a formal BLOCK on RFC-042. The proposed in-band token refresh leaves an unverified 15-minute window where a revoked user credential can continue pumping frames across open sockets. This fails SOC2 Article 4. We cannot merge until token revocation is enforced synchronously on heartbeat." },
      { sender: "Vanguard", role: "Principal Systems Architect", tag: "scale", content: "@Aegis If you force a synchronous database query on every heartbeat across 100,000 concurrent sockets, you will crash the Postgres connection pool within 12 seconds of a pod rollout. The p99 latency will spike past 140ms. Any security enforcement must happen in-memory at the ingress edge." },
      { sender: "Ledger", role: "Lead Cloud Economics", tag: "fin", content: "And who approved 12 dedicated Redis Enterprise nodes for initial launch? Off-peak traffic is 20k connections. You are burning $3,500/month ($42,000/yr) on idle compute. Downsize to 4 nodes with memory autoscaling at 75% load. That recoups $25,200 annually!" },
      { sender: "Titan", role: "Data Reliability Architect", tag: "data", content: "Regarding persistence: dual-writing directly to Redis Pub/Sub and Postgres causes message loss if a worker node crashes between writes. We must enforce the Transactional Outbox Pattern with Debezium CDC into Kafka." },
      { sender: "Athena", role: "Council Chair", tag: "chair", content: "Synthesizing resolution: Vanguard's latency requirement and Aegis's revocation requirement converge on a Redis Bloom Filter bitset at the edge (<0.2ms, zero DB load). Ledger's 4-node autoscale cluster accepted. Titan's Transactional Outbox accepted. Human Lead, how do you steer?" },
      { sender: "Lead Architect", role: "Human Engineer", tag: "human", content: "!summary, !diagram, approve" },
      { sender: "Athena", role: "Council Chair", tag: "chair", content: "✅ COUNCIL CONSENSUS APPROVED BY LEAD ARCHITECT. Autonomous handoff delivered to @ClaudeCode in #dev-implementation." }
    ],
    toolsLog: [
      {
        agent: "Aegis",
        role: "Staff Security Auditor",
        tool: "cve_database_search",
        duration: "142ms",
        tag: "sec",
        query: 'query: "WebSocket in-band heartbeat token refresh session hijacking"\ncompliance: "SOC2 Article 4 | OWASP ASVS 4.0"',
        result: '{\n  "matched_cve": "CVE-2023-4580 (Severity: High / CVSS 8.1)",\n  "vulnerability": "In-band WebSocket heartbeat renews token without central revocation check",\n  "exposure_window": "15 minutes between heartbeats allowing banned credentials to pump frames",\n  "remediation": "Synchronous sub-ms token blacklist verification before socket frame ingest"\n}'
      },
      {
        agent: "Vanguard",
        role: "Principal Systems Architect",
        tool: "queue_concurrency_sim",
        duration: "215ms",
        tag: "scale",
        query: 'concurrent_sockets: 100000\nreconnect_burst_window_sec: 15\nauth_mode: "synchronous_postgres_query"\npostgres_pool_size: 500',
        result: '{\n  "time_to_failure": "11.8 seconds",\n  "exception": "ConnectionPoolExhaustedException (500/500 active)",\n  "throttled_clients": 94210,\n  "measured_p99_latency_ms": 144.2,\n  "sla_target_ms": 20.0,\n  "status": "CRITICAL SLA BREACH"\n}'
      },
      {
        agent: "Ledger",
        role: "Lead Cloud Economics",
        tool: "aws_pricing_calculator",
        duration: "98ms",
        tag: "fin",
        query: 'service: "Amazon MemoryDB for Redis"\nnode_type: "cache.r6g.2xlarge"\nnode_count: 12\nbaseline_sockets: 20000',
        result: '{\n  "monthly_bill": "$3,504.00",\n  "annual_spend": "$42,048.00",\n  "off_peak_memory_utilization": "16.4%",\n  "optimized_cluster_4_nodes": "$16,848.00",\n  "net_annual_savings": "$25,200.00"\n}'
      },
      {
        agent: "Titan",
        role: "Data Reliability Architect",
        tool: "distributed_fault_injection",
        duration: "310ms",
        tag: "data",
        query: 'pipeline: "dual_write (Redis Streams + Postgres Insert)"\nfault_scenario: "worker_sigkill_mid_transaction"\niterations: 1000',
        result: '{\n  "total_events_dispatched": 50000,\n  "simulated_worker_crashes": 38,\n  "dropped_events_uncommitted": 92,\n  "message_loss_percentage": "1.84%",\n  "consistency_guarantee": "VIOLATED (Split-brain dual write)"\n}'
      },
      {
        agent: "Vanguard",
        role: "Principal Systems Architect",
        tool: "redis_bloom_benchmark",
        duration: "76ms",
        tag: "scale",
        query: 'capacity: 1000000\nerror_rate: 0.0001\nbitset_size_mb: 2.38',
        result: '{\n  "lookup_latency_micros": 140,\n  "lookup_latency_ms": 0.14,\n  "memory_footprint_mb": 2.38,\n  "zero_db_queries_guarantee": true\n}'
      }
    ],
    matrix: [
      {
        vector: "Security vs Concurrency Latency",
        clash: "Aegis (Synchronous DB validation) vs Vanguard (140ms p99 SLA breach under 100k sockets).",
        resolution: "Pre-load edge Bloom filter with revoked session bitsets (<0.2ms latency, zero database hits).",
        invariant: "INV-SEC-01: Heartbeat auth checked <1ms at edge ingress"
      },
      {
        vector: "Infrastructure Sizing vs Off-Peak Economics",
        clash: "Vanguard (12-node over-provisioning) vs Ledger ($42,000/yr budget waste on 16% off-peak load).",
        resolution: "Adopt 4-node Redis cluster with CPU/Memory autoscaling at 75% threshold, saving $25,200 annually.",
        invariant: "INV-FIN-03: Annual cloud infrastructure cost capped under $18k/yr"
      },
      {
        vector: "Distributed Dual-Write vs Message Atomicity",
        clash: "Engineering Ops (Direct Redis + Postgres write) vs Titan (1.84% message loss on node crash).",
        resolution: "Implement Transactional Outbox pattern with Debezium CDC tailing PostgreSQL WAL into Kafka.",
        invariant: "INV-DATA-04: At-least-once message delivery with zero split-brain data loss"
      }
    ],
    manifestItems: [
      { action: "CREATE", path: "src/security/bloom_revocation.py", mandatedBy: "Aegis", purpose: "Edge Bloom filter bitset validator ensuring sub-ms token revocation" },
      { action: "CREATE", path: "src/gateway/socket_manager.py", mandatedBy: "Vanguard", purpose: "Zero-DB reconnection connection pool with backpressure throttling" },
      { action: "MODIFY", path: "infra/redis_cluster.tf", mandatedBy: "Ledger", purpose: "Downsize cluster to 4 autoscale nodes saving $25,200/yr" },
      { action: "CREATE", path: "src/persistence/outbox_publisher.py", mandatedBy: "Titan", purpose: "Transactional outbox publisher with Debezium CDC connector" },
      { action: "CREATE", path: "tests/test_invariants.py", mandatedBy: "Council", purpose: "Formal verification suite validating all 5 invariants" }
    ],
    components: {
      clients: {
        title: "100k Sockets Client Apps Tier",
        auditor: "Vanguard • Principal Systems",
        score: "Score: 6.8/10",
        avatar: "V",
        tag: "scale",
        toolName: "queue_concurrency_sim",
        toolDuration: "215ms",
        toolSnippet: 'concurrency: 100,000\nburst_window: 15s\np99_latency: 144.2ms (Fail)',
        finding: "Synchronous DB queries during thundering herd reconnection crashes connection pool in 11.8s.",
        resolution: "Rate-limit reconnection handshakes and decouple auth validation to RAM.",
        code: `async def handle_connection(ws, token):
    if not await bloom_filter.contains(token):
        await ws.accept()
    else:
        await ws.close(code=4001)`
      },
      nlb: {
        title: "AWS L4 Network Load Balancer",
        auditor: "Vanguard • Principal Systems",
        score: "Score: 8.5/10",
        avatar: "V",
        tag: "scale",
        toolName: "nlb_flow_evaluator",
        toolDuration: "65ms",
        toolSnippet: 'mode: "cross-zone"\ntls_termination: "edge"\npreserve_client_ip: true',
        finding: "L7 application load balancer adds 18ms latency and inspects packets needlessly.",
        resolution: "Use L4 Network Load Balancer with zero in-band payload inspection.",
        code: `resource "aws_lb" "nlb" {
  name               = "quorum-edge-nlb"
  load_balancer_type = "network"
  enable_cross_zone_load_balancing = true
}`
      },
      redis: {
        title: "4-Node WebSocket Cluster",
        auditor: "Ledger • Lead Cloud Economics",
        score: "Score: 6.0/10 (Resolved)",
        avatar: "L",
        tag: "fin",
        toolName: "aws_pricing_calculator",
        toolDuration: "98ms",
        toolSnippet: 'monthly_savings: "$2,100.00"\nannual_savings: "$25,200.00"\nautoscale_threshold: "75%"',
        finding: "12 dedicated nodes burned $42,000/yr with 16% off-peak utilization.",
        resolution: "Cluster downsized to 4 nodes with memory autoscaling at 75% capacity.",
        code: `resource "aws_elasticache_replication_group" "ws_cluster" {
  num_cache_clusters = 4
  node_type          = "cache.r6g.large"
  auto_minor_version_upgrade = true
}`
      },
      gateway: {
        title: "Redis Bloom Filter (Edge Revocation)",
        auditor: "Aegis • Staff Security",
        score: "Score: 4.5/10 (Resolved)",
        avatar: "A",
        tag: "sec",
        toolName: "cve_database_search",
        toolDuration: "142ms",
        toolSnippet: 'query: "WebSocket heartbeat session hijacking"\nresult: "CVE-2023-4580 (CVSS 8.1 High)"',
        finding: "In-band heartbeat token validation permits a 15-minute window of unauthorized socket frames after account ban.",
        resolution: "Sub-ms Redis Bloom filter bitset deployed at gateway edge. Revoked tokens checked in RAM with zero DB load.",
        code: `async def check_revocation(token_jti: str) -> bool:
    # O(1) in-memory Redis Bloom filter check
    return await redis_bloom.exists("revoked_tokens", token_jti)`
      },
      outbox: {
        title: "Postgres Outbox & CDC Pipeline",
        auditor: "Titan • Data Reliability",
        score: "Score: 7.2/10 (Resolved)",
        avatar: "T",
        tag: "data",
        toolName: "distributed_fault_injection",
        toolDuration: "310ms",
        toolSnippet: 'dual_write_loss: "1.84%"\noutbox_cdc_loss: "0.00%"',
        finding: "Dual-writing to Redis Streams and Aurora without Outbox causes 1.84% message loss on worker crash.",
        resolution: "Enforce Transactional Outbox pattern with Debezium CDC connector publishing to Kafka.",
        code: `INSERT INTO outbox_events (aggregate_id, payload, created_at)
VALUES ($1, $2, NOW())
RETURNING id;`
      },
      kafka: {
        title: "Kafka Event Stream Replica",
        auditor: "Titan & Vanguard",
        score: "Score: 9.0/10",
        avatar: "T",
        tag: "data",
        toolName: "kafka_partition_audit",
        toolDuration: "85ms",
        toolSnippet: 'partitions: 16\nreplication_factor: 3\nmin_insync_replicas: 2',
        finding: "Downstream microservices overwhelmed by broadcast spikes without backpressure.",
        resolution: "Partitioned Kafka event stream with guaranteed ordering by aggregate ID.",
        code: `metadata.broker.list=kafka:9092
acks=all
retries=2147483647`
      }
    },
    adrMarkdown: `# ADR-042: Scalable Real-Time WebSocket Messaging Fabric

**Status:** APPROVED WITH CONDITIONS  
**Date:** 2026-11-06  
**Author / Lead:** Human Lead Architect  
**Council Reviewers:** Athena (Chair), Aegis (Security), Vanguard (Scalability), Ledger (FinOps), Titan (Database)

---

## 1. Context & Problem Statement
The product requires bidirectional communication for 100,000 concurrent WebSocket sessions. Initial proposal used synchronous PostgreSQL database lookups during heartbeat authentication, risking connection pool exhaustion during thundering herd reconnection storms.

---

## 2. Decision Drivers & Invariants
- **INV-SEC-01:** Token revocation must be verified in under 1ms without database roundtrips.
- **INV-SCALE-02:** Zero PostgreSQL queries permitted on client reconnection burst.
- **INV-FIN-03:** Cloud infrastructure compute spend reduced by at least $20,000/year.
- **INV-DATA-04:** Zero message loss under ungraceful worker termination.
- **INV-ISO-05:** Council consensus derived via cryptographically partitioned Switch soundproof rooms.

---

## 3. Considered Options
1. **Option A (Original):** Synchronous PostgreSQL queries + 12 dedicated Redis nodes. *(Rejected: 140ms p99 SLA breach and $25.2k cloud waste)*.
2. **Option B (Quorum Synthesized):** Edge Redis Bloom filter (<0.2ms) + 4-node autoscaling cluster + Postgres Transactional Outbox with Debezium CDC. *(Approved)*.

---

## 4. Decision Outcomes
- Deploy **Redis Bloom Filter** bitset at API gateway edge to check token revocation in sub-0.2ms.
- Downsize Redis cluster from 12 nodes to 4 nodes with memory autoscaling at 75% load, **saving $25,200 annually**.
- Implement **Transactional Outbox Pattern** with Debezium CDC to guarantee zero event loss between PostgreSQL and Kafka.

---

## 5. Implementer Handoff (Autonomous Agent CLI)
Execute the scaffolded implementation via Claude Code:
\`\`\`bash
claude -p "Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."
\`\`\`

*Generated by Quorum 2.0 Delphi Architecture Engine on Switch AI.*`,
    prStickyComment: `## 🏛️ Quorum Architecture Review Report: RFC-042

**Status:** ✅ **APPROVED WITH CONDITIONS**  
**Review Protocol:** Switch Delphi Method (4 Soundproof Isolation Chambers)  
**Cross-Chamber Leakage:** 0 Bytes  
**Sycophancy / Anchor Bias:** 0.0%  

---

### Specialist Council Scoreboard

| Specialist | Domain | Blind Score | Identified Vulnerability / Finding | Mandated Architectural Resolution |
| :--- | :--- | :---: | :--- | :--- |
| **Aegis** | Threat Modeling & Auth | **4.5/10** | In-band heartbeat token refresh leaves 15m unrevoked window (CVE-2023-4580) | Sub-ms edge Redis Bloom filter bitset check (<0.2ms RAM) |
| **Vanguard** | Concurrency & Latency | **6.8/10** | Synchronous DB queries on 100k reconnections crashes pool in 11.8s | Zero-DB reconnection architecture via in-memory session cache |
| **Ledger** | Cloud Economics & FinOps | **6.0/10** | 12 dedicated Redis shards burns $42k/yr on 16% off-peak load | Downsize to 4 autoscale nodes (**recoups $25,200/year**) |
| **Titan** | State Consistency & ACID | **7.2/10** | Dual-writing without Outbox incurs 1.84% message loss on worker crash | Transactional Outbox pattern with Debezium CDC into Kafka |

---

### Verified Invariants

- [x] **INV-SEC-01:** Token revocation verified in <1ms at edge ingress
- [x] **INV-SCALE-02:** Zero PostgreSQL queries on 100k client reconnection burst
- [x] **INV-FIN-03:** Cloud infrastructure annual spend reduced by **$25,200.00**
- [x] **INV-DATA-04:** Outbox CDC guarantees at-least-once atomicity into Kafka
- [x] **INV-ISO-05:** Zero context packet leakage across 4 audit rooms

---

<details><summary><b>📂 Section 6 Implementer Manifest (Claude Code)</b></summary>

\`\`\`bash
claude -p "Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."
\`\`\`

</details>

*Automated review posted by Quorum Autonomous Architecture Review Desk.*`
  },

  rfc019: {
    id: "RFC-019",
    headline: "Distributed URL Shortener (10B Keys)",
    subline: "Decoupled Key Generation Service & multi-tier caching for 50k QPS redirects",
    targetScale: "10B Keys (50k QPS Global)",
    targetBranch: "feat/adr-019-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-019.md Section 6. Switch to branch 'feat/adr-019-impl'. Implement pre-allocated range Base62 key generator and Cassandra telemetry sinks. Run 'pytest tests/ -v'."`,
    specialists: [
      { key: "sec", name: "Aegis", domain: "Abuse & Link Scraping", score: "5.2/10", tag: "sec", role: "Staff Security Auditor", avatar: "A" },
      { key: "scale", name: "Vanguard", domain: "50k QPS Key Generation", score: "7.0/10", tag: "scale", role: "Principal Systems Architect", avatar: "V" },
      { key: "fin", name: "Ledger", domain: "Telemetry Tiering ROI", score: "6.5/10", tag: "fin", role: "Lead Cloud Economics", avatar: "L" },
      { key: "data", name: "Titan", domain: "Cross-Region Consistency", score: "8.1/10", tag: "data", role: "Data Reliability Architect", avatar: "T" }
    ],
    invariants: [
      { id: "INV-SEC-01", desc: "Non-enumerable Base62 keys (Feistel Cipher)" },
      { id: "INV-SCALE-02", desc: "Sub-5ms p99 redirect SLA at edge" },
      { id: "INV-FIN-03", desc: "Telemetry in ClickHouse (-$14,000/yr)" },
      { id: "INV-DATA-04", desc: "Cassandra Quorum Reads across 3 Regions" },
      { id: "INV-ISO-05", desc: "Switch Room Isolation (0 Leaked Bytes)" }
    ],
    chambers: [
      { id: "audit-security", specialist: "Aegis", domain: "Abuse & Link Scraping", score: "5.2/10", tag: "sec", token: "sw_sec_019_109c", acl: "['athena', 'aegis']", leak: "0 Bytes", finding: "Sequential auto-increment IDs allow competitors to scrape all customer URLs. Mandates shuffled Feistel permutation." },
      { id: "audit-scalability", specialist: "Vanguard", domain: "50k QPS Key Generation", score: "7.0/10", tag: "scale", token: "sw_scale_019_232d", acl: "['athena', 'vanguard']", leak: "0 Bytes", finding: "Central database sequence generator becomes single bottleneck above 15k QPS. Mandates pre-allocated range Key Generation Service (KGS)." },
      { id: "audit-finops", specialist: "Ledger", domain: "Telemetry Tiering ROI", score: "6.5/10", tag: "fin", token: "sw_fin_019_881f", acl: "['athena', 'ledger']", leak: "0 Bytes", finding: "Storing redirect click telemetry in primary OLTP database burns $18k/yr on storage. Tiering to ClickHouse saves $14,000/yr." },
      { id: "audit-database", specialist: "Titan", domain: "Cross-Region Consistency", score: "8.1/10", tag: "data", token: "sw_data_019_994a", acl: "['athena', 'titan']", leak: "0 Bytes", finding: "Multi-region writes risk collision. Enforce Cassandra LOCAL_QUORUM consistency with deterministic KGS allocation." }
    ],
    debateMessages: [
      { sender: "Athena", role: "Council Chair", tag: "chair", content: "Convening Quorum for RFC-019: Distributed URL Shortener (10B Keys). Rooms partitioned." },
      { sender: "Aegis", role: "Staff Security Auditor", tag: "sec", content: "BLOCK: Sequential 7-character IDs expose user privacy to trivial scraping. We must shuffle the key space using a pseudo-random Feistel cipher." },
      { sender: "Vanguard", role: "Principal Systems Architect", tag: "scale", content: "Agree with Aegis. Furthermore, generating keys synchronously in PostgreSQL will bottleneck at 15k QPS. We must decouple key generation to an independent Key Generation Service (KGS) with ZooKeeper range leases." },
      { sender: "Ledger", role: "Lead Cloud Economics", tag: "fin", content: "And don't write click analytics into the primary database! Decouple analytics into ClickHouse with 90-day TTL. That saves $14,000/year." },
      { sender: "Titan", role: "Data Reliability Architect", tag: "data", content: "For 10B keys, primary storage must be Cassandra with partition key on hash(short_code). Reads served from Redis LRU cache." },
      { sender: "Athena", role: "Council Chair", tag: "chair", content: "Consensus locked: Shuffled Base62 KGS + Redis LRU + ClickHouse tiering approved." }
    ],
    toolsLog: [
      {
        agent: "Aegis",
        role: "Staff Security Auditor",
        tool: "entropy_enumeration_evaluator",
        duration: "110ms",
        tag: "sec",
        query: 'algorithm: "sequential_base62"\nkey_length: 7\nsample_size: 10000',
        result: '{\n  "predictability_score": "99.8% (CRITICAL SCRAPING RISK)",\n  "remediation": "Obfuscate with 3-round Feistel permutation"\n}'
      },
      {
        agent: "Vanguard",
        role: "Principal Systems Architect",
        tool: "kgs_throughput_benchmark",
        duration: "185ms",
        tag: "scale",
        query: 'range_size: 1000000\nworkers: 10\ntarget_qps: 50000',
        result: '{\n  "sustained_qps": 62400,\n  "p99_key_dispense_ms": 0.42,\n  "zookeeper_lease_overhead": "0.01%"\n}'
      }
    ],
    matrix: [
      {
        vector: "Key Predictability vs Generator Throughput",
        clash: "Aegis (Cryptographic random key) vs Vanguard (50k QPS sequential key speed).",
        resolution: "Pre-allocated range KGS with Feistel cipher permutation provides O(1) non-sequential keys.",
        invariant: "INV-SEC-01: Zero enumerable short URL sequences"
      }
    ],
    manifestItems: [
      { action: "CREATE", path: "src/keygen/kgs_worker.py", mandatedBy: "Vanguard", purpose: "Pre-allocated range Key Generation Service" },
      { action: "CREATE", path: "src/security/feistel_cipher.py", mandatedBy: "Aegis", purpose: "Non-enumerable Base62 key obfuscation" },
      { action: "CREATE", path: "src/analytics/clickhouse_sink.py", mandatedBy: "Ledger", purpose: "Decoupled analytics writer saving $14,000/yr" }
    ],
    components: {
      clients: {
        title: "Global Client Ingress",
        auditor: "Vanguard • Principal Systems",
        score: "Score: 7.0/10",
        avatar: "V",
        tag: "scale",
        toolName: "anycast_latency_timer",
        toolDuration: "50ms",
        toolSnippet: 'ingress: "Cloudflare Anycast"\np99_latency: "12ms"',
        finding: "Direct client traffic to single region incurs 180ms latency.",
        resolution: "Edge Anycast routing to closest regional point of presence.",
        code: `GET /s/{short_code} HTTP/2\nHost: q.co`
      },
      nlb: {
        title: "Cloudflare Edge CDN",
        auditor: "Vanguard • Principal Systems",
        score: "Score: 8.8/10",
        avatar: "V",
        tag: "scale",
        toolName: "cache_hit_sim",
        toolDuration: "90ms",
        toolSnippet: 'cache_hit_rate: "98.2%"\nedge_redirect_time: "4.1ms"',
        finding: "High traffic links flood origin servers unnecessarily.",
        resolution: "HTTP 301 cache with 24-hour TTL at edge CDN.",
        code: `HTTP/2 301 Moved Permanently\nLocation: https://destination.com\nCache-Control: public, max-age=86400`
      },
      gateway: {
        title: "Envoy API Gateway",
        auditor: "Aegis • Staff Security",
        score: "Score: 5.2/10 (Resolved)",
        avatar: "A",
        tag: "sec",
        toolName: "rate_limit_benchmark",
        toolDuration: "110ms",
        toolSnippet: 'burst_cap: 100000\ntoken_bucket: "redis_cluster"',
        finding: "Automated link crawlers scrape private keys.",
        resolution: "Enforce token bucket rate limiting (100 req/sec per IP) in Envoy.",
        code: `rate_limits:\n  - actions:\n      - request_headers:\n          header_name: "X-Forwarded-For"`
      },
      redis: {
        title: "Redis LRU Cache Tier",
        auditor: "Vanguard • Principal Systems",
        score: "Score: 8.0/10",
        avatar: "V",
        tag: "scale",
        toolName: "lru_working_set_calc",
        toolDuration: "75ms",
        toolSnippet: 'working_set_size: "20% of keys"\ncache_hit_ratio: "82%"',
        finding: "Disk read IOPS overwhelmed by repeated redirect lookups.",
        resolution: "Top 20% hot URLs cached in Redis with volatile-lru eviction.",
        code: `maxmemory 32gb\nmaxmemory-policy allkeys-lru`
      },
      outbox: {
        title: "Pre-Allocated Key Gen Service (KGS)",
        auditor: "Aegis & Vanguard",
        score: "Score: 7.5/10 (Resolved)",
        avatar: "A",
        tag: "sec",
        toolName: "kgs_throughput_benchmark",
        toolDuration: "185ms",
        toolSnippet: 'lease_range: "1,000,000 keys"\nzookeeper_lock_time: "12ms"',
        finding: "Database auto-increment bottlenecks and leaks link volume.",
        resolution: "ZooKeeper range leases with 3-round Feistel cipher permutation.",
        code: `def mint_short_key(range_offset: int) -> str:
    shuffled = feistel_permute(range_offset)
    return base62_encode(shuffled)`
      },
      kafka: {
        title: "Cassandra + ClickHouse Sinks",
        auditor: "Ledger & Titan",
        score: "Score: 8.5/10",
        avatar: "L",
        tag: "fin",
        toolName: "clickhouse_compression_calc",
        toolDuration: "115ms",
        toolSnippet: 'compression_ratio: "14:1"\nannual_savings: "$14,000/yr"',
        finding: "Telemetry retention in OLTP database inflates storage costs by 400%.",
        resolution: "Decouple click streams into ClickHouse with 90-day TTL.",
        code: `ALTER TABLE click_events MODIFY TTL click_time + INTERVAL 90 DAY;`
      }
    },
    adrMarkdown: `# ADR-019: Global Scalable URL Shortener Architecture (10B Keys)

**Status:** APPROVED WITH CONDITIONS  
**Date:** 2026-11-06  
**Author / Lead:** Core Infra Team  
**Council Reviewers:** Athena (Chair), Aegis, Vanguard, Ledger, Titan

---

## 1. Context & Key Space Target
Design a global URL shortener supporting 10B links with 50,000 QPS and sub-10ms redirect latency.

---

## 2. Decision Outcomes
1. **Decoupled Key Generator:** Pre-allocated randomized Base62 ranges generated by standalone KGS with Feistel cipher.
2. **Storage Decoupling:** Primary redirects served from Cassandra + Redis LRU; telemetry tiered to ClickHouse (-$14,000/yr).

*Generated by Quorum on Switch AI.*`,
    prStickyComment: `## 🏛️ Quorum Architecture Review Report: RFC-019

| Specialist | Domain | Score | Status |
| :--- | :--- | :---: | :--- |
| **Aegis** | Abuse & Link Scraping | 5.2/10 | 🔒 Shuffled Base62 |
| **Vanguard** | 50k QPS Key Generation | 7.0/10 | ✅ Pre-allocated KGS |
| **Ledger** | Telemetry Tiering ROI | 6.5/10 | 💰 -$14,000/yr ClickHouse |
| **Titan** | Cross-Region Cassandra | 8.1/10 | ✅ Sub-5ms Reads |

<details><summary><b>📂 Section 6 Implementer Manifest (Claude Code)</b></summary>

\`\`\`bash
claude -p "Read ADR-019.md Section 6. Switch to branch 'feat/adr-019-impl'. Implement pre-allocated range Base62 key generator and Cassandra telemetry sinks. Run 'pytest tests/ -v'."
\`\`\`
</details>`
  },

  rfc088: {
    id: "RFC-088",
    headline: "Multi-Region Payment Processing Service",
    subline: "Active-Active Idempotency & Two-Phase Saga with PCI-DSS Level 1 Perimeter",
    targetScale: "50k RPS ($50M/day Volume)",
    targetBranch: "feat/adr-088-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-088.md Section 6. Switch to branch 'feat/adr-088-impl'. Implement idempotency key middleware with DynamoDB TTL and distributed two-phase saga coordinator. Run 'pytest tests/ -v'."`,
    specialists: [
      { key: "sec", name: "Aegis", domain: "PCI-DSS Level 1 Auth", score: "3.8/10", tag: "sec", role: "Staff Security Auditor", avatar: "A" },
      { key: "scale", name: "Vanguard", domain: "Active-Active Idempotency", score: "6.2/10", tag: "scale", role: "Principal Systems Architect", avatar: "V" },
      { key: "fin", name: "Ledger", domain: "Interchange Cost Routing", score: "5.8/10", tag: "fin", role: "Lead Cloud Economics", avatar: "L" },
      { key: "data", name: "Titan", domain: "Saga Compensations", score: "6.5/10", tag: "data", role: "Data Reliability Architect", avatar: "T" }
    ],
    invariants: [
      { id: "INV-SEC-01", desc: "Zero PAN in app memory (HSM Perimeter)" },
      { id: "INV-SCALE-02", desc: "Regional Idempotency Leases <20ms" },
      { id: "INV-FIN-03", desc: "Least-Cost Routing (-$38,000/yr)" },
      { id: "INV-DATA-04", desc: "2PC Saga Compensations 100% Atomic" },
      { id: "INV-ISO-05", desc: "Switch Room Isolation (0 Leaked Bytes)" }
    ],
    chambers: [
      { id: "audit-security", specialist: "Aegis", domain: "PCI-DSS Level 1 Auth", score: "3.8/10", tag: "sec", token: "sw_sec_088_99a", acl: "['athena', 'aegis']", leak: "0 Bytes", finding: "Raw PAN exposure in debug log aggregators violates PCI-DSS 3.4. Mandates perimeter edge tokenization in HSM." },
      { id: "audit-scalability", specialist: "Vanguard", domain: "Active-Active Idempotency", score: "6.2/10", tag: "scale", token: "sw_scale_088_55b", acl: "['athena', 'vanguard']", leak: "0 Bytes", finding: "Cross-region two-phase pessimistic locks spike checkout latency to 820ms. Mandates regional conditional write leases in DynamoDB." },
      { id: "audit-finops", specialist: "Ledger", domain: "Interchange Cost Routing", score: "5.8/10", tag: "fin", token: "sw_fin_088_12c", acl: "['athena', 'ledger']", leak: "0 Bytes", finding: "Static flat-rate gateway interchange incurs $38,000/yr overpayment. Mandates dynamic least-cost BIN router." },
      { id: "audit-database", specialist: "Titan", domain: "Saga Compensations", score: "6.5/10", tag: "data", token: "sw_data_088_77d", acl: "['athena', 'titan']", leak: "0 Bytes", finding: "Non-atomic webhook retries cause double credit. Mandates two-phase saga coordinator with unique transaction constraints." }
    ],
    debateMessages: [
      { sender: "Athena", role: "Council Chair", tag: "chair", content: "Convening Quorum for RFC-088: Multi-Region Payment Processing Service. Soundproof chambers locked." },
      { sender: "Aegis", role: "Staff Security Auditor", tag: "sec", content: "CRITICAL BLOCK: Unmasked card numbers found in log aggregators. We cannot touch production until hardware tokenization is deployed at perimeter edge." },
      { sender: "Vanguard", role: "Principal Systems Architect", tag: "scale", content: "Agreed on tokenization. And do NOT use cross-region pessimistic locks—820ms checkout latency causes 18% cart abandonment. Use regional idempotency leases." },
      { sender: "Ledger", role: "Lead Cloud Economics", tag: "fin", content: "Implement dynamic interchange routing. Routing domestic debit cards to local rails saves $38,000/year over flat stripe pricing." },
      { sender: "Titan", role: "Data Reliability Architect", tag: "data", content: "We mandate strict two-phase saga state machines to guarantee automated compensations if payment gateway times out." },
      { sender: "Athena", role: "Council Chair", tag: "chair", content: "Consensus reached: Edge HSM tokenization + Regional DynamoDB leases + Smart BIN routing approved." }
    ],
    toolsLog: [
      {
        agent: "Aegis",
        role: "Staff Security Auditor",
        tool: "pci_dss_log_scanner",
        duration: "135ms",
        tag: "sec",
        query: 'target_index: "elasticsearch-app-logs"\nregex: "card_number|cvv|exp"',
        result: '{\n  "unmasked_pan_matches": 1420,\n  "compliance_status": "CRITICAL PCI-DSS VIOLATION (Req 3.4)"\n}'
      },
      {
        agent: "Vanguard",
        role: "Principal Systems Architect",
        tool: "cross_region_lock_evaluator",
        duration: "240ms",
        tag: "scale",
        query: 'topology: "2pc_global_pessimistic_lock"\nregions: ["us-east-1", "eu-west-1"]',
        result: '{\n  "p99_latency_ms": 820.5,\n  "abandonment_projection": "18.2%",\n  "status": "FAIL: Checkout latency spike"\n}'
      }
    ],
    matrix: [
      {
        vector: "PCI-DSS Compliance vs Debug Visibility",
        clash: "Engineering Ops (Full raw payload logging) vs Aegis (PCI-DSS Level 1 violation).",
        resolution: "Perimeter tokenization in HSM vault; debug logs only contain opaque token IDs.",
        invariant: "INV-SEC-01: Zero raw cardholder PAN exposure in application memory"
      },
      {
        vector: "Cross-Region Locking vs Checkout Speed",
        clash: "Titan (Global locks to prevent double-charging) vs Vanguard (800ms cross-region latency).",
        resolution: "Regional idempotency leases with conditional writes in DynamoDB global tables.",
        invariant: "INV-SCALE-02: Sub-50ms checkout authorization latency"
      }
    ],
    manifestItems: [
      { action: "CREATE", path: "src/security/hsm_tokenizer.py", mandatedBy: "Aegis", purpose: "Perimeter hardware tokenization vault preventing PAN logging" },
      { action: "CREATE", path: "src/idempotency/dynamo_lease.py", mandatedBy: "Vanguard", purpose: "Regional conditional write idempotency coordinator" },
      { action: "CREATE", path: "src/routing/interchange_router.py", mandatedBy: "Ledger", purpose: "Least-cost payment routing engine saving $38,000/yr" },
      { action: "CREATE", path: "tests/test_payment_saga.py", mandatedBy: "Titan", purpose: "Saga compensation verification under simulated network partitions" }
    ],
    components: {
      clients: {
        title: "Checkout Client Apps (Web / iOS)",
        auditor: "Vanguard • Principal Systems",
        score: "Score: 6.2/10",
        avatar: "V",
        tag: "scale",
        toolName: "regional_handshake_timer",
        toolDuration: "45ms",
        toolSnippet: 'client_edge: "Cloudflare Anycast"\nlatency: "14ms"',
        finding: "Cross-region latency spikes cause shopping cart abandonment.",
        resolution: "Regional client endpoint with local TLS handshake.",
        code: `fetch('/api/pay', { headers: { 'Idempotency-Key': uuid() } })`
      },
      nlb: {
        title: "Perimeter Tokenization Vault (HSM)",
        auditor: "Aegis • Staff Security",
        score: "Score: 3.8/10 (Resolved)",
        avatar: "A",
        tag: "sec",
        toolName: "pci_dss_log_scanner",
        toolDuration: "135ms",
        toolSnippet: 'matches: "1,420 unmasked PAN in logs"\nremediation: "Edge tokenization in HSM"',
        finding: "Raw cardholder PAN exposure in debug log aggregators violates PCI-DSS 3.4.",
        resolution: "Hardware security module replaces card details with opaque tokens at edge.",
        code: `def tokenize_card(pan, cvv):\n    return hsm_client.mint_token(pan, cvv)`
      },
      gateway: {
        title: "Regional Idempotency Coordinator",
        auditor: "Vanguard • Principal Systems",
        score: "Score: 6.2/10 (Resolved)",
        avatar: "V",
        tag: "scale",
        toolName: "cross_region_lock_evaluator",
        toolDuration: "240ms",
        toolSnippet: '2pc_latency: "820ms"\ndynamodb_lease: "18ms"',
        finding: "Cross-region locks introduce 800ms latency spikes.",
        resolution: "DynamoDB conditional writes with TTL leases per idempotency key.",
        code: `dynamodb.put_item(\n    ConditionExpression='attribute_not_exists(idempotency_key)'\n)`
      },
      redis: {
        title: "Smart Interchange Router",
        auditor: "Ledger • Lead FinOps",
        score: "Score: 5.8/10 (Resolved)",
        avatar: "L",
        tag: "fin",
        toolName: "interchange_optimization_matrix",
        toolDuration: "88ms",
        toolSnippet: 'static_markup: "2.9% + 30c"\nleast_cost_routing: "-$38,000/yr"',
        finding: "Static payment gateway routing pays 2.9% + 30c flat interchange.",
        resolution: "Dynamic least-cost router routes to lowest-fee provider, saving $38,000/yr.",
        code: `def select_lowest_fee_provider(card_bin, currency):\n    return fee_matrix.get_cheapest(card_bin, currency)`
      },
      outbox: {
        title: "Two-Phase Saga State Machine",
        auditor: "Titan • Data Reliability",
        score: "Score: 6.5/10 (Resolved)",
        avatar: "T",
        tag: "data",
        toolName: "saga_compensation_harness",
        toolDuration: "190ms",
        toolSnippet: 'compensations_verified: "100%"\nzero_orphan_holds: true',
        finding: "Non-atomic webhook retries cause duplicate balance crediting.",
        resolution: "Two-phase saga state machine with strict database unique constraints.",
        code: `async def execute_payment_saga(tx_id):\n    await auth_hold()\n    await commit_ledger()\n    await capture_payment()`
      },
      kafka: {
        title: "Multi-Rail Payment Gateway Sinks",
        auditor: "Vanguard & Ledger",
        score: "Score: 8.8/10",
        avatar: "V",
        tag: "scale",
        toolName: "gateway_failover_sim",
        toolDuration: "105ms",
        toolSnippet: 'acquirers: ["Stripe", "Adyen", "Chase"]\nfailover_time: "140ms"',
        finding: "Single acquirer outages bring down 100% of checkout flow.",
        resolution: "Multi-acquirer active-active circuit breaker with automatic failover.",
        code: `circuit_breaker = CircuitBreaker(fail_max=3, reset_timeout=30)`
      }
    },
    adrMarkdown: `# ADR-088: Multi-Region Payment Processing Service

**Status:** APPROVED WITH CONDITIONS  
**Date:** 2026-11-06  
**Author / Lead:** Fintech Platform Team  
**Council Reviewers:** Athena (Chair), Aegis, Vanguard, Ledger, Titan

---

## 1. Context & Compliance Target
Active-active multi-region payment gateway with automated multi-bank failover and strict PCI-DSS Level 1 compliance.

---

## 2. Decision Outcomes
1. **Perimeter Tokenization:** Zero cardholder PAN stored in application logs or microservice memory.
2. **Dynamic Smart Routing:** Least-cost interchange fees dynamically routed, saving $38,000 annually.

*Generated by Quorum on Switch AI.*`,
    prStickyComment: `## 🏛️ Quorum Architecture Review Report: RFC-088

| Specialist | Domain | Score | Status |
| :--- | :--- | :---: | :--- |
| **Aegis** | PCI-DSS Level 1 Auth | 3.8/10 | 🛡️ HSM Tokenizer |
| **Vanguard** | Regional Idempotency | 6.2/10 | ⚡ Sub-20ms DynamoDB |
| **Ledger** | Interchange Cost Routing | 5.8/10 | 💰 -$38,000/yr Routing |
| **Titan** | Saga Compensations | 6.5/10 | ✅ Two-Phase Commit |

<details><summary><b>📂 Section 6 Implementer Manifest (Claude Code)</b></summary>

\`\`\`bash
claude -p "Read ADR-088.md Section 6. Switch to branch 'feat/adr-088-impl'. Implement scaffolded files. Run 'pytest tests/ -v'."
\`\`\`
</details>`
  }
};

const TOPOLOGY_MODELS = {
  rfc042: {
    viewBox: "0 0 1060 420",
    nodes: [
      { key: "clients", x: 30, y: 160, title: "100k Sockets", sub: "Client Apps Tier", metric: "Sub-20ms p99 SLA", pin: "INGRESS", color: "#38bdf8" },
      { key: "nlb", x: 235, y: 160, title: "AWS L4 NLB", sub: "TLS Termination", metric: "Zero In-Band Auth", pin: "EDGE LB", color: "#818cf8" },
      { key: "redis", x: 445, y: 160, title: "WebSocket Cluster", sub: "4 Nodes Autoscaling", metric: "$16.8k/yr vs $42k", pin: "💰 -$25.2k/yr", color: "#10b981" },
      { key: "gateway", x: 675, y: 70, title: "Redis Bloom Filter", sub: "Edge Revocation Cache", metric: "<0.2ms RAM Lookup", pin: "🛡️ Aegis: INV-SEC-01", color: "#f43f5e" },
      { key: "outbox", x: 675, y: 250, title: "Postgres Outbox", sub: "Transactional Table", metric: "Zero Message Loss", pin: "🏛️ Titan: INV-DATA-04", color: "#a78bfa" },
      { key: "kafka", x: 900, y: 250, title: "Kafka Event Stream", sub: "Debezium CDC Replica", metric: "Guaranteed Delivery", pin: "STREAM", color: "#06b6d4" }
    ],
    connections: [
      { from: "clients", to: "nlb", d: "M 180 207 L 235 207" },
      { from: "nlb", to: "redis", d: "M 390 207 L 445 207" },
      { from: "redis", to: "gateway", d: "M 620 207 C 648 207, 648 117, 675 117" },
      { from: "redis", to: "outbox", d: "M 620 207 C 648 207, 648 297, 675 297" },
      { from: "outbox", to: "kafka", d: "M 850 297 L 900 297" }
    ]
  },
  rfc019: {
    viewBox: "0 0 1060 420",
    nodes: [
      { key: "clients", x: 30, y: 160, title: "Global Clients", sub: "Anycast Ingress", metric: "10,000 req/sec", pin: "GLOBAL", color: "#38bdf8" },
      { key: "nlb", x: 235, y: 160, title: "Cloudflare Edge", sub: "CDN & Hot Cache", metric: "98% Cache Hit", pin: "CDN EDGE", color: "#818cf8" },
      { key: "gateway", x: 445, y: 160, title: "Envoy Gateway", sub: "Token Bucket Rate Limit", metric: "100k Burst Cap", pin: "🛡️ Aegis: Sec", color: "#f43f5e" },
      { key: "redis", x: 675, y: 70, title: "Redis LRU Tier", sub: "80/20 Working Set", metric: "<1.2ms Read SLA", pin: "⚡ Vanguard: Perf", color: "#06b6d4" },
      { key: "outbox", x: 675, y: 250, title: "Key Gen Service (KGS)", sub: "Feistel Base62 Permute", metric: "Deterministic 7-Char", pin: "💰 Ledger: FinOps", color: "#10b981" },
      { key: "kafka", x: 900, y: 250, title: "Cassandra + ClickHouse", sub: "Storage & Analytics", metric: "10B Keys Capacity", pin: "🏛️ Titan: Store", color: "#a78bfa" }
    ],
    connections: [
      { from: "clients", to: "nlb", d: "M 180 207 L 235 207" },
      { from: "nlb", to: "gateway", d: "M 390 207 L 445 207" },
      { from: "gateway", to: "redis", d: "M 620 207 C 648 207, 648 117, 675 117" },
      { from: "gateway", to: "outbox", d: "M 620 207 C 648 207, 648 297, 675 297" },
      { from: "outbox", to: "kafka", d: "M 850 297 L 900 297" }
    ]
  },
  rfc088: {
    viewBox: "0 0 1060 420",
    nodes: [
      { key: "clients", x: 30, y: 160, title: "Checkout Apps", sub: "Web & Mobile SDKs", metric: "<14ms Handshake", pin: "INGRESS", color: "#38bdf8" },
      { key: "nlb", x: 235, y: 160, title: "Perimeter HSM", sub: "Tokenization Vault", metric: "Zero PAN Ingest", pin: "🛡️ Aegis: PCI-1", color: "#f43f5e" },
      { key: "gateway", x: 445, y: 160, title: "Idempotency Coord", sub: "DynamoDB Leases", metric: "18ms Regional", pin: "⚡ Vanguard: NoLock", color: "#06b6d4" },
      { key: "redis", x: 675, y: 70, title: "Smart BIN Router", sub: "Least-Cost Routing", metric: "-$38,000/yr Saved", pin: "💰 Ledger: -$38k", color: "#10b981" },
      { key: "outbox", x: 675, y: 250, title: "2PC Saga Engine", sub: "State Coordinator", metric: "Atomic Compensate", pin: "🏛️ Titan: Saga", color: "#a78bfa" },
      { key: "kafka", x: 900, y: 250, title: "Multi-Rail Sinks", sub: "Stripe / Adyen / Fed", metric: "High-Availability", pin: "PAYMENT RAILS", color: "#38bdf8" }
    ],
    connections: [
      { from: "clients", to: "nlb", d: "M 180 207 L 235 207" },
      { from: "nlb", to: "gateway", d: "M 390 207 L 445 207" },
      { from: "gateway", to: "redis", d: "M 620 207 C 648 207, 648 117, 675 117" },
      { from: "gateway", to: "outbox", d: "M 620 207 C 648 207, 648 297, 675 297" },
      { from: "outbox", to: "kafka", d: "M 850 297 L 900 297" }
    ]
  }
};

// ==========================================================================
// 1. DELIBERATION PIPELINE EXECUTION ENGINE (Progressive Live Run)
// ==========================================================================

function triggerDeliberationRun() {
  runDeliberationPipeline(currentProposalKey, deliberationMode === "instant");
}

function onProposalSelectChange(key) {
  currentProposalKey = key;
  runDeliberationPipeline(key, deliberationMode === "instant");
}

function toggleDeliberationSpeed() {
  deliberationMode = (deliberationMode === "live") ? "instant" : "live";
  const icon = document.getElementById("mode-icon");
  const text = document.getElementById("mode-text");
  if (icon && text) {
    if (deliberationMode === "instant") {
      icon.textContent = "⚡";
      text.textContent = "Instant";
      showToast("Fast mode enabled: Reviews resolve in ~50ms");
    } else {
      icon.textContent = "⏱️";
      text.textContent = "Live Run";
      showToast("Live mode enabled: 4-phase deliberation simulation");
    }
  }
}

function runDeliberationPipeline(key, isInstant = false) {
  if (!PROPOSALS[key]) return;
  currentProposalKey = key;
  const p = PROPOSALS[key];

  if (deliberationTimer) {
    clearTimeout(deliberationTimer);
    deliberationTimer = null;
  }

  isDeliberating = true;
  updateHUDDeliberationState(true, "RUNNING DELPHI PROTOCOL", "Initializing soundproof rooms and specialist contexts...");

  // Update Proposal Title & Target
  const headlineElem = document.getElementById("prop-headline");
  if (headlineElem) headlineElem.textContent = p.headline;

  const sublineElem = document.getElementById("prop-subline");
  if (sublineElem) sublineElem.textContent = p.subline || "Interactive service topology — click any node to inspect invariants";

  const targetElem = document.getElementById("prop-target");
  if (targetElem) targetElem.textContent = p.targetScale;

  // Render Horizontal Invariant Strip
  const invElem = document.getElementById("invariant-items");
  if (invElem && p.invariants) {
    invElem.innerHTML = p.invariants.map(inv => `
      <span class="inv-strip-chip">
        <strong>${inv.id}:</strong> ${inv.desc}
      </span>
    `).join("");
  }

  // Pre-render static content
  renderADRAndManifest(p);
  renderMatrix(p);

  const skipBtn = document.getElementById("hud-skip-action");
  if (skipBtn) skipBtn.style.display = isInstant ? "none" : "inline-block";

  if (isInstant) {
    // Fast-Forward immediately
    executePhase(1, p);
    executePhase(2, p);
    executePhase(3, p);
    executePhase(4, p);
    finalizeConsensus(p);
    return;
  }

  // Live Progressive Sequence (Realistic 2.6s multi-agent deliberation)
  // Phase 1: Cryptographic Isolation (0ms -> 600ms)
  executePhase(1, p);
  setStepState(1, "active");
  setStepState(2, "pending");
  setStepState(3, "pending");
  setStepState(4, "pending");
  updateHUDDeliberationState(true, "PHASE 1: ROOM ISOLATION", `Partitioning 4 Soundproof Chambers (${p.chambers.map(c => '#' + c.id).join(', ')})...`);

  deliberationTimer = setTimeout(() => {
    // Phase 2: Independent Chamber Audits (600ms -> 1300ms)
    setStepState(1, "done");
    setStepState(2, "active");
    executePhase(2, p);
    updateHUDDeliberationState(true, "PHASE 2: BLIND AUDITS", `Specialists running tools: CVE search, concurrency sim, cloud pricing (0 leaked bytes)...`);

    deliberationTimer = setTimeout(() => {
      // Phase 3: Public Deliberation Floor Clash (1300ms -> 2100ms)
      setStepState(2, "done");
      setStepState(3, "active");
      executePhase(3, p);
      updateHUDDeliberationState(true, "PHASE 3: FLOOR CLASH", `Athena convenes #review-desk: Reconciling security, latency, and FinOps constraints...`);

      deliberationTimer = setTimeout(() => {
        // Phase 4: Dynamic Topology Synthesis & Consensus (2100ms -> 2700ms)
        setStepState(3, "done");
        setStepState(4, "active");
        executePhase(4, p);
        updateHUDDeliberationState(true, "PHASE 4: TOPOLOGY SYNTHESIS", `Synthesizing architecture vector graph & locking invariant assertions...`);

        deliberationTimer = setTimeout(() => {
          finalizeConsensus(p);
        }, 600);
      }, 800);
    }, 700);
  }, 600);
}

function executePhase(phaseNum, p) {
  if (phaseNum === 1) {
    // Render Chambers
    renderChambersGrid(p.chambers);
  } else if (phaseNum === 2) {
    // Render Tool Traces
    renderToolTraces(p.toolsLog);
  } else if (phaseNum === 3) {
    // Render Floor Debate
    renderFloorMessages(p.debateMessages);
  } else if (phaseNum === 4) {
    // Render Topology
    renderDynamicTopologySVG(currentProposalKey);
  }
}

function finalizeConsensus(p) {
  isDeliberating = false;
  setStepState(1, "done");
  setStepState(2, "done");
  setStepState(3, "done");
  setStepState(4, "done");

  const skipBtn = document.getElementById("hud-skip-action");
  if (skipBtn) skipBtn.style.display = "none";

  updateHUDDeliberationState(false, "CONSENSUS LOCKED", `Delphi review verified: 4 Soundproof Chambers reconciled with zero packet leakage.`);

  const conveneBtnText = document.getElementById("convene-btn-text");
  if (conveneBtnText) conveneBtnText.textContent = "↻ Re-run Review";

  const canvasBadge = document.getElementById("canvas-status-badge");
  if (canvasBadge) {
    canvasBadge.innerHTML = `<span class="sync-dot live"></span> Consensus Locked`;
  }

  showToast(`Consensus locked for ${p.id}! All 5 invariants verified.`);
}

function skipToConsensus() {
  if (deliberationTimer) {
    clearTimeout(deliberationTimer);
    deliberationTimer = null;
  }
  const p = PROPOSALS[currentProposalKey];
  executePhase(1, p);
  executePhase(2, p);
  executePhase(3, p);
  executePhase(4, p);
  finalizeConsensus(p);
}

function updateHUDDeliberationState(running, stateText, narrativeText) {
  const pill = document.getElementById("hud-live-pill");
  const stateElem = document.getElementById("hud-status-state");
  const narrativeElem = document.getElementById("hud-narrative-text");

  if (pill) {
    if (running) {
      pill.className = "hud-live-pill running";
    } else {
      pill.className = "hud-live-pill";
    }
  }
  if (stateElem) stateElem.textContent = stateText;
  if (narrativeElem) narrativeElem.textContent = narrativeText;
}

function setStepState(stepNum, state) {
  const step = document.getElementById(`hud-step-${stepNum}`);
  if (!step) return;
  step.className = `hud-step ${state}`;
}

// ==========================================================================
// 2. RENDER SUB-VIEWS
// ==========================================================================

function renderChambersGrid(chambers) {
  const grid = document.getElementById("chambers-grid-container");
  if (!grid || !chambers) return;
  grid.innerHTML = chambers.map(ch => `
    <div class="chamber-card">
      <div class="chamber-header-row">
        <div class="chamber-badge-title">
          <span class="spec-avatar ${ch.tag}" style="width:22px; height:22px; font-size:10px;">${ch.specialist[0]}</span>
          <span>#${ch.id}</span>
        </div>
        <span class="chamber-isolation-pill">🔒 100% BLIND</span>
      </div>
      <div class="chamber-meta-line">
        <span><strong>Agent:</strong> ${ch.specialist} (${ch.domain})</span>
        <span class="chamber-code-token">token: ${ch.token}</span>
      </div>
      <div class="chamber-finding-box">
        <strong>Independent Finding:</strong> ${ch.finding}
      </div>
      <div class="chamber-footer-row">
        <span style="font-family:var(--font-mono); font-size:9.5px; color:var(--text-muted);">ACL: <code>${ch.acl}</code></span>
        <span style="font-family:var(--font-mono); font-size:10px; font-weight:700; color:#10b981;">Leakage: ${ch.leak}</span>
      </div>
    </div>
  `).join("");
}

function renderToolTraces(toolsLog) {
  const container = document.getElementById("tools-stream-container");
  const toolBtn = document.getElementById("tool-traces-btn");
  if (toolBtn && toolsLog) {
    toolBtn.innerHTML = `<span class="nav-icon">🔍</span> Tool Traces (${toolsLog.length})`;
  }
  if (!container || !toolsLog) return;
  container.innerHTML = toolsLog.map(t => `
    <div class="tool-trace-card">
      <div class="tool-trace-header">
        <div class="tool-author-info">
          <span class="tool-author-pill ${t.tag}">${t.agent}</span>
          <span class="tool-title">${t.tool}</span>
        </div>
        <span class="tool-duration-badge">${t.duration}</span>
      </div>
      <div class="tool-trace-body">
        <div class="trace-block">
          <span class="trace-label">Invocation Arguments</span>
          <pre class="trace-code">${t.query}</pre>
        </div>
        <div class="trace-block">
          <span class="trace-label">Chamber Output Payload</span>
          <pre class="trace-code">${t.result}</pre>
        </div>
      </div>
    </div>
  `).join("");
}

function renderFloorMessages(messages) {
  const container = document.getElementById("floor-messages-container");
  if (!container || !messages) return;
  container.innerHTML = messages.map(m => {
    const isHuman = m.tag === "human";
    const avatarLetter = isHuman ? "H" : (m.sender === "Athena" ? "A" : m.sender[0]);
    return `
      <div class="chat-msg-row ${m.tag}">
        <div class="chat-avatar ${m.tag}">${avatarLetter}</div>
        <div class="chat-body-wrap">
          <div class="chat-meta-line">
            <span class="chat-author-name">${m.sender}</span>
            <span class="chat-author-role">&bull; ${m.role}</span>
          </div>
          <div class="chat-bubble">${m.content}</div>
        </div>
      </div>
    `;
  }).join("");
  container.scrollTop = container.scrollHeight;
}

function renderMatrix(p) {
  const tbody = document.getElementById("studio-matrix-rows");
  if (tbody && p.matrix) {
    tbody.innerHTML = p.matrix.map(m => `
      <tr>
        <td><span class="vector-badge">${m.vector}</span></td>
        <td><span style="color:var(--text-secondary);">${m.clash}</span></td>
        <td>
          <span style="color:var(--text-primary); font-weight:500;">${m.resolution}</span><br>
          <span class="invariant-pill">${m.invariant}</span>
        </td>
      </tr>
    `).join("");
  }
}

function renderADRAndManifest(p) {
  const adrSheet = document.getElementById("adr-sheet-content");
  if (adrSheet && p.adrMarkdown) {
    adrSheet.innerHTML = renderMarkdown(p.adrMarkdown);
  }

  const manifest = document.getElementById("manifest-table-container");
  if (manifest && p.manifestItems) {
    manifest.innerHTML = p.manifestItems.map(item => `
      <div class="manifest-row">
        <span class="action-pill ${item.action.toLowerCase()}">${item.action}</span>
        <div>
          <div class="manifest-path">${item.path}</div>
          <div style="font-size:9.5px; color:var(--text-muted);">${item.purpose} <span style="color:var(--brand-primary); font-weight:600;">(${item.mandatedBy})</span></div>
        </div>
      </div>
    `).join("");
  }

  const branchElem = document.getElementById("target-branch-display");
  if (branchElem) branchElem.textContent = p.targetBranch;

  const verifyElem = document.getElementById("verification-cmd-display");
  if (verifyElem) verifyElem.textContent = p.verificationCmd;

  const termLaunch = document.getElementById("term-launch-display");
  if (termLaunch) termLaunch.textContent = p.claudeCmd;

  const prPreview = document.getElementById("pr-preview-content");
  if (prPreview && p.prStickyComment) prPreview.textContent = p.prStickyComment;
}

// ==========================================================================
// 3. DYNAMIC VECTOR TOPOLOGY SVG (100% Client-Side Synthesized)
// ==========================================================================

function renderDynamicTopologySVG(rfcKey) {
  const container = document.getElementById("dynamic-svg-viewport");
  if (!container) return;

  const model = TOPOLOGY_MODELS[rfcKey] || TOPOLOGY_MODELS.rfc042;
  const isPaused = !flowAnimationActive;

  let svgHtml = `
    <svg viewBox="${model.viewBox}" class="topology-svg-root" id="synthesized-topology-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-node-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#141c2e" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#0b101c" stop-opacity="0.98" />
        </linearGradient>
        <filter id="glow-selected" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#06b6d4" flood-opacity="0.7" />
        </filter>
      </defs>

      <!-- Connections / Flow Wires -->
      <g class="topology-wires-layer">
  `;

  // Draw wire paths and animated particles
  model.connections.forEach((conn, idx) => {
    svgHtml += `
      <path id="flow-path-${idx}" class="flow-wire active-stream ${isPaused ? 'paused' : ''}" d="${conn.d}" />
      ${!isPaused ? `
        <circle r="4" class="flow-particle" fill="#22d3ee">
          <animateMotion path="${conn.d}" dur="${1.8 + (idx * 0.3)}s" repeatCount="indefinite" />
        </circle>
      ` : ''}
    `;
  });

  svgHtml += `
      </g>
      <!-- Nodes Layer -->
      <g class="topology-nodes-layer">
  `;

  // Draw Nodes with generous spacing and zero text collision
  model.nodes.forEach(n => {
    const isSelected = selectedTopologyNode === n.key;
    const nodeW = 180;
    const nodeH = 108;
    svgHtml += `
      <g class="svg-node-group ${isSelected ? 'selected' : ''}" id="svg-node-${n.key}" onclick="selectDynamicNode('${n.key}')">
        <!-- Node Background -->
        <rect class="node-body-rect" x="${n.x}" y="${n.y}" width="${nodeW}" height="${nodeH}" rx="12"
          fill="url(#grad-node-bg)" stroke="${isSelected ? '#06b6d4' : 'rgba(255,255,255,0.12)'}" stroke-width="${isSelected ? '2.5' : '1.2'}"
          filter="${isSelected ? 'url(#glow-selected)' : 'none'}" />

        <!-- Accent Top Line -->
        <rect x="${n.x + 14}" y="${n.y}" width="${nodeW - 28}" height="2.5" rx="1" fill="${n.color}" opacity="0.9" />

        <!-- Row 1: Category Tag (Left) & Pin Badge (Right) -->
        <rect x="${n.x + 12}" y="${n.y + 10}" width="54" height="16" rx="4" fill="rgba(255,255,255,0.05)" />
        <text x="${n.x + 39}" y="${n.y + 21}" text-anchor="middle" font-family="var(--font-sans)" font-size="8.5" font-weight="700" fill="#94a3b8" letter-spacing="0.5">TIER</text>

        ${n.pin ? `
          <rect x="${n.x + nodeW - 90}" y="${n.y + 9}" width="78" height="18" rx="4" fill="rgba(0,0,0,0.5)" stroke="${n.color}" stroke-width="1" />
          <text x="${n.x + nodeW - 51}" y="${n.y + 21.5}" text-anchor="middle" font-family="var(--font-mono)" font-size="9" font-weight="700" fill="${n.color}">${n.pin}</text>
        ` : ''}

        <!-- Row 2: Title (Dedicated baseline, zero collision) -->
        <text x="${n.x + 14}" y="${n.y + 48}" font-family="var(--font-sans)" font-size="13.5" font-weight="700" fill="#f8fafc">${n.title}</text>

        <!-- Row 3: Subtitle -->
        <text x="${n.x + 14}" y="${n.y + 68}" font-family="var(--font-sans)" font-size="11" fill="#94a3b8">${n.sub}</text>

        <!-- Row 4: Metric Pill -->
        <rect x="${n.x + 10}" y="${n.y + 80}" width="${nodeW - 20}" height="20" rx="5" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.06)" />
        <text x="${n.x + 18}" y="${n.y + 94}" font-family="var(--font-mono)" font-size="10.5" font-weight="600" fill="${n.color}">⚡ ${n.metric}</text>
      </g>
    `;
  });

  svgHtml += `
      </g>
    </svg>
  `;

  container.innerHTML = svgHtml;

  // Auto-select node to sync Right Rail Inspector
  const defaultKey = model.nodes[2] ? model.nodes[2].key : model.nodes[0].key;
  selectDynamicNode(defaultKey);
}

function selectDynamicNode(nodeKey) {
  selectedTopologyNode = nodeKey;
  document.querySelectorAll(".svg-node-group").forEach(el => el.classList.remove("selected"));
  const svgNode = document.getElementById(`svg-node-${nodeKey}`);
  if (svgNode) svgNode.classList.add("selected");

  // Ensure inspector is open
  const inspector = document.getElementById("inspector-rail");
  if (inspector && inspector.classList.contains("collapsed")) {
    inspector.classList.remove("collapsed");
    const toggleBtn = document.getElementById("inspector-toggle-btn");
    if (toggleBtn) toggleBtn.classList.add("active");
  }

  // Populate Inspector
  const p = PROPOSALS[currentProposalKey];
  const comp = p.components ? p.components[nodeKey] : null;
  if (!comp) return;

  const inspTitle = document.getElementById("insp-title");
  if (inspTitle) inspTitle.textContent = comp.title;

  const avatar = document.getElementById("insp-avatar");
  if (avatar) {
    avatar.textContent = comp.avatar || "A";
    avatar.className = `spec-avatar ${comp.tag || 'sec'}`;
  }

  const auditor = document.getElementById("insp-auditor");
  if (auditor) auditor.textContent = comp.auditor;

  const score = document.getElementById("insp-score");
  if (score) {
    score.textContent = comp.score;
    score.className = `spec-score-pill ${comp.tag || 'sec'}`;
  }

  const find = document.getElementById("insp-finding");
  if (find) find.textContent = comp.finding;

  const res = document.getElementById("insp-resolution");
  if (res) res.textContent = comp.resolution;

  const code = document.getElementById("insp-code");
  if (code) code.textContent = comp.code;

  const toolName = document.getElementById("insp-tool-name");
  if (toolName) toolName.textContent = comp.toolName || "verification_trace";

  const toolDur = document.getElementById("insp-tool-duration");
  if (toolDur) toolDur.textContent = comp.toolDuration || "110ms";

  const toolSnip = document.getElementById("insp-tool-snippet");
  if (toolSnip) toolSnip.textContent = comp.toolSnippet || "";
}

function toggleInspector() {
  const rail = document.getElementById("inspector-rail");
  const toggleBtn = document.getElementById("inspector-toggle-btn");
  if (!rail) return;
  rail.classList.toggle("collapsed");
  if (toggleBtn) {
    toggleBtn.classList.toggle("active", !rail.classList.contains("collapsed"));
  }
}

function toggleFlowAnimation() {
  flowAnimationActive = !flowAnimationActive;
  const label = document.getElementById("anim-status-label");
  if (label) {
    label.textContent = flowAnimationActive ? "ACTIVE" : "PAUSED";
    label.style.color = flowAnimationActive ? "var(--brand-primary)" : "var(--text-muted)";
  }
  renderDynamicTopologySVG(currentProposalKey);
  showToast(flowAnimationActive ? "Traffic animation active" : "Traffic animation paused");
}

function exportDynamicSVG() {
  const svgElem = document.getElementById("synthesized-topology-svg");
  if (!svgElem) {
    showToast("No active SVG topology to export.");
    return;
  }
  const svgXml = new XMLSerializer().serializeToString(svgElem);
  const standaloneSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated dynamically by Quorum 2.0 Delphi Architecture Engine -->
${svgXml}
`;
  const blob = new Blob([standaloneSvg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentProposalKey}_Synthesized_System_Topology.svg`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${currentProposalKey}_Synthesized_System_Topology.svg`);
}

// ==========================================================================
// 4. CUSTOM ARCHITECTURE RFC MODAL (Dynamic Heuristics Generator)
// ==========================================================================

function openCustomRFCModal() {
  const modal = document.getElementById("custom-rfc-modal");
  if (modal) modal.style.display = "flex";
}

function closeCustomRFCModal() {
  const modal = document.getElementById("custom-rfc-modal");
  if (modal) modal.style.display = "none";
}

function handleModalBackdropClick(event) {
  if (event.target.id === "custom-rfc-modal") {
    closeCustomRFCModal();
  }
}

function applyRFCPreset(presetKey) {
  const titleInput = document.getElementById("custom-title-input");
  const dilemmaInput = document.getElementById("custom-dilemma-input");

  if (presetKey === "fraud") {
    if (titleInput) titleInput.value = "Real-Time Fraud Scoring & Risk Engine";
    if (dilemmaInput) dilemmaInput.value = "Process 100,000 tx/sec with sub-5ms ML scoring, zero false-positive account lockouts, and under $12k/mo infrastructure spend under network partition.";
  } else if (presetKey === "stream") {
    if (titleInput) titleInput.value = "Global Adaptive Video Streaming CDN";
    if (dilemmaInput) dilemmaInput.value = "Deliver 10,000,000 concurrent 4K HLS video streams with sub-2s startup latency, zero rebuffering, and token authentication at edge POPs.";
  } else if (presetKey === "crypto") {
    if (titleInput) titleInput.value = "High-Frequency Crypto Order Matching Engine";
    if (dilemmaInput) dilemmaInput.value = "Match 200,000 orders/sec with deterministic sub-1ms p99 latency, zero-copy memory ring buffers, and strict double-spend ACID ledger verification.";
  }
}

function submitCustomRFC() {
  const titleInput = document.getElementById("custom-title-input");
  const dilemmaInput = document.getElementById("custom-dilemma-input");

  const title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : "Custom Distributed Architecture";
  const dilemma = (dilemmaInput && dilemmaInput.value.trim()) ? dilemmaInput.value.trim() : "High-throughput microservices architecture with strict security and availability.";

  const customKey = "custom_" + Date.now().toString(36);
  const rfcId = "RFC-" + Math.floor(100 + Math.random() * 900);

  // Synthesize dynamic proposal
  const customProposal = synthesizeCustomProposal(customKey, rfcId, title, dilemma);
  PROPOSALS[customKey] = customProposal;

  // Add to Dropdown
  const dropdown = document.getElementById("proposal-dropdown");
  if (dropdown) {
    const opt = document.createElement("option");
    opt.value = customKey;
    opt.textContent = `${rfcId}: ${title}`;
    dropdown.appendChild(opt);
    dropdown.value = customKey;
  }

  closeCustomRFCModal();
  showToast(`Conventing Delphi Council for ${rfcId}...`);
  runDeliberationPipeline(customKey, false);
}

function synthesizeCustomProposal(key, rfcId, title, dilemma) {
  const dLower = dilemma.toLowerCase();

  // Heuristic Domain Detection
  const hasAuth = dLower.includes("auth") || dLower.includes("token") || dLower.includes("fraud") || dLower.includes("sec") || dLower.includes("pci");
  const hasScale = dLower.includes("latency") || dLower.includes("stream") || dLower.includes("scale") || dLower.includes("qps") || dLower.includes("rps") || dLower.includes("order");
  const hasFin = dLower.includes("cost") || dLower.includes("spend") || dLower.includes("budget") || dLower.includes("cloud") || dLower.includes("bill");

  // Dynamic Topology Model
  TOPOLOGY_MODELS[key] = {
    viewBox: "0 0 1060 420",
    nodes: [
      { key: "clients", x: 30, y: 160, title: "Client Ingress", sub: "Global Edge", metric: "Sub-5ms SLA", pin: "INGRESS", color: "#38bdf8" },
      { key: "nlb", x: 235, y: 160, title: "Edge Gateway", sub: "TLS & Rate Limits", metric: "Zero Overhead", pin: "EDGE", color: "#818cf8" },
      { key: "redis", x: 445, y: 160, title: "Worker Cluster", sub: "Autoscaling Core", metric: "Optimized Footprint", pin: "COMPUTE", color: "#10b981" },
      { key: "gateway", x: 675, y: 70, title: "Security Barrier", sub: "RAM Fast-Path", metric: "<0.3ms Lookup", pin: "🛡️ Aegis: Sec", color: "#f43f5e" },
      { key: "outbox", x: 675, y: 250, title: "Atomic Ledger", sub: "Transactional Sink", metric: "Zero Data Loss", pin: "🏛️ Titan: State", color: "#a78bfa" },
      { key: "kafka", x: 900, y: 250, title: "Broadcast Rails", sub: "Event Pub/Sub", metric: "At-Least-Once", pin: "STREAM", color: "#06b6d4" }
    ],
    connections: [
      { from: "clients", to: "nlb", d: "M 180 207 L 235 207" },
      { from: "nlb", to: "redis", d: "M 390 207 L 445 207" },
      { from: "redis", to: "gateway", d: "M 620 207 C 648 207, 648 117, 675 117" },
      { from: "redis", to: "outbox", d: "M 620 207 C 648 207, 648 297, 675 297" },
      { from: "outbox", to: "kafka", d: "M 850 297 L 900 297" }
    ]
  };

  return {
    id: rfcId,
    headline: title,
    subline: `Synthesized architecture for "${dilemma.substring(0, 90)}..."`,
    targetScale: "High Concurrency & Low Latency",
    targetBranch: `feat/${rfcId.toLowerCase()}-impl`,
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ${rfcId}.md Section 6. Switch to branch 'feat/${rfcId.toLowerCase()}-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."`,
    specialists: [
      { key: "sec", name: "Aegis", domain: "Threat Modeling & Auth", score: hasAuth ? "4.2/10" : "6.5/10", tag: "sec", role: "Staff Security Auditor", avatar: "A" },
      { key: "scale", name: "Vanguard", domain: "Concurrency & Latency", score: hasScale ? "5.8/10" : "7.2/10", tag: "scale", role: "Principal Systems Architect", avatar: "V" },
      { key: "fin", name: "Ledger", domain: "Cloud Economics & ROI", score: hasFin ? "5.4/10" : "6.8/10", tag: "fin", role: "Lead Cloud Economics", avatar: "L" },
      { key: "data", name: "Titan", domain: "Data Consistency & ACID", score: "7.0/10", tag: "data", role: "Data Reliability Architect", avatar: "T" }
    ],
    invariants: [
      { id: "INV-SEC-01", desc: "Edge security verification enforced <1ms" },
      { id: "INV-SCALE-02", desc: "P99 latency bound preserved under 10x burst load" },
      { id: "INV-FIN-03", desc: "Compute right-sized to autoscale with zero idle burn" },
      { id: "INV-DATA-04", desc: "Zero double-spend or packet loss across partitions" },
      { id: "INV-ISO-05", desc: "Switch Room Isolation (0 Leaked Bytes)" }
    ],
    chambers: [
      { id: "audit-security", specialist: "Aegis", domain: "Security & Threat Modeling", score: hasAuth ? "4.2/10" : "6.5/10", tag: "sec", token: `sw_sec_${key}`, acl: "['athena', 'aegis']", leak: "0 Bytes", finding: `Identified vulnerability: In-flight validation without RAM verification exposes attack surface during peak throughput.` },
      { id: "audit-scalability", specialist: "Vanguard", domain: "Concurrency & Latency", score: hasScale ? "5.8/10" : "7.2/10", tag: "scale", token: `sw_scale_${key}`, acl: "['athena', 'vanguard']", leak: "0 Bytes", finding: `Bottleneck identified: Synchronous processing locks threads under heavy burst. Decouple into asynchronous event ring.` },
      { id: "audit-finops", specialist: "Ledger", domain: "Cloud Economics & ROI", score: hasFin ? "5.4/10" : "6.8/10", tag: "fin", token: `sw_fin_${key}`, acl: "['athena', 'ledger']", leak: "0 Bytes", finding: `Over-provisioning identified: Fixed instance reservations waste $18,000/yr. Shift to reactive autoscaling.` },
      { id: "audit-database", specialist: "Titan", domain: "Data Consistency & ACID", score: "7.0/10", tag: "data", token: `sw_data_${key}`, acl: "['athena', 'titan']", leak: "0 Bytes", finding: `Consistency guarantee: Transactional outbox pattern required to prevent split-brain writes on worker failure.` }
    ],
    debateMessages: [
      { sender: "Athena", role: "Council Chair", tag: "chair", content: `Convening Quorum for ${rfcId}: "${title}". 4 Soundproof Chambers partitioned.` },
      { sender: "Aegis", role: "Staff Security Auditor", tag: "sec", content: `Warning on ${title}: We must mandate edge token verification in RAM before allowing downstream invocation.` },
      { sender: "Vanguard", role: "Principal Systems Architect", tag: "scale", content: `@Aegis Concur on edge validation, but all data lookups must be asynchronous with zero thread blocking to satisfy SLA.` },
      { sender: "Ledger", role: "Lead Cloud Economics", tag: "fin", content: `Ensure memory autoscaling is configured at 75% threshold to avoid runaway cloud bills.` },
      { sender: "Titan", role: "Data Reliability Architect", tag: "data", content: `State transitions must be committed atomically to the transactional outbox table before publishing.` },
      { sender: "Athena", role: "Council Chair", tag: "chair", content: `Synthesizing consensus: Edge fast-path + Async worker ring + Autoscale compute approved.` },
      { sender: "Lead Architect", role: "Human Engineer", tag: "human", content: "approve" },
      { sender: "Athena", role: "Council Chair", tag: "chair", content: `✅ Consensus locked. Handing off Section 6 manifest to @ClaudeCode on branch feat/${rfcId.toLowerCase()}-impl.` }
    ],
    toolsLog: [
      { agent: "Aegis", role: "Staff Security Auditor", tool: "edge_threat_evaluator", duration: "128ms", tag: "sec", query: `target: "${title}"\nscope: "edge_ingress_auth"`, result: `{\n  "status": "VULNERABILITY_FOUND",\n  "remediation": "In-memory RAM token filter"\n}` },
      { agent: "Vanguard", role: "Principal Systems Architect", tool: "load_burst_simulator", duration: "205ms", tag: "scale", query: `workload: "${title}"\nmode: "non_blocking"`, result: `{\n  "simulated_p99_ms": 4.8,\n  "sla_status": "PASS"\n}` }
    ],
    matrix: [
      { vector: "Security vs Latency SLA", clash: "Aegis (Strict verification) vs Vanguard (Throughput SLA).", resolution: "Deploy fast-path RAM validation filter at edge ingress.", invariant: "INV-SEC-01: Sub-ms edge validation" },
      { vector: "Compute Availability vs Cloud Spend", clash: "Vanguard (Over-provisioned headroom) vs Ledger (Budget waste).", resolution: "Autoscaling cluster with dynamic node scaling.", invariant: "INV-FIN-03: Right-sized cloud spend" }
    ],
    manifestItems: [
      { action: "CREATE", path: `src/security/fast_filter.py`, mandatedBy: "Aegis", purpose: "Fast-path in-memory security validation" },
      { action: "CREATE", path: `src/core/worker_engine.py`, mandatedBy: "Vanguard", purpose: "Asynchronous high-concurrency event processor" },
      { action: "MODIFY", path: `infra/autoscale_cluster.tf`, mandatedBy: "Ledger", purpose: "Autoscaling cluster definition with 75% threshold" },
      { action: "CREATE", path: `tests/test_invariants.py`, mandatedBy: "Council", purpose: "Test suite verifying all operational invariants" }
    ],
    components: {
      clients: {
        title: "Client Apps Tier",
        auditor: "Vanguard • Principal Systems",
        score: "Score: 7.2/10",
        avatar: "V",
        tag: "scale",
        toolName: "client_roundtrip_timer",
        toolDuration: "42ms",
        toolSnippet: 'ingress: "Global Anycast"\nlatency: "Sub-5ms"',
        finding: "Direct unbuffered requests risk cascading timeouts.",
        resolution: "Anycast edge routing with keep-alive connections.",
        code: `// Client Ingress Request\nfetch('/api/v1/event', { method: 'POST', body: payload })`
      },
      nlb: {
        title: "Edge Gateway & TLS",
        auditor: "Vanguard • Principal Systems",
        score: "Score: 8.4/10",
        avatar: "V",
        tag: "scale",
        toolName: "gateway_rate_benchmark",
        toolDuration: "60ms",
        toolSnippet: 'throughput: "200k req/s"\ntls_handshake: "2.1ms"',
        finding: "TLS handshakes bottleneck worker nodes.",
        resolution: "Offload TLS termination to edge gateway.",
        code: `server { listen 443 ssl http2; ssl_session_cache shared:SSL:10m; }`
      },
      redis: {
        title: "Worker Processing Cluster",
        auditor: "Ledger • Lead Cloud Economics",
        score: "Score: 6.8/10",
        avatar: "L",
        tag: "fin",
        toolName: "autoscale_efficiency_calc",
        toolDuration: "95ms",
        toolSnippet: 'monthly_savings: "$1,500.00"\nautoscale_threshold: "75%"',
        finding: "Static provisioning incurs excessive idle costs.",
        resolution: "Elastic worker cluster with metric-based autoscaling.",
        code: `autoscaling_group { min_size = 2; max_size = 8; cpu_utilization = 75; }`
      },
      gateway: {
        title: "Security & Risk Fast-Path",
        auditor: "Aegis • Staff Security",
        score: "Score: 4.2/10 (Resolved)",
        avatar: "A",
        tag: "sec",
        toolName: "edge_threat_evaluator",
        toolDuration: "128ms",
        toolSnippet: 'rule_evaluation: "<0.3ms"\nrisk_score: "0 (Clean)"',
        finding: "Synchronous authentication lookups add excessive latency.",
        resolution: "In-memory bloom filter and local token cache at ingress.",
        code: `async def verify_request(token):\n    return token_cache.is_valid(token)`
      },
      outbox: {
        title: "Transactional Outbox & Ledger",
        auditor: "Titan • Data Reliability",
        score: "Score: 7.0/10 (Resolved)",
        avatar: "T",
        tag: "data",
        toolName: "ledger_consistency_audit",
        toolDuration: "140ms",
        toolSnippet: 'acid_compliance: "Verified"\nzero_double_spend: true',
        finding: "Non-atomic database writes cause inconsistencies on crash.",
        resolution: "Transactional outbox table commits state before event publish.",
        code: `BEGIN;\nINSERT INTO ledger_entries VALUES (...);\nINSERT INTO outbox_events VALUES (...);\nCOMMIT;`
      },
      kafka: {
        title: "Event Broadcast Stream",
        auditor: "Titan & Vanguard",
        score: "Score: 8.8/10",
        avatar: "T",
        tag: "data",
        toolName: "kafka_throughput_test",
        toolDuration: "80ms",
        toolSnippet: 'throughput: "250,000 evt/s"\ndelivery: "At-Least-Once"',
        finding: "Downstream consumers require guaranteed delivery ordering.",
        resolution: "Partitioned event log with key-ordered dispatch.",
        code: `producer.send(topic="domain_events", key=entity_id, value=payload)`
      }
    },
    adrMarkdown: `# ${rfcId}: ${title}

**Status:** APPROVED WITH CONDITIONS  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Author / Lead:** Human Lead Architect  
**Council Reviewers:** Athena (Chair), Aegis, Vanguard, Ledger, Titan

---

## 1. Context & Architectural Dilemma
${dilemma}

---

## 2. Decision Drivers & Invariants
- **INV-SEC-01:** Sub-ms security validation at edge ingress.
- **INV-SCALE-02:** Strict p99 latency guarantees under burst concurrency.
- **INV-FIN-03:** Autoscaling compute footprint with zero idle over-provisioning.
- **INV-DATA-04:** Transactional Outbox pattern guarantees zero message loss.
- **INV-ISO-05:** Consensus derived via Switch cryptographically partitioned soundproof rooms.

---

## 3. Decision Outcomes
- Implemented edge RAM fast-path validation filter to satisfy security and latency.
- Right-sized compute cluster with 75% memory autoscale.
- Enforced Transactional Outbox pattern for atomic state commits.

---

## 4. Implementer Handoff (Autonomous Agent CLI)
\`\`\`bash
claude -p "Read ${rfcId}.md Section 6. Switch to branch 'feat/${rfcId.toLowerCase()}-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."
\`\`\`

*Synthesized by Quorum 2.0 Delphi Architecture Engine on Switch AI.*`,
    prStickyComment: `## 🏛️ Quorum Architecture Review Report: ${rfcId}

**Proposal:** ${title}  
**Status:** ✅ **APPROVED WITH CONDITIONS**  
**Review Protocol:** Switch Delphi Method (4 Soundproof Isolation Chambers)  

| Specialist | Domain | Score | Resolution |
| :--- | :--- | :---: | :--- |
| **Aegis** | Threat Modeling & Auth | ${hasAuth ? "4.2/10" : "6.5/10"} | 🛡️ Edge RAM Filter |
| **Vanguard** | Concurrency & Latency | ${hasScale ? "5.8/10" : "7.2/10"} | ⚡ Async Worker Ring |
| **Ledger** | Cloud Economics & FinOps | ${hasFin ? "5.4/10" : "6.8/10"} | 💰 Autoscale Cluster |
| **Titan** | Data Consistency & ACID | 7.0/10 | ✅ Transactional Outbox |

<details><summary><b>📂 Section 6 Implementer Manifest (Claude Code)</b></summary>

\`\`\`bash
claude -p "Read ${rfcId}.md Section 6. Switch to branch 'feat/${rfcId.toLowerCase()}-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v'."
\`\`\`
</details>`
  };
}

// ==========================================================================
// 5. VIEW SWITCHING & INTERACTION
// ==========================================================================

function setCenterView(viewId) {
  document.querySelectorAll(".view-nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === viewId);
  });

  document.querySelectorAll(".canvas-view").forEach(v => {
    v.classList.toggle("active", v.id === `view-${viewId}`);
  });
}

function jumpToPhase(phaseNum) {
  currentPhase = phaseNum;
  if (phaseNum === 1) {
    setCenterView("chambers");
  } else if (phaseNum === 2) {
    setCenterView("tools");
  } else if (phaseNum === 3) {
    setCenterView("floor");
  } else if (phaseNum === 4) {
    setCenterView("topology");
  }
}

// Floor Interactions
function insertFloorPrompt(prompt) {
  const input = document.getElementById("floor-user-input");
  if (input) {
    input.value = prompt;
    input.focus();
  }
}

function handleFloorSubmit(e) {
  e.preventDefault();
  const input = document.getElementById("floor-user-input");
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  input.value = "";

  const p = PROPOSALS[currentProposalKey];
  p.debateMessages.push({
    sender: "Lead Architect",
    role: "Human Engineer",
    tag: "human",
    content: text
  });
  renderFloorMessages(p.debateMessages);

  // Show typing indicator
  const typingBar = document.getElementById("floor-typing-bar");
  const typingText = document.getElementById("typing-status-text");
  if (typingBar) typingBar.style.display = "flex";
  if (typingText) typingText.textContent = "Athena is evaluating directive...";

  setTimeout(() => {
    if (typingBar) typingBar.style.display = "none";
    let reply = "";
    const lower = text.toLowerCase();

    if (lower.includes("approve")) {
      reply = `✅ **DIRECTIVE ACCEPTED:** Architectural consensus locked by Lead Architect. Section 6 file scaffolding dispatched to @ClaudeCode on branch \`${p.targetBranch}\`.`;
      finalizeConsensus(p);
      jumpToPhase(4);
    } else if (lower.includes("summary")) {
      reply = `📋 **EXECUTIVE SUMMARY:** Reconciled specialist trade-offs. Security barrier verified (<0.3ms lookup), compute autoscaled with zero idle burn, and Transactional Outbox enforced for zero message loss.`;
    } else if (lower.includes("diagram")) {
      reply = `📊 **VECTOR TOPOLOGY:** Switched stageboard to high-resolution system topology canvas.`;
      setCenterView("topology");
    } else if (lower.includes("veto")) {
      reply = `🛑 **DIRECTIVE ACCEPTED:** Proposal returned to chamber audit phase for re-evaluation with updated constraints.`;
    } else {
      reply = `Acknowledged directive: "${text}". Incorporating steering invariants into ADR Section 4 trade-off log.`;
    }

    p.debateMessages.push({
      sender: "Athena",
      role: "Council Chair",
      tag: "chair",
      content: reply
    });
    renderFloorMessages(p.debateMessages);
  }, 750);
}

// Clipboard Actions
function copyHandoffCommand() {
  const cmd = PROPOSALS[currentProposalKey].claudeCmd;
  navigator.clipboard.writeText(cmd).then(() => {
    showToast("Terminal command copied: claude -p 'Read ADR...'");
  }).catch(() => {
    showToast("Command copied.");
  });
}

function copyPRComment() {
  const p = PROPOSALS[currentProposalKey];
  navigator.clipboard.writeText(p.prStickyComment).then(() => {
    showToast("GitHub PR sticky comment copied to clipboard!");
  }).catch(() => {
    showToast("PR comment copied.");
  });
}

function copyInspectorCode() {
  const code = document.getElementById("insp-code").textContent;
  navigator.clipboard.writeText(code).then(() => {
    showToast("Contract specification copied to clipboard.");
  }).catch(() => {
    showToast("Code copied.");
  });
}

function exportADR() {
  const p = PROPOSALS[currentProposalKey];
  const blob = new Blob([p.adrMarkdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${p.id}_Architecture_Decision_Record.md`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${p.id}_Architecture_Decision_Record.md`);
}

function showToast(text) {
  const toast = document.getElementById("studio-toast");
  const msg = document.getElementById("toast-message");
  if (!toast || !msg) return;
  msg.textContent = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function renderMarkdown(md) {
  return md
    .replace(/^# (.*$)/gim, '<h2 style="font-size:16px; font-weight:700; margin:16px 0 8px; color:var(--text-primary);">$1</h2>')
    .replace(/^## (.*$)/gim, '<h3 style="font-size:12.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.4px; margin:16px 0 6px; color:var(--brand-primary);">$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/`(.*?)`/gim, '<code style="font-family:var(--font-mono); font-size:11px; background:var(--bg-card-subtle); padding:2px 5px; border-radius:4px; border:1px solid var(--border-subtle);">$1</code>')
    .replace(/^\- (.*$)/gim, '<li style="margin-left:16px; margin-bottom:4px; font-size:12px; color:var(--text-secondary);">$1</li>')
    .replace(/\n$/gim, '<br>');
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  runDeliberationPipeline("rfc042", true); // Fast load first time
});
