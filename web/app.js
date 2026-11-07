/**
 * BlindCouncil Studio — Production Architecture Workbench Logic
 * Displays interactive visual topology, live agent tool calls, tension matrix, and code scaffolding.
 */

const PROPOSALS = {
  rfc042: {
    id: "RFC-042",
    headline: "100,000 WebSocket Messaging Fabric",
    targetBranch: "feat/adr-042-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."`,
    diagramImg: "diagram_rfc042_resolved.png",
    specialists: [
      { key: "sec", name: "Aegis", domain: "Threat Modeling & Auth", score: "4.5/10", tag: "sec", role: "Staff Security Auditor" },
      { key: "scale", name: "Vanguard", domain: "Concurrency & p99 Latency", score: "6.8/10", tag: "scale", role: "Principal Systems Architect" },
      { key: "fin", name: "Ledger", domain: "Cloud Economics & ROI", score: "6.0/10", tag: "fin", role: "Lead Cloud Economics" },
      { key: "data", name: "Titan", domain: "State Consistency & ACID", score: "7.2/10", tag: "data", role: "Data Reliability Architect" }
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
    components: {
      clients: {
        title: "100k Sockets Clients Tier",
        auditor: "Vanguard • Scale",
        score: "Score: 6.8/10",
        avatar: "V",
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
        auditor: "Vanguard • Scale",
        score: "Score: 9.0/10",
        avatar: "V",
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
        auditor: "Aegis • Security",
        score: "Score: 4.5/10 (Resolved)",
        avatar: "A",
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
        auditor: "Ledger • FinOps",
        score: "Score: 6.0/10 (Resolved)",
        avatar: "L",
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
        auditor: "Titan • State Reliability",
        score: "Score: 7.2/10 (Resolved)",
        avatar: "T",
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
    manifest: [
      { action: "CREATE", path: "src/middleware/bloom_revocation.py", purpose: "Redis Bloom filter revocation middleware (Mandated by Aegis & Vanguard)" },
      { action: "CREATE", path: "src/cluster/config.yaml", purpose: "4-node cluster autoscaling spec saving $25,200/year (Mandated by Ledger)" },
      { action: "CREATE", path: "src/db/outbox_producer.py", purpose: "Transactional Outbox pattern event producer (Mandated by Titan)" }
    ],
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

*Generated by BlindCouncil.*`
  },

  rfc019: {
    id: "RFC-019",
    headline: "Global Scalable URL Shortener (10B Keys)",
    targetBranch: "feat/adr-019-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-019.md Section 6. Switch to branch 'feat/adr-019-impl'. Implement Base62 collision-free ID generator with Redis cluster cache and Cassandra persistent tier. Run 'pytest tests/ -v'."`,
    diagramImg: "diagram_rfc042_resolved.png",
    specialists: [
      { key: "sec", name: "Aegis", domain: "Abuse & Link Scraping", score: "5.2/10", tag: "sec", role: "Staff Security Auditor" },
      { key: "scale", name: "Vanguard", domain: "50k QPS Key Generation", score: "7.0/10", tag: "scale", role: "Principal Systems Architect" },
      { key: "fin", name: "Ledger", domain: "Telemetry Tiering ROI", score: "6.5/10", tag: "fin", role: "Lead Cloud Economics" },
      { key: "data", name: "Titan", domain: "Cross-Region Pinning", score: "8.1/10", tag: "data", role: "Data Reliability Architect" }
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
        invariant: "INV-FIN-02: Analytics storage decoupled from OLTP database"
      }
    ],
    components: {
      clients: {
        title: "Global HTTP Redirect Clients",
        auditor: "Vanguard • Scale",
        score: "Score: 7.0/10",
        avatar: "V",
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
        auditor: "Vanguard • Scale",
        score: "Score: 8.5/10",
        avatar: "V",
        toolName: "dns_anycast_eval",
        toolDuration: "55ms",
        toolSnippet: 'routing: "LatencyBased"\nhandshake_overhead: "<12ms"',
        finding: "Edge DNS routing clients to nearest regional data center.",
        resolution: "Latency-based routing reduces handshake to <15ms.",
        code: `RoutingPolicy: LatencyBased
TTL: 60`
      },
      gateway: {
        title: "Distributed Key Generation Service (KGS)",
        auditor: "Aegis • Security",
        score: "Score: 5.2/10 (Resolved)",
        avatar: "A",
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
        auditor: "Ledger • FinOps",
        score: "Score: 6.5/10 (Resolved)",
        avatar: "L",
        toolName: "cache_hit_ratio_sim",
        toolDuration: "90ms",
        toolSnippet: 'hit_ratio: "84.2%"\nmemory_bound: "32GB"',
        finding: "80/20 rule: top 20% URLs receive 80% of click traffic.",
        resolution: "Memory cache prevents database reads for hot links.",
        code: `maxmemory-policy allkeys-lru`
      },
      outbox: {
        title: "Cassandra + ClickHouse Sinks",
        auditor: "Titan • State Reliability",
        score: "Score: 8.1/10",
        avatar: "T",
        toolName: "clickhouse_compression_calc",
        toolDuration: "115ms",
        toolSnippet: 'compression_ratio: "14:1"\nannual_savings: "$14,000/yr"',
        finding: "Telemetry retention in OLTP database inflates storage costs by 400%.",
        resolution: "Decouple click streams into ClickHouse with 90-day TTL.",
        code: `ALTER TABLE click_events MODIFY TTL click_time + INTERVAL 90 DAY;`
      }
    },
    manifest: [
      { action: "CREATE", path: "src/kgs/range_allocator.py", purpose: "Base62 distributed key generation range coordinator" },
      { action: "CREATE", path: "src/cache/lru_tier.py", purpose: "Redis hot-tier cache with 80/20 memory eviction policy" },
      { action: "CREATE", path: "src/security/safe_browsing.py", purpose: "Asynchronous anti-malware and link reputation validator" }
    ],
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

---

## 3. Scaffolding Manifest
- \`src/kgs/range_allocator.py\`
- \`src/cache/lru_tier.py\`
- \`src/security/safe_browsing.py\`

*Generated by BlindCouncil.*`
  },

  rfc088: {
    id: "RFC-088",
    headline: "Multi-Region Payment Processing Service",
    targetBranch: "feat/adr-088-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-088.md Section 6. Switch to branch 'feat/adr-088-impl'. Implement idempotency key middleware with DynamoDB TTL and distributed two-phase saga coordinator. Run 'pytest tests/ -v'."`,
    diagramImg: "diagram_rfc042_resolved.png",
    specialists: [
      { key: "sec", name: "Aegis", domain: "PCI-DSS Level 1 Auth", score: "3.8/10", tag: "sec", role: "Staff Security Auditor" },
      { key: "scale", name: "Vanguard", domain: "Active-Active Idempotency", score: "6.2/10", tag: "scale", role: "Principal Systems Architect" },
      { key: "fin", name: "Ledger", domain: "Interchange Cost Routing", score: "5.8/10", tag: "fin", role: "Lead Cloud Economics" },
      { key: "data", name: "Titan", domain: "Saga Compensations", score: "6.5/10", tag: "data", role: "Data Reliability Architect" }
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
        invariant: "INV-SEC-02: Zero raw cardholder PAN exposure in application memory"
      },
      {
        vector: "Cross-Region Locking vs Checkout Speed",
        clash: "Titan (Global locks to prevent double-charging) vs Vanguard (800ms cross-region latency).",
        resolution: "Regional idempotency leases with conditional writes in DynamoDB global tables.",
        invariant: "INV-SCALE-03: Sub-50ms checkout authorization latency"
      }
    ],
    components: {
      clients: {
        title: "Checkout Client Apps (Web / iOS)",
        auditor: "Vanguard • Scale",
        score: "Score: 6.2/10",
        avatar: "V",
        toolName: "regional_handshake_timer",
        toolDuration: "45ms",
        toolSnippet: 'client_edge: "Cloudflare Anycast"\nlatency: "14ms"',
        finding: "Cross-region latency spikes cause shopping cart abandonment.",
        resolution: "Regional client endpoint with local TLS handshake.",
        code: `fetch('/api/pay', { headers: { 'Idempotency-Key': uuid() } })`
      },
      nlb: {
        title: "Perimeter Tokenization Vault (HSM)",
        auditor: "Aegis • Security",
        score: "Score: 3.8/10 (Resolved)",
        avatar: "A",
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
        auditor: "Vanguard • Scale",
        score: "Score: 6.2/10 (Resolved)",
        avatar: "V",
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
        auditor: "Ledger • FinOps",
        score: "Score: 5.8/10 (Resolved)",
        avatar: "L",
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
        auditor: "Titan • State Reliability",
        score: "Score: 6.5/10 (Resolved)",
        avatar: "T",
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
    manifest: [
      { action: "CREATE", path: "src/payment/idempotency_guard.py", purpose: "Distributed idempotency filter with DynamoDB conditional write" },
      { action: "CREATE", path: "src/saga/payment_coordinator.py", purpose: "Two-phase saga state machine with automatic compensations" },
      { action: "CREATE", path: "src/routing/smart_interchange.py", purpose: "Least-cost payment gateway router saving $38,000/year" }
    ],
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

---

## 3. Scaffolding Manifest
- \`src/payment/idempotency_guard.py\`
- \`src/saga/payment_coordinator.py\`
- \`src/routing/smart_interchange.py\`

*Generated by BlindCouncil.*`
  }
};

