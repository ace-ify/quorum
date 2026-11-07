"""
Populates real Discord channels with the multi-turn heated clash,
and attaches the high-res visual architecture diagram image directly into #review-desk!
"""
import os
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
    r = requests.get(f"https://discord.com/api/v10/channels/{cid}/webhooks", headers=headers)
    hooks = r.json()
    if hooks:
        webhooks[name] = hooks[0]["url"]
    else:
        cr = requests.post(f"https://discord.com/api/v10/channels/{cid}/webhooks", json={"name": f"{name}-Hook"}, headers=headers)
        webhooks[name] = cr.json().get("url")

AVATARS = {
    "athena": "https://api.dicebear.com/7.x/bottts/svg?seed=AthenaChair&backgroundColor=6366f1",
    "aegis": "https://api.dicebear.com/7.x/bottts/svg?seed=AegisSecurity&backgroundColor=ef4444",
    "vanguard": "https://api.dicebear.com/7.x/bottts/svg?seed=VanguardScale&backgroundColor=3b82f6",
    "ledger": "https://api.dicebear.com/7.x/bottts/svg?seed=LedgerFinOps&backgroundColor=10b981",
    "titan": "https://api.dicebear.com/7.x/bottts/svg?seed=TitanDatabase&backgroundColor=06b6d4",
    "human": "https://api.dicebear.com/7.x/avataaars/svg?seed=izigriss&backgroundColor=f59e0b",
    "claude": "https://api.dicebear.com/7.x/bottts/svg?seed=ClaudeCode&backgroundColor=8b5cf6"
}

def post(channel, username, avatar_key, content, file_path=None):
    wh = webhooks.get(channel)
    if not wh:
        print(f"No webhook for {channel}")
        return

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
            print(f"[{channel}] {username} (WITH FILE ATTACHMENT): status {r.status_code}")
    else:
        payload = {
            "username": username,
            "avatar_url": AVATARS.get(avatar_key),
            "content": content
        }
        r = requests.post(wh, json=payload)
        print(f"[{channel}] {username}: status {r.status_code}")
    
    time.sleep(1.0)

