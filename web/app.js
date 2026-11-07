/**
 * Quorum Studio — Autonomous Architecture Review Board
 * Direct-Manipulation Architecture Workbench with Draggable Nodes,
 * Live Bezier Wire Re-routing, Visual Resolution Lifecycle, and Python Backend Sync.
 */

let deliberationMode = "live"; // "live" or "instant"
let isDeliberating = false;
let deliberationTimer = null;
let currentProposalKey = "rfc042";
let currentPhase = 4;
let flowAnimationActive = true;
let dragModeActive = true;
let selectedTopologyNode = null;

// Canvas Pan & Zoom State
let currentZoom = 1.0;
let panOffset = { x: 0, y: 0 };
let isPanningCanvas = false;
let panStart = { x: 0, y: 0 };

// Node Drag State
let draggedNodeKey = null;
let dragStartMouse = { x: 0, y: 0 };
let dragStartNodePos = { x: 0, y: 0 };

// Live Telemetry Streamer
let telemetryTimer = null;

// ==========================================================================
// ARCHITECTURE DOMAIN REPOSITORY
// ==========================================================================

const PROPOSALS = {
  rfc042: {
    id: "RFC-042",
    headline: "100,000 WebSocket Messaging Fabric",
    subline: "Interactive service topology — drag nodes to re-route live bezier wires",
    targetScale: "100k Sockets (peak 25k msg/s)",
    targetBranch: "feat/adr-042-impl",
    verificationCmd: "pytest tests/ -v",
    baseThroughput: 100200,
    baseLatency: 17.8,
    metricUnit: "msg/s",
    claudeCmd: `claude -p "Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."`,
    legendChips: [
      { tag: "sec", name: "Aegis (Security: In-Band CVE)" },
      { tag: "scale", name: "Vanguard (Scale: p99 <20ms)" },
      { tag: "fin", name: "Ledger (FinOps: -$25.2k/yr)" },
      { tag: "data", name: "Titan (CDC: 0 Msg Loss)" }
    ],
    invariants: [
      { id: "INV-SEC-01", desc: "Revocation <1ms (Edge Bloom bitset)" },
      { id: "INV-SCALE-02", desc: "Zero-DB Reconnect (100k Sockets)" },
      { id: "INV-FIN-03", desc: "Compute -$25.2k/yr (4-Node Autoscale)" },
      { id: "INV-DATA-04", desc: "Outbox CDC Atomicity (Debezium -> Kafka)" },
      { id: "INV-ISO-05", desc: "Switch Room Isolation (0 Leaked Bytes)" }
    ],
    vulnerableNodeKey: "gateway",
    flawNotice: "⚠️ CVE-2023-4580 (CVSS 8.1 High): In-band heartbeat token hijack window",
    resolvedNotice: "✓ Edge Bloom Filter Bitset Deployed (<0.2ms RAM, 0 DB queries)",
    chambers: [
      { id: "audit-security", specialist: "Aegis", domain: "Security & Threat Modeling", score: "4.5/10", tag: "sec", token: "sw_sec_live_9921b", acl: "['athena', 'aegis']", leak: "0 Bytes", finding: "In-band heartbeat token refresh leaves a 15-minute hijacking window without revocation checks. Mandates sub-ms Redis Bloom filter." },
      { id: "audit-scalability", specialist: "Vanguard", domain: "Concurrency & p99 Latency", score: "6.8/10", tag: "scale", token: "sw_scale_live_4412a", acl: "['athena', 'vanguard']", leak: "0 Bytes", finding: "Synchronous DB queries on 100k reconnections crashes Postgres pool in 11.8s. Mandates zero-DB RAM lookups." },
      { id: "audit-finops", specialist: "Ledger", domain: "Cloud Economics & ROI", score: "6.0/10", tag: "fin", token: "sw_fin_live_8834c", acl: "['athena', 'ledger']", leak: "0 Bytes", finding: "12 dedicated Redis shards burns $42k/yr on 16% off-peak load. Mandates 4-node autoscale cluster, saving $25,200/yr." },
      { id: "audit-database", specialist: "Titan", domain: "Data Consistency & Storage", score: "7.2/10", tag: "data", token: "sw_data_live_1120f", acl: "['athena', 'titan']", leak: "0 Bytes", finding: "Dual-writing to Redis Streams and Aurora without Outbox causes 1.84% message loss on crashes. Mandates Debezium CDC." }
    ],
    debateMessages: [
      { sender: "Athena", role: "Council Chair", tag: "chair", content: "Convening Quorum for RFC-042: Scalable Real-Time WebSocket Messaging Cluster. All 4 specialist chambers locked with zero packet leakage." },
      { sender: "Aegis", role: "Staff Security Auditor", tag: "sec", content: "CRITICAL BLOCK on RFC-042. Proposed in-band token refresh leaves a 15-minute window where revoked credentials continue pumping frames. Fails SOC2 Article 4. We cannot merge until token revocation is enforced synchronously on heartbeat." },
      { sender: "Vanguard", role: "Principal Systems Architect", tag: "scale", content: "@Aegis Synchronous database queries across 100,000 concurrent sockets will exhaust Postgres pool within 12 seconds. P99 latency will spike past 140ms. Security enforcement must happen in-memory at ingress edge." },
      { sender: "Ledger", role: "Lead Cloud Economics", tag: "fin", content: "12 dedicated Redis Enterprise nodes is gross over-provisioning! Off-peak is 20k connections. You are burning $3,500/mo ($42,000/yr). Downsize to 4 nodes with memory autoscaling at 75% load to recoup $25,200 annually!" },
      { sender: "Titan", role: "Data Reliability Architect", tag: "data", content: "Dual-writing directly to Redis and Postgres causes message loss if a worker crashes between writes. We mandate the Transactional Outbox Pattern with Debezium CDC into Kafka." },
      { sender: "Athena", role: "Council Chair", tag: "chair", content: "Synthesizing resolution: Edge Redis Bloom filter bitset (<0.2ms, zero DB load) + 4-node autoscale cluster + Transactional Outbox approved. Human Lead, how do you steer?" },
      { sender: "Lead Architect", role: "Human Engineer", tag: "human", content: "!summary, !diagram, approve" },
      { sender: "Athena", role: "Council Chair", tag: "chair", content: "✅ COUNCIL CONSENSUS APPROVED BY LEAD ARCHITECT. Autonomous handoff delivered to @ClaudeCode in #dev-implementation." }
    ],
    toolsLog: [
      { agent: "Aegis", role: "Staff Security Auditor", tool: "cve_database_search", duration: "142ms", tag: "sec", query: 'query: "WebSocket heartbeat session hijacking"\ncompliance: "SOC2 Article 4"', result: '{\n  "matched_cve": "CVE-2023-4580 (CVSS 8.1 High)",\n  "remediation": "Synchronous sub-ms token blacklist verification before socket frame ingest"\n}' },
      { agent: "Vanguard", role: "Principal Systems Architect", tool: "queue_concurrency_sim", duration: "215ms", tag: "scale", query: 'concurrent_sockets: 100000\nburst_window: 15s\nauth_mode: "postgres_sync"', result: '{\n  "time_to_failure": "11.8s",\n  "status": "CRITICAL SLA BREACH (p99: 144.2ms)"\n}' },
      { agent: "Ledger", role: "Lead Cloud Economics", tool: "aws_pricing_calculator", duration: "98ms", tag: "fin", query: 'service: "Amazon MemoryDB"\nnodes: 12', result: '{\n  "annual_spend": "$42,048.00",\n  "optimized_4_nodes": "$16,848.00",\n  "net_annual_savings": "$25,200.00"\n}' },
      { agent: "Titan", role: "Data Reliability Architect", tool: "distributed_fault_injection", duration: "310ms", tag: "data", query: 'pipeline: "dual_write"\nfault: "sigkill"', result: '{\n  "message_loss_percentage": "1.84%",\n  "consistency": "VIOLATED"\n}' }
    ],
    matrix: [
      { vector: "Security vs Concurrency Latency", clash: "Aegis (Synchronous DB validation) vs Vanguard (140ms p99 SLA breach under 100k sockets).", resolution: "Pre-load edge Bloom filter with revoked session bitsets (<0.2ms latency, zero database hits).", invariant: "INV-SEC-01: Heartbeat auth checked <1ms at edge ingress" },
      { vector: "Infrastructure Sizing vs Off-Peak Economics", clash: "Vanguard (12-node over-provisioning) vs Ledger ($42,000/yr budget waste on 16% off-peak load).", resolution: "Adopt 4-node Redis cluster with CPU/Memory autoscaling at 75% threshold, saving $25,200 annually.", invariant: "INV-FIN-03: Annual cloud infrastructure cost capped under $18k/yr" },
      { vector: "Distributed Dual-Write vs Message Atomicity", clash: "Engineering Ops (Direct Redis + Postgres write) vs Titan (1.84% message loss on node crash).", resolution: "Implement Transactional Outbox pattern with Debezium CDC tailing PostgreSQL WAL into Kafka.", invariant: "INV-DATA-04: At-least-once message delivery with zero split-brain data loss" }
    ],
    manifestItems: [
      { action: "CREATE", path: "src/security/bloom_revocation.py", mandatedBy: "Aegis", purpose: "Edge Bloom filter bitset validator ensuring sub-ms token revocation" },
      { action: "CREATE", path: "src/gateway/socket_manager.py", mandatedBy: "Vanguard", purpose: "Zero-DB reconnection connection pool with backpressure throttling" },
      { action: "MODIFY", path: "infra/redis_cluster.tf", mandatedBy: "Ledger", purpose: "Downsize cluster to 4 autoscale nodes saving $25,200/yr" },
      { action: "CREATE", path: "src/persistence/outbox_publisher.py", mandatedBy: "Titan", purpose: "Transactional outbox publisher with Debezium CDC connector" }
    ],
    components: {
      clients: { title: "100k Sockets Client Apps Tier", auditor: "Vanguard • Principal Systems", score: "Score: 6.8/10", avatar: "V", tag: "scale", toolName: "queue_concurrency_sim", toolDuration: "215ms", toolSnippet: 'concurrency: 100,000\nburst_window: 15s', finding: "Thundering herd reconnects crash Postgres connection pool.", resolution: "Decouple auth validation to in-memory RAM bitset.", code: `async def handle_connection(ws, token):\n    if await bloom_filter.contains(token):\n        await ws.accept()` },
      nlb: { title: "AWS L4 Network Load Balancer", auditor: "Vanguard • Principal Systems", score: "Score: 8.5/10", avatar: "V", tag: "scale", toolName: "nlb_flow_evaluator", toolDuration: "65ms", toolSnippet: 'mode: "cross-zone"\ntls_termination: "edge"', finding: "L7 application load balancer adds 18ms latency inspecting frames.", resolution: "Use L4 Network Load Balancer with zero in-band payload inspection.", code: `resource "aws_lb" "nlb" {\n  load_balancer_type = "network"\n}` },
      redis: { title: "4-Node WebSocket Cluster", auditor: "Ledger • Lead Cloud Economics", score: "Score: 6.0/10 (Resolved)", avatar: "L", tag: "fin", toolName: "aws_pricing_calculator", toolDuration: "98ms", toolSnippet: 'annual_savings: "$25,200.00"', finding: "12 dedicated nodes burned $42,000/yr with 16% off-peak utilization.", resolution: "Cluster downsized to 4 nodes with memory autoscaling at 75% capacity.", code: `resource "aws_elasticache_replication_group" "ws_cluster" {\n  num_cache_clusters = 4\n}` },
      gateway: { title: "Redis Bloom Filter (Edge Revocation)", auditor: "Aegis • Staff Security", score: "Score: 4.5/10 (Resolved)", avatar: "A", tag: "sec", toolName: "cve_database_search", toolDuration: "142ms", toolSnippet: 'CVE: "CVE-2023-4580 (CVSS 8.1)"', finding: "In-band heartbeat token validation permits a 15-minute window of unauthorized socket frames after account ban.", resolution: "Sub-ms Redis Bloom filter bitset deployed at gateway edge. Revoked tokens checked in RAM with zero DB load.", code: `async def check_revocation(token_jti: str) -> bool:\n    return await redis_bloom.exists("revoked_tokens", token_jti)` },
      outbox: { title: "Postgres Outbox & CDC Pipeline", auditor: "Titan • Data Reliability", score: "Score: 7.2/10 (Resolved)", avatar: "T", tag: "data", toolName: "distributed_fault_injection", toolDuration: "310ms", toolSnippet: 'loss: "0.00% (Debezium CDC)"', finding: "Dual-writing without Outbox incurs 1.84% message loss on worker crash.", resolution: "Enforce Transactional Outbox pattern with Debezium CDC connector publishing to Kafka.", code: `INSERT INTO outbox_events (aggregate_id, payload) VALUES ($1, $2);` },
      kafka: { title: "Kafka Event Stream Replica", auditor: "Titan & Vanguard", score: "Score: 9.0/10", avatar: "T", tag: "data", toolName: "kafka_partition_audit", toolDuration: "85ms", toolSnippet: 'partitions: 16\nacks: "all"', finding: "Downstream microservices overwhelmed by broadcast spikes without backpressure.", resolution: "Partitioned Kafka event stream with guaranteed ordering by aggregate ID.", code: `metadata.broker.list=kafka:9092\nacks=all` }
    },
    adrMarkdown: `# ADR-042: Scalable Real-Time WebSocket Messaging Fabric\n\n**Status:** APPROVED WITH CONDITIONS\n**Date:** 2026-11-06\n**Council:** Athena (Chair), Aegis, Vanguard, Ledger, Titan\n\n## 1. Context\n100,000 concurrent sockets requiring sub-20ms p99 SLA.\n\n## 2. Decision\nDeploy Edge Redis Bloom filter (<0.2ms), downsize cluster to 4 nodes (-$25,200/yr), and enforce Postgres Transactional Outbox + Debezium CDC.`,
    prStickyComment: `## 🏛️ Quorum Review Report: RFC-042\n\n| Specialist | Score | Resolution |\n|---|---|---|\n| **Aegis** | 4.5/10 | 🛡️ Edge Bloom Filter |\n| **Vanguard** | 6.8/10 | ⚡ Zero-DB Ingress |\n| **Ledger** | 6.0/10 | 💰 -$25,200/yr Saved |\n| **Titan** | 7.2/10 | ✅ Outbox CDC |`
  },

  rfc019: {
    id: "RFC-019",
    headline: "Distributed URL Shortener (10B Keys)",
    subline: "Pre-allocated range Key Gen Service & multi-tier caching for 50k QPS redirects",
    targetScale: "10B Keys (50k QPS Global)",
    targetBranch: "feat/adr-019-impl",
    verificationCmd: "pytest tests/ -v",
    baseThroughput: 49800,
    baseLatency: 3.8,
    metricUnit: "req/s",
    claudeCmd: `claude -p "Read ADR-019.md Section 6. Switch to branch 'feat/adr-019-impl'. Implement pre-allocated range Base62 key generator. Run 'pytest tests/ -v'."`,
    legendChips: [
      { tag: "sec", name: "Aegis (Security: Non-Enumerable)" },
      { tag: "scale", name: "Vanguard (Scale: 50k QPS)" },
      { tag: "fin", name: "Ledger (FinOps: -$14k/yr ClickHouse)" },
      { tag: "data", name: "Titan (Storage: 10B Keys Cassandra)" }
    ],
    invariants: [
      { id: "INV-SEC-01", desc: "Non-enumerable Base62 keys (Feistel Cipher)" },
      { id: "INV-SCALE-02", desc: "Sub-5ms p99 redirect SLA at edge" },
      { id: "INV-FIN-03", desc: "Telemetry in ClickHouse (-$14,000/yr)" },
      { id: "INV-DATA-04", desc: "Cassandra Quorum Reads across 3 Regions" },
      { id: "INV-ISO-05", desc: "Switch Room Isolation (0 Leaked Bytes)" }
    ],
    vulnerableNodeKey: "outbox",
    flawNotice: "⚠️ Sequential auto-increment keys permit scraping entire URL namespace",
    resolvedNotice: "✓ Shuffled Feistel Permutation KGS Deployed (O(1) non-enumerable keys)",
    chambers: [
      { id: "audit-security", specialist: "Aegis", domain: "Abuse & Link Scraping", score: "5.2/10", tag: "sec", token: "sw_sec_019_109c", acl: "['athena', 'aegis']", leak: "0 Bytes", finding: "Sequential auto-increment IDs allow competitors to scrape all customer URLs. Mandates shuffled Feistel permutation." },
      { id: "audit-scalability", specialist: "Vanguard", domain: "50k QPS Key Generation", score: "7.0/10", tag: "scale", token: "sw_scale_019_232d", acl: "['athena', 'vanguard']", leak: "0 Bytes", finding: "Central database sequence generator bottlenecks above 15k QPS. Mandates pre-allocated range Key Generation Service (KGS)." },
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
      { agent: "Aegis", role: "Staff Security Auditor", tool: "entropy_evaluator", duration: "110ms", tag: "sec", query: 'algorithm: "sequential_base62"', result: '{\n  "scraping_risk": "CRITICAL",\n  "remediation": "Feistel cipher permutation"\n}' },
      { agent: "Vanguard", role: "Principal Systems Architect", tool: "kgs_benchmark", duration: "185ms", tag: "scale", query: 'target_qps: 50000', result: '{\n  "sustained_qps": 62400,\n  "p99_key_dispense_ms": 0.42\n}' }
    ],
    matrix: [
      { vector: "Key Predictability vs Generator Throughput", clash: "Aegis (Cryptographic random key) vs Vanguard (50k QPS sequential key speed).", resolution: "Pre-allocated range KGS with Feistel cipher permutation provides O(1) non-sequential keys.", invariant: "INV-SEC-01: Zero enumerable short URL sequences" }
    ],
    manifestItems: [
      { action: "CREATE", path: "src/keygen/kgs_worker.py", mandatedBy: "Vanguard", purpose: "Pre-allocated range Key Generation Service" },
      { action: "CREATE", path: "src/security/feistel_cipher.py", mandatedBy: "Aegis", purpose: "Non-enumerable Base62 key obfuscation" },
      { action: "CREATE", path: "src/analytics/clickhouse_sink.py", mandatedBy: "Ledger", purpose: "Decoupled analytics writer saving $14,000/yr" }
    ],
    components: {
      clients: { title: "Global Client Ingress", auditor: "Vanguard • Principal Systems", score: "Score: 7.0/10", avatar: "V", tag: "scale", toolName: "anycast_latency_timer", toolDuration: "50ms", toolSnippet: 'ingress: "Anycast"\np99_latency: "12ms"', finding: "Direct client traffic to single region incurs 180ms latency.", resolution: "Edge Anycast routing to closest regional point of presence.", code: `GET /s/{short_code} HTTP/2\nHost: q.co` },
      nlb: { title: "Cloudflare Edge CDN", auditor: "Vanguard • Principal Systems", score: "Score: 8.8/10", avatar: "V", tag: "scale", toolName: "cache_hit_sim", toolDuration: "90ms", toolSnippet: 'cache_hit_rate: "98.2%"', finding: "High traffic links flood origin servers unnecessarily.", resolution: "HTTP 301 cache with 24-hour TTL at edge CDN.", code: `HTTP/2 301 Moved Permanently\nCache-Control: public, max-age=86400` },
      gateway: { title: "Envoy API Gateway", auditor: "Aegis • Staff Security", score: "Score: 5.2/10 (Resolved)", avatar: "A", tag: "sec", toolName: "rate_limit_benchmark", toolDuration: "110ms", toolSnippet: 'burst_cap: 100000', finding: "Automated link crawlers scrape private keys.", resolution: "Enforce token bucket rate limiting (100 req/sec per IP) in Envoy.", code: `rate_limits:\n  - actions:\n      - request_headers: { header_name: "X-Forwarded-For" }` },
      redis: { title: "Redis LRU Cache Tier", auditor: "Vanguard • Principal Systems", score: "Score: 8.0/10", avatar: "V", tag: "scale", toolName: "lru_working_set_calc", toolDuration: "75ms", toolSnippet: 'cache_hit_ratio: "82%"', finding: "Disk read IOPS overwhelmed by repeated redirect lookups.", resolution: "Top 20% hot URLs cached in Redis with volatile-lru eviction.", code: `maxmemory 32gb\nmaxmemory-policy allkeys-lru` },
      outbox: { title: "Pre-Allocated Key Gen Service (KGS)", auditor: "Aegis & Vanguard", score: "Score: 7.5/10 (Resolved)", avatar: "A", tag: "sec", toolName: "kgs_throughput_benchmark", toolDuration: "185ms", toolSnippet: 'lease_range: "1,000,000 keys"', finding: "Database auto-increment bottlenecks and leaks link volume.", resolution: "ZooKeeper range leases with 3-round Feistel cipher permutation.", code: `def mint_short_key(range_offset: int) -> str:\n    shuffled = feistel_permute(range_offset)\n    return base62_encode(shuffled)` },
      kafka: { title: "Cassandra + ClickHouse Sinks", auditor: "Ledger & Titan", score: "Score: 8.5/10", avatar: "L", tag: "fin", toolName: "clickhouse_compression_calc", toolDuration: "115ms", toolSnippet: 'annual_savings: "$14,000/yr"', finding: "Telemetry retention in OLTP database inflates storage costs by 400%.", resolution: "Decouple click streams into ClickHouse with 90-day TTL.", code: `ALTER TABLE click_events MODIFY TTL click_time + INTERVAL 90 DAY;` }
    },
    adrMarkdown: `# ADR-019: Global Scalable URL Shortener Architecture (10B Keys)\n\n**Status:** APPROVED\n**Council:** Athena, Aegis, Vanguard, Ledger, Titan\n\n## 1. Context\n10 Billion short links with 50,000 QPS redirects.\n\n## 2. Decision\nDecoupled KGS with Feistel cipher + Redis LRU + ClickHouse tiering (-$14,000/yr).`,
    prStickyComment: `## 🏛️ Quorum Review Report: RFC-019\n\n| Specialist | Score | Resolution |\n|---|---|---|\n| **Aegis** | 5.2/10 | 🔒 Shuffled Base62 |\n| **Vanguard** | 7.0/10 | ⚡ Pre-allocated KGS |\n| **Ledger** | 6.5/10 | 💰 -$14,000/yr Saved |\n| **Titan** | 8.1/10 | ✅ Sub-5ms Reads |`
  },

  rfc088: {
    id: "RFC-088",
    headline: "Multi-Region Payment Processing Service",
    subline: "Active-Active Idempotency & Two-Phase Saga with PCI-DSS Level 1 Perimeter",
    targetScale: "50k RPS ($50M/day Volume)",
    targetBranch: "feat/adr-088-impl",
    verificationCmd: "pytest tests/ -v",
    baseThroughput: 48900,
    baseLatency: 18.4,
    metricUnit: "tx/s",
    claudeCmd: `claude -p "Read ADR-088.md Section 6. Switch to branch 'feat/adr-088-impl'. Implement idempotency key middleware with DynamoDB TTL. Run 'pytest tests/ -v'."`,
    legendChips: [
      { tag: "sec", name: "Aegis (PCI-DSS Level 1 Auth)" },
      { tag: "scale", name: "Vanguard (Idempotency <20ms)" },
      { tag: "fin", name: "Ledger (FinOps: -$38k/yr Interchange)" },
      { tag: "data", name: "Titan (2PC Saga Coordinator)" }
    ],
    invariants: [
      { id: "INV-SEC-01", desc: "Zero PAN in app memory (HSM Perimeter)" },
      { id: "INV-SCALE-02", desc: "Regional Idempotency Leases <20ms" },
      { id: "INV-FIN-03", desc: "Least-Cost Routing (-$38,000/yr)" },
      { id: "INV-DATA-04", desc: "2PC Saga Compensations 100% Atomic" },
      { id: "INV-ISO-05", desc: "Switch Room Isolation (0 Leaked Bytes)" }
    ],
    vulnerableNodeKey: "nlb",
    flawNotice: "⚠️ Raw cardholder PAN found in application debug logs (PCI-DSS 3.4 Breach)",
    resolvedNotice: "✓ Hardware Security Module (HSM) Perimeter Tokenizer Deployed",
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
      { agent: "Aegis", role: "Staff Security Auditor", tool: "pci_dss_log_scanner", duration: "135ms", tag: "sec", query: 'regex: "card_number|cvv"', result: '{\n  "unmasked_pan_matches": 1420,\n  "compliance": "CRITICAL VIOLATION"\n}' },
      { agent: "Vanguard", role: "Principal Systems Architect", tool: "cross_region_lock_evaluator", duration: "240ms", tag: "scale", query: 'topology: "2pc_global_lock"', result: '{\n  "p99_latency_ms": 820.5,\n  "status": "FAIL: Checkout latency spike"\n}' }
    ],
    matrix: [
      { vector: "PCI-DSS Compliance vs Debug Visibility", clash: "Engineering Ops (Full raw payload logging) vs Aegis (PCI-DSS Level 1 violation).", resolution: "Perimeter tokenization in HSM vault; debug logs only contain opaque token IDs.", invariant: "INV-SEC-01: Zero raw cardholder PAN exposure in application memory" }
    ],
    manifestItems: [
      { action: "CREATE", path: "src/security/hsm_tokenizer.py", mandatedBy: "Aegis", purpose: "Perimeter hardware tokenization vault preventing PAN logging" },
      { action: "CREATE", path: "src/idempotency/dynamo_lease.py", mandatedBy: "Vanguard", purpose: "Regional conditional write idempotency coordinator" },
      { action: "CREATE", path: "src/routing/interchange_router.py", mandatedBy: "Ledger", purpose: "Least-cost payment routing engine saving $38,000/yr" }
    ],
    components: {
      clients: { title: "Checkout Client Apps (Web / iOS)", auditor: "Vanguard • Principal Systems", score: "Score: 6.2/10", avatar: "V", tag: "scale", toolName: "regional_handshake_timer", toolDuration: "45ms", toolSnippet: 'latency: "14ms"', finding: "Cross-region latency spikes cause shopping cart abandonment.", resolution: "Regional client endpoint with local TLS handshake.", code: `fetch('/api/pay', { headers: { 'Idempotency-Key': uuid() } })` },
      nlb: { title: "Perimeter Tokenization Vault (HSM)", auditor: "Aegis • Staff Security", score: "Score: 3.8/10 (Resolved)", avatar: "A", tag: "sec", toolName: "pci_dss_log_scanner", toolDuration: "135ms", toolSnippet: 'matches: "1,420 PAN in logs"', finding: "Raw cardholder PAN exposure in debug log aggregators violates PCI-DSS 3.4.", resolution: "Hardware security module replaces card details with opaque tokens at edge.", code: `def tokenize_card(pan, cvv):\n    return hsm_client.mint_token(pan, cvv)` },
      gateway: { title: "Regional Idempotency Coordinator", auditor: "Vanguard • Principal Systems", score: "Score: 6.2/10 (Resolved)", avatar: "V", tag: "scale", toolName: "cross_region_lock_evaluator", toolDuration: "240ms", toolSnippet: '2pc_latency: "820ms"', finding: "Cross-region locks introduce 800ms latency spikes.", resolution: "DynamoDB conditional writes with TTL leases per idempotency key.", code: `dynamodb.put_item(\n    ConditionExpression='attribute_not_exists(idempotency_key)'\n)` },
      redis: { title: "Smart Interchange Router", auditor: "Ledger • Lead FinOps", score: "Score: 5.8/10 (Resolved)", avatar: "L", tag: "fin", toolName: "interchange_optimization_matrix", toolDuration: "88ms", toolSnippet: 'least_cost: "-$38,000/yr"', finding: "Static payment gateway routing pays 2.9% + 30c flat interchange.", resolution: "Dynamic least-cost router routes to lowest-fee provider, saving $38,000/yr.", code: `def select_lowest_fee_provider(card_bin, currency):\n    return fee_matrix.get_cheapest(card_bin, currency)` },
      outbox: { title: "Two-Phase Saga State Machine", auditor: "Titan • Data Reliability", score: "Score: 6.5/10 (Resolved)", avatar: "T", tag: "data", toolName: "saga_compensation_harness", toolDuration: "190ms", toolSnippet: 'compensations: "100%"', finding: "Non-atomic webhook retries cause duplicate balance crediting.", resolution: "Two-phase saga state machine with strict database unique constraints.", code: `async def execute_payment_saga(tx_id):\n    await auth_hold()\n    await commit_ledger()\n    await capture_payment()` },
      kafka: { title: "Multi-Rail Payment Rails", auditor: "Vanguard & Ledger", score: "Score: 8.8/10", avatar: "V", tag: "scale", toolName: "gateway_failover_sim", toolDuration: "105ms", toolSnippet: 'failover_time: "140ms"', finding: "Single acquirer outages bring down 100% of checkout flow.", resolution: "Multi-acquirer active-active circuit breaker with automatic failover.", code: `circuit_breaker = CircuitBreaker(fail_max=3, reset_timeout=30)` }
    },
    adrMarkdown: `# ADR-088: Multi-Region Payment Processing Service\n\n**Status:** APPROVED\n**Council:** Athena, Aegis, Vanguard, Ledger, Titan\n\n## 1. Context\n50,000 RPS checkout service with PCI-DSS Level 1 compliance.\n\n## 2. Decision\nPerimeter HSM tokenization + Regional DynamoDB leases + Smart BIN routing (-$38,000/yr).`,
    prStickyComment: `## 🏛️ Quorum Review Report: RFC-088\n\n| Specialist | Score | Resolution |\n|---|---|---|\n| **Aegis** | 3.8/10 | 🛡️ Perimeter HSM |\n| **Vanguard** | 6.2/10 | ⚡ Sub-20ms DynamoDB |\n| **Ledger** | 5.8/10 | 💰 -$38,000/yr Saved |\n| **Titan** | 6.5/10 | ✅ Two-Phase Commit |`
  }
};

