/**
 * BlindCouncil Workbench — Enterprise Architecture Governance Engine
 */

const PROPOSALS = {
  rfc042: {
    id: "RFC-042",
    title: "Real-Time Messaging Fabric & Ingress Event Streaming",
    author: "Platform Engineering Core",
    scale: "100k Sockets",
    targetBranch: "feat/adr-042-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."`,
    diagramImg: "diagram_rfc042_resolved.png",
    rfcSections: `
      <h2>1. Problem Statement & Workload Characteristics</h2>
      <p>Our legacy HTTP long-polling architecture is exhausting EC2 memory pools, driving p99 delivery latency above 450ms, and causing database connection churn. We are proposing a dedicated WebSocket cluster to support 100,000 concurrent sockets with sub-20ms broadcast latency.</p>
      
      <h2>2. Proposed Ingress & Auth Specification</h2>
      <p>Clients connect to an AWS Network Load Balancer (NLB) terminating TLS, forwarding TCP frames to an auto-scaling Envoy gateway tier. During connection upgrade, clients submit an ephemeral JWT.</p>
      <div class="doc-callout flagged">
        <strong>Security Flagged (Section 2.3):</strong> Sockets renew credentials using an in-band heartbeat payload every 15 minutes. No external revocation checks are performed between renewals.
      </div>

      <h2>3. Cluster Memory & Sizing Strategy</h2>
      <p>To support high-throughput broadcast channels and 24-hour backpressure buffering, we provision 12 dedicated Redis Enterprise nodes (<code>cache.r6g.2xlarge</code>).</p>
      <div class="doc-callout flagged">
        <strong>FinOps Flagged (Section 3.1):</strong> Baseline traffic is 20,000 off-peak sockets. The 12-node static provisioning incurs an annual cost of $42,000 regardless of load.
      </div>

      <h2>4. Persistence & Event Stream Guarantees</h2>
      <p>Messages written to Redis streams are simultaneously committed to Postgres via application background workers.</p>
      <div class="doc-callout flagged">
        <strong>State Consistency Flagged (Section 4.4):</strong> Direct dual-writing without an atomic boundary exposes the cluster to message loss during worker crashes.
      </div>
    `,
    audits: [
      {
        domainClass: "sec",
        domainName: "Security & Auth",
        specialist: "Aegis",
        role: "Staff Security Auditor",
        score: "4.5 / 10",
        scoreType: "blocking",
        finding: "In-band heartbeat token validation permits a <strong>15-minute window of unauthorized socket frames</strong> after account ban. Active CVE risk under SOC2 Article 4.",
        mandate: "Sub-ms distributed revocation cache at gateway edge before frame ingest."
      },
      {
        domainClass: "scale",
        domainName: "Distributed Scalability",
        specialist: "Vanguard",
        role: "Principal Systems Architect",
        score: "6.8 / 10",
        scoreType: "conditional",
        finding: "Synchronous database lookups on 100k reconnects during pod rolling restarts will <strong>exhaust Postgres connection pools</strong> and crash the database. p99 latency >140ms.",
        mandate: "In-memory Redis Bloom filter with zero database hits on reconnect."
      },
      {
        domainClass: "fin",
        domainName: "Cloud Economics & FinOps",
        specialist: "Ledger",
        role: "Lead Cloud Economics",
        score: "6.0 / 10",
        scoreType: "conditional",
        finding: "12-node provisioned cluster incurs <strong>$3,500/month ($42,000/yr)</strong> for a 20k off-peak baseline. Over-provisioned by 200%.",
        mandate: "Launch with 4 nodes + 75% memory autoscale. Saves $25,200/year."
      },
      {
        domainClass: "data",
        domainName: "State & Reliability",
        specialist: "Titan",
        role: "Data Reliability Architect",
        score: "7.2 / 10",
        scoreType: "conditional",
        finding: "Dual-writing directly to Redis Pub/Sub and Postgres causes <strong>message loss or ghost rows</strong> on worker container termination.",
        mandate: "Transactional Outbox pattern with Debezium CDC for guaranteed delivery."
      }
    ],
    manifest: [
      { action: "CREATE", path: "src/middleware/bloom_revocation.py", desc: "Redis Bloom filter revocation middleware (Mandated by Aegis & Vanguard)" },
      { action: "CREATE", path: "src/cluster/config.yaml", desc: "4-node cluster autoscaling spec saving $25,200/year (Mandated by Ledger)" },
      { action: "CREATE", path: "src/db/outbox_producer.py", desc: "Transactional Outbox pattern event producer (Mandated by Titan)" }
    ],
    adrMarkdown: `# ADR-042: Real-Time Messaging & Event Streaming Architecture

**Status:** APPROVED WITH CONDITIONS  
**Date:** 2026-11-06  
**Author / Lead:** Platform Engineering Core  
**Council Reviewers:** Athena (Chair), Aegis (Sec), Vanguard (Scale), Ledger (FinOps), Titan (Data)

---

## 1. Executive Summary & Deliberation Outcome
- **Security (Aegis):** 4.5/10 ➔ Reconciled via Edge Redis Bloom Filter
- **Scalability (Vanguard):** 6.8/10 ➔ Reconciled via Decoupled Ingress Gateway
- **FinOps (Ledger):** 6.0/10 ➔ Reconciled via 4-Node Dynamic Autoscale (-$25,200/yr)
- **Data Reliability (Titan):** 7.2/10 ➔ Reconciled via Transactional Outbox + Debezium CDC

---

## 2. Invariant Specifications & Reconciled Design
1. **Revocation Latency:** Bitset lookup in RAM executes in <0.2ms, terminating banned sockets immediately.
2. **Reconnection Storm:** 100k client reconnections execute with zero synchronous database queries.
3. **Guaranteed Delivery:** Messages commit to \`outbox_events\` relational table within the state transaction. Debezium CDC streams to Kafka.

---

## 3. Scaffolding File Manifest
- \`src/middleware/bloom_revocation.py\`
- \`src/cluster/config.yaml\`
- \`src/db/outbox_producer.py\`

*Generated by BlindCouncil Workbench.*`
  },

  rfc019: {
    id: "RFC-019",
    title: "Global Scalable URL Shortener Architecture (10B Keys)",
    author: "Core Infra Team",
    scale: "10B Keys / 50k QPS",
    targetBranch: "feat/adr-019-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-019.md Section 6. Switch to branch 'feat/adr-019-impl'. Implement Base62 collision-free ID generator with Redis cluster cache and Cassandra persistent tier. Run 'pytest tests/ -v'."`,
    diagramImg: "diagram_rfc042_resolved.png",
    rfcSections: `
      <h2>1. Workload Scope & Key Space</h2>
      <p>Designing a global URL shortening service capable of persisting 10 Billion distinct links with a read:write ratio of 100:1 and 50,000 query operations per second.</p>

      <h2>2. Key Generation & Persistence Strategy</h2>
      <p>Proposal utilizes standard SQL auto-increment IDs converted to Base62 strings on ingest.</p>
      <div class="doc-callout flagged">
        <strong>Scalability Flagged (Section 2.1):</strong> Centralized auto-increment sequence creates a lock bottleneck at 50k QPS and exposes link enumeration attack surface.
      </div>

      <h2>3. Analytics & Telemetry Retention</h2>
      <p>Click telemetry events are written directly to the relational primary database for 365 days.</p>
      <div class="doc-callout flagged">
        <strong>FinOps Flagged (Section 3.4):</strong> Relational storage for raw click telemetry increases primary database footprint by 400%, adding $14,000/year in unnecessary high-IOPS storage.
      </div>
    `,
    audits: [
      {
        domainClass: "sec",
        domainName: "Security & Abuse",
        specialist: "Aegis",
        role: "Staff Security Auditor",
        score: "5.2 / 10",
        scoreType: "conditional",
        finding: "Sequential Base62 IDs allow automated scraping bots to <strong>enumerate and harvest private shortened links</strong>.",
        mandate: "Randomized pre-allocated range shuffle in distributed Key Generation Service."
      },
      {
        domainClass: "scale",
        domainName: "Distributed Scalability",
        specialist: "Vanguard",
        role: "Principal Systems Architect",
        score: "7.0 / 10",
        scoreType: "conditional",
        finding: "Single relational sequence generator bottlenecks under <strong>50k QPS global concurrent writes</strong>.",
        mandate: "Distributed KGS allocating 1M key chunks per node via Zookeeper leases."
      },
      {
        domainClass: "fin",
        domainName: "Cloud Economics & FinOps",
        specialist: "Ledger",
        role: "Lead Cloud Economics",
        score: "6.5 / 10",
        scoreType: "conditional",
        finding: "Storing raw click streams in primary transactional storage incurs <strong>$14,000/year in wasted IOPS</strong>.",
        mandate: "Tier telemetry to ClickHouse/S3 with 90-day cold retention policy."
      },
      {
        domainClass: "data",
        domainName: "State & Reliability",
        specialist: "Titan",
        role: "Data Reliability Architect",
        score: "8.1 / 10",
        scoreType: "conditional",
        finding: "Cross-region replication lag can return <strong>404 Not Found</strong> for links clicked immediately in another continent.",
        mandate: "Read-your-own-writes session pinning to primary origin region."
      }
    ],
    manifest: [
      { action: "CREATE", path: "src/kgs/range_allocator.py", desc: "Base62 distributed key generation range coordinator" },
      { action: "CREATE", path: "src/cache/lru_tier.py", desc: "Redis hot-tier cache with 80/20 memory eviction policy" },
      { action: "CREATE", path: "src/security/safe_browsing.py", desc: "Asynchronous anti-malware and link reputation validator" }
    ],
    adrMarkdown: `# ADR-019: Global Scalable URL Shortener Architecture (10B Keys)

**Status:** APPROVED WITH CONDITIONS  
**Date:** 2026-11-06  
**Author / Lead:** Core Infra Team  
**Council Reviewers:** Athena (Chair), Aegis, Vanguard, Ledger, Titan

---

## 1. Executive Summary & Blind Scorecard
- Security: 5.2/10 ➔ Resolving: Randomized KGS Ranges
- Scalability: 7.0/10 ➔ Resolving: Distributed Base62 Key Range Coordinator
- FinOps: 6.5/10 ➔ Resolving: ClickHouse Analytics Tiering (-$14,000/yr)
- Data: 8.1/10 ➔ Resolving: Read-Your-Own-Writes Session Pinning

---

## 2. Invariants & Autonomous Manifest
- \`src/kgs/range_allocator.py\`
- \`src/cache/lru_tier.py\`
- \`src/security/safe_browsing.py\`

*Generated by BlindCouncil Workbench.*`
  },

  rfc088: {
    id: "RFC-088",
    title: "Multi-Region Payment Processing Service",
    author: "Fintech Platform Team",
    scale: "Active-Active Multi-Region",
    targetBranch: "feat/adr-088-impl",
    verificationCmd: "pytest tests/ -v",
    claudeCmd: `claude -p "Read ADR-088.md Section 6. Switch to branch 'feat/adr-088-impl'. Implement idempotency key middleware with DynamoDB TTL and distributed two-phase saga coordinator. Run 'pytest tests/ -v'."`,
    diagramImg: "diagram_rfc042_resolved.png",
    rfcSections: `
      <h2>1. Architecture Scope & Payment Resilience</h2>
      <p>Designing a high-availability active-active multi-region payment gateway with automated failover across Stripe, Adyen, and Chase.</p>

      <h2>2. Logging & Audit Telemetry</h2>
      <p>Incoming HTTP payloads are logged comprehensively to centralized Elasticsearch cluster for real-time customer support debugging.</p>
      <div class="doc-callout flagged">
        <strong>Security Flagged (Section 2.4):</strong> Raw payment payload ingestion logs unmasked cardholder metadata, creating a critical PCI-DSS Level 1 compliance failure.
      </div>

      <h2>3. Idempotency & Distributed Locking</h2>
      <p>Cross-region distributed locks synchronize payment authorization across AWS us-east-1 and eu-west-1.</p>
      <div class="doc-callout flagged">
        <strong>Scalability Flagged (Section 3.2):</strong> Synchronous cross-region distributed lock handshakes add 800ms to checkout p99 latency.
      </div>
    `,
    audits: [
      {
        domainClass: "sec",
        domainName: "Security & PCI-DSS",
        specialist: "Aegis",
        role: "Staff Security Auditor",
        score: "3.8 / 10",
        scoreType: "blocking",
        finding: "Unmasked cardholder data in debug log aggregation violates <strong>PCI-DSS Requirement 3.4</strong>. Absolute deployment blocker.",
        mandate: "Zero-knowledge tokenization at edge perimeter before service routing."
      },
      {
        domainClass: "scale",
        domainName: "Distributed Scalability",
        specialist: "Vanguard",
        role: "Principal Systems Architect",
        score: "6.2 / 10",
        scoreType: "conditional",
        finding: "Cross-region locking introduces <strong>800ms checkout latency spikes</strong>, increasing shopping cart abandonment.",
        mandate: "Regional idempotency leases backed by DynamoDB global tables."
      },
      {
        domainClass: "fin",
        domainName: "Cloud Economics & FinOps",
        specialist: "Ledger",
        role: "Lead Cloud Economics",
        score: "5.8 / 10",
        scoreType: "conditional",
        finding: "Static payment gateway routing pays <strong>2.9% + 30c flat interchange</strong> on all transactions regardless of region.",
        mandate: "Least-cost smart router dynamically routing to lowest interchange fee (-$38,000/yr)."
      },
      {
        domainClass: "data",
        domainName: "State & Reliability",
        specialist: "Titan",
        role: "Data Reliability Architect",
        score: "6.5 / 10",
        scoreType: "conditional",
        finding: "Non-atomic webhook retries from payment providers cause <strong>duplicate balance crediting</strong>.",
        mandate: "Two-phase saga state machine with strict database unique constraints."
      }
    ],
    manifest: [
      { action: "CREATE", path: "src/payment/idempotency_guard.py", desc: "Distributed idempotency filter with DynamoDB conditional write" },
      { action: "CREATE", path: "src/saga/payment_coordinator.py", desc: "Two-phase saga state machine with automatic compensations" },
      { action: "CREATE", path: "src/routing/smart_interchange.py", desc: "Least-cost payment gateway router saving $38,000/year" }
    ],
    adrMarkdown: `# ADR-088: Multi-Region Payment Processing Service

**Status:** APPROVED WITH CONDITIONS  
**Date:** 2026-11-06  
**Author / Lead:** Fintech Platform Team  
**Council Reviewers:** Athena (Chair), Aegis, Vanguard, Ledger, Titan

---

## 1. Executive Summary & Blind Scorecard
- Security: 3.8/10 ➔ Resolving: Edge Tokenization & Zero-Log Filter
- Scalability: 6.2/10 ➔ Resolving: DynamoDB Regional Idempotency Leases
- FinOps: 5.8/10 ➔ Resolving: Least-Cost Interchange Routing (-$38,000/yr)
- Data: 6.5/10 ➔ Resolving: Distributed Payment Saga Machine

---

## 2. Invariants & Autonomous Manifest
- \`src/payment/idempotency_guard.py\`
- \`src/saga/payment_coordinator.py\`
- \`src/routing/smart_interchange.py\`

*Generated by BlindCouncil Workbench.*`
  }
};