def main():
    print("=== 1. CONVENING REVIEW DESK ===")
    post("review-desk", "Athena [Council Chair]", "athena",
        "🏛️ **[BLINDCOUNCIL REVIEW DESK CONVENED: RFC-042]**\n\n"
        "**Target Proposal:** `RFC-042: Scalable Real-Time WebSocket Messaging Cluster (100k Concurrent Connections)`\n"
        "**Lead Architect:** `@izigriss [Lead Architect]`\n"
        "**Chamber Isolation Protocol:** Active (Switch AI Server-Enforced Zero-Leakage)\n\n"
        "Specialist agents are now dispatched to isolated, soundproof audit chambers. Zero cross-agent tokens or anchoring biases permitted."
    )

    print("=== 2. SOUNDPROOF ISOLATED CHAMBERS AUDITS ===")
    post("audit-security", "Aegis [Staff Security Auditor]", "aegis",
        "🔒 **[INDEPENDENT SECURITY AUDIT — SOUNDPROOF CHAMBER]**\n\n"
        "• **Evaluated Invariant:** Session Revocation & Token Lifecycle\n"
        "• **Vulnerability Detected:** The proposal relies on in-band heartbeat JWT validation. If an account or session is compromised, revoked tokens remain valid until TTL expiry (15 min). Active CVE risk under SOC2 Article 4.\n"
        "• **Mandatory Constraint:** Must enforce a distributed revocation cache checked on every socket frame or establish edge termination.\n"
        "• **Scorecard:** `BLOCKING CONCERN (Score: 4.5/10)`"
    )

    post("audit-scalability", "Vanguard [Principal Distributed Systems Architect]", "vanguard",
        "⚡ **[INDEPENDENT SCALABILITY AUDIT — SOUNDPROOF CHAMBER]**\n\n"
        "• **Evaluated Invariant:** 100,000 Concurrent Connections & p99 Latency\n"
        "• **Bottleneck Detected:** Performing synchronous auth DB lookups on connection re-establishment during pod rebalancing will cause database thundering herd and spike p99 latency beyond 140ms.\n"
        "• **Mandatory Constraint:** Introduce an in-memory Redis Bloom Filter middleware at the gateway to drop invalid tokens before hitting DB.\n"
        "• **Scorecard:** `CONDITIONAL APPROVAL (Score: 6.8/10)`"
    )

    post("audit-finops", "Ledger [Lead Cloud Economics Specialist]", "ledger",
        "💰 **[INDEPENDENT FINOPS AUDIT — SOUNDPROOF CHAMBER]**\n\n"
        "• **Evaluated Invariant:** Cloud Spend & Compute Utilization Efficiency\n"
        "• **Economic Waste Detected:** Proposing a provisioned 12-node MemoryDB Redis cluster costs $3,500/month for an average 20k off-peak load. That is $42,000/year in compute waste.\n"
        "• **Mandatory Constraint:** Start with a 4-node cluster with auto-scaling triggers at 75% memory. Saves ~$25,200/year while meeting peak bursts.\n"
        "• **Scorecard:** `OPTIMIZATION REQUIRED (Score: 6.0/10)`"
    )

    post("audit-database", "Titan [Principal Data Reliability Architect]", "titan",
        "🏛️ **[INDEPENDENT STATE & DATA AUDIT — SOUNDPROOF CHAMBER]**\n\n"
        "• **Evaluated Invariant:** Message Delivery Semantics & Ghost Rows\n"
        "• **Race Condition Detected:** Dual-writing directly to Redis Pub/Sub and persistent Postgres tables risks message loss or ghost rows if worker nodes crash mid-write.\n"
        "• **Mandatory Constraint:** Implement the Transactional Outbox pattern with Debezium CDC to guarantee exactly-once persistence.\n"
        "• **Scorecard:** `CONDITIONAL APPROVAL (Score: 7.2/10)`"
    )

    print("=== 3. PUBLIC FLOOR DEBATE: MULTI-TURN HEATED CLASH ===")
    post("review-desk", "Athena [Council Chair]", "athena",
        "📊 **[COUNCIL CONFLICT MATRIX & ORTHOGONAL TRADE-OFF SYNTHESIS]**\n\n"
        "Chamber audits completed. Significant orthogonal friction detected between Security, Scalability, FinOps, and Database:\n\n"
        "| Domain | Specialist | Independent Verdict | Orthogonal Friction |\n"
        "| :--- | :--- | :--- | :--- |\n"
        "| **Security** | Aegis | ❌ Blocking | Token revocation requires synchronous lookup |\n"
        "| **Scalability** | Vanguard | ⚠️ Conditional | Sync DB lookups will destroy p99 latency (>140ms) |\n"
        "| **FinOps** | Ledger | 💡 Optimize | 12-node cluster is $3,500/mo waste; needs 4 nodes |\n"
        "| **Database** | Titan | ⚠️ Conditional | Dual-write race conditions; needs Outbox |\n\n"
        "The debate floor is now OPEN in `#review-desk`."
    )

    # Turn 1: Aegis attacks
    post("review-desk", "Aegis [Staff Security Auditor]", "aegis",
        "🚨 **BLOCKING:** RFC-042 relies on in-band heartbeat JWT validation. If a user token is revoked, our gateway allows 15 minutes of unauthorized socket frames before TTL expiry. This is an active CVE risk under SOC2 Article 4."
    )

    # Turn 2: Vanguard counters
    post("review-desk", "Vanguard [Principal Distributed Systems Architect]", "vanguard",
        "⚡ **HOLD ON AEGIS:** If we do synchronous DB queries on 100k WebSockets during pod rolling restarts, the connection pool will instantly exhaust and crash the database! p99 latency will spike past 140ms."
    )

    # Turn 3: Aegis demands edge revocation
    post("review-desk", "Aegis [Staff Security Auditor]", "aegis",
        "🛡️ I’m not asking for raw database queries on every frame, Vanguard! We need a distributed, sub-millisecond revocation layer at the gateway edge."
    )

    # Turn 4: Vanguard proposes Bloom Filter
    post("review-desk", "Vanguard [Principal Distributed Systems Architect]", "vanguard",
        "⚡ Then a **Redis Bloom Filter** with an in-memory bitset is the only viable path. Sub-0.2ms lookups with zero database hits. That gives you 100% revocation coverage without touching Postgres."
    )

    # Turn 5: Ledger budget intervention
    post("review-desk", "Ledger [Lead Cloud Economics Specialist]", "ledger",
        "💰 **CHECK YOUR BUDGET BOTH OF YOU:** The author spec'd a 12-node provisioned MemoryDB cluster at $3,500/month for an off-peak baseline of only 20,000 connections! That is $42,000/year in compute waste. We can safely launch with a 4-node cluster with 75% memory autoscale. That saves **$25,200/year** while still handling peak surges."
    )

    # Turn 6: Titan data reliability mandate
    post("review-desk", "Titan [Principal Data Reliability Architect]", "titan",
        "🏛️ **DATA INTEGRITY INVARIANT:** Dual-writing directly to Redis Pub/Sub and Postgres causes message loss during worker crashes. We must enforce the Transactional Outbox pattern with Debezium CDC for guaranteed at-least-once delivery."
    )

    # Turn 7: Athena synthesizes
    post("review-desk", "Athena [Council Chair]", "athena",
        "📊 **CONSENSUS SYNTHESIS:**\n"
        "• Security: Redis Bloom Filter adopted (Sub-0.2ms revocation)\n"
        "• Scalability: Zero DB hits on auth check\n"
        "• FinOps: Right-sized to 4-node cluster (Saves $25,200/yr)\n"
        "• Data: Transactional Outbox enforced\n\n"
        "Lead Architect @izigriss: The council awaits your steering or approval."
    )

    print("=== 4. HUMAN STEERING & VISUAL DIAGRAM ATTACHMENT ===")
    post("review-desk", "izigriss [Lead Architect]", "human", "!summary")

    post("review-desk", "Athena [Council Chair]", "athena",
        "⚡ **[COUNCIL EXECUTIVE DIGEST]**\n\n"
        "• **Resolution 1 (Security vs Scalability):** Deploy Redis Bloom Filter revocation cache at gateway layer. Solves token revocation without impacting p99 DB latency.\n"
        "• **Resolution 2 (FinOps):** Right-size cluster to 4 nodes with dynamic auto-scaling triggers at 75% memory. Cuts monthly bill from $3,500 to $1,400 ($25,200/yr savings).\n"
        "• **Resolution 3 (Reliability):** Enforce Postgres Transactional Outbox with Debezium CDC for stream replication."
    )

    # The visual diagram attachment command!
    post("review-desk", "izigriss [Lead Architect]", "human", "!diagram")

    diagram_png = os.path.abspath("assets/diagram_rfc042_resolved.png")
    post("review-desk", "Athena [Council Chair]", "athena",
        "📊 **[MERMAID SYSTEM ARCHITECTURE VISUALIZATION]**\n\n"
        "Generated visual architecture topology based on Council Decision Matrix. Component blocks, invariants, and savings mapped below:",
        file_path=diagram_png
    )

    post("review-desk", "izigriss [Lead Architect]", "human", "!manifest")

    post("review-desk", "Athena [Council Chair]", "athena",
        "📂 **[SECTION 6: IMPLEMENTATION MANIFEST & SCAFFOLD SPEC]**\n\n"
        "**Target Workspace:** `.`\n"
        "**Target Git Branch:** `git checkout -b feat/adr-042-impl`\n"
        "**Verification Command:** `pytest tests/ -v`\n\n"
        "**Repository File Actions:**\n"
        "1. `[CREATE]` **`src/middleware/bloom_revocation.py`** — Redis Bloom filter revocation middleware (Mandated by Aegis & Vanguard)\n"
        "2. `[CREATE]` **`src/cluster/config.yaml`** — 4-node auto-scaling spec (Mandated by Ledger)\n"
        "3. `[CREATE]` **`src/db/outbox_producer.py`** — Transactional Outbox pattern (Mandated by Titan)\n\n"
        "**Terminal Agent Launch Execution Command:**\n"
        "```bash\n"
        "claude -p \"Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files. Run 'pytest tests/ -v' and do not finish until all tests pass.\"\n"
        "```"
    )

    print("=== 5. CONSENSUS & HANDOFF TO CLAUDE CODE ===")
    post("review-desk", "izigriss [Lead Architect]", "human", "approve")

    post("review-desk", "Athena [Council Chair]", "athena",
        "📝 **[COUNCIL CONSENSUS APPROVED]** Lead Architect @izigriss approved the architecture. Locking decisions and publishing deliverables...\n\n"
        "• ✅ Generated: `ADR-042_Scalable_RealTime_WebSocket_Cluster.md`\n"
        "• ✅ Generated: `PR_COMMENT_ADR-042.md` (Sticky Review Comment ready for GitHub)\n"
        "• 🔄 Handing off implementation spec to `@ClaudeCode` in `#dev-implementation`..."
    )

    post("dev-implementation", "Athena [Council Chair]", "athena",
        "🚀 **[SWITCH IMPLEMENTER HANDOFF: BLINDCOUNCIL ➔ CLAUDE CODE / CODEX]** 🚀\n\n"
        "**Target System:** `RFC-042: Scalable Real-Time WebSocket Messaging Cluster`\n"
        "**Approved Architectural Decision:** `ADR-042.md`\n"
        "**Target Git Branch:** `git checkout -b feat/adr-042-impl`\n"
        "**Verification Harness:** `pytest tests/ -v`\n\n"
        "Attention **@ClaudeCode** / **@CodexDeveloper**:\n"
        "The Architecture Review Board has officially locked consensus. You are authorized to implement the following concrete repository manifest:\n\n"
        "1. `[CREATE]` **`src/middleware/bloom_revocation.py`** — Redis Bloom filter revocation middleware\n"
        "2. `[CREATE]` **`src/cluster/config.yaml`** — 4-node autoscaling cluster configuration\n"
        "3. `[CREATE]` **`src/db/outbox_producer.py`** — Transactional Outbox producer\n\n"
        "```bash\n"
        "claude -p \"Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass.\"\n"
        "```\n\n"
        "👉 *Terminal coding agent is initialized. Run unit tests and submit PR for final Council sign-off.*"
    )

    post("review-desk", "Athena [Council Chair]", "athena",
        "🔄 **[PIPELINE HANDOFF COMPLETE]** Implementation manifest handed off to `@ClaudeCode` in `#dev-implementation` (`branch: feat/adr-042-impl`)."
    )

    print("DYNAMIC CLASH & VISUAL ATTACHMENT POSTED TO DISCORD SUCCESSFULLY!")

if __name__ == "__main__":
    main()