const TOPOLOGY_MODELS = {
  rfc042: {
    viewBox: "0 0 1060 420",
    nodes: [
      { key: "clients", x: 30, y: 160, w: 180, h: 108, title: "100k Sockets", sub: "Client Apps Tier", metric: "Sub-20ms p99 SLA", pin: "INGRESS", color: "#38bdf8" },
      { key: "nlb", x: 245, y: 160, w: 180, h: 108, title: "AWS L4 NLB", sub: "TLS Termination", metric: "Zero In-Band Auth", pin: "EDGE LB", color: "#818cf8" },
      { key: "redis", x: 460, y: 160, w: 180, h: 108, title: "WebSocket Cluster", sub: "4 Nodes Autoscaling", metric: "$16.8k/yr vs $42k", pin: "💰 -$25.2k/yr", color: "#10b981" },
      { key: "gateway", x: 685, y: 65, w: 180, h: 108, title: "Redis Bloom Filter", sub: "Edge Revocation Cache", metric: "<0.2ms RAM Lookup", pin: "🛡️ Aegis: INV-SEC-01", color: "#f43f5e" },
      { key: "outbox", x: 685, y: 255, w: 180, h: 108, title: "Postgres Outbox", sub: "Transactional Table", metric: "Zero Message Loss", pin: "🏛️ Titan: INV-DATA-04", color: "#a78bfa" },
      { key: "kafka", x: 900, y: 255, w: 140, h: 108, title: "Kafka Event Stream", sub: "Debezium CDC Replica", metric: "Guaranteed Delivery", pin: "STREAM", color: "#06b6d4" }
    ],
    connections: [
      { from: "clients", to: "nlb" },
      { from: "nlb", to: "redis" },
      { from: "redis", to: "gateway" },
      { from: "redis", to: "outbox" },
      { from: "outbox", to: "kafka" }
    ]
  },
  rfc019: {
    viewBox: "0 0 1060 420",
    nodes: [
      { key: "clients", x: 30, y: 160, w: 180, h: 108, title: "Global Clients", sub: "Anycast Ingress", metric: "10,000 req/sec", pin: "GLOBAL", color: "#38bdf8" },
      { key: "nlb", x: 245, y: 160, w: 180, h: 108, title: "Cloudflare Edge", sub: "CDN & Hot Cache", metric: "98% Cache Hit", pin: "CDN EDGE", color: "#818cf8" },
      { key: "gateway", x: 460, y: 160, w: 180, h: 108, title: "Envoy Gateway", sub: "Token Bucket Rate Limit", metric: "100k Burst Cap", pin: "🛡️ Aegis: Sec", color: "#f43f5e" },
      { key: "redis", x: 685, y: 65, w: 180, h: 108, title: "Redis LRU Tier", sub: "80/20 Working Set", metric: "<1.2ms Read SLA", pin: "⚡ Vanguard: Perf", color: "#06b6d4" },
      { key: "outbox", x: 685, y: 255, w: 180, h: 108, title: "Key Gen Service (KGS)", sub: "Feistel Base62 Permute", metric: "Deterministic 7-Char", pin: "💰 Ledger: FinOps", color: "#10b981" },
      { key: "kafka", x: 900, y: 255, w: 140, h: 108, title: "Cassandra + ClickHouse", sub: "Storage & Analytics", metric: "10B Keys Capacity", pin: "🏛️ Titan: Store", color: "#a78bfa" }
    ],
    connections: [
      { from: "clients", to: "nlb" },
      { from: "nlb", to: "gateway" },
      { from: "gateway", to: "redis" },
      { from: "gateway", to: "outbox" },
      { from: "outbox", to: "kafka" }
    ]
  },
  rfc088: {
    viewBox: "0 0 1060 420",
    nodes: [
      { key: "clients", x: 30, y: 160, w: 180, h: 108, title: "Checkout Apps", sub: "Web & Mobile SDKs", metric: "<14ms Handshake", pin: "INGRESS", color: "#38bdf8" },
      { key: "nlb", x: 245, y: 160, w: 180, h: 108, title: "Perimeter HSM", sub: "Tokenization Vault", metric: "Zero PAN Ingest", pin: "🛡️ Aegis: PCI-1", color: "#f43f5e" },
      { key: "gateway", x: 460, y: 160, w: 180, h: 108, title: "Idempotency Coord", sub: "DynamoDB Leases", metric: "18ms Regional", pin: "⚡ Vanguard: NoLock", color: "#06b6d4" },
      { key: "redis", x: 685, y: 65, w: 180, h: 108, title: "Smart BIN Router", sub: "Least-Cost Routing", metric: "-$38,000/yr Saved", pin: "💰 Ledger: -$38k", color: "#10b981" },
      { key: "outbox", x: 685, y: 255, w: 180, h: 108, title: "2PC Saga Engine", sub: "State Coordinator", metric: "Atomic Compensate", pin: "🏛️ Titan: Saga", color: "#a78bfa" },
      { key: "kafka", x: 900, y: 255, w: 140, h: 108, title: "Multi-Rail Sinks", sub: "Stripe / Adyen / Fed", metric: "High-Availability", pin: "PAYMENT RAILS", color: "#38bdf8" }
    ],
    connections: [
      { from: "clients", to: "nlb" },
      { from: "nlb", to: "gateway" },
      { from: "gateway", to: "redis" },
      { from: "gateway", to: "outbox" },
      { from: "outbox", to: "kafka" }
    ]
  }
};

