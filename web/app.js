/**
 * BlindCouncil Workbench — Enterprise Application Logic
 */

const PROPOSALS = {
  rfc042: {
    id: "RFC-042",
    title: "RFC-042: Real-Time Messaging Fabric & Ingress Event Streaming",
    targetBranch: "feat/adr-042-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."`,
    scores: {
      sec: "4.5 / 10 • Conditional",
      scale: "6.8 / 10 • Approved",
      fin: "6.0 / 10 • Conditional",
      data: "7.2 / 10 • Conditional"
    },
    resolutions: {
      sec: "Mandate: Sub-ms Edge Bloom Revocation",
      scale: "Mandate: Zero-DB Reconnection Ingress",
      fin: "Mandate: 4 Nodes + Autoscale (-$25.2k/yr)",
      data: "Mandate: Transactional Outbox + CDC"
    },
    rfcHtml: `
      <h2>1. Workload Scope & Architecture Target</h2>
      <p>Our legacy HTTP long-polling architecture is exhausting server memory, creating 450ms p99 message delivery latency, and driving database connection churn during peak hours. This RFC proposes a dedicated WebSocket messaging fabric to sustain 100,000 concurrent sockets with p99 delivery latency &lt; 20ms.</p>
      
      <h2>2. Ingress & Authentication Pipeline</h2>
      <p>Clients connect to an AWS Network Load Balancer (NLB) configured with TCP pass-through to an auto-scaling Envoy gateway tier. During initial handshake, clients pass a signed JSON Web Token (JWT).</p>
      
      <div class="rfc-inline-callout callout-flag">
        <strong>Review Note [Line 42 — Auth Renewal]:</strong> Active sockets renew credentials using in-band heartbeat frames every 15 minutes. No external revocation checks are performed between renewals.
      </div>

      <h2>3. Cluster Memory & Sizing Strategy</h2>
      <p>To support high-throughput broadcast channels and 24-hour backpressure buffering, the initial proposal provisions 12 dedicated Redis Enterprise nodes (<code>cache.r6g.2xlarge</code>).</p>

      <div class="rfc-inline-callout callout-flag">
        <strong>Review Note [Section 3.1 — Provisioning]:</strong> Baseline traffic drops to 20,000 off-peak sockets. The 12-node static provisioning incurs an annual cost of $42,000 regardless of load.
      </div>

      <h2>4. Persistence, Buffering & Fanout Guarantees</h2>
      <p>Message frames written to Redis streams are simultaneously committed to Postgres via asynchronous background application workers.</p>

      <div class="rfc-inline-callout callout-flag">
        <strong>Review Note [Section 4.3 — Dual-Write Hazard]:</strong> Direct dual-writing without an atomic boundary exposes the cluster to message loss during worker crashes.
      </div>
    `,
    audits: [
      {
        specialist: "Aegis",
        role: "Staff Security Auditor",
        score: "4.5 / 10",
        scoreClass: "pill-warn",
        finding: "In-band heartbeat token validation permits a <strong>15-minute window of unauthorized socket frames</strong> after account ban. Active CVE risk under SOC2 Article 4.",
        resolution: "Mandate Redis Bloom Filter bitset deployed at gateway edge. Revoked user IDs checked in sub-0.2ms RAM with zero database load."
      },
      {
        specialist: "Vanguard",
        role: "Principal Systems Architect",
        score: "6.8 / 10",
        scoreClass: "pill-ok",
        finding: "Synchronous database lookups on 100k reconnects during pod rolling restarts will <strong>exhaust Postgres connection pools</strong> and crash the database. p99 latency >140ms.",
        resolution: "Session lookup and revocation bitsets reside strictly within cluster memory. Zero synchronous database queries during reconnection bursts."
      },
      {
        specialist: "Ledger",
        role: "Lead Cloud Economics",
        score: "6.0 / 10",
        scoreClass: "pill-warn",
        finding: "12-node provisioned cluster incurs <strong>$3,500/month ($42,000/yr)</strong> for a 20k off-peak baseline. Over-provisioned by 200%.",
        resolution: "Downsize initial launch to 4-node cluster with auto-scaling triggers at 75% memory. Recoups $25,200 annually while maintaining headroom."
      },
      {
        specialist: "Titan",
        role: "Data Reliability Architect",
        score: "7.2 / 10",
        scoreClass: "pill-warn",
        finding: "Dual-writing directly to Redis Pub/Sub and Postgres causes <strong>message loss or ghost rows</strong> on worker container termination.",
        resolution: "Adopt Transactional Outbox Pattern with Debezium CDC into Kafka, guaranteeing strict linearizable at-least-once delivery."
      }
    ],
    tradeoffs: [
      {
        dimension: "Security vs Ingress Latency",
        tensions: "Aegis (Synchronous auth revocation on every heartbeat) vs Vanguard (Sub-18ms socket latency requirement).",
        resolution: "Edge Redis Bloom Filter bitset (<0.2ms lookup in RAM, zero Postgres connection churn).",
        invariant: "INV-SEC-01: Revocation latency &lt; 1ms; zero unauthenticated frame delivery."
      },
      {
        dimension: "Cluster Sizing vs Peak Headroom",
        tensions: "Platform Lead (12 static nodes for 100k burst safety) vs Ledger ($42,000/yr budget breach).",
        resolution: "4 primary nodes with AWS CloudWatch 75% memory autoscaling alarms.",
        invariant: "INV-FIN-03: Cloud compute right-sizing saving $25,200/year."
      },
      {
        dimension: "Data Consistency vs Write Throughput",
        tensions: "Original Design (Dual-write Redis + Postgres) vs Titan (Message loss on worker crash).",
        resolution: "Transactional Outbox table with Debezium CDC log streaming to Kafka.",
        invariant: "INV-DATA-04: At-least-once guaranteed delivery under worker fail-stop model."
      }
    ],
    components: [
      {
        name: "Ingress Edge & Redis Bloom Filter",
        desc: "Terminates WebSocket connections and verifies revoked credentials in <0.2ms RAM bitset before frame ingestion."
      },
      {
        name: "4-Node MemoryDB Autoscaling Cluster",
        desc: "Right-sized from 12 nodes to 4 primary instances with 75% memory scaling triggers, saving $25,200/year."
      },
      {
        name: "Transactional Outbox Table",
        desc: "Postgres outbox_events commits atomically with application state, eliminating dual-write split-brain risk."
      },
      {
        name: "Debezium CDC ➔ Kafka Fanout",
        desc: "Tails write-ahead log (WAL) to publish events to Kafka with guaranteed at-least-once ordering."
      }
    ],
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
Our HTTP long-polling architecture is failing under scale (450ms p99 latency). This design introduces a dedicated WebSocket cluster supporting 100,000 concurrent sockets with sub-20ms broadcast latency.

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
    title: "RFC-019: Global Scalable URL Shortener Architecture (10B Keys)",
    targetBranch: "feat/adr-019-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-019.md Section 6. Switch to branch 'feat/adr-019-impl'. Implement Base62 collision-free ID generator with Redis cluster cache and Cassandra persistent tier. Run 'pytest tests/ -v'."`,
    scores: {
      sec: "5.2 / 10 • Conditional",
      scale: "7.0 / 10 • Approved",
      fin: "6.5 / 10 • Conditional",
      data: "8.1 / 10 • Approved"
    },
    resolutions: {
      sec: "Mandate: Randomized Pre-Allocated KGS",
      scale: "Mandate: Distributed Range Coordinator",
      fin: "Mandate: ClickHouse Telemetry Tiering",
      data: "Mandate: Read-Your-Own-Writes Session Pinning"
    },
    rfcHtml: `
      <h2>1. Workload Scope & Key Space</h2>
      <p>Designing a global URL shortening service capable of persisting 10 Billion distinct links with a read:write ratio of 100:1 and 50,000 query operations per second.</p>

      <h2>2. Key Generation & Sequence Allocation</h2>
      <p>The initial specification converts standard relational database auto-increment integers into 7-character Base62 strings.</p>
      
      <div class="rfc-inline-callout callout-flag">
        <strong>Review Note [Section 2.1 — Sequence Bottleneck]:</strong> Centralized auto-increment sequence creates a lock bottleneck at 50k QPS and allows scraping bots to enumerate sequential URLs.
      </div>

      <h2>3. Analytics & Telemetry Retention</h2>
      <p>Click telemetry events are written directly to the relational primary database for 365 days.</p>

      <div class="rfc-inline-callout callout-flag">
        <strong>Review Note [Section 3.4 — Storage Waste]:</strong> Storing raw click streams in primary transactional storage increases database footprint by 400%, adding $14,000/year in unnecessary high-IOPS storage.
      </div>
    `,
    audits: [
      {
        specialist: "Aegis",
        role: "Staff Security Auditor",
        score: "5.2 / 10",
        scoreClass: "pill-warn",
        finding: "Sequential Base62 IDs allow automated scraping bots to <strong>enumerate and harvest private shortened links</strong>.",
        resolution: "Pre-allocated key ranges must be randomly shuffled before worker allocation in distributed KGS."
      },
      {
        specialist: "Vanguard",
        role: "Principal Systems Architect",
        score: "7.0 / 10",
        scoreClass: "pill-ok",
        finding: "Single relational sequence generator bottlenecks under <strong>50k QPS global concurrent writes</strong>.",
        resolution: "Distributed Key Generation Service (KGS) allocating 1M key chunks per node via Zookeeper leases."
      },
      {
        specialist: "Ledger",
        role: "Lead Cloud Economics",
        score: "6.5 / 10",
        scoreClass: "pill-warn",
        finding: "Storing raw click streams in primary transactional storage incurs <strong>$14,000/year in wasted IOPS</strong>.",
        resolution: "Stream telemetry to ClickHouse/S3 with 90-day cold retention policy."
      },
      {
        specialist: "Titan",
        role: "Data Reliability Architect",
        score: "8.1 / 10",
        scoreClass: "pill-ok",
        finding: "Cross-region replication lag can return <strong>404 Not Found</strong> for links clicked immediately in another continent.",
        resolution: "Read-your-own-writes session pinning to primary origin region."
      }
    ],
    tradeoffs: [
      {
        dimension: "Key Generation Throughput vs Randomness",
        tensions: "Vanguard (Zero DB locks on key generation) vs Aegis (Prevent sequential enumeration).",
        resolution: "Pre-allocated 1M key ranges with cryptographically shuffled Base62 tokens.",
        invariant: "INV-SCALE-01: Zero central database lock on link creation."
      },
      {
        dimension: "Analytics Retention vs Primary DB Cost",
        tensions: "Product Team (365-day click telemetry) vs Ledger (Relational IOPS budget breach).",
        resolution: "Tier telemetry to ClickHouse with 90-day retention, saving $14,000/year.",
        invariant: "INV-FIN-02: Analytics storage decoupled from OLTP database."
      }
    ],
    components: [
      {
        name: "Distributed Key Generation Service (KGS)",
        desc: "Zookeeper-managed service pre-computing unique Base62 strings to eliminate database auto-increment bottlenecks."
      },
      {
        name: "Redis LRU Hot-Tier Cache",
        desc: "Caches the top 20% most active URLs in memory, serving 80% of redirect requests with <2ms latency."
      },
      {
        name: "Cassandra Persistent Tier",
        desc: "Distributed wide-column store optimized for high-throughput single-key lookups across multi-region clusters."
      },
      {
        name: "ClickHouse Telemetry Sink",
        desc: "Columnar database for low-cost click stream analytics with 90-day automated TTL retention."
      }
    ],
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
    title: "RFC-088: Multi-Region Payment Processing Service",
    targetBranch: "feat/adr-088-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-088.md Section 6. Switch to branch 'feat/adr-088-impl'. Implement idempotency key middleware with DynamoDB TTL and distributed two-phase saga coordinator. Run 'pytest tests/ -v'."`,
    scores: {
      sec: "3.8 / 10 • Blocking",
      scale: "6.2 / 10 • Conditional",
      fin: "5.8 / 10 • Conditional",
      data: "6.5 / 10 • Conditional"
    },
    resolutions: {
      sec: "Mandate: Edge Perimeter Tokenization",
      scale: "Mandate: Regional Idempotency Leases",
      fin: "Mandate: Least-Cost Interchange Routing",
      data: "Mandate: Distributed Saga Orchestrator"
    },
    rfcHtml: `
      <h2>1. Architecture Scope & Payment Resilience</h2>
      <p>Designing a high-availability active-active multi-region payment gateway with automated failover across Stripe, Adyen, and Chase.</p>

      <h2>2. Logging & Audit Telemetry</h2>
      <p>Incoming HTTP payloads are logged comprehensively to centralized Elasticsearch cluster for real-time customer support debugging.</p>
      
      <div class="rfc-inline-callout callout-flag">
        <strong>Review Note [Section 2.4 — PCI-DSS Breach]:</strong> Raw payment payload ingestion logs unmasked cardholder metadata, creating a critical PCI-DSS Level 1 compliance failure.
      </div>

      <h2>3. Idempotency & Distributed Locking</h2>
      <p>Cross-region distributed locks synchronize payment authorization across AWS us-east-1 and eu-west-1.</p>

      <div class="rfc-inline-callout callout-flag">
        <strong>Review Note [Section 3.2 — Checkout Latency]:</strong> Synchronous cross-region distributed lock handshakes add 800ms to checkout p99 latency.
      </div>
    `,
    audits: [
      {
        specialist: "Aegis",
        role: "Staff Security Auditor",
        score: "3.8 / 10",
        scoreClass: "pill-err",
        finding: "Unmasked cardholder data in debug log aggregation violates <strong>PCI-DSS Requirement 3.4</strong>. Absolute deployment blocker.",
        resolution: "Zero-knowledge perimeter tokenization before service routing. Zero PAN stored in memory."
      },
      {
        specialist: "Vanguard",
        role: "Principal Systems Architect",
        score: "6.2 / 10",
        scoreClass: "pill-warn",
        finding: "Cross-region locking introduces <strong>800ms checkout latency spikes</strong>, increasing shopping cart abandonment.",
        resolution: "Regional idempotency leases backed by DynamoDB global tables."
      },
      {
        specialist: "Ledger",
        role: "Lead Cloud Economics",
        score: "5.8 / 10",
        scoreClass: "pill-warn",
        finding: "Static payment gateway routing pays <strong>2.9% + 30c flat interchange</strong> on all transactions regardless of region.",
        resolution: "Implement least-cost smart router dynamically routing to lowest interchange fee (-$38,000/yr)."
      },
      {
        specialist: "Titan",
        role: "Data Reliability Architect",
        score: "6.5 / 10",
        scoreClass: "pill-warn",
        finding: "Non-atomic webhook retries from payment providers cause <strong>duplicate balance crediting</strong>.",
        resolution: "Two-phase saga state machine with strict database unique constraints."
      }
    ],
    tradeoffs: [
      {
        dimension: "PCI-DSS Compliance vs Debug Visibility",
        tensions: "Engineering Ops (Full raw payload logging) vs Aegis (PCI-DSS Level 1 violation).",
        resolution: "Perimeter tokenization in HSM vault; debug logs only contain opaque token IDs.",
        invariant: "INV-SEC-02: Zero raw cardholder PAN exposure in application memory."
      },
      {
        dimension: "Cross-Region Locking vs Checkout Speed",
        tensions: "Titan (Global locks to prevent double-charging) vs Vanguard (800ms cross-region latency).",
        resolution: "Regional idempotency leases with conditional writes in DynamoDB global tables.",
        invariant: "INV-SCALE-03: Sub-50ms checkout authorization latency."
      }
    ],
    components: [
      {
        name: "Perimeter Tokenization Vault",
        desc: "Hardware-security module (HSM) intercepting incoming card frames and replacing PAN with opaque tokens."
      },
      {
        name: "Regional Idempotency Coordinator",
        desc: "DynamoDB conditional writes with TTL leases to prevent double charging during retries."
      },
      {
        name: "Smart Interchange Router",
        desc: "Real-time decision engine selecting lowest-fee payment processor (saving $38,000/year)."
      },
      {
        name: "Two-Phase Saga State Machine",
        desc: "Compensating transactions orchestrating bank auth, fraud check, and ledger commit."
      }
    ],
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

// 1. Tab Switching
function switchTab(tabId) {
  const tabs = document.querySelectorAll(".tab-item");
  tabs.forEach(tab => {
    tab.classList.remove("active");
    if (tab.getAttribute("data-tab") === tabId) {
      tab.classList.add("active");
    }
  });

  const panes = document.querySelectorAll(".tab-pane");
  panes.forEach(pane => {
    pane.classList.remove("active");
  });

  const activePane = document.getElementById(`tab-${tabId}`);
  if (activePane) {
    activePane.classList.add("active");
  }
}

// 2. Load Proposal Data
function loadProposal(key) {
  if (!PROPOSALS[key]) return;
  currentProposalKey = key;
  const p = PROPOSALS[key];

  // Header & Banner
  document.getElementById("crumb-rfc-id").textContent = p.id;
  document.getElementById("banner-rfc-title").textContent = p.title;

  // Reviewer Scores & Resolutions
  document.getElementById("score-sec").textContent = p.scores.sec;
  document.getElementById("res-sec").textContent = p.resolutions.sec;

  document.getElementById("score-scale").textContent = p.scores.scale;
  document.getElementById("res-scale").textContent = p.resolutions.scale;

  document.getElementById("score-fin").textContent = p.scores.fin;
  document.getElementById("res-fin").textContent = p.resolutions.fin;

  document.getElementById("score-data").textContent = p.scores.data;
  document.getElementById("res-data").textContent = p.resolutions.data;

  // TAB 1: RFC Article & Audit Threads
  document.getElementById("rfc-content-inner").innerHTML = p.rfcHtml;
  document.getElementById("sidebar-finding-count").textContent = `${p.audits.length} Audits`;

  const threadsContainer = document.getElementById("audit-threads-container");
  threadsContainer.innerHTML = p.audits.map(a => `
    <div class="audit-thread-card">
      <div class="thread-header">
        <div class="thread-author-group">
          <span class="thread-author-name">${a.specialist}</span>
          <span class="thread-author-role">${a.role}</span>
        </div>
        <span class="pill ${a.scoreClass}">${a.score}</span>
      </div>
      <div class="thread-body">
        <div class="thread-finding">${a.finding}</div>
        <div class="thread-resolution">
          <div class="resolution-label">ADOPTED RESOLUTION</div>
          <div>${a.resolution}</div>
        </div>
      </div>
    </div>
  `).join("");

  // TAB 2: Trade-offs Table
  const tradeoffsTbody = document.getElementById("tradeoffs-tbody");
  tradeoffsTbody.innerHTML = p.tradeoffs.map(t => `
    <tr>
      <td><strong>${t.dimension}</strong></td>
      <td>${t.tensions}</td>
      <td>${t.resolution}</td>
      <td><code>${t.invariant}</code></td>
    </tr>
  `).join("");

  // TAB 3: Components Grid
  const compGrid = document.getElementById("topology-components-grid");
  compGrid.innerHTML = p.components.map(c => `
    <div class="comp-card">
      <h4>${c.name}</h4>
      <p>${c.desc}</p>
    </div>
  `).join("");

  // TAB 4: ADR Document
  document.getElementById("adr-rendered-text").innerHTML = renderMarkdown(p.adrMarkdown);

  // TAB 5: Implementation Handoff
  document.getElementById("hand-branch").textContent = `git checkout -b ${p.targetBranch}`;
  document.getElementById("hand-test").textContent = p.verificationCmd;
  document.getElementById("hand-cli-code").textContent = p.claudeCmd;

  const manifestTbody = document.getElementById("manifest-tbody");
  manifestTbody.innerHTML = p.manifest.map(m => `
    <tr>
      <td><span class="pill pill-ok">${m.action}</span></td>
      <td><code>${m.path}</code></td>
      <td>${m.purpose}</td>
    </tr>
  `).join("");
}

// 3. Clipboard and Export Handlers
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

// 4. Toast Notification Utility
function showToast(text) {
  let toast = document.getElementById("workbench-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "workbench-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
  }, 2400);
}

// 5. Simple Markdown Parser for ADR Viewer
function renderMarkdown(md) {
  return md
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/\n$/gim, '<br>');
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  loadProposal("rfc042");
});