let currentProposalKey = "rfc042";

// 1. Switch View Tabs
function switchView(viewId) {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(tab => {
    tab.classList.remove("active");
    if (tab.getAttribute("data-tab") === viewId) {
      tab.classList.add("active");
    }
  });

  const views = document.querySelectorAll(".workbench-view");
  views.forEach(view => {
    view.classList.remove("active");
  });

  const activeView = document.getElementById(`view-${viewId}`);
  if (activeView) {
    activeView.classList.add("active");
  }
}

// 2. Load Proposal Data
function loadProposal(key) {
  if (!PROPOSALS[key]) return;
  currentProposalKey = key;
  const p = PROPOSALS[key];

  // View 1: RFC Inspector Pane
  document.getElementById("doc-rfc-id").textContent = p.id;
  document.getElementById("doc-rfc-title").textContent = p.title;
  document.getElementById("rfc-rendered-body").innerHTML = p.rfcSections;

  // View 1: Specialist Cards
  const cardsContainer = document.getElementById("audit-cards-list");
  cardsContainer.innerHTML = p.audits.map(a => `
    <div class="audit-card ${a.domainClass}">
      <div class="card-top">
        <div class="specialist-meta">
          <div class="specialist-avatar ${a.domainClass}">${a.specialist.charAt(0)}</div>
          <div>
            <div class="specialist-name">${a.specialist}</div>
            <div class="specialist-domain">${a.role}</div>
          </div>
        </div>
        <span class="score-badge ${a.scoreType}">${a.score}</span>
      </div>
      <div class="card-finding">${a.finding}</div>
      <div class="card-mandate"><span>MANDATE:</span> ${a.mandate}</div>
    </div>
  `).join("");

  document.getElementById("audit-count").textContent = `${p.audits.length} Findings`;

  // View 4: ADR & Manifest
  document.getElementById("adr-doc-title").textContent = `${p.id}: ${p.title}`;
  document.getElementById("adr-markdown-content").innerHTML = renderMarkdown(p.adrMarkdown);
  document.getElementById("target-branch-text").textContent = `git checkout -b ${p.targetBranch}`;
  document.getElementById("verification-cmd-text").textContent = p.verificationCmd;
  document.getElementById("cli-cmd-display").textContent = p.claudeCmd;

  const manifestTable = document.getElementById("scaffold-manifest-rows");
  manifestTable.innerHTML = p.manifest.map(m => `
    <div class="manifest-row">
      <div class="manifest-head">
        <span class="action-badge action-${m.action.toLowerCase()}">${m.action}</span>
        <span class="manifest-file">${m.path}</span>
      </div>
      <div class="manifest-desc">${m.desc}</div>
    </div>
  `).join("");

  // Update Simulation Telemetry
  updateSimulation();
}

