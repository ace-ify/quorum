/**
 * Quorum Studio — Autonomous Architecture Review Board
 * Complete interactive workbench logic for visual topology, live agent tool traces,
 * soundproof isolation chambers, council floor debate, tension matrix, and code scaffolding.
 */

const PROPOSALS = {
  rfc042: {
    id: "RFC-042",
    headline: "100,000 WebSocket Messaging Fabric",
    targetScale: "100k Sockets (peak 25k msg/s)",
    targetBranch: "feat/adr-042-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."`,
    diagramImg: "diagram_rfc042_resolved.svg",
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
    nodes: [
      { key: "clients", label: "100k Sockets", sub: "Clients Tier", metric: "Sub-20ms p99", iconType: "clients" },
      { key: "nlb", label: "AWS L4 NLB", sub: "TLS Termination", metric: "Zero-Inspection", iconType: "nlb" },
      { key: "gateway", pin: "SEC", pinClass: "flag-sec", label: "Ingress Gateway", sub: "Bloom Revocation", metric: "<0.2ms RAM Lookup", iconType: "gateway" },
      { key: "redis", pin: "-$25.2k", pinClass: "flag-fin", label: "4-Node Cluster", sub: "75% Autoscale", metric: "$16.8k/yr vs $42k", iconType: "redis" },
      { key: "outbox", pin: "CDC", pinClass: "flag-data", label: "Postgres Outbox", sub: "Debezium -> Kafka", metric: "Zero Msg Loss", iconType: "outbox" }
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
        vector: "Auth Revocation vs Ingress Latency",
        clash: "Aegis (Synchronous auth revocation on every heartbeat) vs Vanguard (Sub-18ms socket latency requirement).",
        resolution: "Edge Redis Bloom Filter bitset (<0.2ms lookup in RAM, zero Postgres connection churn).",
        invariant: "INV-SEC-01: Revocation latency < 1ms"
      },
      {
        vector: "Cluster Sizing vs Peak Headroom",
        clash: "Original Spec (12 static nodes, $42,000/yr) vs Ledger (20k off-peak baseline, $25.2k budget waste).",
        resolution: "4 primary nodes with AWS CloudWatch 75% memory autoscaling alarms.",
        invariant: "INV-FIN-03: Compute right-sizing (-$25,200/yr)"
      },
      {
        vector: "Persistence vs Write Throughput",
        clash: "Original Spec (Dual-write Redis + Postgres) vs Titan (Message loss on worker crash).",
        resolution: "Transactional Outbox table with Debezium CDC log streaming to Kafka.",
        invariant: "INV-DATA-04: At-least-once linearizable delivery"
      }
    ],
    manifestItems: [
      { action: "CREATE", path: "src/middleware/bloom_revocation.py", mandatedBy: "Aegis & Vanguard", purpose: "Redis Bloom filter sub-0.2ms token revocation middleware" },
      { action: "CREATE", path: "src/cluster/config.yaml", mandatedBy: "Ledger", purpose: "4-node cluster autoscaling spec saving $25,200/year" },
      { action: "CREATE", path: "src/db/outbox_producer.py", mandatedBy: "Titan", purpose: "Transactional Outbox pattern producer for zero message loss" },
      { action: "CREATE", path: "tests/test_messaging_cluster.py", mandatedBy: "Athena", purpose: "Verifies sub-1ms Bloom filter latency and payload integrity" }
    ],
    components: {
      clients: {
        title: "100k Sockets Clients Tier",
        auditor: "Vanguard • Principal Systems",
        score: "Score: 6.8/10",
        avatar: "V",
        tag: "scale",
        toolName: "queue_concurrency_sim",
        toolDuration: "215ms",
        toolSnippet: 'connections: 100000\nstatus: "ConnectionPoolExhaustedException at t=11.8s"',
        finding: "100k simultaneous reconnections during rolling pod deployments risk crashing relational connection pool.",
        resolution: "Client-side randomized jitter and exponential backoff enforced at connection layer.",
        code: `# Client reconnect jitter spec
reconnect_delay = min(MAX_BACKOFF, BASE_BACKOFF * (2 ** retry_count))
jittered_delay = reconnect_delay * (0.5 + random.random())`
      },
      nlb: {
        title: "AWS L4 Network Load Balancer",
        auditor: "Vanguard • Principal Systems",
        score: "Score: 9.0/10",
        avatar: "V",
        tag: "scale",
        toolName: "tls_passthrough_eval",
        toolDuration: "64ms",
        toolSnippet: 'mode: "TCP_PASS_THROUGH"\nlatency_overhead: "<0.05ms"',
        finding: "TCP level pass-through avoids HTTP long-polling handshake overhead and terminates TLS at line speed.",
        resolution: "L4 direct routing preserves client socket state without TLS re-encryption tax.",
        code: `Type: AWS::ElasticLoadBalancingV2::LoadBalancer
Properties:
  Type: network
  Scheme: internet-facing
  IpAddressType: dualstack`
      },
      gateway: {
        title: "Ingress Gateway & Bloom Filter",
        auditor: "Aegis • Staff Security",
        score: "Score: 4.5/10 (Resolved)",
        avatar: "A",
        tag: "sec",
        toolName: "cve_database_search",
        toolDuration: "142ms",
        toolSnippet: 'query: "WebSocket heartbeat session hijacking"\nresult: "CVE-2023-4580 (CVSS 8.1 High)"',
        finding: "In-band heartbeat token validation permits a 15-minute window of unauthorized socket frames after account ban.",
        resolution: "Sub-ms Redis Bloom filter bitset deployed at gateway edge. Revoked tokens checked in RAM with zero DB load.",
        code: `# src/middleware/bloom_revocation.py
async def verify_socket_session(socket_id: str, token_id: str) -> bool:
    """Checks sub-ms RAM bitset for revoked tokens without DB hits."""
    if await redis_bloom.exists("revoked_tokens", token_id):
        await terminate_connection(socket_id, reason="Revoked")
        return False
    return True`
      },
      redis: {
        title: "4-Node MemoryDB Autoscaling Cluster",
        auditor: "Ledger • Lead FinOps",
        score: "Score: 6.0/10 (Resolved)",
        avatar: "L",
        tag: "fin",
        toolName: "aws_pricing_calculator",
        toolDuration: "98ms",
        toolSnippet: '12_nodes: "$42,048/yr (16.4% utilization)"\n4_nodes_autoscale: "$16,848/yr (Saves $25,200/yr)"',
        finding: "12 provisioned nodes for a 20k baseline is rejected by Ledger. Wastes $25,200/year on idle compute.",
        resolution: "Right-sized to 4 primary instances with 75% memory autoscaling alarms, saving $25,200 annually.",
        code: `ClusterConfiguration:
  InitialNodes: 4
  NodeType: cache.r6g.xlarge
  AutoScaling:
    Metric: MemoryUtilizationPercentage
    Threshold: 75
    CooldownSeconds: 300`
      },
      outbox: {
        title: "Postgres Outbox & Debezium CDC",
        auditor: "Titan • Data Reliability",
        score: "Score: 7.2/10 (Resolved)",
        avatar: "T",
        tag: "data",
        toolName: "distributed_fault_injection",
        toolDuration: "310ms",
        toolSnippet: 'fault: "worker_sigkill_mid_write"\npacket_loss: "1.84% (Dual-write violation)"',
        finding: "Dual-writing directly to Redis Pub/Sub and Postgres causes message loss if a worker crashes between writes.",
        resolution: "Transactional Outbox table with Debezium CDC into Kafka guarantees strict at-least-once delivery.",
        code: `# src/db/outbox_producer.py
async def emit_chat_event(session, event_payload: dict):
    # Commits to outbox_events in same ACID transaction as state
    event = OutboxEvent(payload=event_payload, status="PENDING")
    session.add(event)
    await session.commit()`
      }
    },
    adrMarkdown: `# ADR-042: Real-Time Messaging Fabric & Ingress Event Streaming

**Status:** APPROVED WITH CONDITIONS  
**Date:** 2026-11-06  
**Author / Lead:** Platform Engineering Core  
**Council Reviewers:** Athena (Chair), Aegis (Sec), Vanguard (Scale), Ledger (FinOps), Titan (Data)

---

## 1. Context & Workload Target
Legacy HTTP long-polling architecture is failing under scale (450ms p99 latency). This design introduces a dedicated WebSocket cluster supporting 100,000 concurrent sockets with sub-20ms broadcast latency.

---

## 2. Decision Outcomes & Resolved Invariants
1. **Edge Token Revocation:** Implemented Redis Bloom filter middleware at ingress edge. User revocation status checked in <0.2ms RAM with zero database hits.
2. **Cluster Right-Sizing:** Provisioned 4x cache.r6g.xlarge nodes with memory autoscale at 75%, saving $25,200 annually.
3. **Guaranteed Delivery:** Enforced Transactional Outbox pattern with Debezium CDC into Kafka, eliminating dual-write state corruption.

---

## 3. Scaffolding File Manifest
- \`src/middleware/bloom_revocation.py\`
- \`src/cluster/config.yaml\`
- \`src/db/outbox_producer.py\`
- \`tests/test_messaging_cluster.py\`

*Generated by Quorum on Switch AI.*`,
    prStickyComment: `## 🏛️ Quorum Architecture Review Report: RFC-042

| Specialist | Domain | Score | Status |
| :--- | :--- | :---: | :--- |
| **Aegis** | Security & Threat Modeling | 4.5/10 | ⚠️ BLOCK (Resolved) |
| **Vanguard** | Scalability & Latency | 6.8/10 | ✅ APPROVED |
| **Ledger** | FinOps & Cloud Economics | 6.0/10 | 💰 -$25,200/yr |
| **Titan** | Data Consistency & ACID | 7.2/10 | ✅ APPROVED |

### ⚡ Key Architectural Reconciliations
- **Edge Revocation:** Redis Bloom filter bitset deployed (<0.2ms RAM lookup).
- **Compute Savings:** Right-sized from 12 to 4 nodes with 75% memory autoscale.
- **Delivery Guarantee:** Outbox CDC stream prevents split-brain dual write.

<details><summary><b>📂 Section 6 Implementer Manifest (Claude Code)</b></summary>

\`\`\`bash
claude -p "Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement scaffolded files. Run 'pytest tests/ -v'."
\`\`\`
</details>`
  },

  rfc019: {
    id: "RFC-019",
    headline: "Global Scalable URL Shortener (10B Keys)",
    targetScale: "10B Keys (50k QPS)",
    targetBranch: "feat/adr-019-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-019.md Section 6. Switch to branch 'feat/adr-019-impl'. Implement Base62 collision-free ID generator with Redis cluster cache and Cassandra persistent tier. Run 'pytest tests/ -v'."`,
    diagramImg: "diagram_rfc042_resolved.svg",
    specialists: [
      { key: "sec", name: "Aegis", domain: "Abuse & Link Scraping", score: "5.2/10", tag: "sec", role: "Staff Security Auditor", avatar: "A" },
      { key: "scale", name: "Vanguard", domain: "50k QPS Key Generation", score: "7.0/10", tag: "scale", role: "Principal Systems Architect", avatar: "V" },
      { key: "fin", name: "Ledger", domain: "Telemetry Tiering ROI", score: "6.5/10", tag: "fin", role: "Lead Cloud Economics", avatar: "L" },
      { key: "data", name: "Titan", domain: "Cross-Region Pinning", score: "8.1/10", tag: "data", role: "Data Reliability Architect", avatar: "T" }
    ],
    invariants: [
      { id: "INV-SCALE-01", desc: "Zero central DB lock on key minting" },
      { id: "INV-SEC-02", desc: "Anti-Enumeration Shuffled Base62" },
      { id: "INV-FIN-03", desc: "Decouple ClickHouse Sinks (-$14k/yr)" },
      { id: "INV-DATA-04", desc: "Cassandra Read Latency <5ms" },
      { id: "INV-ISO-05", desc: "Switch Room Isolation (0 Leaked Bytes)" }
    ],
    nodes: [
      { key: "clients", label: "50k QPS", sub: "Global Clients", metric: "<1.8ms Edge", iconType: "clients" },
      { key: "nlb", label: "Anycast DNS", sub: "Latency Routing", metric: "<12ms Handshake", iconType: "nlb" },
      { key: "gateway", pin: "SEC", pinClass: "flag-sec", label: "Distributed KGS", sub: "Shuffled Base62", metric: "Zero Enumeration", iconType: "gateway" },
      { key: "redis", pin: "LRU", pinClass: "flag-scale", label: "Hot Cache Tier", sub: "84% Hit Ratio", metric: "32GB RAM Bound", iconType: "redis" },
      { key: "outbox", pin: "-$14k", pinClass: "flag-fin", label: "ClickHouse Sink", sub: "90-Day Telemetry", metric: "14:1 Compression", iconType: "outbox" }
    ],
    chambers: [
      { id: "audit-security", specialist: "Aegis", domain: "Abuse & Link Scraping", score: "5.2/10", tag: "sec", token: "sw_sec_019_71a", acl: "['athena', 'aegis']", leak: "0 Bytes", finding: "Sequential auto-increment IDs permit automated enumeration scraping. Mandates cryptographically shuffled Base62 token space." },
      { id: "audit-scalability", specialist: "Vanguard", domain: "50k QPS Key Generation", score: "7.0/10", tag: "scale", token: "sw_scale_019_22b", acl: "['athena', 'vanguard']", leak: "0 Bytes", finding: "Relational row-lock contention on central sequences limits minting to 6,200 RPS. Mandates range pre-allocation in 1M chunks." },
      { id: "audit-finops", specialist: "Ledger", domain: "Telemetry Tiering ROI", score: "6.5/10", tag: "fin", token: "sw_fin_019_99c", acl: "['athena', 'ledger']", leak: "0 Bytes", finding: "Storing 365-day click telemetry in primary OLTP database burns IOPS. Mandates ClickHouse tiering, saving $14,000/year." },
      { id: "audit-database", specialist: "Titan", domain: "Cross-Region Pinning", score: "8.1/10", tag: "data", token: "sw_data_019_44d", acl: "['athena', 'titan']", leak: "0 Bytes", finding: "Multi-region Cassandra ring provides linear scale for 10B keys with predictable sub-5ms read latencies." }
    ],
    debateMessages: [
      { sender: "Athena", role: "Council Chair", tag: "chair", content: "Convening Quorum for RFC-019: Global Scalable URL Shortener (10B Keys). Specialists have concluded soundproof chamber assessments." },
      { sender: "Vanguard", role: "Principal Systems Architect", tag: "scale", content: "A central SQL auto-increment sequence caps out at 6,200 QPS due to lock contention. We must decouple key generation with pre-allocated 1M ranges." },
      { sender: "Aegis", role: "Staff Security Auditor", tag: "sec", content: "If you pre-allocate sequential numbers, bots will enumerate all shortlinks in minutes. We must shuffle the token space cryptographically." },
      { sender: "Ledger", role: "Lead Cloud Economics", tag: "fin", content: "And don't write click telemetry to Cassandra. Tier it to ClickHouse with a 90-day TTL to save $14,000 annually in storage." },
      { sender: "Titan", role: "Data Reliability Architect", tag: "data", content: "Agreed. Cassandra for O(1) redirects + ClickHouse for analytics achieves high write throughput without row lock contention." },
      { sender: "Athena", role: "Council Chair", tag: "chair", content: "Consensus locked: Pre-allocated shuffled Base62 KGS + ClickHouse analytics tiering adopted." }
    ],
    toolsLog: [
      {
        agent: "Vanguard",
        role: "Principal Systems Architect",
        tool: "key_generation_lock_benchmark",
        duration: "185ms",
        tag: "scale",
        query: 'mechanism: "sql_auto_increment"\nqps_target: 50000',
        result: '{\n  "row_lock_contention": "92.4%",\n  "max_achievable_qps": 6200,\n  "status": "FAIL: Centralized sequence bottleneck"\n}'
      },
      {
        agent: "Aegis",
        role: "Staff Security Auditor",
        tool: "entropy_enumeration_test",
        duration: "120ms",
        tag: "sec",
        query: 'id_format: "sequential_base62"\nworker_probe_rate: 1000',
        result: '{\n  "enumeration_rate": "99.8%",\n  "vulnerability": "Predictable sequential URLs enable automated harvesting"\n}'
      }
    ],
    matrix: [
      {
        vector: "Key Generation Throughput vs Randomness",
        clash: "Vanguard (Zero DB locks on key generation) vs Aegis (Prevent sequential enumeration).",
        resolution: "Pre-allocated 1M key ranges with cryptographically shuffled Base62 tokens.",
        invariant: "INV-SCALE-01: Zero central database lock on link creation"
      },
      {
        vector: "Analytics Retention vs Primary DB Cost",
        clash: "Product Team (365-day click telemetry) vs Ledger (Relational IOPS budget breach).",
        resolution: "Tier telemetry to ClickHouse with 90-day retention, saving $14,000/year.",
        invariant: "INV-FIN-03: Analytics storage decoupled from OLTP database"
      }
    ],
    manifestItems: [
      { action: "CREATE", path: "src/kgs/token_generator.py", mandatedBy: "Vanguard & Aegis", purpose: "Pre-allocated shuffled Base62 key generator service" },
      { action: "CREATE", path: "src/db/clickhouse_sink.py", mandatedBy: "Ledger", purpose: "Telemetry ingestion pipeline saving $14,000/yr" },
      { action: "CREATE", path: "tests/test_shortener.py", mandatedBy: "Athena", purpose: "End-to-end encoding, SSRF guard, and cache tests" }
    ],
    components: {
      clients: {
        title: "Global HTTP Redirect Clients",
        auditor: "Vanguard • Principal Systems",
        score: "Score: 7.0/10",
        avatar: "V",
        tag: "scale",
        toolName: "edge_latency_benchmark",
        toolDuration: "82ms",
        toolSnippet: 'qps: 50000\nmeasured_latency: "1.8ms at Cloudflare edge"',
        finding: "50,000 incoming query operations per second worldwide.",
        resolution: "Cloudflare edge workers handle initial redirect caching.",
        code: `addEventListener('fetch', event => {
  event.respondWith(handleRedirect(event.request))
})`
      },
      nlb: {
        title: "Anycast Edge Gateway",
        auditor: "Vanguard • Principal Systems",
        score: "Score: 8.5/10",
        avatar: "V",
        tag: "scale",
        toolName: "dns_anycast_eval",
        toolDuration: "55ms",
        toolSnippet: 'routing: "LatencyBased"\nhandshake_overhead: "<12ms"',
        finding: "Edge DNS routing clients to nearest regional data center.",
        resolution: "Latency-based routing reduces handshake to <15ms.",
        code: `RoutingPolicy: LatencyBased\nTTL: 60`
      },
      gateway: {
        title: "Distributed Key Generation Service (KGS)",
        auditor: "Aegis • Staff Security",
        score: "Score: 5.2/10 (Resolved)",
        avatar: "A",
        tag: "sec",
        toolName: "entropy_enumeration_test",
        toolDuration: "120ms",
        toolSnippet: 'sequence: "shuffled_base62"\nharvesting_resistance: "100%"',
        finding: "Auto-increment keys allow scraping bots to enumerate private links.",
        resolution: "Shuffled Base62 ranges pre-computed and leased in 1M chunks.",
        code: `def get_next_token():
    return token_buffer.pop_shuffled()`
      },
      redis: {
        title: "Redis LRU Hot Cache Tier",
        auditor: "Ledger • Lead FinOps",
        score: "Score: 6.5/10 (Resolved)",
        avatar: "L",
        tag: "fin",
        toolName: "cache_hit_ratio_sim",
        toolDuration: "90ms",
        toolSnippet: 'hit_ratio: "84.2%"\nmemory_bound: "32GB"',
        finding: "80/20 rule: top 20% URLs receive 80% of click traffic.",
        resolution: "Memory cache prevents database reads for hot links.",
        code: `maxmemory-policy allkeys-lru`
      },
      outbox: {
        title: "Cassandra + ClickHouse Sinks",
        auditor: "Titan • Data Reliability",
        score: "Score: 8.1/10",
        avatar: "T",
        tag: "data",
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
1. **Decoupled Key Generator:** Pre-allocated randomized Base62 ranges generated by standalone KGS.
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
claude -p "Read ADR-019.md Section 6. Switch to branch 'feat/adr-019-impl'. Implement scaffolded files. Run 'pytest tests/ -v'."
\`\`\`
</details>`
  },

  rfc088: {
    id: "RFC-088",
    headline: "Multi-Region Payment Processing Service",
    targetScale: "50k RPS ($50M/day Volume)",
    targetBranch: "feat/adr-088-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-088.md Section 6. Switch to branch 'feat/adr-088-impl'. Implement idempotency key middleware with DynamoDB TTL and distributed two-phase saga coordinator. Run 'pytest tests/ -v'."`,
    diagramImg: "diagram_rfc042_resolved.svg",
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
    nodes: [
      { key: "clients", label: "Checkout Apps", sub: "Web / Mobile", metric: "<14ms Handshake", iconType: "clients" },
      { key: "nlb", pin: "PCI-1", pinClass: "flag-sec", label: "HSM Tokenizer", sub: "Edge Vault", metric: "Zero PAN Ingest", iconType: "nlb" },
      { key: "gateway", pin: "TTL", pinClass: "flag-scale", label: "Idempotency Coord", sub: "DynamoDB Leases", metric: "18ms Regional", iconType: "gateway" },
      { key: "redis", pin: "-$38k", pinClass: "flag-fin", label: "Smart Router", sub: "Least-Cost BIN", metric: "1.9% vs 2.9%", iconType: "redis" },
      { key: "outbox", pin: "2PC", pinClass: "flag-data", label: "Saga Engine", sub: "Two-Phase Commit", metric: "Zero Orphan Holds", iconType: "outbox" }
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
        code: `def tokenize_card(pan, cvv):
    return hsm_client.mint_token(pan, cvv)`
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
        code: `dynamodb.put_item(
    ConditionExpression='attribute_not_exists(idempotency_key)'
)`
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
        code: `def select_lowest_fee_provider(card_bin, currency):
    return fee_matrix.get_cheapest(card_bin, currency)`
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
        code: `async def execute_payment_saga(tx_id):
    await auth_hold()
    await commit_ledger()
    await capture_payment()`
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

let currentProposalKey = "rfc042";
let currentPhase = 3;
let isPlaying = false;
let playInterval = null;

// Helper: Node Icons (SVG)
function getNodeIconSvg(iconType) {
  if (iconType === "clients") {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
  } else if (iconType === "nlb") {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M16 12l-4-4-4 4"></path><path d="M12 16V8"></path></svg>`;
  } else if (iconType === "gateway") {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
  } else if (iconType === "redis") {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
  } else {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`;
  }
}

// 1. Proposal Switcher
function switchProposal(key) {
  if (!PROPOSALS[key]) return;
  currentProposalKey = key;
  const p = PROPOSALS[key];

  // Headline & Target
  document.getElementById("prop-headline").textContent = p.headline;
  const targetElem = document.getElementById("prop-target");
  if (targetElem) targetElem.textContent = p.targetScale;

  // Invariant Assertions List (Left Rail)
  const invElem = document.getElementById("invariant-items");
  if (invElem && p.invariants) {
    invElem.innerHTML = p.invariants.map(inv => `
      <div class="inv-item">
        <span class="inv-dot"></span>
        <span class="inv-name"><strong>${inv.id}:</strong> ${inv.desc}</span>
      </div>
    `).join("");
  }

  // Specialists List (Left Rail)
  const spList = document.getElementById("specialists-list");
  if (spList) {
    spList.innerHTML = p.specialists.map(sp => `
      <div class="specialist-card ${sp.key === 'sec' ? 'active' : ''}" onclick="selectSpecialist('${sp.key}')" id="sp-card-${sp.key}">
        <div class="spec-avatar-row">
          <div class="spec-avatar ${sp.tag}">${sp.avatar}</div>
          <div class="spec-info">
            <span class="spec-name">${sp.name}</span>
            <span class="spec-domain">${sp.domain}</span>
          </div>
        </div>
        <span class="spec-score-pill ${sp.tag}">${sp.score}</span>
      </div>
    `).join("");
  }

  // Render Dynamic Vector Architecture Topology (100% Client-Side Synthesized)
  renderDynamicTopologySVG(key);

  // Live Tools Stream
  const toolsContainer = document.getElementById("tools-stream-container");
  const toolBtn = document.getElementById("tool-traces-btn");
  if (toolBtn && p.toolsLog) {
    toolBtn.textContent = `Tool Traces (${p.toolsLog.length})`;
  }
  if (toolsContainer && p.toolsLog) {
    toolsContainer.innerHTML = p.toolsLog.map(t => `
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

  // Soundproof Chambers (Isolation Monitor)
  const chambersGrid = document.getElementById("chambers-grid-container");
  if (chambersGrid && p.chambers) {
    chambersGrid.innerHTML = p.chambers.map(ch => `
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
          <span style="font-family:var(--font-mono); font-size:10px; font-weight:700; color:#059669;">Leakage: ${ch.leak}</span>
        </div>
      </div>
    `).join("");
  }

  // Council Floor Deliberation Stream
  renderFloorMessages(p.debateMessages);

  // Tension Matrix Table
  const matrixTbody = document.getElementById("studio-matrix-rows");
  if (matrixTbody && p.matrix) {
    matrixTbody.innerHTML = p.matrix.map(m => `
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

  // ADR Sheet Content
  const adrSheet = document.getElementById("adr-sheet-content");
  if (adrSheet && p.adrMarkdown) {
    adrSheet.innerHTML = renderMarkdown(p.adrMarkdown);
  }

  // Manifest Table
  const manifestContainer = document.getElementById("manifest-table-container");
  if (manifestContainer && p.manifestItems) {
    manifestContainer.innerHTML = p.manifestItems.map(item => `
      <div class="manifest-row">
        <span class="action-pill ${item.action.toLowerCase()}">${item.action}</span>
        <div>
          <div class="manifest-path">${item.path}</div>
          <div style="font-size:9.5px; color:var(--text-muted);">${item.purpose} <span style="color:var(--brand-primary); font-weight:600;">(${item.mandatedBy})</span></div>
        </div>
      </div>
    `).join("");
  }

  // Terminal & PR Sticky Elements
  const branchElem = document.getElementById("target-branch-display");
  if (branchElem) branchElem.textContent = p.targetBranch;

  const verifyElem = document.getElementById("verification-cmd-display");
  if (verifyElem) verifyElem.textContent = p.verificationCmd;

  const termLaunch = document.getElementById("term-launch-display");
  if (termLaunch) termLaunch.textContent = p.claudeCmd;

  const prPreview = document.getElementById("pr-preview-content");
  if (prPreview && p.prStickyComment) prPreview.textContent = p.prStickyComment;

  // Select Default Node (Gateway)
  selectNode("gateway");
}

// 2. Render Floor Messages
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

// 3. Select Node on Interactive Canvas
function selectNode(nodeKey) {
  const p = PROPOSALS[currentProposalKey];
  const comp = p.components[nodeKey];
  if (!comp) return;

  // Highlight active node card
  document.querySelectorAll(".arch-node").forEach(node => {
    node.classList.remove("active");
  });
  const activeNode = document.getElementById(`node-${nodeKey}`);
  if (activeNode) activeNode.classList.add("active");

  // Update Right Inspector Panel
  const inspTitle = document.getElementById("insp-title");
  if (inspTitle) inspTitle.textContent = comp.title;
  
  const avatarElem = document.getElementById("insp-avatar");
  if (avatarElem) {
    avatarElem.textContent = comp.avatar;
    avatarElem.className = `spec-avatar ${comp.tag || 'sec'}`;
  }

  const auditorElem = document.getElementById("insp-auditor");
  if (auditorElem) auditorElem.textContent = comp.auditor;
  
  const scoreElem = document.getElementById("insp-score");
  if (scoreElem) {
    scoreElem.textContent = comp.score;
    scoreElem.className = `spec-score-pill ${comp.tag || 'sec'}`;
  }

  const findElem = document.getElementById("insp-finding");
  if (findElem) findElem.textContent = comp.finding;

  const resElem = document.getElementById("insp-resolution");
  if (resElem) resElem.textContent = comp.resolution;

  const codeElem = document.getElementById("insp-code");
  if (codeElem) codeElem.textContent = comp.code;

  if (comp.toolName) {
    const toolNameElem = document.getElementById("insp-tool-name");
    if (toolNameElem) toolNameElem.textContent = comp.toolName;

    const toolDurElem = document.getElementById("insp-tool-duration");
    if (toolDurElem) toolDurElem.textContent = comp.toolDuration || "120ms";

    const toolSnipElem = document.getElementById("insp-tool-snippet");
    if (toolSnipElem) toolSnipElem.textContent = comp.toolSnippet || "";
  }
}

// 4. Select Specialist
function selectSpecialist(spKey) {
  document.querySelectorAll(".specialist-card").forEach(r => r.classList.remove("active"));
  const card = document.getElementById(`sp-card-${spKey}`);
  if (card) card.classList.add("active");

  if (spKey === "sec") selectNode("gateway");
  else if (spKey === "scale") selectNode("clients");
  else if (spKey === "fin") selectNode("redis");
  else if (spKey === "data") selectNode("outbox");
}

// 5. Stepper & Phase Jump
function jumpToPhase(phaseNum) {
  currentPhase = phaseNum;
  document.querySelectorAll(".step-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-phase") == phaseNum) {
      btn.classList.add("active");
    }
  });

  const tag = document.getElementById("stage-phase-tag");
  const title = document.getElementById("stage-phase-title");

  if (phaseNum === 1) {
    if (tag) tag.textContent = "PHASE 1 OF 4";
    if (title) title.textContent = "Isolated Blind Chamber Audits (Switch Core 0.31.0 Verified)";
    setCenterView("chambers");
    selectSpecialist("sec");
  } else if (phaseNum === 2) {
    if (tag) tag.textContent = "PHASE 2 OF 4";
    if (title) title.textContent = "Specialist Tension Matrix & Trade-off Deliberation";
    setCenterView("matrix");
  } else if (phaseNum === 3) {
    if (tag) tag.textContent = "PHASE 3 OF 4";
    if (title) title.textContent = "Synthesized Architecture Topology (Vector Verification)";
    setCenterView("topology");
    selectNode("gateway");
  } else if (phaseNum === 4) {
    if (tag) tag.textContent = "PHASE 4 OF 4";
    if (title) title.textContent = "Autonomous Implementer Handoff (Claude Code / Codex Bridge)";
    setCenterView("adr");
  }
}

// 6. Play / Pause Deliberation Animation
function togglePlayDeliberation() {
  const btn = document.getElementById("play-btn");
  const btnText = document.getElementById("play-btn-text");

  if (isPlaying) {
    clearInterval(playInterval);
    isPlaying = false;
    if (btn) btn.classList.remove("playing");
    if (btnText) btnText.textContent = "Auto-Play";
  } else {
    isPlaying = true;
    if (btn) btn.classList.add("playing");
    if (btnText) btnText.textContent = "Pause";
    showToast("Auto-playing 4-phase deliberation protocol...");
    playInterval = setInterval(() => {
      let nextPhase = (currentPhase % 4) + 1;
      jumpToPhase(nextPhase);
    }, 3200);
  }
}

// 7. View Switcher in Stage
function setCenterView(viewId) {
  document.querySelectorAll(".view-nav-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-view") === viewId) btn.classList.add("active");
  });

  document.querySelectorAll(".canvas-view").forEach(v => v.classList.remove("active"));
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.add("active");

  const titleMap = {
    topology: "Synthesized Architecture Topology (Vector Verification)",
    floor: "Council Deliberation Floor (#review-desk Debate)",
    chambers: "Soundproof Chambers Monitor (Physical Packet Isolation)",
    tools: "Specialist Tool Execution Traces",
    matrix: "Pairwise Tension & Trade-Off Matrix",
    adr: "Deliverables: Michael Nygard ADR & Terminal Handoff"
  };
  const titleElem = document.getElementById("stage-phase-title");
  if (titleElem && titleMap[viewId]) {
    titleElem.textContent = titleMap[viewId];
  }
}

// 8. Interactive Floor Prompting
function insertFloorPrompt(cmd) {
  const input = document.getElementById("floor-user-input");
  if (input) {
    input.value = cmd;
    input.focus();
  }
}

function handleFloorSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("floor-user-input");
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  input.value = "";

  const p = PROPOSALS[currentProposalKey];
  p.debateMessages.push({
    sender: "Lead Architect",
    role: "Human Lead",
    tag: "human",
    content: text
  });
  renderFloorMessages(p.debateMessages);

  // Dynamic chair reply
  const typingBar = document.getElementById("floor-typing-bar");
  const typingText = document.getElementById("typing-status-text");
  if (typingBar) typingBar.style.display = "flex";
  if (typingText) typingText.textContent = "Athena is evaluating directive...";

  setTimeout(() => {
    if (typingBar) typingBar.style.display = "none";
    let reply = "";
    const lower = text.toLowerCase();

    if (lower.includes("approve")) {
      reply = "✅ **DIRECTIVE ACCEPTED:** Architectural consensus locked by Lead Architect. Section 6 file scaffolding dispatched to @ClaudeCode on branch `" + p.targetBranch + "`.";
      jumpToPhase(4);
    } else if (lower.includes("summary")) {
      reply = "📋 **EXECUTIVE SUMMARY:** Reconciled 3 orthogonal tensions. Redis Bloom filter deployed (<0.2ms lookup), Redis cluster right-sized saving $25.2k/yr, and Transactional Outbox enforced for zero message loss.";
    } else if (lower.includes("diagram")) {
      reply = "📊 **VECTOR TOPOLOGY:** Switched stageboard to high-resolution system topology canvas.";
      setCenterView("topology");
    } else if (lower.includes("veto")) {
      reply = "🛑 **DIRECTIVE ACCEPTED:** Proposal returned to chamber audit phase for re-evaluation with updated constraints.";
    } else {
      reply = "Acknowledged directive: '" + text + "'. Incorporating steering invariants into ADR Section 4 trade-off log.";
    }

    p.debateMessages.push({
      sender: "Athena",
      role: "Council Chair",
      tag: "chair",
      content: reply
    });
    renderFloorMessages(p.debateMessages);
  }, 900);
}

// 9. Clipboard Actions
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
  switchProposal("rfc042");
  jumpToPhase(3);
});


// ==========================================================================
// DYNAMIC VECTOR TOPOLOGY SYNTHESIS ENGINE (100% Client-Side Rendered)
// ==========================================================================
let flowAnimationActive = true;
let selectedTopologyNode = null;

const TOPOLOGY_MODELS = {
  rfc042: {
    title: "RFC-042: Real-Time Messaging & Event Streaming Architecture",
    viewBox: "0 0 1060 420",
    nodes: [
      {
        key: "clients",
        x: 30, y: 160, w: 150, h: 95,
        title: "100k Sockets",
        sub: "Client Apps Tier",
        metric: "Sub-20ms p99 SLA",
        pin: "INGRESS",
        color: "#38bdf8",
        specialist: "Vanguard",
        invariant: "INV-SCALE-02: Zero-DB reconnection thundering herd"
      },
      {
        key: "nlb",
        x: 235, y: 160, w: 155, h: 95,
        title: "AWS L4 NLB",
        sub: "TLS Termination",
        metric: "Zero In-Band Auth",
        pin: "EDGE LB",
        color: "#818cf8",
        specialist: "Vanguard",
        invariant: "INV-SCALE-02: TCP connection distribution"
      },
      {
        key: "redis",
        x: 445, y: 160, w: 175, h: 95,
        title: "WebSocket Cluster",
        sub: "4 Nodes Autoscaling",
        metric: "$16.8k/yr vs $42k",
        pin: "💰 -$25.2k/yr",
        pinClass: "highlight-fin",
        color: "#10b981",
        specialist: "Ledger (FinOps)",
        invariant: "INV-FIN-03: Downsized from 12 to 4 nodes with 75% memory autoscale"
      },
      {
        key: "gateway",
        x: 675, y: 70, w: 175, h: 95,
        title: "Redis Bloom Filter",
        sub: "Edge Revocation Cache",
        metric: "<0.2ms RAM Lookup",
        pin: "🛡️ Aegis: INV-SEC-01",
        pinClass: "highlight-sec",
        color: "#f43f5e",
        specialist: "Aegis (Security)",
        invariant: "INV-SEC-01: Sub-ms token revocation blacklist check on heartbeat"
      },
      {
        key: "outbox",
        x: 675, y: 250, w: 175, h: 95,
        title: "Postgres Outbox",
        sub: "Transactional Table",
        metric: "Zero Message Loss",
        pin: "🏛️ Titan: INV-DATA-04",
        pinClass: "highlight-data",
        color: "#a78bfa",
        specialist: "Titan (Database)",
        invariant: "INV-DATA-04: Atomic persistence + Debezium CDC guarantee"
      },
      {
        key: "kafka",
        x: 900, y: 250, w: 140, h: 95,
        title: "Kafka Event Stream",
        sub: "Debezium CDC Replica",
        metric: "Guaranteed Delivery",
        pin: "STREAM",
        color: "#06b6d4",
        specialist: "Titan & Vanguard",
        invariant: "INV-DATA-04: Resilient cross-service event broadcast"
      }
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
    title: "RFC-019: High-Throughput Distributed URL Shortener (10B Keys)",
    viewBox: "0 0 1060 420",
    nodes: [
      {
        key: "clients",
        x: 30, y: 160, w: 150, h: 95,
        title: "Global Clients",
        sub: "Anycast Ingress",
        metric: "10,000 req/sec",
        pin: "GLOBAL",
        color: "#38bdf8",
        specialist: "Vanguard",
        invariant: "INV-SCALE-01: Global latency <25ms p99"
      },
      {
        key: "nlb",
        x: 235, y: 160, w: 155, h: 95,
        title: "Cloudflare Edge",
        sub: "CDN & Hot Cache",
        metric: "98% Cache Hit",
        pin: "CDN EDGE",
        color: "#818cf8",
        specialist: "Vanguard",
        invariant: "INV-SCALE-02: Edge caching offload"
      },
      {
        key: "gateway",
        x: 445, y: 160, w: 175, h: 95,
        title: "Envoy Gateway",
        sub: "Token Bucket Rate Limit",
        metric: "100k Burst Cap",
        pin: "🛡️ Aegis: Sec",
        pinClass: "highlight-sec",
        color: "#f43f5e",
        specialist: "Aegis (Security)",
        invariant: "INV-SEC-01: Distributed DDoS mitigation & scrapers throttle"
      },
      {
        key: "redis",
        x: 675, y: 70, w: 175, h: 95,
        title: "Redis LRU Tier",
        sub: "80/20 Working Set",
        metric: "<1.2ms Read SLA",
        pin: "⚡ Vanguard: Perf",
        pinClass: "highlight-scale",
        color: "#06b6d4",
        specialist: "Vanguard",
        invariant: "INV-SCALE-03: Sub-2ms redirect cache latency"
      },
      {
        key: "outbox",
        x: 675, y: 250, w: 175, h: 95,
        title: "Base62 Murmur3",
        sub: "Key Gen Service",
        metric: "Deterministic 7-Char",
        pin: "💰 Ledger: FinOps",
        pinClass: "highlight-fin",
        color: "#10b981",
        specialist: "Ledger",
        invariant: "INV-FIN-02: Compact 7-character encoding saves 42% SSD storage"
      },
      {
        key: "kafka",
        x: 900, y: 250, w: 140, h: 95,
        title: "DynamoDB Store",
        sub: "Partitioned Hash",
        metric: "10B Keys Capacity",
        pin: "🏛️ Titan: Store",
        pinClass: "highlight-data",
        color: "#a78bfa",
        specialist: "Titan (Database)",
        invariant: "INV-DATA-01: Multi-partition single-table hash key design"
      }
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
    title: "RFC-088: Multi-Region Active-Active Payment Processing Saga",
    viewBox: "0 0 1060 420",
    nodes: [
      {
        key: "clients",
        x: 30, y: 160, w: 150, h: 95,
        title: "Checkout Apps",
        sub: "Web & Mobile SDKs",
        metric: "<14ms Handshake",
        pin: "INGRESS",
        color: "#38bdf8",
        specialist: "Vanguard",
        invariant: "INV-SCALE-01: Mobile client network resilience"
      },
      {
        key: "nlb",
        x: 235, y: 160, w: 155, h: 95,
        title: "Perimeter HSM",
        sub: "Tokenization Vault",
        metric: "Zero PAN Ingest",
        pin: "🛡️ Aegis: PCI-1",
        pinClass: "highlight-sec",
        color: "#f43f5e",
        specialist: "Aegis (Security)",
        invariant: "INV-SEC-01: PCI-DSS 3.4 strict raw PAN isolation in HSM"
      },
      {
        key: "gateway",
        x: 445, y: 160, w: 175, h: 95,
        title: "Idempotency Coord",
        sub: "DynamoDB Leases",
        metric: "18ms Regional",
        pin: "⚡ Vanguard: NoLock",
        pinClass: "highlight-scale",
        color: "#06b6d4",
        specialist: "Vanguard",
        invariant: "INV-SCALE-02: Conditional write leases eliminate 820ms cross-region locks"
      },
      {
        key: "redis",
        x: 675, y: 70, w: 175, h: 95,
        title: "Smart BIN Router",
        sub: "Least-Cost Routing",
        metric: "-$38,000/yr Saved",
        pin: "💰 Ledger: -$38k",
        pinClass: "highlight-fin",
        color: "#10b981",
        specialist: "Ledger (FinOps)",
        invariant: "INV-FIN-03: Dynamic debit interchange routing reduces fees by 1.0%"
      },
      {
        key: "outbox",
        x: 675, y: 250, w: 175, h: 95,
        title: "2PC Saga Engine",
        sub: "State Coordinator",
        metric: "Atomic Compensate",
        pin: "🏛️ Titan: Saga",
        pinClass: "highlight-data",
        color: "#a78bfa",
        specialist: "Titan (Database)",
        invariant: "INV-DATA-04: Guaranteed automated rollback on gateway timeout"
      },
      {
        key: "kafka",
        x: 900, y: 250, w: 140, h: 95,
        title: "Payment Rails",
        sub: "Multi-Acquirer Active",
        metric: "Stripe / Adyen / Fed",
        pin: "MULTI-RAIL",
        color: "#38bdf8",
        specialist: "Vanguard & Ledger",
        invariant: "INV-SCALE-03: High-availability payment gateway failover"
      }
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
        <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#06b6d4" flood-opacity="0.5" />
        </filter>
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

  // Draw Nodes with generous spacing and distinct vertical zones to guarantee zero overlap
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
  // Highlight SVG Node
  document.querySelectorAll(".svg-node-group").forEach(el => el.classList.remove("selected"));
  const svgNode = document.getElementById(`svg-node-${nodeKey}`);
  if (svgNode) svgNode.classList.add("selected");

  // Sync right-rail inspector panel
  if (typeof selectNode === "function") {
    selectNode(nodeKey);
  }
}

function toggleFlowAnimation() {
  flowAnimationActive = !flowAnimationActive;
  const label = document.getElementById("anim-status-label");
  if (label) {
    label.textContent = flowAnimationActive ? "ACTIVE" : "PAUSED";
    label.style.color = flowAnimationActive ? "var(--accent-primary)" : "var(--text-muted)";
  }
  // Re-render SVG to update animateMotion
  renderDynamicTopologySVG(currentProposalKey);
  showToast(flowAnimationActive ? "Animated packet traffic resumed" : "Traffic animation paused");
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

function closeInspector() {
  const drawer = document.getElementById("node-inspector-drawer");
  if (drawer) drawer.style.display = "none";
}
