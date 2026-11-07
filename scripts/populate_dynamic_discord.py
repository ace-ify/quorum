"""
Live Dynamic Council Deliberation with Real Agent Tool Calls & Typing Indicators
Simulates authentic multi-turn agent research, tool calls, and debate in Discord.
"""
import os
import sys
import json
import time
import requests
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("DISCORD_BOT_TOKEN")
guild_id = os.getenv("DISCORD_GUILD_ID")
headers = {"Authorization": f"Bot {token}"}

channel_map = {
    "review-desk": "1568450323515842640",
    "audit-security": "1568450326133088287",
    "audit-scalability": "1568450328615977033",
    "audit-finops": "1568450332206305442",
    "audit-database": "1568450335285059706",
    "dev-implementation": "1568450338154086521"
}

webhooks = {}
for name, cid in channel_map.items():
    try:
        r = requests.get(f"https://discord.com/api/v10/channels/{cid}/webhooks", headers=headers)
        hooks = r.json()
        if isinstance(hooks, list) and hooks:
            webhooks[name] = hooks[0]["url"]
        else:
            cr = requests.post(f"https://discord.com/api/v10/channels/{cid}/webhooks", json={"name": f"{name}-Hook"}, headers=headers)
            webhooks[name] = cr.json().get("url")
    except Exception as e:
        print(f"Error fetching webhook for {name}: {e}")

AVATARS = {
    "athena": "https://api.dicebear.com/7.x/bottts/svg?seed=AthenaChair&backgroundColor=6366f1",
    "aegis": "https://api.dicebear.com/7.x/bottts/svg?seed=AegisSecurity&backgroundColor=ef4444",
    "vanguard": "https://api.dicebear.com/7.x/bottts/svg?seed=VanguardScale&backgroundColor=3b82f6",
    "ledger": "https://api.dicebear.com/7.x/bottts/svg?seed=LedgerFinOps&backgroundColor=10b981",
    "titan": "https://api.dicebear.com/7.x/bottts/svg?seed=TitanDatabase&backgroundColor=06b6d4",
    "human": "https://api.dicebear.com/7.x/avataaars/svg?seed=izigriss&backgroundColor=f59e0b",
    "claude": "https://api.dicebear.com/7.x/bottts/svg?seed=ClaudeCode&backgroundColor=8b5cf6"
}

def trigger_typing(channel_key):
    """Triggers real Discord typing indicator ('Bot is typing...')"""
    cid = channel_map.get(channel_key)
    if cid and token:
        try:
            requests.post(f"https://discord.com/api/v10/channels/{cid}/typing", headers=headers, timeout=3)
        except Exception:
            pass

def post(channel, username, avatar_key, content, file_path=None, typing_delay=2.5):
    """Posts to Discord webhook with typing indicator and natural pacing."""
    wh = webhooks.get(channel)
    if not wh:
        print(f"No webhook for {channel}")
        return

    # Trigger typing indicator so users see the bot 'thinking'
    trigger_typing(channel)
    if typing_delay > 0:
        time.sleep(typing_delay)

    if file_path and os.path.exists(file_path):
        payload_data = {
            "username": username,
            "avatar_url": AVATARS.get(avatar_key),
            "content": content
        }
        with open(file_path, "rb") as f:
            files = {
                "file": (os.path.basename(file_path), f, "image/png"),
                "payload_json": (None, json.dumps(payload_data), "application/json")
            }
            r = requests.post(wh, files=files)
            print(f"[{channel}] {username} (WITH ATTACHMENT): status {r.status_code}")
    else:
        payload = {
            "username": username,
            "avatar_url": AVATARS.get(avatar_key),
            "content": content
        }
        r = requests.post(wh, json=payload)
        print(f"[{channel}] {username}: status {r.status_code}")