// 3. Invariant & Trade-off Simulator Logic
function updateSimulation() {
  const concurrency = parseInt(document.getElementById("dial-concurrency").value, 10);
  const revocation = document.getElementById("dial-revocation").value;
  const cluster = document.getElementById("dial-cluster").value;
  const persistence = document.getElementById("dial-persistence").value;

  // Display Dial Value
  document.getElementById("val-concurrency").textContent = concurrency.toLocaleString();

  // 1. Calculate p99 Latency
  let p99 = 12.0 + (concurrency / 100000) * 2.2;
  let latencyStatus = "Within 18ms SLA Target";
  let latencyClass = "status-good";

  if (revocation === "db") {
    p99 += 128.0 + (concurrency / 20000) * 8.5;
    latencyStatus = "CRITICAL: Database Pool Exhaustion";
    latencyClass = "status-bad";
  } else if (cluster === "static2") {
    p99 += 190.0;
    latencyStatus = "CRITICAL: Cluster CPU Throttling";
    latencyClass = "status-bad";
  } else if (concurrency > 180000) {
    p99 += 8.5;
    latencyStatus = "High Load Warning";
    latencyClass = "status-warn";
  }

  document.getElementById("metric-latency").textContent = p99.toFixed(1);
  const statusLatEl = document.getElementById("status-latency");
  statusLatEl.textContent = latencyStatus;
  statusLatEl.className = `metric-status ${latencyClass}`;

  // 2. Calculate Infrastructure Cost
  let costNum = 16800;
  let costStatus = "Saves $25,200/yr vs Static";
  let costClass = "status-good";

  if (cluster === "static12") {
    costNum = 42000;
    costStatus = "FinOps Alert: 200% Over-Provisioned";
    costClass = "status-bad";
  } else if (cluster === "static2") {
    costNum = 8400;
    costStatus = "Under-Provisioned (Single Point of Failure)";
    costClass = "status-warn";
  } else {
    // Dynamic autoscale
    if (concurrency > 150000) {
      costNum += Math.floor(((concurrency - 150000) / 10000) * 900);
      costStatus = `Autoscaled for ${concurrency.toLocaleString()} sockets`;
    }
  }

  document.getElementById("metric-cost").textContent = `$${costNum.toLocaleString()}`;
  const statusCostEl = document.getElementById("status-cost");
  statusCostEl.textContent = costStatus;
  statusCostEl.className = `metric-status ${costClass}`;

  // 3. Calculate Revocation Enforcement Window
  let secNum = "<0.2";
  let secUnit = "ms";
  let secStatus = "Zero Unauthorized Frames";
  let secClass = "status-good";

  if (revocation === "jwt") {
    secNum = "15";
    secUnit = "min";
    secStatus = "SOC2 Violation: Session Hijacking Window";
    secClass = "status-bad";
  } else if (revocation === "db") {
    secNum = "~115";
    secUnit = "ms";
    secStatus = "Secure but Triggers DB Latency Spikes";
    secClass = "status-warn";
  }

  document.getElementById("metric-revocation").textContent = secNum;
  document.querySelector("#card-sec .metric-unit").textContent = secUnit;
  const statusSecEl = document.getElementById("status-sec");
  statusSecEl.textContent = secStatus;
  statusSecEl.className = `metric-status ${secClass}`;

  // 4. Calculate Message Loss
  let lossNum = "0.00%";
  let lossStatus = "Strict At-Least-Once (CDC)";
  let lossClass = "status-good";

  if (persistence === "dualwrite") {
    lossNum = "1.84%";
    lossStatus = "Dual-Write Split-Brain Risk";
    lossClass = "status-bad";
  }

  document.getElementById("metric-loss").textContent = lossNum;
  const statusDataEl = document.getElementById("status-data");
  statusDataEl.textContent = lossStatus;
  statusDataEl.className = `metric-status ${lossClass}`;

  // Update Summary Rationale Text
  const summaryEl = document.getElementById("summary-text");
  if (revocation === "bloom" && cluster === "dynamic" && persistence === "outbox") {
    summaryEl.innerHTML = `<strong>Optimal Consensus Verified:</strong> Edge Redis Bloom filter achieves sub-0.2ms revocation without DB load. 4-node autoscale cluster recoups $25,200/year. Transactional Outbox guarantees zero lost events.`;
  } else if (revocation === "jwt") {
    summaryEl.innerHTML = `<strong style="color:#f87171">Security Compromise:</strong> In-band JWT refresh leaves an unrevoked 15-minute credential window. Aegis will place an absolute deployment BLOCK on this configuration.`;
  } else if (revocation === "db") {
    summaryEl.innerHTML = `<strong style="color:#fbbf24">Scalability Bottleneck:</strong> Querying Postgres synchronously on socket heartbeats will saturate the connection pool during pod rollouts. Vanguard mandates in-memory verification.`;
  } else if (cluster === "static12") {
    summaryEl.innerHTML = `<strong style="color:#f87171">FinOps Waste:</strong> 12 dedicated instances for a 20k baseline is rejected by Ledger. Downsize to 4 nodes with memory autoscaling at 75%.`;
  } else if (persistence === "dualwrite") {
    summaryEl.innerHTML = `<strong style="color:#f87171">Data Inconsistency:</strong> Dual-writing without an atomic boundary creates orphan records on worker failure. Titan mandates Transactional Outbox + Debezium CDC.`;
  }
}