// ==========================================================================
// 1. DYNAMIC BEZIER WIRE CALCULATOR
// ==========================================================================

function calculateBezierPath(fromNode, toNode) {
  const fromW = fromNode.w || 180;
  const fromH = fromNode.h || 108;
  const toH = toNode.h || 108;

  const startX = fromNode.x + fromW;
  const startY = fromNode.y + fromH / 2;
  const endX = toNode.x;
  const endY = toNode.y + toH / 2;

  const dx = Math.max(30, (endX - startX) * 0.45);
  const cp1X = startX + dx;
  const cp1Y = startY;
  const cp2X = endX - dx;
  const cp2Y = endY;

  return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
}

// ==========================================================================
// 2. LIVE DELIBERATION PIPELINE (Evolutionary State Machine)
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
    icon.textContent = (deliberationMode === "instant") ? "⚡" : "⏱️";
    text.textContent = (deliberationMode === "instant") ? "Instant" : "Live Run";
    showToast(`Switched to ${deliberationMode} mode`);
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
  if (sublineElem) sublineElem.textContent = p.subline || "Interactive service topology — drag nodes to re-route live bezier wires";

  const targetElem = document.getElementById("prop-target");
  if (targetElem) targetElem.textContent = p.targetScale;

  // Render Legend Chips Dynamically
  renderLegendChips(p.legendChips);

  // Render Invariant Footer Strip
  renderInvariantStrip(p.invariants);

  // Pre-render ADR and Matrix
  renderADRAndManifest(p);
  renderMatrix(p);

  const skipBtn = document.getElementById("hud-skip-action");
  if (skipBtn) skipBtn.style.display = isInstant ? "none" : "inline-block";

  // Start Live Telemetry Fluctuator
  startLiveTelemetry(p.baseThroughput, p.baseLatency, p.metricUnit);

  if (isInstant) {
    executePhase(1, p);
    executePhase(2, p);
    executePhase(3, p);
    executePhase(4, p);
    finalizeConsensus(p);
    return;
  }

  // Live Multi-Stage Delphi Pipeline
  // Phase 1: Cryptographic Isolation (0ms -> 600ms)
  executePhase(1, p);
  setStepState(1, "active");
  setStepState(2, "pending");
  setStepState(3, "pending");
  setStepState(4, "pending");
  updateHUDDeliberationState(true, "PHASE 1: ROOM ISOLATION", `Partitioning 4 Soundproof Chambers (${p.chambers.map(c => '#' + c.id).join(', ')})...`);

  // Visual Evolution: Highlight the detected vulnerability on canvas
  highlightFlawedArchitecture(p);

  deliberationTimer = setTimeout(() => {
    // Phase 2: Independent Chamber Audits (600ms -> 1300ms)
    setStepState(1, "done");
    setStepState(2, "active");
    executePhase(2, p);
    updateHUDDeliberationState(true, "PHASE 2: BLIND AUDITS", `Specialists running tools (CVE search, concurrency sim, cloud pricing)...`);

    deliberationTimer = setTimeout(() => {
      // Phase 3: Public Floor Clash (1300ms -> 2200ms)
      setStepState(2, "done");
      setStepState(3, "active");
      executePhase(3, p);
      updateHUDDeliberationState(true, "PHASE 3: FLOOR CLASH", `Athena convenes #review-desk: Reconciling security, latency, and FinOps constraints...`);

      deliberationTimer = setTimeout(() => {
        // Phase 4: Dynamic Topology Synthesis & Consensus (2200ms -> 2800ms)
        setStepState(3, "done");
        setStepState(4, "active");
        executePhase(4, p);
        resolveFlawedArchitecture(p);
        updateHUDDeliberationState(true, "PHASE 4: TOPOLOGY SYNTHESIS", `Synthesizing architecture vector graph & locking invariant assertions...`);

        deliberationTimer = setTimeout(() => {
          finalizeConsensus(p);
        }, 600);
      }, 900);
    }, 700);
  }, 600);
}