let currentProposalKey = "rfc042";
let currentPhase = 3;
let isPlaying = false;
let playInterval = null;

// 1. Proposal Switcher
function switchProposal(key) {
  if (!PROPOSALS[key]) return;
  currentProposalKey = key;
  const p = PROPOSALS[key];

  document.getElementById("prop-headline").textContent = p.headline;

  // Specialists List
  const spList = document.getElementById("specialists-list");
  spList.innerHTML = p.specialists.map(sp => `
    <div class="specialist-row ${sp.key === 'sec' ? 'active' : ''}" onclick="selectSpecialist('${sp.key}')" id="sp-row-${sp.key}">
      <div class="sp-top">
        <span class="sp-name">${sp.name}</span>
        <span class="sp-score ${sp.tag}">${sp.score}</span>
      </div>
      <div class="sp-domain">${sp.domain}</div>
    </div>
  `).join("");

  // Live Tools Stream
  const toolsContainer = document.getElementById("tools-stream-container");
  if (toolsContainer && p.toolsLog) {
    toolsContainer.innerHTML = p.toolsLog.map(t => `
      <div class="tool-log-card">
        <div class="tool-log-header">
          <div class="tool-agent-badge">
            <span class="sp-score ${t.tag}">${t.agent}</span>
            <span>${t.role}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="tool-tag">${t.tool}</span>
            <span class="tool-duration">${t.duration}</span>
          </div>
        </div>
        <div class="tool-call-body">
          <div class="tool-call-box">
            <span style="color:#64748b;">// Tool Arguments</span><br>
            ${t.query.replace(/\n/g, '<br>')}
          </div>
          <div class="tool-result-box">
            <span style="color:#64748b;">// Tool Output Payload</span><br>
            <pre style="margin:0; font-family:var(--font-mono); font-size:11px;">${t.result}</pre>
          </div>
        </div>
      </div>
    `).join("");
  }

  // Matrix Table
  const matrixTbody = document.getElementById("studio-matrix-rows");
  matrixTbody.innerHTML = p.matrix.map(m => `
    <tr>
      <td><strong>${m.vector}</strong></td>
      <td>${m.clash}</td>
      <td>${m.resolution}</td>
      <td><code>${m.invariant}</code></td>
    </tr>
  `).join("");

  // ADR Sheet
  document.getElementById("adr-sheet-content").innerHTML = renderMarkdown(p.adrMarkdown);

  // Dock Scaffolding
  const scaffoldGrid = document.getElementById("scaffold-grid");
  scaffoldGrid.innerHTML = p.manifest.map(m => `
    <div class="scaffold-card">
      <div class="scaffold-card-top">
        <span class="action-pill">${m.action}</span>
        <code>${m.path}</code>
      </div>
      <p>${m.purpose}</p>
    </div>
  `).join("");

  // Dock Terminal
  document.getElementById("term-branch").textContent = `git checkout -b ${p.targetBranch}`;
  document.getElementById("term-test").textContent = p.verificationCmd;
  document.getElementById("term-cli-cmd").textContent = p.claudeCmd;

  // Select Default Node (Gateway)
  selectNode("gateway");
}