// 4. Clipboard and Export Handlers
function copyHandoffCommand() {
  const cmd = PROPOSALS[currentProposalKey].claudeCmd;
  navigator.clipboard.writeText(cmd).then(() => {
    showToast("Terminal execution command copied to clipboard!");
  }).catch(() => {
    showToast("Copied to clipboard!");
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

function resetTopologyZoom() {
  const img = document.getElementById("topo-img");
  img.style.transform = "scale(1)";
  showToast("Canvas centered.");
}

// 5. Toast Notification Utility
function showToast(text) {
  let toast = document.getElementById("workbench-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "workbench-toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #1e293b;
      color: #38bdf8;
      border: 1px solid #38bdf8;
      border-radius: 6px;
      padding: 10px 18px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      z-index: 99999;
      opacity: 0;
      transform: translateY(10px);
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
    toast.style.transform = "translateY(10px)";
  }, 2400);
}

// 6. Simple Markdown Parser for ADR Viewer
function renderMarkdown(md) {
  return md
    .replace(/^# (.*$)/gim, '<h2 style="font-size:17px; margin:14px 0 8px; color:#fff;">$1</h2>')
    .replace(/^## (.*$)/gim, '<h3 style="font-size:14px; margin:12px 0 6px; color:#93c5fd;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/^\- (.*$)/gim, '<li style="margin-left:18px; margin-bottom:4px;">$1</li>')
    .replace(/\n$/gim, '<br>');
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  loadProposal("rfc042");
});
