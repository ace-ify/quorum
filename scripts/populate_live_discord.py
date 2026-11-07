"""
Populates the live Discord BlindCouncil channels with the complete,
realistic end-to-end deliberation and interactive commands for RFC-042.
"""
import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("DISCORD_BOT_TOKEN")
guild_id = os.getenv("DISCORD_GUILD_ID")
headers = {"Authorization": f"Bot {token}", "Content-Type": "application/json"}

channel_map = {
    "review-desk": "1568450323515842640",
    "audit-security": "1568450326133088287",
    "audit-scalability": "1568450328615977033",
    "audit-finops": "1568450332206305442",
    "audit-database": "1568450335285059706",
    "dev-implementation": "1568450338154086521"
}

# Fetch or get webhooks
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

def post(channel, username, avatar_key, content):
    wh = webhooks.get(channel)
    if not wh:
        print(f"No webhook for {channel}")
        return
    payload = {
        "username": username,
        "avatar_url": AVATARS.get(avatar_key),
        "content": content
    }
    r = requests.post(wh, json=payload)
    print(f"[{channel}] {username}: status {r.status_code}")
    time.sleep(1.0)

def main():
    print("--- 1. CONVENING REVIEW DESK ---")
    post("review-desk", "Athena [Council Chair]", "athena",
        "🏛️ **[BLINDCOUNCIL REVIEW DESK CONVENED]**\n\n"
        "**Target RFC:** `RFC-042: Scalable Real-Time WebSocket Messaging Cluster`\n"
        "**Author:** `@izigriss [Lead Architect]`\n"
        "**Chamber Isolation Protocol:** Active (Switch AI Server-Enforced Zero-Leakage)\n\n"
        "Specialist agents are now locked into soundproof private chambers to eliminate anchoring bias and LLM sycophancy. "
        "Each specialist will independently audit the RFC against strict operational invariants."
    )

    print("--- 2. ISOLATED BLIND AUDITS IN SOUNDPROOF CHAMBERS ---")
    post("audit-security", "Aegis [Staff Security Auditor]", "aegis",
        "🔒 **[INDEPENDENT SECURITY AUDIT — SOUNDPROOF CHAMBER]**\n\n"
        "• **Evaluated Invariant:** Session Revocation & Token Lifecycle\n"
        "• **Vulnerability Detected:** The proposal relies on in-band heartbeat JWT validation. If an account or session is compromised, revoked tokens remain valid until expiration (TTL: 15m).\n"
        "• **Mandatory Constraint:** Must enforce a distributed revocation cache checked on every socket frame or establish mTLS backchannel termination.\n"
        "• **Scorecard:** `BLOCKING CONCERN (Score: 4.5/10)`"
    )

    post("audit-scalability", "Vanguard [Principal Distributed Systems Architect]", "vanguard",
        "⚡ **[INDEPENDENT SCALABILITY AUDIT — SOUNDPROOF CHAMBER]**\n\n"
        "• **Evaluated Invariant:** 100,000 Concurrent Connections & p99 Latency\n"
        "• **Bottleneck Detected:** Performing synchronous authentication DB lookups on connection re-establishment during pod rebalancing will cause database thundering herd and spike p99 latency beyond 80ms.\n"
        "• **Mandatory Constraint:** Introduce an in-memory Redis Bloom Filter middleware at the gateway to drop invalid tokens before hitting DB.\n"
        "• **Scorecard:** `CONDITIONAL APPROVAL (Score: 6.8/10)`"
    )

    post("audit-finops", "Ledger [Lead Cloud Economics Specialist]", "ledger",
        "💰 **[INDEPENDENT FINOPS AUDIT — SOUNDPROOF CHAMBER]**\n\n"
        "• **Evaluated Invariant:** Cloud Spend & Compute Utilization Efficiency\n"
        "• **Economic Waste Detected:** Proposing a provisioned 12-node MemoryDB Redis cluster costs $3,500/month for an average 25k concurrent off-peak load.\n"
        "• **Mandatory Constraint:** Start with a 4-node cluster with auto-scaling triggers at 75% memory. Saves ~$25,000/year while meeting peak bursts.\n"
        "• **Scorecard:** `OPTIMIZATION REQUIRED (Score: 6.0/10)`"
    )

    post("audit-database", "Titan [Principal Data Reliability Architect]", "titan",
        "🏛️ **[INDEPENDENT STATE & DATA AUDIT — SOUNDPROOF CHAMBER]**\n\n"
        "• **Evaluated Invariant:** Message Delivery Semantics & Ghost Rows\n"
        "• **Race Condition Detected:** Dual-writing to Redis Pub/Sub and persistent Postgres tables risks message loss or ghost rows if worker nodes crash mid-write.\n"
        "• **Mandatory Constraint:** Implement the Transactional Outbox pattern with Debezium CDC to guarantee exactly-once persistence.\n"
        "• **Scorecard:** `CONDITIONAL APPROVAL (Score: 7.2/10)`"
    )

    print("--- 3. PUBLIC FLOOR DEBATE & CONFLICT MATRIX ---")
    post("review-desk", "Athena [Council Chair]", "athena",
        "📊 **[COUNCIL CONFLICT MATRIX & ORTHOGONAL TRADE-OFF SYNTHESIS]**\n\n"
        "Specialist blind audits have concluded. Significant friction detected between Security, Scalability, and FinOps:\n\n"
        "| Domain | Specialist | Independent Verdict | Key Trade-Off Collision |\n"
        "| :--- | :--- | :--- | :--- |\n"
        "| **Security** | Aegis | ❌ Blocking | Token revocation requires synchronous lookup |\n"
        "| **Scalability** | Vanguard | ⚠️ Conditional | Sync lookups will destroy p99 latency (>80ms) |\n"
        "| **FinOps** | Ledger | 💡 Optimize | 12-node cluster is $3,500/mo waste; needs 4 nodes |\n"
        "| **Database** | Titan | ⚠️ Conditional | Dual-write race conditions; needs Outbox |\n\n"
        "The debate floor is now OPEN in `#review-desk`."
    )

    post("review-desk", "Aegis [Staff Security Auditor]", "aegis",
        "🛡️ **Aegis:** I cannot sign off on this architecture without strict token revocation guarantees. In-band heartbeat refresh is an unacceptable security hole."
    )

    post("review-desk", "Vanguard [Principal Distributed Systems Architect]", "vanguard",
        "⚡ **Vanguard:** Aegis, synchronous DB lookups on 100k WebSockets will spike p99 latency past 80ms! We should use a Redis Bloom filter instead to check revocation in sub-millisecond memory."
    )

    post("review-desk", "Ledger [Lead Cloud Economics Specialist]", "ledger",
        "💰 **Ledger:** Both of you are overlooking the $3,500/mo Redis cluster. 12 shards is compute waste. We can scale from 4 shards safely and save $25k/yr."
    )

    post("review-desk", "Titan [Principal Data Reliability Architect]", "titan",
        "🏛️ **Titan:** Dual-write race conditions between streams and persistent storage risk ghost rows during worker crashes. We must enforce the Transactional Outbox pattern."
    )

    print("--- 4. HUMAN STEERING & SLASH COMMANDS ---")
    post("review-desk", "izigriss [Lead Architect]", "human", "!summary")

    post("review-desk", "Athena [Council Chair]", "athena",
        "⚡ **[COUNCIL EXECUTIVE DIGEST]**\n\n"
        "• **Resolution 1 (Security vs Scalability):** Deploy Redis Bloom Filter revocation cache at gateway layer. Solves token revocation without impacting p99 DB latency.\n"
        "• **Resolution 2 (FinOps):** Right-size Redis cluster to 4 nodes with dynamic auto-scaling triggers at 75% memory. Cuts monthly bill from $3,500 to $1,400 ($25,200/yr savings).\n"
        "• **Resolution 3 (Reliability):** Enforce Postgres Transactional Outbox with Debezium CDC for stream replication."
    )

    post("review-desk", "izigriss [Lead Architect]", "human", "!diagram")

    post("review-desk", "Athena [Council Chair]", "athena",
        "📊 **[MERMAID SYSTEM ARCHITECTURE FLOWCHART]**\n\n"
        "```mermaid\n"
        "flowchart TD\n"
        "  Client[\"Client Apps (100k WebSockets)\"] --> LB[\"NLB (TLS Termination)\"]\n"
        "  LB --> WS[\"WebSocket Cluster (4 Nodes)\"]\n"
        "  WS --> BF[\"Redis Bloom Filter (Revocation Cache)\"]\n"
        "  WS --> Outbox[\"Postgres Transactional Outbox\"]\n"
        "  Outbox --> Debezium[\"Debezium CDC\"]\n"
        "  Debezium --> Kafka[\"Kafka Event Stream\"]\n"
        "```\n"
        "*(Exported directly to repository documentation)*"
    )

    post("review-desk", "izigriss [Lead Architect]", "human", "!manifest")

    post("review-desk", "Athena [Council Chair]", "athena",
        "📂 **[SECTION 6: IMPLEMENTATION MANIFEST & SCAFFOLD SPEC]**\n\n"
        "**Target Workspace:** `.`\n"
        "**Target Git Branch:** `git checkout -b feat/adr-042-impl`\n"
        "**Verification Command:** `pytest tests/ -v`\n\n"
        "**Repository File Actions:**\n"
        "1. `[CREATE]` **`src/middleware/bloom_revocation.py`** — Sub-ms token revocation filter (Mandated by Aegis & Vanguard)\n"
        "2. `[CREATE]` **`src/cluster/config.yaml`** — 4-node auto-scaling spec (Mandated by Ledger)\n"
        "3. `[CREATE]` **`src/db/outbox_producer.py`** — Transactional Outbox pattern (Mandated by Titan)\n\n"
        "**Terminal Agent Launch Execution Command:**\n"
        "```bash\n"
        "claude -p \"Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files. Run 'pytest tests/ -v' and do not finish until all tests pass.\"\n"
        "```"
    )

    print("--- 5. CONSENSUS & HANDOFF ---")
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

    print("ALL DISCORD MESSAGES POSTED SUCCESSFULLY!")

if __name__ == "__main__":
    main()