// 2. Select Node on Interactive Graph
function selectNode(nodeKey) {
  const p = PROPOSALS[currentProposalKey];
  const comp = p.components[nodeKey];
  if (!comp) return;

  // Highlight active node in graph
  document.querySelectorAll(".arch-node").forEach(node => {
    node.classList.remove("active");
  });
  const activeNode = document.querySelector(`.arch-node[onclick="selectNode('${nodeKey}')"]`);
  if (activeNode) activeNode.classList.add("active");

  // Update Right Inspector Drawer
  document.getElementById("insp-title").textContent = comp.title;
  document.getElementById("insp-auditor-avatar").textContent = comp.avatar;
  document.getElementById("insp-auditor-name").textContent = comp.auditor;
  document.getElementById("insp-auditor-score").textContent = comp.score;
  document.getElementById("insp-finding").textContent = comp.finding;
  document.getElementById("insp-resolution").textContent = comp.resolution;
  document.getElementById("insp-code-snippet").textContent = comp.code;

  // Update Tool Call Trace in Inspector
  if (comp.toolName) {
    document.getElementById("insp-tool-name").textContent = comp.toolName;
    document.getElementById("insp-tool-duration").textContent = comp.toolDuration || "120ms";
    document.getElementById("insp-tool-snippet").textContent = comp.toolSnippet || "";
  }
}