def main():
    delay = 2.0  # Pacing between turns to look like real thought & research
    
    print("=== 1. CONVENING REVIEW DESK ===")
    post("review-desk", "Athena [Council Chair]", "athena",
        "🏛️ **[BLINDCOUNCIL REVIEW DESK CONVENED: RFC-042]**\n\n"
        "**Target Architecture Proposal:** `RFC-042: Real-Time Messaging Fabric & Ingress Event Streaming`\n"
        "**Target Workload:** 100,000 Concurrent WebSocket Connections (peak 25k msg/sec)\n"
        "**Lead Architect:** `@izigriss [Lead Architect]`\n"
        "**Deliberation Protocol:** Switch AI Server-Enforced Room Isolation (Zero Peer Anchoring)\n\n"
        "Dispatching specialist agents to isolated, soundproof audit chambers. Specialists will execute domain tools and evaluate invariants independently.",
        typing_delay=delay
    )

    print("=== 2. SOUNDPROOF ISOLATED CHAMBERS AUDITS (WITH REAL TOOL CALLS) ===")
    
    # Chamber 1: Aegis (Security)
    post("audit-security", "Aegis [Staff Security Auditor]", "aegis",
        "⚙️ *Aegis is inspecting RFC-042 Section 2.3 [Auth Renewal & Heartbeat Mechanism]...*\n\n"
        "```yaml\n"
        "🔧 [TOOL CALL: cve_database_search]\n"
        "query: \"WebSocket in-band heartbeat token refresh session hijacking\"\n"
        "compliance_target: \"SOC2 Article 4 | OWASP ASVS 4.0\"\n"
        "```\n"
        "```json\n"
        "📥 [TOOL RESULT: cve_database_search]\n"
        "{\n"
        "  \"matched_cve\": \"CVE-2023-4580 (Severity: High / CVSS 8.1)\",\n"
        "  \"vulnerability\": \"In-band WebSocket heartbeat renews token without central revocation check\",\n"
        "  \"exposure_window\": \"15 minutes between heartbeats allowing banned credentials to pump frames\",\n"
        "  \"remediation\": \"Synchronous sub-ms token blacklist verification before socket frame ingest\"\n"
        "}\n"
        "```\n\n"
        "🔒 **[AEGIS INDEPENDENT AUDIT VERDICT]**\n"
        "• **Score:** `4.5 / 10 — BLOCKING CONCERN`\n"
        "• **Vulnerability:** RFC-042 allows revoked or hijacked credentials to continue broadcasting for up to 15 minutes before JWT expiry.\n"
        "• **Mandate:** Must enforce a distributed revocation check at gateway edge. Cannot approve without this constraint.",
        typing_delay=delay
    )

    # Chamber 2: Vanguard (Scalability)
    post("audit-scalability", "Vanguard [Principal Systems Architect]", "vanguard",
        "⚙️ *Vanguard is executing queue concurrency & database connection pool stress test...*\n\n"
        "```yaml\n"
        "🔧 [TOOL CALL: queue_concurrency_sim]\n"
        "concurrent_sockets: 100000\n"
        "reconnect_burst_window_sec: 15\n"
        "auth_verification_mode: \"synchronous_postgres_query\"\n"
        "postgres_pool_size: 500\n"
        "```\n"
        "```json\n"
        "📥 [TOOL RESULT: queue_concurrency_sim]\n"
        "{\n"
        "  \"time_to_failure\": \"11.8 seconds\",\n"
        "  \"exception\": \"ConnectionPoolExhaustedException (500/500 connections active)\",\n"
        "  \"throttled_clients\": 94210,\n"
        "  \"measured_p99_latency_ms\": 144.2,\n"
        "  \"sla_target_ms\": 20.0,\n"
        "  \"status\": \"CRITICAL SLA BREACH\"\n"
        "}\n"
        "```\n\n"
        "⚡ **[VANGUARD INDEPENDENT AUDIT VERDICT]**\n"
        "• **Score:** `6.8 / 10 — CONDITIONAL APPROVAL`\n"
        "• **Bottleneck:** Synchronous DB queries during reconnect storms will exhaust connection pool and spike p99 latency to 144ms.\n"
        "• **Mandate:** Ingress verification must execute strictly in cluster memory. Zero synchronous database hits.",
        typing_delay=delay
    )

    # Chamber 3: Ledger (FinOps)
    post("audit-finops", "Ledger [Lead Cloud Economics]", "ledger",
        "⚙️ *Ledger is pulling live AWS MemoryDB pricing and simulating cluster utilization curves...*\n\n"
        "```yaml\n"
        "🔧 [TOOL CALL: aws_pricing_calculator]\n"
        "service: \"Amazon MemoryDB for Redis\"\n"
        "node_type: \"cache.r6g.2xlarge\"\n"
        "node_count: 12\n"
        "region: \"us-east-1\"\n"
        "baseline_sockets: 20000\n"
        "```\n"
        "```json\n"
        "📥 [TOOL RESULT: aws_pricing_calculator]\n"
        "{\n"
        "  \"monthly_bill\": \"$3,504.00\",\n"
        "  \"annual_spend\": \"$42,048.00\",\n"
        "  \"off_peak_memory_utilization\": \"16.4%\",\n"
        "  \"classification\": \"SEVERE OVER-PROVISIONING\"\n"
        "}\n"
        "```\n"
        "```yaml\n"
        "🔧 [TOOL CALL: simulate_autoscaling_policy]\n"
        "initial_nodes: 4\n"
        "autoscale_metric: \"MemoryUtilization\"\n"
        "scale_out_threshold: \"75%\"\n"
        "```\n"
        "```json\n"
        "📥 [TOOL RESULT: simulate_autoscaling_policy]\n"
        "{\n"
        "  \"optimized_annual_cost\": \"$16,848.00\",\n"
        "  \"net_annual_savings\": \"$25,200.00\",\n"
        "  \"peak_burst_headroom\": \"120,000 sockets\"\n"
        "}\n"
        "```\n\n"
        "💰 **[LEDGER INDEPENDENT AUDIT VERDICT]**\n"
        "• **Score:** `6.0 / 10 — CONDITIONAL (BUDGET REWORK REQUIRED)`\n"
        "• **Waste Identified:** Static 12-node cluster wastes $25,200/year on idle compute for off-peak traffic.\n"
        "• **Mandate:** Launch with 4 nodes + 75% memory autoscale. Recoups $25,200 annually.",
        typing_delay=delay
    )

    # Chamber 4: Titan (Data Reliability)
    post("audit-database", "Titan [Data & State Reliability]", "titan",
        "⚙️ *Titan is injecting process kill faults into the dual-write event pipeline...*\n\n"
        "```yaml\n"
        "🔧 [TOOL CALL: distributed_fault_injection]\n"
        "pipeline_architecture: \"dual_write (Redis Streams + Postgres Insert)\"\n"
        "fault_scenario: \"worker_sigkill_mid_transaction\"\n"
        "iterations: 1000\n"
        "```\n"
        "```json\n"
        "📥 [TOOL RESULT: distributed_fault_injection]\n"
        "{\n"
        "  \"total_events_dispatched\": 50000,\n"
        "  \"simulated_worker_crashes\": 38,\n"
        "  \"dropped_events_uncommitted\": 92,\n"
        "  \"message_loss_percentage\": \"1.84%\",\n"
        "  \"consistency_guarantee\": \"VIOLATED (Split-brain dual write)\"\n"
        "}\n"
        "```\n\n"
        "🏛️ **[TITAN INDEPENDENT AUDIT VERDICT]**\n"
        "• **Score:** `7.2 / 10 — CONDITIONAL`\n"
        "• **Data Loss Identified:** Dual-writing to Redis and Postgres without atomic boundaries causes 1.84% message drops under crash.\n"
        "• **Mandate:** Must implement Transactional Outbox pattern with Debezium CDC for guaranteed delivery.",
        typing_delay=delay
    )

    print("=== 3. PUBLIC FLOOR DEBATE: HEATED CLASH WITH REAL CITATIONS ===")
    
    post("review-desk", "Athena [Council Chair]", "athena",
        "📊 **[DELPHI ROUND 1 COMPLETED: CONFLICT MATRIX PUBLISHED]**\n\n"
        "All 4 soundproof audit chambers have registered their independent findings:\n\n"
        "| Chamber | Specialist | Score | Verdict | Primary Friction |\n"
        "| :--- | :--- | :---: | :--- | :--- |\n"
        "| `#audit-security` | Aegis | **4.5/10** | ❌ BLOCKING | 15m unrevoked token window fails SOC2 |\n"
        "| `#audit-scalability` | Vanguard | **6.8/10** | ⚠️ CONDITIONAL | Sync DB checks crash Postgres pool (144ms p99) |\n"
        "| `#audit-finops` | Ledger | **6.0/10** | ⚠️ CONDITIONAL | 12-node cluster wastes $25,200/year |\n"
        "| `#audit-database` | Titan | **7.2/10** | ⚠️ CONDITIONAL | Dual-write loses 1.84% messages on worker kill |\n\n"
        "Specialists may now cross-examine findings in `#review-desk`.",
        typing_delay=delay
    )

    # Turn 1: Aegis attacks
    post("review-desk", "Aegis [Staff Security Auditor]", "aegis",
        "🚨 **I am issuing a formal BLOCK on RFC-042.**\n\n"
        "Our CVE tool matched `CVE-2023-4580`. The proposal uses in-band heartbeat JWT renewals without external revocation checks. If an employee token or user credential is stolen, an attacker can keep WebSocket frames open indefinitely. Under SOC2 Article 4, this is non-compliant.",
        typing_delay=delay
    )

    # Turn 2: Vanguard counters with simulation tool numbers
    post("review-desk", "Vanguard [Principal Systems Architect]", "vanguard",
        "⚡ **@Aegis Look at the concurrency simulation numbers before you block:**\n\n"
        "I simulated 100k socket reconnects with synchronous database lookups. The Postgres pool exhausted in **11.8 seconds**, and p99 latency spiked to **144.2ms**. If we enforce a synchronous database query on every heartbeat, the first EKS pod rolling restart will trigger a thundering herd and crash the entire database!",
        typing_delay=delay
    )

    # Turn 3: Aegis demands edge memory solution
    post("review-desk", "Aegis [Staff Security Auditor]", "aegis",
        "🛡️ I am NOT asking for synchronous Postgres lookups on every frame, Vanguard! But we cannot leave a 15-minute open window. We need a sub-millisecond in-memory revocation layer at the ingress edge.",
        typing_delay=delay
    )

    # Turn 4: Vanguard proposes Bloom Filter
    post("review-desk", "Vanguard [Principal Systems Architect]", "vanguard",
        "⚡ *Vanguard runs lookup latency benchmark on Redis Bloom Filter...*\n\n"
        "```yaml\n"
        "🔧 [TOOL CALL: redis_bloom_benchmark]\n"
        "capacity: 1000000\n"
        "error_rate: 0.0001\n"
        "bitset_size_mb: 2.38\n"
        "lookup_latency_micros: 140\n"
        "```\n"
        "Then an **edge Redis Bloom Filter bitset** is the answer. Revocation lookups take **0.14ms in RAM** with zero database queries. If a token is revoked, it's dropped instantly at ingress.",
        typing_delay=delay
    )

    # Turn 5: Ledger brings cost analysis
    post("review-desk", "Ledger [Lead Cloud Economics]", "ledger",
        "💰 **Now look at the infrastructure bill:**\n\n"
        "The author requested 12 dedicated `cache.r6g.2xlarge` nodes costing **$3,504/month ($42,048/yr)**. My utilization analysis showed off-peak traffic is only 20,000 sockets (16.4% memory use). That is $25,200/year burned on idle compute!\n\n"
        "We can deploy 4 nodes with 75% memory autoscale. It handles 120,000 peak bursts and saves **$25,200 every year**.",
        typing_delay=delay
    )

    # Turn 6: Titan data integrity mandate
    post("review-desk", "Titan [Data & State Reliability]", "titan",
        "🏛️ **Regarding event persistence:**\n\n"
        "My fault injection test killed worker nodes mid-write: **1.84% of messages were dropped** because Redis Pub/Sub and Postgres were dual-written without an atomic boundary. We must enforce the **Transactional Outbox Pattern** with Debezium CDC into Kafka for guaranteed at-least-once delivery.",
        typing_delay=delay
    )

    # Turn 7: Athena synthesizes
    post("review-desk", "Athena [Council Chair]", "athena",
        "📊 **COUNCIL CONSENSUS SYNTHESIS:**\n\n"
        "• **Security & Scale:** Edge Redis Bloom Filter bitset (<0.2ms lookup, zero DB load) — *Aegis & Vanguard aligned*.\n"
        "• **FinOps:** Downsized to 4 nodes + 75% memory autoscale (-$25,200/yr) — *Ledger aligned*.\n"
        "• **Reliability:** Postgres Transactional Outbox + Debezium CDC — *Titan aligned*.\n\n"
        "Lead Architect `@izigriss`: The floor is yours. Use `!summary`, `!diagram`, `!manifest`, or type `approve` to lock consensus.",
        typing_delay=delay
    )

    print("=== 4. HUMAN STEERING & VISUAL DIAGRAM ATTACHMENT ===")
    post("review-desk", "izigriss [Lead Architect]", "human", "!summary", typing_delay=1.0)

    post("review-desk", "Athena [Council Chair]", "athena",
        "⚡ **[COUNCIL EXECUTIVE DIGEST: RFC-042]**\n\n"
        "• **Resolution 1 (Security + Scale):** Deploy Redis Bloom Filter revocation bitset at gateway ingress (<0.2ms latency, zero Postgres load).\n"
        "• **Resolution 2 (FinOps):** Downsize from 12 static nodes to 4 primary nodes with 75% memory autoscaling. Saves $25,200 annually.\n"
        "• **Resolution 3 (Data):** Enforce Transactional Outbox table with Debezium CDC for guaranteed at-least-once fanout.\n"
        "• **Deliberation Status:** Ready for final sign-off.",
        typing_delay=delay
    )

    post("review-desk", "izigriss [Lead Architect]", "human", "!diagram", typing_delay=1.0)

    diagram_png = os.path.abspath("assets/diagram_rfc042_resolved.png")
    post("review-desk", "Athena [Council Chair]", "athena",
        "📊 **[SYNTHESIZED VECTOR SYSTEM TOPOLOGY]**\n\n"
        "Generated high-resolution system architecture topology resolving all 4 specialist invariants:",
        file_path=diagram_png,
        typing_delay=delay
    )

    post("review-desk", "izigriss [Lead Architect]", "human", "!manifest", typing_delay=1.0)

    post("review-desk", "Athena [Council Chair]", "athena",
        "📂 **[SECTION 6: IMPLEMENTATION SCAFFOLDING SPEC]**\n\n"
        "**Target Git Branch:** `git checkout -b feat/adr-042-impl`\n"
        "**Verification Harness:** `pytest tests/ -v`\n\n"
        "**Scaffolded File Manifest:**\n"
        "1. `[CREATE]` `src/middleware/bloom_revocation.py` — *Redis Bloom filter revocation middleware (Aegis & Vanguard)*\n"
        "2. `[CREATE]` `src/cluster/config.yaml` — *4-node autoscaling cluster spec saving $25,200/yr (Ledger)*\n"
        "3. `[CREATE]` `src/db/outbox_producer.py` — *Transactional Outbox pattern event producer (Titan)*\n\n"
        "**Terminal Agent Launch Execution Command:**\n"
        "```bash\n"
        "claude -p \"Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass.\"\n"
        "```",
        typing_delay=delay
    )

    print("=== 5. CONSENSUS & HANDOFF TO CLAUDE CODE ===")
    post("review-desk", "izigriss [Lead Architect]", "human", "approve", typing_delay=1.0)

    post("review-desk", "Athena [Council Chair]", "athena",
        "✅ **[COUNCIL CONSENSUS APPROVED BY LEAD ARCHITECT]**\n\n"
        "• **ADR Created:** `docs/adr/ADR-042.md` (Michael Nygard standard)\n"
        "• **GitHub Sticky Comment:** `PR_COMMENT_ADR-042.md`\n"
        "• **Handoff:** Handing off Section 6 scaffolding spec to `@ClaudeCode` in `#dev-implementation`...",
        typing_delay=delay
    )

    post("dev-implementation", "Athena [Council Chair]", "athena",
        "🚀 **[SWITCH IMPLEMENTER HANDOFF: BLINDCOUNCIL ➔ CLAUDE CODE / CODEX]**\n\n"
        "**Target System:** `RFC-042: Scalable Real-Time WebSocket Messaging Cluster`\n"
        "**Approved Architectural Decision:** `ADR-042.md`\n"
        "**Target Git Branch:** `git checkout -b feat/adr-042-impl`\n"
        "**Verification Test Command:** `pytest tests/ -v`\n\n"
        "**Scaffolded Repository Manifest:**\n"
        "1. `[CREATE]` `src/middleware/bloom_revocation.py` — Redis Bloom filter revocation middleware\n"
        "2. `[CREATE]` `src/cluster/config.yaml` — 4-node cluster autoscaling spec\n"
        "3. `[CREATE]` `src/db/outbox_producer.py` — Transactional Outbox pattern producer\n\n"
        "```bash\n"
        "claude -p \"Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass.\"\n"
        "```\n\n"
        "Handed off to `@ClaudeCode`. Autonomous implementation pipeline active!",
        typing_delay=delay
    )

    post("review-desk", "Athena [Council Chair]", "athena",
        "🔄 **[PIPELINE ACTIVE]** Implementation spec delivered to `@ClaudeCode` in `#dev-implementation` (`branch: feat/adr-042-impl`).",
        typing_delay=delay
    )

    print("ALL MESSAGES WITH TOOL CALLS AND TYPING INDICATORS DELIVERED TO DISCORD!")

if __name__ == "__main__":
    main()