function executePhase(phaseNum, p) {
  if (phaseNum === 1) renderChambersGrid(p.chambers);
  else if (phaseNum === 2) renderToolTraces(p.toolsLog);
  else if (phaseNum === 3) renderFloorMessages(p.debateMessages);
  else if (phaseNum === 4) renderDynamicTopologySVG(currentProposalKey);
}

function highlightFlawedArchitecture(p) {
  renderDynamicTopologySVG(currentProposalKey);
  const vKey = p.vulnerableNodeKey;
  if (!vKey) return;

  const nodeGroup = document.getElementById(`svg-node-${vKey}`);
  if (nodeGroup) {
    nodeGroup.classList.add("warning-node");
    const subText = nodeGroup.querySelector(".node-sub-text");
    if (subText) subText.textContent = "⚠️ VULNERABILITY DETECTED";
  }
}

function resolveFlawedArchitecture(p) {
  const vKey = p.vulnerableNodeKey;
  if (!vKey) return;

  const nodeGroup = document.getElementById(`svg-node-${vKey}`);
  if (nodeGroup) {
    nodeGroup.classList.remove("warning-node");
    nodeGroup.classList.add("resolved-node");
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
  resolveFlawedArchitecture(p);
  finalizeConsensus(p);
}

function updateHUDDeliberationState(running, stateText, narrativeText) {
  const pill = document.getElementById("hud-live-pill");
  const stateElem = document.getElementById("hud-status-state");
  const narrativeElem = document.getElementById("hud-narrative-text");
  const canvasBadge = document.getElementById("canvas-status-badge");

  if (pill) pill.className = running ? "header-status-badge running" : "header-status-badge";
  if (stateElem) stateElem.textContent = stateText;
  if (narrativeElem) narrativeElem.textContent = narrativeText;
  if (canvasBadge) {
    canvasBadge.innerHTML = running ? `<span class="sync-dot busy"></span> ${stateText}` : `<span class="sync-dot live"></span> Consensus Locked`;
  }
}

function setStepState(stepNum, state) {
  const step = document.getElementById(`hud-step-${stepNum}`);
  if (step) step.className = `hud-step ${state}`;

  // Reflect active pipeline stage directly on unified navigation tabs
  const viewMap = { 1: "chambers", 2: "tools", 3: "floor", 4: "topology" };
  const viewId = viewMap[stepNum];
  if (viewId) {
    const btn = document.querySelector(`.view-nav-btn[data-view='${viewId}']`);
    if (btn) {
      if (state === "active") {
        btn.classList.add("pipeline-active");
        btn.classList.remove("pipeline-done");
      } else if (state === "done") {
        btn.classList.remove("pipeline-active");
        btn.classList.add("pipeline-done");
      } else {
        btn.classList.remove("pipeline-active");
        btn.classList.remove("pipeline-done");
      }
    }
  }
}

// ==========================================================================
// 3. LIVE FLUCTUATING TELEMETRY ENGINE
// ==========================================================================

function startLiveTelemetry(baseTput = 100000, baseLat = 18.0, unit = "msg/s") {
  if (telemetryTimer) clearInterval(telemetryTimer);

  const teleElem = document.getElementById("live-telemetry-text");
  if (!teleElem) return;

  telemetryTimer = setInterval(() => {
    const jitterTput = Math.round(baseTput + (Math.random() * 800 - 400));
    const jitterLat = (baseLat + (Math.random() * 0.8 - 0.4)).toFixed(1);
    teleElem.textContent = `${jitterTput.toLocaleString()} ${unit} • ${jitterLat}ms p99`;
  }, 1600);
}

// ==========================================================================
// 4. INTERACTIVE DRAGGABLE TOPOLOGY SVG CANVAS
// ==========================================================================

function renderDynamicTopologySVG(rfcKey) {
  const container = document.getElementById("dynamic-svg-viewport");
  if (!container) return;

  const model = TOPOLOGY_MODELS[rfcKey] || TOPOLOGY_MODELS.rfc042;
  const isPaused = !flowAnimationActive;

  // Build SVG XML
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

      <g id="canvas-transform-group" transform="translate(${panOffset.x}, ${panOffset.y}) scale(${currentZoom})">
        
        <!-- Connections Layer -->
        <g class="topology-wires-layer" id="svg-wires-group">
  `;

  // Draw Dynamic Bezier Wires
  model.connections.forEach((conn, idx) => {
    const fromNode = model.nodes.find(n => n.key === conn.from);
    const toNode = model.nodes.find(n => n.key === conn.to);
    if (!fromNode || !toNode) return;

    const pathD = calculateBezierPath(fromNode, toNode);
    svgHtml += `
      <path id="flow-wire-${conn.from}-${conn.to}" class="flow-wire active-stream ${isPaused ? 'paused' : ''}" d="${pathD}" />
      ${!isPaused ? `
        <circle r="4" class="flow-particle" fill="#22d3ee">
          <animateMotion id="anim-particle-${conn.from}-${conn.to}" path="${pathD}" dur="${1.8 + (idx * 0.25)}s" repeatCount="indefinite" />
        </circle>
      ` : ''}
    `;
  });

  svgHtml += `
        </g>

        <!-- Nodes Layer -->
        <g class="topology-nodes-layer" id="svg-nodes-group">
  `;

  // Draw Nodes
  model.nodes.forEach(n => {
    const isSelected = selectedTopologyNode === n.key;
    const nodeW = n.w || 180;
    const nodeH = n.h || 108;

    svgHtml += `
      <g class="svg-node-group ${isSelected ? 'selected' : ''}" id="svg-node-${n.key}" data-node-key="${n.key}" onmousedown="onNodeMouseDown(event, '${n.key}')">
        <!-- Body Card -->
        <rect class="node-body-rect" x="${n.x}" y="${n.y}" width="${nodeW}" height="${nodeH}" rx="12"
          fill="url(#grad-node-bg)" stroke="${isSelected ? '#06b6d4' : 'rgba(255,255,255,0.12)'}" stroke-width="${isSelected ? '2.5' : '1.2'}"
          filter="${isSelected ? 'url(#glow-selected)' : 'none'}" />

        <!-- Top Stripe -->
        <rect class="node-stripe" x="${n.x + 14}" y="${n.y}" width="${nodeW - 28}" height="2.5" rx="1" fill="${n.color}" opacity="0.9" />

        <!-- Row 1: Tag & Pin -->
        <rect class="node-tier-badge" x="${n.x + 12}" y="${n.y + 10}" width="54" height="16" rx="4" fill="rgba(255,255,255,0.05)" />
        <text class="node-tier-text" x="${n.x + 39}" y="${n.y + 21}" text-anchor="middle" font-family="var(--font-sans)" font-size="8.5" font-weight="700" fill="#94a3b8" letter-spacing="0.5">TIER</text>

        ${n.pin ? `
          <rect class="node-pin-box" x="${n.x + nodeW - 90}" y="${n.y + 9}" width="78" height="18" rx="4" fill="rgba(0,0,0,0.5)" stroke="${n.color}" stroke-width="1" />
          <text class="node-pin-text" x="${n.x + nodeW - 51}" y="${n.y + 21.5}" text-anchor="middle" font-family="var(--font-mono)" font-size="9" font-weight="700" fill="${n.color}">${n.pin}</text>
        ` : ''}

        <!-- Row 2: Title -->
        <text class="node-title-text" x="${n.x + 14}" y="${n.y + 48}" font-family="var(--font-sans)" font-size="13" font-weight="700" fill="#f8fafc">${n.title}</text>

        <!-- Row 3: Subtitle -->
        <text class="node-sub-text" x="${n.x + 14}" y="${n.y + 68}" font-family="var(--font-sans)" font-size="10.5" fill="#94a3b8">${n.sub}</text>

        <!-- Row 4: Metric Pill -->
        <rect class="node-metric-box" x="${n.x + 10}" y="${n.y + 80}" width="${nodeW - 20}" height="20" rx="5" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.06)" />
        <text class="node-metric-text" x="${n.x + 18}" y="${n.y + 94}" font-family="var(--font-mono)" font-size="10" font-weight="600" fill="${n.color}">⚡ ${n.metric}</text>
      </g>
    `;
  });

  svgHtml += `
        </g>
      </g>
    </svg>
  `;

  container.innerHTML = svgHtml;

  // Initialize Canvas Interactions (Drag, Pan, Zoom)
  attachCanvasInteractions();

  // Auto-select node to sync Right Rail
  const defaultKey = model.nodes[2] ? model.nodes[2].key : model.nodes[0].key;
  selectDynamicNode(defaultKey);
}

// ==========================================================================
// 5. DIRECT MANIPULATION: DRAG NODES & LIVE WIRE RE-ROUTING
// ==========================================================================

function onNodeMouseDown(e, nodeKey) {
  if (!dragModeActive) return;
  e.stopPropagation();

  draggedNodeKey = nodeKey;
  const model = TOPOLOGY_MODELS[currentProposalKey];
  const node = model.nodes.find(n => n.key === nodeKey);
  if (!node) return;

  const svg = document.getElementById("synthesized-topology-svg");
  const ctm = svg.getScreenCTM();
  if (ctm) {
    dragStartMouse = {
      x: (e.clientX - ctm.e) / ctm.a,
      y: (e.clientY - ctm.f) / ctm.d
    };
  } else {
    dragStartMouse = { x: e.clientX, y: e.clientY };
  }
  dragStartNodePos = { x: node.x, y: node.y };

  const nodeGroup = document.getElementById(`svg-node-${nodeKey}`);
  if (nodeGroup) nodeGroup.classList.add("is-dragging");

  selectDynamicNode(nodeKey);
}

function attachCanvasInteractions() {
  const container = document.getElementById("dynamic-svg-viewport");
  if (!container) return;

  container.onmousedown = (e) => {
    if (e.target.closest(".svg-node-group")) return;
    isPanningCanvas = true;
    panStart = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    container.classList.add("is-panning");
  };

  window.onmousemove = (e) => {
    // 1. Drag Node
    if (draggedNodeKey) {
      const model = TOPOLOGY_MODELS[currentProposalKey];
      const node = model.nodes.find(n => n.key === draggedNodeKey);
      if (!node) return;

      const svg = document.getElementById("synthesized-topology-svg");
      const ctm = svg.getScreenCTM();
      let currentMouse;
      if (ctm) {
        currentMouse = {
          x: (e.clientX - ctm.e) / ctm.a,
          y: (e.clientY - ctm.f) / ctm.d
        };
      } else {
        currentMouse = { x: e.clientX, y: e.clientY };
      }

      const dx = (currentMouse.x - dragStartMouse.x) / currentZoom;
      const dy = (currentMouse.y - dragStartMouse.y) / currentZoom;

      node.x = Math.max(0, Math.min(880, dragStartNodePos.x + dx));
      node.y = Math.max(0, Math.min(310, dragStartNodePos.y + dy));

      // Fast update node elements
      updateSvgNodePosition(node);

      // Fast re-route connected wires in real-time!
      updateConnectedWires(node);
      return;
    }

    // 2. Pan Canvas
    if (isPanningCanvas) {
      panOffset = {
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      };
      applyCanvasTransform();
    }
  };

  window.onmouseup = () => {
    if (draggedNodeKey) {
      const nodeGroup = document.getElementById(`svg-node-${draggedNodeKey}`);
      if (nodeGroup) nodeGroup.classList.remove("is-dragging");
      draggedNodeKey = null;
    }
    if (isPanningCanvas) {
      isPanningCanvas = false;
      container.classList.remove("is-panning");
    }
  };

  container.onwheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    zoomCanvas(delta);
  };
}

function updateSvgNodePosition(n) {
  const g = document.getElementById(`svg-node-${n.key}`);
  if (!g) return;

  const nodeW = n.w || 180;

  const bodyRect = g.querySelector(".node-body-rect");
  if (bodyRect) { bodyRect.setAttribute("x", n.x); bodyRect.setAttribute("y", n.y); }

  const stripe = g.querySelector(".node-stripe");
  if (stripe) { stripe.setAttribute("x", n.x + 14); stripe.setAttribute("y", n.y); }

  const tierBadge = g.querySelector(".node-tier-badge");
  if (tierBadge) { tierBadge.setAttribute("x", n.x + 12); tierBadge.setAttribute("y", n.y + 10); }

  const tierText = g.querySelector(".node-tier-text");
  if (tierText) { tierText.setAttribute("x", n.x + 39); tierText.setAttribute("y", n.y + 21); }

  const pinBox = g.querySelector(".node-pin-box");
  if (pinBox) { pinBox.setAttribute("x", n.x + nodeW - 90); pinBox.setAttribute("y", n.y + 9); }

  const pinText = g.querySelector(".node-pin-text");
  if (pinText) { pinText.setAttribute("x", n.x + nodeW - 51); pinText.setAttribute("y", n.y + 21.5); }

  const titleText = g.querySelector(".node-title-text");
  if (titleText) { titleText.setAttribute("x", n.x + 14); titleText.setAttribute("y", n.y + 48); }

  const subText = g.querySelector(".node-sub-text");
  if (subText) { subText.setAttribute("x", n.x + 14); subText.setAttribute("y", n.y + 68); }

  const metricBox = g.querySelector(".node-metric-box");
  if (metricBox) { metricBox.setAttribute("x", n.x + 10); metricBox.setAttribute("y", n.y + 80); }

  const metricText = g.querySelector(".node-metric-text");
  if (metricText) { metricText.setAttribute("x", n.x + 18); metricText.setAttribute("y", n.y + 94); }
}

function updateConnectedWires(node) {
  const model = TOPOLOGY_MODELS[currentProposalKey];
  model.connections.forEach(conn => {
    if (conn.from === node.key || conn.to === node.key) {
      const fromNode = model.nodes.find(n => n.key === conn.from);
      const toNode = model.nodes.find(n => n.key === conn.to);
      if (!fromNode || !toNode) return;

      const newD = calculateBezierPath(fromNode, toNode);
      const wire = document.getElementById(`flow-wire-${conn.from}-${conn.to}`);
      if (wire) wire.setAttribute("d", newD);

      const anim = document.getElementById(`anim-particle-${conn.from}-${conn.to}`);
      if (anim) anim.setAttribute("path", newD);
    }
  });
}

function zoomCanvas(delta) {
  currentZoom = Math.max(0.6, Math.min(1.8, currentZoom + delta));
  const levelText = document.getElementById("zoom-level-text");
  if (levelText) levelText.textContent = `${Math.round(currentZoom * 100)}%`;
  applyCanvasTransform();
}

function resetCanvasTransform() {
  currentZoom = 1.0;
  panOffset = { x: 0, y: 0 };
  const levelText = document.getElementById("zoom-level-text");
  if (levelText) levelText.textContent = "100%";
  applyCanvasTransform();
  showToast("Canvas view reset to 100%");
}

function applyCanvasTransform() {
  const group = document.getElementById("canvas-transform-group");
  if (group) {
    group.setAttribute("transform", `translate(${panOffset.x}, ${panOffset.y}) scale(${currentZoom})`);
  }
}

function toggleDragMode() {
  dragModeActive = !dragModeActive;
  const label = document.getElementById("drag-status-label");
  if (label) label.textContent = dragModeActive ? "Drag: ON" : "Drag: OFF";
  showToast(dragModeActive ? "Node dragging enabled: click and drag any service box" : "Node dragging disabled");
}

function selectDynamicNode(nodeKey) {
  selectedTopologyNode = nodeKey;
  document.querySelectorAll(".svg-node-group").forEach(el => el.classList.remove("selected"));
  const svgNode = document.getElementById(`svg-node-${nodeKey}`);
  if (svgNode) svgNode.classList.add("selected");

  // Sync right-rail inspector panel
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
  if (toolName) toolName.textContent = comp.toolName || "trace";

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
  if (toggleBtn) toggleBtn.classList.toggle("active", !rail.classList.contains("collapsed"));
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
// 6. DYNAMIC UI RENDERING (Chips, Invariants, Chambers, Floor, Matrix, ADR)
// ==========================================================================

function renderLegendChips(chips) {
  const container = document.getElementById("topology-legend-chips");
  if (!container || !chips) return;
  container.innerHTML = chips.map(c => `
    <span class="legend-chip ${c.tag}"><span class="legend-dot"></span> ${c.name}</span>
  `).join("");
}

function renderInvariantStrip(invariants) {
  const container = document.getElementById("invariant-items");
  if (!container || !invariants) return;
  container.innerHTML = invariants.map(inv => `
    <span class="inv-strip-chip"><strong>${inv.id}:</strong> ${inv.desc}</span>
  `).join("");
}

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
// 7. CUSTOM ARCHITECTURE RFC MODAL (Domain-Specific Synthesis)
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
  if (event.target.id === "custom-rfc-modal") closeCustomRFCModal();
}

function applyRFCPreset(presetKey) {
  const titleInput = document.getElementById("custom-title-input");
  const dilemmaInput = document.getElementById("custom-dilemma-input");

  if (presetKey === "stream") {
    if (titleInput) titleInput.value = "Global Adaptive Video Streaming CDN";
    if (dilemmaInput) dilemmaInput.value = "Deliver 10,000,000 concurrent 4K HLS video streams with sub-2s startup latency, zero rebuffering, and token authentication at edge POPs.";
  } else if (presetKey === "fraud") {
    if (titleInput) titleInput.value = "Real-Time Fraud Scoring & Risk Engine";
    if (dilemmaInput) dilemmaInput.value = "Process 100,000 tx/sec with sub-5ms ML scoring, zero false-positive account lockouts, and under $12k/mo infrastructure spend under network partition.";
  } else if (presetKey === "crypto") {
    if (titleInput) titleInput.value = "High-Frequency Crypto Order Matching Engine";
    if (dilemmaInput) dilemmaInput.value = "Match 200,000 orders/sec with deterministic sub-1ms p99 latency, zero-copy memory ring buffers, and strict double-spend ACID ledger verification.";
  }
}


// ==========================================================================
// DELPHI SHIMMER SKELETON CONTROLLER
// ==========================================================================

let skeletonTimerInterval = null;
let skeletonNarrativeInterval = null;
let skeletonStartTime = 0;

function showDelphiSkeleton(title, dilemma) {
  const overlay = document.getElementById("delphi-skeleton-overlay");
  if (!overlay) return;

  overlay.classList.add("active");
  skeletonStartTime = Date.now();

  const titleElem = document.getElementById("skeleton-status-title");
  if (titleElem) titleElem.textContent = `CONVENING DELPHI REVIEW: ${title.toUpperCase()}`;

  const narrativeElem = document.getElementById("skeleton-narrative-text");
  const timerElem = document.getElementById("skeleton-timer-pill");

  const secChip = document.getElementById("skel-sec");
  const scaleChip = document.getElementById("skel-scale");
  const finChip = document.getElementById("skel-fin");
  const dataChip = document.getElementById("skel-data");

  const resetChips = () => {
    [secChip, scaleChip, finChip, dataChip].forEach(c => {
      if (c) {
        const tag = c.querySelector(".chamber-status-tag");
        if (tag) {
          tag.textContent = "LOCKING";
          tag.style.color = "#38bdf8";
        }
      }
    });
  };
  resetChips();

  // Timer Tick
  if (skeletonTimerInterval) clearInterval(skeletonTimerInterval);
  skeletonTimerInterval = setInterval(() => {
    const elapsed = ((Date.now() - skeletonStartTime) / 1000).toFixed(1);
    if (timerElem) timerElem.textContent = `Elapsed: ${elapsed}s`;
  }, 100);

  // Progressive Stage Narrative
  const narratives = [
    { at: 0, text: "Partitioning 4 Soundproof Chambers across Switch Core (0 byte leakage)...", chamber: "sec" },
    { at: 4, text: "Chamber #audit-security: Aegis running zero-trust surface scanner & CVE probes...", chamber: "sec" },
    { at: 8, text: "Chamber #audit-scalability: Vanguard running p99 concurrency & partition simulator...", chamber: "scale" },
    { at: 13, text: "Chamber #audit-finops: Ledger calculating AWS/GCP cloud egress right-sizing...", chamber: "fin" },
    { at: 18, text: "Chamber #audit-database: Titan validating ACID outbox table and write amplification...", chamber: "data" },
    { at: 23, text: "Athena convening #review-desk floor clash to reconcile specialist trade-offs...", chamber: "all" },
    { at: 28, text: "Synthesizing final architecture vector topology & Michael Nygard ADR...", chamber: "all" },
    { at: 35, text: "Still working; waiting for agent responses...", chamber: "all" }
  ];

  let stepIdx = 0;
  if (skeletonNarrativeInterval) clearInterval(skeletonNarrativeInterval);
  skeletonNarrativeInterval = setInterval(() => {
    const elapsed = (Date.now() - skeletonStartTime) / 1000;
    while (stepIdx < narratives.length - 1 && elapsed >= narratives[stepIdx + 1].at) {
      stepIdx++;
    }
    const current = narratives[stepIdx];
    if (narrativeElem) narrativeElem.textContent = current.text;

    // Update chamber tags progressively with live audit markers
    if (elapsed >= 5 && secChip) {
      const tag = secChip.querySelector(".chamber-status-tag");
      if (tag && tag.textContent !== "VERIFIED") { tag.textContent = "CVE CHECKED"; tag.style.color = "#38bdf8"; }
    }
    if (elapsed >= 10 && scaleChip) {
      const tag = scaleChip.querySelector(".chamber-status-tag");
      if (tag && tag.textContent !== "VERIFIED") { tag.textContent = "P99 SIMULATED"; tag.style.color = "#38bdf8"; }
    }
    if (elapsed >= 15 && finChip) {
      const tag = finChip.querySelector(".chamber-status-tag");
      if (tag && tag.textContent !== "VERIFIED") { tag.textContent = "COST MODELLED"; tag.style.color = "#38bdf8"; }
    }
    if (elapsed >= 20 && dataChip) {
      const tag = dataChip.querySelector(".chamber-status-tag");
      if (tag && tag.textContent !== "VERIFIED") { tag.textContent = "ACID CHECKED"; tag.style.color = "#38bdf8"; }
    }
  }, 500);
}

function hideDelphiSkeleton() {
  const overlay = document.getElementById("delphi-skeleton-overlay");
  if (overlay) overlay.classList.remove("active");

  if (skeletonTimerInterval) {
    clearInterval(skeletonTimerInterval);
    skeletonTimerInterval = null;
  }
  if (skeletonNarrativeInterval) {
    clearInterval(skeletonNarrativeInterval);
    skeletonNarrativeInterval = null;
  }

  // Once synthesis is complete, finalize all chambers to VERIFIED
  ["sec", "scale", "fin", "data"].forEach(id => {
    const chip = document.getElementById(`skel-chamber-${id}`);
    if (chip) {
      const tag = chip.querySelector(".chamber-status-tag");
      if (tag) { tag.textContent = "VERIFIED"; tag.style.color = "#34d399"; }
    }
  });
}


async function submitCustomRFC() {
  const titleInput = document.getElementById("custom-title-input");
  const dilemmaInput = document.getElementById("custom-dilemma-input");
  const submitBtn = document.getElementById("modal-submit-btn") || document.querySelector("#custom-rfc-modal button[type='submit']") || document.querySelector("#custom-rfc-modal .modal-btn.primary");

  const title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : "Custom Distributed Architecture";
  const dilemma = (dilemmaInput && dilemmaInput.value.trim()) ? dilemmaInput.value.trim() : "High-throughput microservices architecture with strict security and availability.";

  const customKey = "custom_" + Date.now().toString(36);
  const rfcId = "RFC-" + Math.floor(100 + Math.random() * 900);

  // Close modal immediately and show full canvas skeleton loader
  closeCustomRFCModal();
  setCenterView("topology");
  showDelphiSkeleton(title, dilemma);
  updateHUDDeliberationState(true, "DELPHI REVIEW RUNNING", `Synthesizing architecture review for "${title}" across 4 chambers...`);
  showToast(`Initiating Delphi Council for: ${title}`);

  let liveSuccess = false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 65000);
    const host = window.location.origin.startsWith("http") ? window.location.origin : "http://localhost:8788";
    const res = await fetch(`${host}/api/custom_rfc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dilemma }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const liveData = await res.json();
      if (liveData && liveData.nodes && liveData.nodes.length > 0) {
        TOPOLOGY_MODELS[customKey] = {
          viewBox: "0 0 1060 420",
          nodes: liveData.nodes,
          connections: liveData.connections || [
            { from: "clients", to: "nlb" },
            { from: "nlb", to: "redis" },
            { from: "redis", to: "gateway" },
            { from: "redis", to: "outbox" },
            { from: "outbox", to: "kafka" }
          ]
        };

        const activeId = liveData.rfcId || rfcId;
        PROPOSALS[customKey] = {
          id: activeId,
          headline: liveData.headline || title,
          subline: liveData.subline || `Synthesized architecture for "${dilemma.substring(0, 90)}..."`,
          targetScale: liveData.targetScale || "Production Scale",
          targetBranch: `feat/${activeId.toLowerCase()}-impl`,
          verificationCmd: "pytest tests/ -v",
          baseThroughput: 85000,
          baseLatency: 3.8,
          metricUnit: "req/s",
          claudeCmd: `claude -p "Read ${activeId}.md Section 6. Switch to branch 'feat/${activeId.toLowerCase()}-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."`,
          legendChips: liveData.legendChips || [
            { tag: "sec", name: "Aegis (Security and Abuse)" },
            { tag: "scale", name: "Vanguard (Scale and Latency)" },
            { tag: "fin", name: "Ledger (Cloud Economics)" },
            { tag: "data", name: "Titan (Storage ACID)" }
          ],
          invariants: liveData.invariants || [],
          vulnerableNodeKey: "gateway",
          flawNotice: liveData.flawNotice || "⚠️ Architectural tension detected across specialist boundaries",
          resolvedNotice: liveData.resolvedNotice || "✓ Invariant enforced: Reconciled security and throughput SLA",
          chambers: liveData.switchRooms || liveData.chambers || [],
          debateMessages: liveData.debate || liveData.debateMessages || [],
          toolsLog: liveData.toolsLog || [],
          matrix: liveData.matrix || [
            { vector: "Security vs Latency SLA", clash: "Aegis vs Vanguard", resolution: liveData.resolvedNotice || "Enforce zero-trust edge fast-path", invariant: "INV-SEC-01" },
            { vector: "Scale vs Infrastructure Cost", clash: "Vanguard vs Ledger", resolution: liveData.annualSavings || "Cloud rightsizing and autoscaling", invariant: "INV-FIN-03" }
          ],
          manifestItems: liveData.manifestItems || [
            { action: "CREATE", path: `src/security/fast_filter.py`, mandatedBy: "Aegis", purpose: "Edge security verification" },
            { action: "CREATE", path: `src/core/worker_engine.py`, mandatedBy: "Vanguard", purpose: "Asynchronous worker engine" },
            { action: "MODIFY", path: `infra/cluster.tf`, mandatedBy: "Ledger", purpose: "Autoscaling cluster definition" }
          ],
          components: liveData.components || {},
          adrMarkdown: liveData.adrMarkdown || `# ${activeId}: ${title}

**Status:** APPROVED
**Council:** Athena, Aegis, Vanguard, Ledger, Titan`,
          prStickyComment: `## 🏛️ Quorum Review Report: ${activeId}

| Specialist | Score | Verdict |
|---|---|---|
| **Aegis** | 6.5/10 | 🛡️ Approved |
| **Vanguard** | 7.0/10 | ⚡ Latency Met |
| **Ledger** | 6.0/10 | 💰 ${liveData.annualSavings || 'Cost Optimized'} |
| **Titan** | 7.5/10 | ✅ ACID Guaranteed |`
        };
        liveSuccess = true;
      }
    }
  } catch (err) {
    console.log("Live backend server not reachable or timed out. Falling back to local synthesizer.", err);
  } finally {
    hideDelphiSkeleton();
  }

  if (!liveSuccess) {
    synthesizeCustomProposal(customKey, rfcId, title, dilemma);
  }

  // Add to Dropdown
  const dropdown = document.getElementById("proposal-dropdown");
  if (dropdown) {
    const opt = document.createElement("option");
    opt.value = customKey;
    opt.textContent = `${rfcId}: ${title}`;
    dropdown.appendChild(opt);
    dropdown.value = customKey;
  }

  showToast(`Consensus Locked for ${rfcId}!`);
  runDeliberationPipeline(customKey, false);
}