// 3. Select Specialist
function selectSpecialist(spKey) {
  document.querySelectorAll(".specialist-row").forEach(r => r.classList.remove("active"));
  const row = document.getElementById(`sp-row-${spKey}`);
  if (row) row.classList.add("active");

  // Map specialist to primary node
  if (spKey === "sec") selectNode("gateway");
  else if (spKey === "scale") selectNode("clients");
  else if (spKey === "fin") selectNode("redis");
  else if (spKey === "data") selectNode("outbox");
}

// 4. Stepper & Phase Jump
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
    tag.textContent = "PHASE 1 OF 4";
    title.textContent = "Isolated Blind Chamber Audits (0 Cross-Leakage Verified)";
    setCenterView("tools");
    selectSpecialist("sec");
  } else if (phaseNum === 2) {
    tag.textContent = "PHASE 2 OF 4";
    title.textContent = "Specialist Tension Matrix & Trade-off Deliberation";
    setCenterView("matrix");
  } else if (phaseNum === 3) {
    tag.textContent = "PHASE 3 OF 4";
    title.textContent = "Synthesized Architecture Topology (Vector Verification)";
    setCenterView("topology");
    selectNode("gateway");
  } else if (phaseNum === 4) {
    tag.textContent = "PHASE 4 OF 4";
    title.textContent = "Autonomous Implementer Handoff (Claude Code / Codex)";
    setCenterView("adr");
    switchDockTab("terminal");
  }
}

// 5. Play / Pause Deliberation Animation
function togglePlayDeliberation() {
  const btnText = document.getElementById("play-btn-text");
  if (isPlaying) {
    clearInterval(playInterval);
    isPlaying = false;
    btnText.textContent = "Play Review";
  } else {
    isPlaying = true;
    btnText.textContent = "Pause Review";
    playInterval = setInterval(() => {
      let nextPhase = (currentPhase % 4) + 1;
      jumpToPhase(nextPhase);
    }, 2800);
  }
}

// 6. View Switcher in Stage
function setCenterView(viewId) {
  document.querySelectorAll(".stage-toggle-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-view") === viewId) btn.classList.add("active");
  });

  document.querySelectorAll(".canvas-view").forEach(v => v.classList.remove("active"));
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.add("active");
}

// 7. Dock Tab Switcher
function switchDockTab(dockId) {
  document.querySelectorAll(".dock-tab").forEach(tab => {
    tab.classList.remove("active");
    if (tab.getAttribute("data-dock") === dockId) tab.classList.add("active");
  });

  document.querySelectorAll(".dock-panel").forEach(p => p.classList.remove("active"));
  const target = document.getElementById(`dock-${dockId}`);
  if (target) target.classList.add("active");
}

// 8. Clipboard & Export
function copyHandoffCommand() {
  const cmd = PROPOSALS[currentProposalKey].claudeCmd;
  navigator.clipboard.writeText(cmd).then(() => {
    showToast("Terminal execution command copied to clipboard.");
  }).catch(() => {
    showToast("Command copied.");
  });
}

function exportADR() {
  const md = PROPOSALS[currentProposalKey].adrMarkdown;
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${PROPOSALS[currentProposalKey].id}_Architecture_Decision_Record.md`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${PROPOSALS[currentProposalKey].id}_Architecture_Decision_Record.md`);
}

function showToast(text) {
  let toast = document.getElementById("studio-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "studio-toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #1e2328;
      color: #fff;
      border-radius: 6px;
      padding: 9px 16px;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
      z-index: 99999;
      opacity: 0;
      transform: translateY(8px);
      transition: all 0.2s ease;
      font-family: var(--font-sans);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
  }, 2200);
}

function renderMarkdown(md) {
  return md
    .replace(/^# (.*$)/gim, '<h2 style="font-size:16px; margin:14px 0 6px; color:#1e2328;">$1</h2>')
    .replace(/^## (.*$)/gim, '<h3 style="font-size:13.5px; margin:12px 0 4px; color:#0969da;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/^\- (.*$)/gim, '<li style="margin-left:16px; margin-bottom:2px;">$1</li>')
    .replace(/\n$/gim, '<br>');
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  switchProposal("rfc042");
  jumpToPhase(3);
});
