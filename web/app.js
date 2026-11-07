/**
 * BlindCouncil — Minimalist Review Desk Logic
 */

const DATA = {
  rfc042: {
    id: "RFC-042",
    title: "RFC-042: Real-time messaging cluster (100k sockets)",
    lede: "Replacing legacy HTTP long-polling with an auto-scaling WebSocket ingress tier and Redis cluster backplane.",
    meta: "RFC-042 · Opened yesterday by infra-core · 4 specialists reviewing",
    branch: "feat/adr-042-impl",
    testCmd: "pytest tests/ -v",
    cliCmd: `claude -p "Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."`,
    topoImg: "diagram_rfc042_resolved.png",
    docBody: `
      <h2>1. Workload characteristics</h2>
      <p>HTTP long-polling has reached memory limits on our existing service tier. We require a persistent duplex connection tier capable of serving 100,000 concurrent sockets with p99 delivery latency under 20 milliseconds.</p>

      <h2>2. Authentication and session lifecycle</h2>
      <p>Clients connect to an AWS Network Load Balancer terminating TLS 1.3 and forwarding TCP frames to an Envoy proxy fleet. During the HTTP-to-WebSocket upgrade handshake, the client submits a short-lived bearer token.</p>
      
      <div class="doc-callout flagged">
        <strong>Flagged for Security:</strong> Tokens are renewed in-band every 15 minutes during regular ping/pong heartbeats. The gateway does not query revocation state between refresh intervals.
      </div>

      <h2>3. Cluster sizing and memory provisioning</h2>
      <p>To support cross-node channel broadcast and 24-hour retention buffers, we propose deploying 12 dedicated Redis Enterprise nodes (<code>cache.r6g.2xlarge</code>).</p>
      
      <div class="doc-callout flagged">
        <strong>Flagged for FinOps:</strong> Baseline traffic is 20,000 off-peak sockets. 12 dedicated instances incur an unvarying $42,000/year cost regardless of actual utilization.
      </div>

      <h2>4. Storage tier and event delivery</h2>
      <p>Messages written to Redis Streams are simultaneously inserted into the relational Postgres database via asynchronous worker threads.</p>

      <div class="doc-callout flagged">
        <strong>Flagged for Data Reliability:</strong> Dual-writing without an atomic boundary exposes the cluster to message drops if a worker process crashes between writes.
      </div>
    `,
    threads: [
      {
        author: "Aegis",
        initial: "A",
        role: "Security",
        tag: "Blocker",
        tagClass: "blocker",
        body: "The 15-minute in-band refresh window means that after a user is suspended or a credential is leaked, their active socket stays open until the cycle expires. Under SOC2 Article 4, revocation must be immediate.",
        mandate: "Sub-millisecond revocation lookup in RAM before accepting WebSocket frames."
      },
      {
        author: "Vanguard",
        initial: "V",
        role: "Scalability",
        tag: "Conditional",
        tagClass: "conditional",
        body: "If Aegis's revocation check hits Postgres on every heartbeat across 100k connections, it will exhaust connection pools during pod restarts. Any revocation validation must reside strictly in cluster memory.",
        mandate: "Redis Bloom filter bitset at gateway edge (<0.2ms latency, zero database queries)."
      },
      {
        author: "Ledger",
        initial: "L",
        role: "FinOps",
        tag: "Conditional",
        tagClass: "conditional",
        body: "12 dedicated nodes for a 20k baseline is oversized. Provision 4 primary nodes with autoscaling alarms triggered at 75% memory. Handles 20k to 100k while saving $25,200 annually.",
        mandate: "Downsize cluster to 4 nodes with 75% memory autoscaling threshold."
      },
      {
        author: "Titan",
        initial: "T",
        role: "Data Reliability",
        tag: "Conditional",
        tagClass: "conditional",
        body: "Direct dual-writing to Redis and Postgres is an anti-pattern. If a worker pod crashes mid-execution, chat history desynchronizes. Adopt the Transactional Outbox pattern.",
        mandate: "Commit events to outbox table inside the state transaction; stream via Debezium CDC."
      }
    ],
    matrix: [
      { auditor: "Aegis", domain: "Security & Threat Modeling", score: "4.5 / 10", finding: "15m unrevoked session window fails SOC2 Article 4", resolution: "Edge Redis Bloom filter bitset check (<0.2ms)" },
      { auditor: "Vanguard", domain: "Scalability & Concurrency", score: "6.8 / 10", finding: "Synchronous DB checks crash connection pools at 100k", resolution: "In-memory Bloom filter with zero DB queries" },
      { auditor: "Ledger", domain: "FinOps & Cloud Economics", score: "6.0 / 10", finding: "12 static nodes waste $25,200/yr during off-peak", resolution: "4 nodes with 75% memory autoscaling" },
      { auditor: "Titan", domain: "Data & State Reliability", score: "7.2 / 10", finding: "Dual-write race causes message loss on worker crash", resolution: "Transactional Outbox pattern + Debezium CDC" }
    ],
    manifest: [
      { action: "CREATE", path: "src/middleware/bloom_revocation.py", desc: "Redis Bloom filter revocation middleware (Mandated by Aegis & Vanguard)" },
      { action: "CREATE", path: "src/cluster/config.yaml", desc: "4-node cluster autoscaling spec saving $25,200/year (Mandated by Ledger)" },
      { action: "CREATE", path: "src/db/outbox_producer.py", desc: "Transactional Outbox pattern producer (Mandated by Titan)" }
    ],
    adrContent: `
      <h2>1. Context and Problem Statement</h2>
      <p>HTTP long-polling creates unacceptable latency and memory overhead. We are migrating to a persistent WebSocket cluster serving 100k concurrent connections.</p>

      <h2>2. Decision and Invariants</h2>
      <p>We approve the proposal with three architectural conditions:</p>
      <p><strong>1. Revocation SLA:</strong> Revocation status is validated on every heartbeat via a local Redis Bloom filter in sub-0.2ms RAM, avoiding central database queries.</p>
      <p><strong>2. Cluster Right-Sizing:</strong> The cluster launches with 4 nodes of <code>cache.r6g.xlarge</code> with horizontal autoscaling triggers at 75% memory load, reducing cost by $25,200 annually.</p>
      <p><strong>3. Outbox Pattern:</strong> Persistence guarantees are enforced by committing events to a Postgres <code>outbox_events</code> table within the business transaction, streaming downstream via Debezium CDC.</p>

      <h2>3. Scaffolding Files</h2>
      <p>Implementation files generated in Section 6 manifest:</p>
      <p><code>src/middleware/bloom_revocation.py</code><br><code>src/cluster/config.yaml</code><br><code>src/db/outbox_producer.py</code></p>
    `
  },

  rfc019: {
    id: "RFC-019",
    title: "RFC-019: Global scalable URL shortener (10B keys)",
    lede: "High-throughput Base62 key generation with tiered Redis cache and Cassandra persistent store.",
    meta: "RFC-019 · Opened 3 days ago by infra-core · 4 specialists reviewing",
    branch: "feat/adr-019-impl",
    testCmd: "pytest tests/ -v",
    cliCmd: `claude -p "Read ADR-019.md Section 6. Switch to branch 'feat/adr-019-impl'. Implement Base62 collision-free ID generator with Redis cluster cache and Cassandra persistent tier. Run 'pytest tests/ -v'."`,
    topoImg: "diagram_rfc042_resolved.png",
    docBody: `
      <h2>1. Workload Scope</h2>
      <p>Designing a URL shortening service for 10 Billion distinct links with a read:write ratio of 100:1 and 50,000 requests per second.</p>

      <h2>2. Key Generation Strategy</h2>
      <p>Proposal utilizes standard SQL auto-increment IDs converted to Base62 strings on ingest.</p>
      <div class="doc-callout flagged">
        <strong>Flagged for Scalability:</strong> Centralized auto-increment sequence creates a lock bottleneck at 50k QPS and exposes link enumeration attack surface.
      </div>

      <h2>3. Analytics and Telemetry</h2>
      <p>Click telemetry events are written directly to the relational primary database for 365 days.</p>
      <div class="doc-callout flagged">
        <strong>Flagged for FinOps:</strong> Storing raw telemetry in primary transactional storage increases disk footprint by 400%, adding $14,000/year in unnecessary IOPS.
      </div>
    `,
    threads: [
      {
        author: "Aegis",
        initial: "A",
        role: "Security",
        tag: "Conditional",
        tagClass: "conditional",
        body: "Sequential Base62 IDs allow scrapers to enumerate and harvest private links. Range allocation must be shuffled.",
        mandate: "Randomized range shuffle in distributed Key Generation Service."
      },
      {
        author: "Vanguard",
        initial: "V",
        role: "Scalability",
        tag: "Conditional",
        tagClass: "conditional",
        body: "A single auto-increment database lock cannot sustain 50,000 writes/sec. Adopt a distributed pre-allocated KGS.",
        mandate: "Pre-allocate 1,000,000 key ranges per node via distributed coordinator."
      },
      {
        author: "Ledger",
        initial: "L",
        role: "FinOps",
        tag: "Conditional",
        tagClass: "conditional",
        body: "Retaining click telemetry indefinitely in primary transactional storage wastes $14,000/year in high-performance SSD volume fees.",
        mandate: "Stream click events to ClickHouse/S3 with a 90-day cold retention lifecycle."
      },
      {
        author: "Titan",
        initial: "T",
        role: "Data Reliability",
        tag: "Conditional",
        tagClass: "conditional",
        body: "Replication delay between regions causes 404 errors for links clicked immediately in another continent.",
        mandate: "Read-your-own-writes session routing to origin region."
      }
    ],
    matrix: [
      { auditor: "Aegis", domain: "Security & Abuse", score: "5.2 / 10", finding: "Sequential Base62 IDs allow scraping enumeration", resolution: "Randomized key range shuffle" },
      { auditor: "Vanguard", domain: "Distributed Scalability", score: "7.0 / 10", finding: "Auto-increment lock bottlenecks at 50k QPS", resolution: "Distributed pre-allocated KGS" },
      { auditor: "Ledger", domain: "Cloud Economics & FinOps", score: "6.5 / 10", finding: "Telemetry in primary DB wastes $14,000/yr", resolution: "ClickHouse tiering with 90-day retention" },
      { auditor: "Titan", domain: "Data & State Reliability", score: "8.1 / 10", finding: "Cross-region replication returns 404s on new links", resolution: "Read-your-own-writes session stickiness" }
    ],
    manifest: [
      { action: "CREATE", path: "src/kgs/range_allocator.py", desc: "Base62 distributed key generation range coordinator" },
      { action: "CREATE", path: "src/cache/lru_tier.py", desc: "Redis hot-tier cache with 80/20 memory eviction policy" },
      { action: "CREATE", path: "src/security/safe_browsing.py", desc: "Asynchronous anti-malware and link reputation validator" }
    ],
    adrContent: `
      <h2>1. Context and Problem Statement</h2>
      <p>URL shortening tier requires 10B keys capacity with sub-10ms redirect latency.</p>

      <h2>2. Decision</h2>
      <p>Adopt distributed Key Generation Service with pre-allocated shuffled ranges. Telemetry streamed to ClickHouse.</p>

      <h2>3. Scaffolding Files</h2>
      <p><code>src/kgs/range_allocator.py</code><br><code>src/cache/lru_tier.py</code><br><code>src/security/safe_browsing.py</code></p>
    `
  },

  rfc088: {
    id: "RFC-088",
    title: "RFC-088: Multi-region payment service",
    lede: "Active-active multi-region payment gateway with automated provider failover across Stripe, Adyen, and Chase.",
    meta: "RFC-088 · Opened 5 days ago by fintech-core · 4 specialists reviewing",
    branch: "feat/adr-088-impl",
    testCmd: "pytest tests/ -v",
    cliCmd: `claude -p "Read ADR-088.md Section 6. Switch to branch 'feat/adr-088-impl'. Implement idempotency key middleware with DynamoDB TTL and distributed two-phase saga coordinator. Run 'pytest tests/ -v'."`,
    topoImg: "diagram_rfc042_resolved.png",
    docBody: `
      <h2>1. Architecture Scope</h2>
      <p>Designing an active-active payment gateway with sub-1000ms SLA and zero duplicate transaction execution.</p>

      <h2>2. Telemetry and Audit Logs</h2>
      <p>Incoming request payloads are logged to Elasticsearch for customer support troubleshooting.</p>
      <div class="doc-callout flagged">
        <strong>Flagged for Security:</strong> Raw request logging writes unmasked cardholder metadata to search indices, violating PCI-DSS Requirement 3.4.
      </div>

      <h2>3. Idempotency Guarantees</h2>
      <p>Cross-region distributed locks synchronize payment authorization across AWS us-east-1 and eu-west-1.</p>
      <div class="doc-callout flagged">
        <strong>Flagged for Scalability:</strong> Cross-region lock acquisition adds 800ms of network latency to transaction checkout times.
      </div>
    `,
    threads: [
      {
        author: "Aegis",
        initial: "A",
        role: "Security & PCI-DSS",
        tag: "Blocker",
        tagClass: "blocker",
        body: "Logging raw cardholder metadata violates PCI-DSS Level 1. This is a non-negotiable merge blocker.",
        mandate: "Zero-knowledge perimeter tokenization before payloads enter service tier."
      },
      {
        author: "Vanguard",
        initial: "V",
        role: "Scalability",
        tag: "Conditional",
        tagClass: "conditional",
        body: "Cross-region locking introduces 800ms latency spikes. Adopt regional idempotency leases with DynamoDB global tables.",
        mandate: "Regional idempotency lease with monotonic timestamp fencing."
      },
      {
        author: "Ledger",
        initial: "L",
        role: "FinOps",
        tag: "Conditional",
        tagClass: "conditional",
        body: "Static routing pays 2.9% + 30c flat interchange. Route dynamically to lowest interchange processor.",
        mandate: "Least-cost smart gateway router saving $38,000 annually."
      },
      {
        author: "Titan",
        initial: "T",
        role: "Data Reliability",
        tag: "Conditional",
        tagClass: "conditional",
        body: "Non-atomic webhook retries cause duplicate balance crediting during payment gateway retries.",
        mandate: "Two-phase saga state machine with strict database unique constraints."
      }
    ],
    matrix: [
      { auditor: "Aegis", domain: "Security & PCI-DSS", score: "3.8 / 10", finding: "Cardholder data in debug logs violates PCI-DSS 3.4", resolution: "Perimeter tokenization & zero-log filter" },
      { auditor: "Vanguard", domain: "Distributed Scalability", score: "6.2 / 10", finding: "Cross-region locks add 800ms to checkout", resolution: "DynamoDB regional idempotency leases" },
      { auditor: "Ledger", domain: "Cloud Economics & FinOps", score: "5.8 / 10", finding: "Static routing incurs maximum interchange fees", resolution: "Least-cost router saving $38,000/yr" },
      { auditor: "Titan", domain: "Data & State Reliability", score: "6.5 / 10", finding: "Non-atomic webhook retries create duplicates", resolution: "Two-phase saga machine with unique constraints" }
    ],
    manifest: [
      { action: "CREATE", path: "src/payment/idempotency_guard.py", desc: "Distributed idempotency filter with DynamoDB conditional write" },
      { action: "CREATE", path: "src/saga/payment_coordinator.py", desc: "Two-phase saga state machine with automatic compensations" },
      { action: "CREATE", path: "src/routing/smart_interchange.py", desc: "Least-cost payment gateway router saving $38,000/year" }
    ],
    adrContent: `
      <h2>1. Context and Problem Statement</h2>
      <p>Multi-region payment processing requires zero duplicate charges and strict PCI-DSS compliance.</p>

      <h2>2. Decision</h2>
      <p>Perimeter tokenization, DynamoDB regional idempotency leases, and two-phase saga coordinator.</p>

      <h2>3. Scaffolding Files</h2>
      <p><code>src/payment/idempotency_guard.py</code><br><code>src/saga/payment_coordinator.py</code><br><code>src/routing/smart_interchange.py</code></p>
    `
  }
};