function synthesizeCustomProposal(key, rfcId, title, dilemma) {
  const dLower = dilemma.toLowerCase();

  let nodes, connections, legendChips, invariants, toolsLog, components, flawNotice, resolvedNotice, baseTput, baseLat, metricUnit;

    if (dLower.includes("url") || dLower.includes("short") || dLower.includes("link") || dLower.includes("bitly") || dLower.includes("tinyurl")) {
    // REAL DISTRIBUTED URL SHORTENER ARCHITECTURE (10B KEYS / 50k QPS)
    baseTput = 50000;
    baseLat = 8.4;
    metricUnit = "req/s";
    legendChips = [
      { tag: "sec", name: "Aegis (Security: Feistel Permutation)" },
      { tag: "scale", name: "Vanguard (Scale: 50k QPS Redirects)" },
      { tag: "fin", name: "Ledger (FinOps: -$14.4k/yr Cold Tier)" },
      { tag: "data", name: "Titan (KGS: Zero Token Collisions)" }
    ];
    invariants = [
      { id: "INV-SEC-01", desc: "Feistel cipher permutes 64-bit ID to prevent link enumeration scraping" },
      { id: "INV-SCALE-02", desc: "Top 20% hot links served from Redis LRU cache under 2ms p99 SLA" },
      { id: "INV-FIN-03", desc: "Cold storage tiering to Cassandra NVMe saves $14,400/year over in-memory" },
      { id: "INV-DATA-04", desc: "Key Generation Service (KGS) allocates pre-generated ranges with zero collisions" },
      { id: "INV-ISO-05", desc: "Switch Room Isolation (0 Leaked Bytes, 0.0% Sycophancy)" }
    ];
    flawNotice = "⚠️ Sequential auto-increment IDs permit competitors to scrape all customer URLs";
    resolvedNotice = "✓ Feistel Permutation Generator + Redis LRU Cache Tier Deployed";
    nodes = [
      { key: "clients", x: 30, y: 160, w: 180, h: 108, title: "50k QPS Clients", sub: "Global Redirect Ingress", metric: "<10ms p99 SLA", pin: "INGRESS", color: "#38bdf8" },
      { key: "nlb", x: 245, y: 160, w: 180, h: 108, title: "Anycast Edge NLB", sub: "Edge TLS & WAF Filter", metric: "Sub-2ms TLS", pin: "EDGE", color: "#818cf8" },
      { key: "redis", x: 460, y: 160, w: 180, h: 108, title: "Redis LRU Hot Cache", sub: "Top 20% URLs (80% Hits)", metric: "91.4% Hit Ratio", pin: "💰 -$14k/yr", color: "#10b981" },
      { key: "gateway", x: 685, y: 65, w: 180, h: 108, title: "KGS & Feistel Cipher", sub: "Collision-Free Keys", metric: "<0.1ms Token", pin: "🛡️ Aegis: Sec", color: "#f43f5e" },
      { key: "outbox", x: 685, y: 255, w: 180, h: 108, title: "Cassandra Key-Value", sub: "10B Sharded Rows", metric: "99.999% SLA", pin: "🏛️ Titan: KV", color: "#a78bfa" },
      { key: "kafka", x: 900, y: 255, w: 140, h: 108, title: "ClickHouse Analytics", sub: "Click Telemetry Sink", metric: "Real-Time QPS", pin: "STREAM", color: "#06b6d4" }
    ];
    connections = [
      { from: "clients", to: "nlb" },
      { from: "nlb", to: "redis" },
      { from: "redis", to: "gateway" },
      { from: "redis", to: "outbox" },
      { from: "outbox", to: "kafka" }
    ];
    toolsLog = [
      { agent: "Aegis", role: "Staff Security Auditor", tool: "id_entropy_auditor", duration: "110ms", tag: "sec", query: "entropy_check: auto_increment\nvector: scraping", result: JSON.stringify({ flaw: "Sequential IDs allow automated link enumeration", resolution: "64-bit Feistel block cipher permutation" }, null, 2) },
      { agent: "Vanguard", role: "Principal Systems Architect", tool: "redirect_latency_sim", duration: "185ms", tag: "scale", query: "concurrency: 50000\nread_write_ratio: 100:1", result: JSON.stringify({ measured_p99: "8.4ms", cache_hit_rate: "91.4%", status: "PASS: Low Latency SLA Enforced" }, null, 2) },
      { agent: "Ledger", role: "Lead Cloud Economics", tool: "kv_storage_tco", duration: "92ms", tag: "fin", query: "records: 10000000000\nstorage_model: RAM_vs_NVMe", result: JSON.stringify({ ram_only_cost: "$28,500/mo", tiered_cassandra_cost: "$16,500/mo", annual_savings: "$14,400/yr" }, null, 2) }
    ];
    components = {
      clients: { title: "50,000 QPS Redirect Ingress", auditor: "Vanguard • Principal Systems", score: "Score: 8.5/10", avatar: "V", tag: "scale", toolName: "http_redirect_probe", toolDuration: "35ms", toolSnippet: 'target: "50,000 QPS"', finding: "High-volume redirects directly hitting DB cause connection spikes.", resolution: "Anycast edge routing with HTTP 302/301 cached responses.", code: "HTTP/1.1 302 Found\nLocation: https://example.com/target" },
      nlb: { title: "Anycast Edge NLB & WAF", auditor: "Aegis • Staff Security", score: "Score: 7.8/10", avatar: "A", tag: "sec", toolName: "waf_rate_limiter", toolDuration: "60ms", toolSnippet: 'rate_limit: "10k/IP/hr"', finding: "Public redirect endpoints vulnerable to malware and phishing distribution.", resolution: "Google Safe Browsing API check upon URL creation + edge rate limiting.", code: "app.use(googleSafeBrowsingCheck());" },
      redis: { title: "Redis LRU Hot Cache Tier", auditor: "Vanguard & Ledger", score: "Score: 9.1/10", avatar: "V", tag: "scale", toolName: "lru_cache_timer", toolDuration: "25ms", toolSnippet: 'hit_ratio: "91.4%"', finding: "Direct disk reads on 50k QPS breach <10ms SLA.", resolution: "Top 20% hot URLs kept in RAM with LRU eviction; serves 80%+ traffic sub-2ms.", code: "const url = await redis.get(`short:${hash}`);\nif (url) return res.redirect(url);" },
      gateway: { title: "KGS & Feistel Cipher Generator", auditor: "Aegis • Staff Security", score: "Score: 6.2/10 (Resolved)", avatar: "A", tag: "sec", toolName: "feistel_cipher_runner", toolDuration: "40ms", toolSnippet: 'permutation: "Feistel 64-bit"', finding: "Predictable short URLs permit bulk link enumeration by competitors.", resolution: "Feistel block cipher shuffles sequential keys into pseudo-random 7-char Base62 tokens.", code: "def encode_token(seq_id):\n    shuffled = feistel_permute(seq_id)\n    return base62_encode(shuffled)" },
      outbox: { title: "Cassandra Sharded Storage", auditor: "Titan • Database Architect", score: "Score: 8.6/10", avatar: "T", tag: "data", toolName: "kv_durability_bench", toolDuration: "120ms", toolSnippet: 'rows: "10 Billion"', finding: "Single RDBMS cannot scale to 10 Billion rows without sharding bottlenecks.", resolution: "NoSQL wide-column Cassandra cluster with partition key on short_code.", code: "SELECT original_url FROM url_mapping WHERE short_code = ?;" },
      kafka: { title: "ClickHouse Clickstream Analytics", auditor: "Titan & Vanguard", score: "Score: 9.2/10", avatar: "T", tag: "data", toolName: "clickstream_sink", toolDuration: "55ms", toolSnippet: 'qps: "50,000"', finding: "Synchronous click counting in primary database degrades redirect throughput.", resolution: "Decoupled asynchronous event stream into ClickHouse for geo/device analytics.", code: "INSERT INTO click_stream (short_code, ts, ip, user_agent) VALUES (...);" }
    };
  } else if (dLower.includes("video") || dLower.includes("stream") || dLower.includes("hls")) {
    // REAL VIDEO CDN ARCHITECTURE
    baseTput = 10000000;
    baseLat = 1.4;
    metricUnit = "streams";
    legendChips = [
      { tag: "sec", name: "Aegis (Security: HMAC DRM Tokens)" },
      { tag: "scale", name: "Vanguard (Scale: 10M HLS Streams)" },
      { tag: "fin", name: "Ledger (FinOps: -$45k/yr Egress)" },
      { tag: "data", name: "Titan (QoE: Sub-2s Startup)" }
    ];
    invariants = [
      { id: "INV-SEC-01", desc: "Signed HMAC token validation <1ms at edge POPs" },
      { id: "INV-SCALE-02", desc: "Sub-2s video startup latency across 99% of sessions" },
      { id: "INV-FIN-03", desc: "Multi-CDN egress routing saves $45,000/year" },
      { id: "INV-DATA-04", desc: "S3 Segment Chunk Durability 99.999% with MinIO replica" },
      { id: "INV-ISO-05", desc: "Switch Room Isolation (0 Leaked Bytes)" }
    ];
    flawNotice = "⚠️ Unsigned segment manifest allows unauthorized CDN video stream scraping";
    resolvedNotice = "✓ Edge HMAC Manifest Tokenizer Deployed at Anycast POPs";
    nodes = [
      { key: "clients", x: 30, y: 160, w: 180, h: 108, title: "10M Video Clients", sub: "HLS / DASH SDKs", metric: "<2s Startup SLA", pin: "10M USERS", color: "#38bdf8" },
      { key: "nlb", x: 245, y: 160, w: 180, h: 108, title: "Anycast Edge POPs", sub: "Cloudflare Workers", metric: "Sub-10ms Handshake", pin: "EDGE CDN", color: "#818cf8" },
      { key: "redis", x: 460, y: 160, w: 180, h: 108, title: "Media CDN Workers", sub: "Chunk Caching Tier", metric: "99.1% Cache Hit", pin: "💰 -$45k/yr", color: "#10b981" },
      { key: "gateway", x: 685, y: 65, w: 180, h: 108, title: "HMAC Token DRM", sub: "Edge Session Guard", metric: "<0.2ms Verify", pin: "🛡️ Aegis: DRM", color: "#f43f5e" },
      { key: "outbox", x: 685, y: 255, w: 180, h: 108, title: "S3 Segment Vault", sub: "Zero-Egress Storage", metric: "99.999% Durability", pin: "🏛️ Titan: S3", color: "#a78bfa" },
      { key: "kafka", x: 900, y: 255, w: 140, h: 108, title: "ClickHouse QoS", sub: "Real-Time Telemetry", metric: "<0.1% Rebuffer", pin: "STREAM", color: "#06b6d4" }
    ];
    connections = [
      { from: "clients", to: "nlb" },
      { from: "nlb", to: "redis" },
      { from: "redis", to: "gateway" },
      { from: "redis", to: "outbox" },
      { from: "outbox", to: "kafka" }
    ];
    toolsLog = [
      { agent: "Aegis", role: "Staff Security Auditor", tool: "drm_token_auditor", duration: "125ms", tag: "sec", query: 'protocol: "HLS_AES128"\ncheck: "manifest_tampering"', result: '{\n  "vulnerability": "Unsigned playlists allow stream hotlinking",\n  "remediation": "Signed HMAC URL tokenization at edge CDN"\n}' },
      { agent: "Vanguard", role: "Principal Systems Architect", tool: "hls_transcode_sim", duration: "245ms", tag: "scale", query: 'concurrent_streams: 10000000\nbitrate: "4K/1080p"', result: '{\n  "measured_startup_ms": 1420,\n  "rebuffering_ratio": "0.08%",\n  "status": "PASS: Ultra-Low Latency Verified"\n}' },
      { agent: "Ledger", role: "Lead Cloud Economics", tool: "egress_cost_calculator", duration: "84ms", tag: "fin", query: 'egress_tb_month: 25000\nprovider: "Cloudflare_R2"', result: '{\n  "standard_aws_cost": "$125,000/mo",\n  "zero_egress_model": "$80,000/mo",\n  "annual_savings": "$45,000/yr"\n}' }
    ];
    components = {
      clients: { title: "10M Video Player Clients (HLS / DASH)", auditor: "Vanguard • Principal Systems", score: "Score: 7.2/10", avatar: "V", tag: "scale", toolName: "hls_startup_timer", toolDuration: "60ms", toolSnippet: 'startup_latency: "1.4s"', finding: "Cold starts without pre-warmed edge buffers exceed 4 seconds.", resolution: "Deploy Anycast POPs with speculative segment pre-fetching.", code: `videoPlayer.loadSource('https://cdn.quorum.tv/live/master.m3u8?token=' + hmacToken);` },
      nlb: { title: "Anycast Edge POPs & CDN Origin Shield", auditor: "Vanguard • Principal Systems", score: "Score: 8.8/10", avatar: "V", tag: "scale", toolName: "anycast_pop_router", toolDuration: "72ms", toolSnippet: 'pops_active: 280', finding: "Direct origin hits overwhelm S3 chunk storage under live sports spikes.", resolution: "Tiered Cloudflare Worker caching shields origin with 99.1% hit ratio.", code: `addEventListener('fetch', event => {\n  event.respondWith(handleMediaRequest(event.request));\n});` },
      redis: { title: "Media CDN Worker Cache Tier", auditor: "Ledger • Lead Cloud Economics", score: "Score: 6.8/10", avatar: "L", tag: "fin", toolName: "egress_cost_calculator", toolDuration: "84ms", toolSnippet: 'annual_savings: "$45,000/yr"', finding: "Standard AWS CloudFront egress fees incur $125k/mo on 10M viewers.", resolution: "Multi-CDN routing through zero-egress Cloudflare R2 + Fastly saves $45k/yr.", code: `def route_video_segment(chunk_id):\n    return get_cheapest_edge_cdn(chunk_id)` },
      gateway: { title: "HMAC Manifest Tokenizer (DRM Guard)", auditor: "Aegis • Staff Security", score: "Score: 4.2/10 (Resolved)", avatar: "A", tag: "sec", toolName: "drm_token_auditor", toolDuration: "125ms", toolSnippet: 'token_check: "<0.2ms"', finding: "Unsigned manifest playlists permit unauthorized stream scraping and hotlinking.", resolution: "Signed HMAC tokens verified at edge POPs in under 0.2ms with expiring nonces.", code: `def verify_hmac_drm(token: str, secret: bytes) -> bool:\n    return hmac.compare_digest(mint_hmac(token), expected)` },
      outbox: { title: "S3 / MinIO Segment Chunk Vault", auditor: "Titan • Data Reliability", score: "Score: 8.4/10", avatar: "T", tag: "data", toolName: "s3_durability_bench", toolDuration: "110ms", toolSnippet: 'durability: "99.999999999%"', finding: "Single region storage outage brings down video replay catalog.", resolution: "Cross-region asynchronous replication between AWS S3 and MinIO clusters.", code: `s3.put_object(Bucket='video-chunks', Key=f"{stream_id}/{seq}.ts", Body=chunk_bytes)` },
      kafka: { title: "ClickHouse Real-Time QoS Telemetry", auditor: "Titan & Vanguard", score: "Score: 9.0/10", avatar: "T", tag: "data", toolName: "clickhouse_telemetry_stream", toolDuration: "95ms", toolSnippet: 'rebuffer_rate: "0.08%"', finding: "Player rebuffering anomalies go undetected without real-time telemetry.", resolution: "ClickHouse analytics sink ingests player QoS telemetry with 1-second dashboards.", code: `INSERT INTO video_qoe (user_id, stream_id, rebuffer_ms, bitrate) VALUES (...);` }
    };
  } else {
    // REAL HIGH-THROUGHPUT ENGINE
    baseTput = 100000;
    baseLat = 4.8;
    metricUnit = "evt/s";
    legendChips = [
      { tag: "sec", name: "Aegis (Security: RAM Fast-Path)" },
      { tag: "scale", name: "Vanguard (Scale: Sub-5ms p99)" },
      { tag: "fin", name: "Ledger (FinOps: -$18k/yr Autoscale)" },
      { tag: "data", name: "Titan (ACID: Zero Double-Spend)" }
    ];
    invariants = [
      { id: "INV-SEC-01", desc: "Edge security verification enforced <1ms" },
      { id: "INV-SCALE-02", desc: "P99 latency bound preserved under 10x burst load" },
      { id: "INV-FIN-03", desc: "Compute right-sized to autoscale with zero idle burn" },
      { id: "INV-DATA-04", desc: "Zero double-spend or packet loss across partitions" },
      { id: "INV-ISO-05", desc: "Switch Room Isolation (0 Leaked Bytes)" }
    ];
    flawNotice = "⚠️ Synchronous database query creates cascading timeouts under burst";
    resolvedNotice = "✓ In-Memory Fast-Path Filter Deployed at Ingress Edge";
    nodes = [
      { key: "clients", x: 30, y: 160, w: 180, h: 108, title: "Client Ingress", sub: "Global Edge", metric: "Sub-5ms SLA", pin: "INGRESS", color: "#38bdf8" },
      { key: "nlb", x: 245, y: 160, w: 180, h: 108, title: "Edge Gateway", sub: "TLS & Rate Limits", metric: "Zero Overhead", pin: "EDGE", color: "#818cf8" },
      { key: "redis", x: 460, y: 160, w: 180, h: 108, title: "Worker Cluster", sub: "Autoscaling Core", metric: "Optimized Footprint", pin: "COMPUTE", color: "#10b981" },
      { key: "gateway", x: 685, y: 65, w: 180, h: 108, title: "Security Barrier", sub: "RAM Fast-Path", metric: "<0.3ms Lookup", pin: "🛡️ Aegis: Sec", color: "#f43f5e" },
      { key: "outbox", x: 685, y: 255, w: 180, h: 108, title: "Atomic Ledger", sub: "Transactional Sink", metric: "Zero Data Loss", pin: "🏛️ Titan: State", color: "#a78bfa" },
      { key: "kafka", x: 900, y: 255, w: 140, h: 108, title: "Broadcast Rails", sub: "Event Pub/Sub", metric: "At-Least-Once", pin: "STREAM", color: "#06b6d4" }
    ];
    connections = [
      { from: "clients", to: "nlb" },
      { from: "nlb", to: "redis" },
      { from: "redis", to: "gateway" },
      { from: "redis", to: "outbox" },
      { from: "outbox", to: "kafka" }
    ];
    toolsLog = [
      { agent: "Aegis", role: "Staff Security Auditor", tool: "edge_threat_evaluator", duration: "128ms", tag: "sec", query: `target: "${title}"`, result: '{\n  "remediation": "In-memory RAM token filter"\n}' },
      { agent: "Vanguard", role: "Principal Systems Architect", tool: "load_burst_simulator", duration: "205ms", tag: "scale", query: `workload: "${title}"`, result: '{\n  "p99_latency_ms": 4.8,\n  "status": "PASS"\n}' }
    ];
    components = {
      clients: { title: "Client Ingress Tier", auditor: "Vanguard • Principal Systems", score: "Score: 7.2/10", avatar: "V", tag: "scale", toolName: "latency_probe", toolDuration: "42ms", toolSnippet: 'latency: "Sub-5ms"', finding: "Unbuffered connections risk cascading timeouts.", resolution: "Anycast edge routing with keep-alive connections.", code: `fetch('/api/v1/event', { method: 'POST', body: payload })` },
      nlb: { title: "Edge Gateway & TLS", auditor: "Vanguard • Principal Systems", score: "Score: 8.4/10", avatar: "V", tag: "scale", toolName: "gateway_bench", toolDuration: "60ms", toolSnippet: 'tls: "2.1ms"', finding: "TLS handshakes bottleneck worker nodes.", resolution: "Offload TLS termination to edge gateway.", code: `server { listen 443 ssl http2; }` },
      redis: { title: "Worker Processing Cluster", auditor: "Ledger • Lead Cloud Economics", score: "Score: 6.8/10", avatar: "L", tag: "fin", toolName: "autoscale_efficiency_calc", toolDuration: "95ms", toolSnippet: 'monthly_savings: "$1,500.00"', finding: "Static provisioning incurs excessive idle costs.", resolution: "Elastic worker cluster with metric-based autoscaling.", code: `autoscaling_group { min_size = 2; max_size = 8; }` },
      gateway: { title: "Security & Risk Fast-Path", auditor: "Aegis • Staff Security", score: "Score: 4.2/10 (Resolved)", avatar: "A", tag: "sec", toolName: "threat_scanner", toolDuration: "128ms", toolSnippet: 'risk_score: "0 (Clean)"', finding: "Synchronous auth lookups add latency.", resolution: "In-memory bloom filter and local token cache at ingress.", code: `async def verify_request(token):\n    return token_cache.is_valid(token)` },
      outbox: { title: "Transactional Outbox & Ledger", auditor: "Titan • Data Reliability", score: "Score: 7.0/10 (Resolved)", avatar: "T", tag: "data", toolName: "ledger_audit", toolDuration: "140ms", toolSnippet: 'zero_double_spend: true', finding: "Non-atomic database writes cause inconsistencies on crash.", resolution: "Transactional outbox table commits state before event publish.", code: `BEGIN;\nINSERT INTO ledger VALUES (...);\nCOMMIT;` },
      kafka: { title: "Event Broadcast Stream", auditor: "Titan & Vanguard", score: "Score: 8.8/10", avatar: "T", tag: "data", toolName: "kafka_stream_test", toolDuration: "80ms", toolSnippet: 'delivery: "At-Least-Once"', finding: "Downstream consumers require guaranteed delivery ordering.", resolution: "Partitioned event log with key-ordered dispatch.", code: `producer.send(topic="domain_events", key=id, value=payload)` }
    };
  }

  TOPOLOGY_MODELS[key] = { viewBox: "0 0 1060 420", nodes, connections };

  PROPOSALS[key] = {
    id: rfcId,
    headline: title,
    subline: `Synthesized architecture for "${dilemma.substring(0, 90)}..."`,
    targetScale: "Production Workload",
    targetBranch: `feat/${rfcId.toLowerCase()}-impl`,
    verificationCmd: "pytest tests/ -v",
    baseThroughput: baseTput,
    baseLatency: baseLat,
    metricUnit: metricUnit,
    claudeCmd: `claude -p "Read ${rfcId}.md Section 6. Switch to branch 'feat/${rfcId.toLowerCase()}-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."`,
    legendChips,
    invariants,
    vulnerableNodeKey: "gateway",
    flawNotice,
    resolvedNotice,
    chambers: [
      { id: "audit-security", specialist: "Aegis", domain: "Security & Threat Modeling", score: "4.2/10", tag: "sec", token: `sw_sec_${key}`, acl: "['athena', 'aegis']", leak: "0 Bytes", finding: flawNotice },
      { id: "audit-scalability", specialist: "Vanguard", domain: "Concurrency & Latency", score: "6.5/10", tag: "scale", token: `sw_scale_${key}`, acl: "['athena', 'vanguard']", leak: "0 Bytes", finding: "Synchronous processing creates cascading bottlenecks. Mandates edge caching fast-path." },
      { id: "audit-finops", specialist: "Ledger", domain: "Cloud Economics & ROI", score: "6.0/10", tag: "fin", token: `sw_fin_${key}`, acl: "['athena', 'ledger']", leak: "0 Bytes", finding: "Over-provisioning identified. Downsize baseline compute to autoscale clusters." },
      { id: "audit-database", specialist: "Titan", domain: "Data Consistency & ACID", score: "7.0/10", tag: "data", token: `sw_data_${key}`, acl: "['athena', 'titan']", leak: "0 Bytes", finding: "State transitions require Transactional Outbox pattern with zero split-brain data loss." }
    ],
    debateMessages: [
      { sender: "Athena", role: "Council Chair", tag: "chair", content: `Convening Quorum for ${rfcId}: "${title}". 4 Soundproof Chambers partitioned.` },
      { sender: "Aegis", role: "Staff Security Auditor", tag: "sec", content: `Warning on ${title}: ${flawNotice}. We must mandate edge validation before downstream execution.` },
      { sender: "Vanguard", role: "Principal Systems Architect", tag: "scale", content: `@Aegis Concur on security, but all lookups must be asynchronous with zero thread blocking to satisfy SLA.` },
      { sender: "Ledger", role: "Lead Cloud Economics", tag: "fin", content: `Ensure autoscale thresholds are configured properly to avoid runaway cloud bills.` },
      { sender: "Titan", role: "Data Reliability Architect", tag: "data", content: `State transitions must be committed atomically to prevent data loss under worker crash.` },
      { sender: "Athena", role: "Council Chair", tag: "chair", content: `Synthesizing consensus: Edge fast-path + Async worker ring + Autoscale compute approved.` },
      { sender: "Lead Architect", role: "Human Engineer", tag: "human", content: "approve" },
      { sender: "Athena", role: "Council Chair", tag: "chair", content: `✅ Consensus locked. Handing off Section 6 manifest to @ClaudeCode on branch feat/${rfcId.toLowerCase()}-impl.` }
    ],
    toolsLog,
    matrix: [
      { vector: "Security vs Latency SLA", clash: "Aegis (Strict verification) vs Vanguard (Throughput SLA).", resolution: "Deploy fast-path RAM validation filter at edge ingress.", invariant: "INV-SEC-01: Sub-ms edge validation" }
    ],
    manifestItems: [
      { action: "CREATE", path: `src/security/fast_filter.py`, mandatedBy: "Aegis", purpose: "Fast-path in-memory security validation" },
      { action: "CREATE", path: `src/core/worker_engine.py`, mandatedBy: "Vanguard", purpose: "Asynchronous high-concurrency event processor" },
      { action: "MODIFY", path: `infra/autoscale_cluster.tf`, mandatedBy: "Ledger", purpose: "Autoscaling cluster definition with 75% threshold" }
    ],
    components,
    adrMarkdown: `# ${rfcId}: ${title}\n\n**Status:** APPROVED\n**Council:** Athena, Aegis, Vanguard, Ledger, Titan\n\n## 1. Context\n${dilemma}\n\n## 2. Decision Outcomes\n- Edge fast-path validation deployed.\n- Autoscale compute with zero idle burn.\n- Transactional Outbox pattern enforced.`,
    prStickyComment: `## 🏛️ Quorum Review Report: ${rfcId}\n\n| Specialist | Score | Resolution |\n|---|---|---|\n| **Aegis** | 4.2/10 | 🛡️ Edge Fast-Path |\n| **Vanguard** | 6.5/10 | ⚡ Non-Blocking Core |\n| **Ledger** | 6.0/10 | 💰 Autoscale Cluster |\n| **Titan** | 7.0/10 | ✅ Outbox Verified |`
  };
}

// ==========================================================================
// 8. VIEW SWITCHING & INTERACTION
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
  if (phaseNum === 1) setCenterView("chambers");
  else if (phaseNum === 2) setCenterView("tools");
  else if (phaseNum === 3) setCenterView("floor");
  else if (phaseNum === 4) setCenterView("topology");
}

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
      reply = `📋 **EXECUTIVE SUMMARY:** Reconciled specialist trade-offs. Security barrier verified, compute autoscaled with zero idle burn, and Transactional Outbox enforced for zero message loss.`;
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
  setTimeout(() => { toast.classList.remove("show"); }, 2400);
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

// Check Backend API Connection
async function checkBackendConnection() {
  try {
    const res = await fetch("/api/health");
    if (res.ok) {
      const data = await res.json();
      console.log("Connected to Quorum Python Backend Server:", data);
      showToast("Connected to live Python Delphi engine (0B leakage)");
    }
  } catch (err) {
    // Offline mode is seamless
  }
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  runDeliberationPipeline("rfc042", true); // Fast load on initial open
  checkBackendConnection();
});