let currentKey = "rfc042";

// 1. Tab switching
function setTab(tabId) {
  const links = document.querySelectorAll(".nav-link");
  links.forEach(l => {
    l.classList.remove("active");
    if (l.getAttribute("data-tab") === tabId) l.classList.add("active");
  });

  const tabs = document.querySelectorAll(".content-tab");
  tabs.forEach(t => t.classList.remove("active"));

  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.add("active");
}

// 2. Change proposal
function changeProposal(key) {
  if (!DATA[key]) return;
  currentKey = key;
  const p = DATA[key];

  // Header
  document.getElementById("nav-rfc-label").textContent = p.id;
  document.getElementById("doc-title").textContent = p.title;
  document.getElementById("doc-lede").textContent = p.lede;
  document.querySelector(".doc-meta").textContent = p.meta;

  // Document body
  document.getElementById("doc-content").innerHTML = p.docBody;

  // Threads
  document.getElementById("threads-count").textContent = `${p.threads.length} open`;
  const threadsContainer = document.getElementById("threads-list");
  threadsContainer.innerHTML = p.threads.map(t => `
    <div class="thread-card">
      <div class="thread-head">
        <div class="thread-author-group">
          <div class="avatar">${t.initial}</div>
          <span class="thread-author">${t.author} (${t.role})</span>
        </div>
        <span class="thread-tag ${t.tagClass}">${t.tag}</span>
      </div>
      <div class="thread-body">${t.body}</div>
      <div class="thread-mandate"><strong>Mandate:</strong> ${t.mandate}</div>
    </div>
  `).join("");

  // Matrix
  const matrixTbody = document.getElementById("matrix-tbody");
  matrixTbody.innerHTML = p.matrix.map(m => `
    <tr>
      <td><strong>${m.auditor}</strong></td>
      <td>${m.domain}</td>
      <td class="score-text">${m.score}</td>
      <td>${m.finding}</td>
      <td>${m.resolution}</td>
    </tr>
  `).join("");

  // Topology image
  document.getElementById("topo-image").src = p.topoImg;

  // ADR & Handoff
  document.getElementById("adr-heading").textContent = `${p.id}: Architecture decision record`;
  document.getElementById("adr-body").innerHTML = p.adrContent;
  document.getElementById("handoff-branch").textContent = p.branch;
  document.getElementById("handoff-test").textContent = p.testCmd;
  document.getElementById("handoff-cli").textContent = p.cliCmd;

  const manifestContainer = document.getElementById("handoff-manifest");
  manifestContainer.innerHTML = p.manifest.map(m => `
    <div class="manifest-entry">
      <div class="manifest-entry-head">
        <span class="manifest-action">${m.action}</span>
        <code>${m.path}</code>
      </div>
      <div class="manifest-desc">${m.desc}</div>
    </div>
  `).join("");
}

// 3. Copy CLI command
function copyCli() {
  const cmd = DATA[currentKey].cliCmd;
  navigator.clipboard.writeText(cmd).then(() => {
    showToast("Terminal command copied to clipboard");
  }).catch(() => {
    showToast("Copied to clipboard");
  });
}

// 4. Toast utility
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  changeProposal("rfc042");
});
