"""
Generates high-fidelity 1080p Discord UI frames for the 5 BlindCouncil demo scenes,
and renders them into full-motion video perfectly synchronized with the voiceover track.
"""
import os
import subprocess

BRAVE_EXE = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
FFMPEG = r"C:\Users\ace21\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"

CSS_DISCORD = """
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    background-color: #313338;
    color: #dbdee1;
    font-family: 'gg sans', 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    display: flex;
    height: 1080px;
    width: 1920px;
    overflow: hidden;
}

/* Server sidebar */
.guild-nav {
    width: 72px;
    background-color: #1e1f22;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0;
    gap: 10px;
}
.guild-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #5865f2;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}
.guild-icon.active {
    border-radius: 16px;
    background-color: #4752c4;
}

/* Channel sidebar */
.channel-sidebar {
    width: 260px;
    background-color: #2b2d31;
    display: flex;
    flex-direction: column;
}
.server-header {
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 700;
    font-size: 15px;
    color: #f2f3f5;
    border-bottom: 1px solid #1f2023;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.category-header {
    padding: 18px 16px 6px;
    font-size: 12px;
    font-weight: 800;
    color: #949ba4;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.channel-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 2px 8px;
    padding: 7px 10px;
    border-radius: 4px;
    color: #949ba4;
    font-size: 14.5px;
    font-weight: 500;
}
.channel-item.active {
    background-color: #404249;
    color: #ffffff;
    font-weight: 600;
}
.channel-item .hash {
    font-size: 18px;
    color: #80848e;
}
.channel-item.active .hash {
    color: #ffffff;
}

.user-bar {
    margin-top: auto;
    height: 52px;
    background-color: #232428;
    padding: 0 10px;
    display: flex;
    align-items: center;
    gap: 10px;
}
.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #f59e0b;
}

/* Main chat area */
.chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #313338;
}
.chat-header {
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #1f2023;
    box-shadow: 0 1px 2px rgba(0,0,0,0.15);
}
.chat-header-title {
    font-size: 16px;
    font-weight: 700;
    color: #f2f3f5;
    display: flex;
    align-items: center;
    gap: 8px;
}
.chat-header-topic {
    font-size: 13.5px;
    color: #949ba4;
    border-left: 1px solid #3f4147;
    padding-left: 12px;
    margin-left: 4px;
}

.messages-list {
    flex: 1;
    padding: 20px 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 18px;
}
.message-card {
    display: flex;
    gap: 16px;
}
.msg-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    flex-shrink: 0;
}
.msg-body {
    flex: 1;
}
.msg-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}
.msg-author {
    font-size: 15px;
    font-weight: 600;
    color: #f2f3f5;
}
.msg-badge {
    background-color: #5865f2;
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 3px;
    text-transform: uppercase;
}
.msg-badge.human {
    background-color: #f59e0b;
}
.msg-time {
    font-size: 12px;
    color: #949ba4;
}
.msg-content {
    font-size: 14.5px;
    line-height: 1.45;
    color: #dbdee1;
}

/* Discord Embed */
.embed {
    margin-top: 8px;
    padding: 14px 18px;
    background-color: #2b2d31;
    border-left: 4px solid #5865f2;
    border-radius: 4px;
    max-width: 950px;
}
.embed.red { border-left-color: #ef4444; }
.embed.blue { border-left-color: #3b82f6; }
.embed.green { border-left-color: #10b981; }
.embed.cyan { border-left-color: #06b6d4; }
.embed.gold { border-left-color: #f59e0b; }

.embed-title {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 8px;
}
.embed-desc {
    font-size: 13.5px;
    color: #dbdee1;
    line-height: 1.4;
}

/* Table in Embed */
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 13px;
}
th, td {
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid #3f4147;
}
th {
    background-color: #1e1f22;
    color: #b5bac1;
    font-weight: 700;
}

/* Code block */
pre {
    background-color: #1e1f22;
    border: 1px solid #232428;
    border-radius: 4px;
    padding: 10px 14px;
    margin-top: 6px;
    font-family: 'Consolas', monospace;
    font-size: 12.5px;
    color: #7dd3fc;
    overflow-x: auto;
}

/* Bottom Chat Input */
.chat-input-bar {
    height: 68px;
    padding: 0 20px 18px;
    background-color: #313338;
}
.input-box {
    height: 44px;
    background-color: #383a40;
    border-radius: 8px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    color: #80848e;
    font-size: 14.5px;
    gap: 12px;
}

/* Chamber grid in scene 2 */
.chamber-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 10px;
}
.chamber-card {
    background: #2b2d31;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #3f4147;
}
"""

def generate_scene_html(scene_num: int) -> str:
    active_channel = "dev-implementation" if scene_num == 5 else "review-desk"
    
    sidebar = f"""
    <div class="guild-nav">
        <div class="guild-icon active">🏛️</div>
        <div class="guild-icon">SW</div>
        <div class="guild-icon">GH</div>
    </div>
    <div class="channel-sidebar">
        <div class="server-header">
            <span>🏛️ BlindCouncil Desk</span>
            <span style="font-size:12px;">▼</span>
        </div>
        <div class="category-header">▼ BLINDCOUNCIL REVIEW DESK</div>
        <div class="channel-item {'active' if active_channel=='review-desk' else ''}">
            <span class="hash">#</span> review-desk
        </div>
        <div class="channel-item {'active' if active_channel=='audit-security' else ''}">
            <span class="hash">🔒</span> audit-security
        </div>
        <div class="channel-item {'active' if active_channel=='audit-scalability' else ''}">
            <span class="hash">🔒</span> audit-scalability
        </div>
        <div class="channel-item {'active' if active_channel=='audit-finops' else ''}">
            <span class="hash">🔒</span> audit-finops
        </div>
        <div class="channel-item {'active' if active_channel=='audit-database' else ''}">
            <span class="hash">🔒</span> audit-database
        </div>
        <div class="channel-item {'active' if active_channel=='dev-implementation' else ''}">
            <span class="hash">🚀</span> dev-implementation
        </div>
        
        <div class="user-bar">
            <img class="user-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=izigriss&backgroundColor=f59e0b" />
            <div style="flex:1;">
                <div style="font-size:13px;font-weight:700;color:#fff;">izigriss</div>
                <div style="font-size:11px;color:#949ba4;">Lead Architect</div>
            </div>
            <div style="color:#b5bac1;font-size:16px;">🎤 🎧 ⚙️</div>
        </div>
    </div>
    """

    content = ""

    if scene_num == 1:
        # Scene 1: Intake & Convening
        header_title = "# review-desk"
        header_topic = "🏛️ Main Council Chamber: RFC Submission, Conflict Synthesis, Human Steering & Consensus"
        content = """
        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=AthenaChair&backgroundColor=6366f1" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#a5b4fc;">Athena [Council Chair]</span>
                    <span class="msg-badge">BOT</span>
                    <span class="msg-time">Today at 8:00 AM</span>
                </div>
                <div class="msg-content">
                    🏛️ <strong>[BLINDCOUNCIL REVIEW DESK CONVENED]</strong><br><br>
                    <strong>Target System:</strong> <code>RFC-042: Scalable Real-Time WebSocket Messaging Cluster</code><br>
                    <strong>Lead Architect:</strong> <code>@izigriss [Lead Architect]</code><br>
                    <strong>Switch Server Isolation Protocol:</strong> <span style="color:#4ade80;">ACTIVE (Zero-Leakage Soundproof Chambers)</span>
                </div>
                <div class="embed">
                    <div class="embed-title">🛡️ Switch AI Server-Enforced Room Isolation Protocol</div>
                    <div class="embed-desc">
                        To eliminate <strong>LLM sycophancy, context pollution, and groupthink</strong>, specialist agents are physically partitioned into isolated audit chambers before meeting on the public floor.<br><br>
                        • <code>#audit-security</code> ➔ <strong>Aegis</strong> (Staff Security & Invariant Auditor)<br>
                        • <code>#audit-scalability</code> ➔ <strong>Vanguard</strong> (Principal Distributed Systems Architect)<br>
                        • <code>#audit-finops</code> ➔ <strong>Ledger</strong> (Lead Cloud Economics Specialist)<br>
                        • <code>#audit-database</code> ➔ <strong>Titan</strong> (Principal Data Reliability Architect)<br><br>
                        <em>Zero cross-chamber tokens or opinions are leaked. Independent sovereign evaluations underway...</em>
                    </div>
                </div>
            </div>
        </div>
        """

    elif scene_num == 2:
        # Scene 2: Isolated Blind Audits
        header_title = "🔒 Soundproof Audit Chambers (Switch Server Isolation)"
        header_topic = "Zero-Leakage Multi-Chamber Deliberation: Specialists Evaluating Without Cross-Anchoring"
        content = """
        <div style="background:#232428;padding:12px 18px;border-radius:6px;border:1px solid #3b82f6;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;">
            <div>
                <span style="font-weight:700;color:#60a5fa;font-size:15px;">🛡️ SWITCH SERVER ISOLATION STATUS:</span>
                <span style="color:#4ade80;font-weight:700;margin-left:8px;">✅ 100% BLIND ISOLATION VERIFIED</span>
            </div>
            <div style="font-size:13px;color:#949ba4;">RFC-042 Dispatched to 4 Soundproof Chambers</div>
        </div>

        <div class="chamber-grid">
            <div class="chamber-card" style="border-left:4px solid #ef4444;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                    <img style="width:32px;height:32px;border-radius:50%;" src="https://api.dicebear.com/7.x/bottts/svg?seed=AegisSecurity&backgroundColor=ef4444" />
                    <div>
                        <div style="font-weight:700;color:#f87171;">#audit-security — Aegis</div>
                        <div style="font-size:11px;color:#949ba4;">Staff Security Auditor</div>
                    </div>
                </div>
                <div style="font-size:13px;line-height:1.4;">
                    <strong>Vulnerability:</strong> In-band heartbeat token validation permits 15m revoked token window.<br>
                    <strong>Mandate:</strong> Distributed revocation cache on socket frame.<br>
                    <span style="color:#ef4444;font-weight:700;">Verdict: BLOCKING CONCERN (Score: 4.5/10)</span>
                </div>
            </div>

            <div class="chamber-card" style="border-left:4px solid #3b82f6;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                    <img style="width:32px;height:32px;border-radius:50%;" src="https://api.dicebear.com/7.x/bottts/svg?seed=VanguardScale&backgroundColor=3b82f6" />
                    <div>
                        <div style="font-weight:700;color:#60a5fa;">#audit-scalability — Vanguard</div>
                        <div style="font-size:11px;color:#949ba4;">Principal Distributed Systems Architect</div>
                    </div>
                </div>
                <div style="font-size:13px;line-height:1.4;">
                    <strong>Bottleneck:</strong> Synchronous auth DB lookups on 100k reconnects will spike p99 past 80ms.<br>
                    <strong>Mandate:</strong> In-memory Redis Bloom filter at gateway.<br>
                    <span style="color:#60a5fa;font-weight:700;">Verdict: CONDITIONAL APPROVAL (Score: 6.8/10)</span>
                </div>
            </div>

            <div class="chamber-card" style="border-left:4px solid #10b981;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                    <img style="width:32px;height:32px;border-radius:50%;" src="https://api.dicebear.com/7.x/bottts/svg?seed=LedgerFinOps&backgroundColor=10b981" />
                    <div>
                        <div style="font-weight:700;color:#34d399;">#audit-finops — Ledger</div>
                        <div style="font-size:11px;color:#949ba4;">Lead Cloud Economics Specialist</div>
                    </div>
                </div>
                <div style="font-size:13px;line-height:1.4;">
                    <strong>Economic Waste:</strong> Provisioned 12-node MemoryDB cluster costs $3,500/mo.<br>
                    <strong>Mandate:</strong> Start with 4 nodes with 75% auto-scaling (Saves $25,200/yr).<br>
                    <span style="color:#34d399;font-weight:700;">Verdict: OPTIMIZATION REQUIRED (Score: 6.0/10)</span>
                </div>
            </div>

            <div class="chamber-card" style="border-left:4px solid #06b6d4;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                    <img style="width:32px;height:32px;border-radius:50%;" src="https://api.dicebear.com/7.x/bottts/svg?seed=TitanDatabase&backgroundColor=06b6d4" />
                    <div>
                        <div style="font-weight:700;color:#22d3ee;">#audit-database — Titan</div>
                        <div style="font-size:11px;color:#949ba4;">Principal Data Reliability Architect</div>
                    </div>
                </div>
                <div style="font-size:13px;line-height:1.4;">
                    <strong>Race Condition:</strong> Dual-writing to Redis and Postgres risks ghost rows.<br>
                    <strong>Mandate:</strong> Enforce Transactional Outbox pattern with Debezium CDC.<br>
                    <span style="color:#22d3ee;font-weight:700;">Verdict: CONDITIONAL APPROVAL (Score: 7.2/10)</span>
                </div>
            </div>
        </div>
        """

    elif scene_num == 3:
        # Scene 3: Public Floor Debate & Conflict Synthesis
        header_title = "# review-desk"
        header_topic = "Public Deliberation Floor: Resolving Orthogonal Architectural Trade-Offs"
        content = """
        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=AthenaChair&backgroundColor=6366f1" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#a5b4fc;">Athena [Council Chair]</span>
                    <span class="msg-badge">BOT</span>
                    <span class="msg-time">Today at 8:02 AM</span>
                </div>
                <div class="embed">
                    <div class="embed-title">📊 COUNCIL CONFLICT MATRIX & ORTHOGONAL TRADE-OFF SYNTHESIS</div>
                    <table>
                        <tr><th>Domain</th><th>Specialist</th><th>Independent Verdict</th><th>Orthogonal Friction</th></tr>
                        <tr><td><b>Security</b></td><td>Aegis</td><td style="color:#ef4444;">❌ Blocking</td><td>Token revocation requires synchronous lookup</td></tr>
                        <tr><td><b>Scalability</b></td><td>Vanguard</td><td style="color:#60a5fa;">⚠️ Conditional</td><td>Sync lookups will destroy p99 latency (>80ms)</td></tr>
                        <tr><td><b>FinOps</b></td><td>Ledger</td><td style="color:#34d399;">💡 Optimize</td><td>12-node cluster is $3,500/mo waste; needs 4 nodes</td></tr>
                        <tr><td><b>Database</b></td><td>Titan</td><td style="color:#22d3ee;">⚠️ Conditional</td><td>Dual-write race conditions; needs Outbox</td></tr>
                    </table>
                </div>
            </div>
        </div>

        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=AegisSecurity&backgroundColor=ef4444" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#f87171;">Aegis [Staff Security Auditor]</span>
                    <span class="msg-badge">BOT</span>
                    <span class="msg-time">Today at 8:02 AM</span>
                </div>
                <div class="msg-content">
                    🛡️ <strong>Aegis:</strong> I cannot sign off on this architecture without strict token revocation guarantees. In-band heartbeat refresh is an unacceptable security hole.
                </div>
            </div>
        </div>

        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=VanguardScale&backgroundColor=3b82f6" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#60a5fa;">Vanguard [Principal Distributed Systems Architect]</span>
                    <span class="msg-badge">BOT</span>
                    <span class="msg-time">Today at 8:02 AM</span>
                </div>
                <div class="msg-content">
                    ⚡ <strong>Vanguard:</strong> Aegis, synchronous DB lookups on 100k WebSockets will spike p99 latency past 80ms! We should use a Redis Bloom filter instead to check revocation in sub-millisecond memory.
                </div>
            </div>
        </div>

        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=LedgerFinOps&backgroundColor=10b981" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#34d399;">Ledger [Lead Cloud Economics Specialist]</span>
                    <span class="msg-badge">BOT</span>
                    <span class="msg-time">Today at 8:03 AM</span>
                </div>
                <div class="msg-content">
                    💰 <strong>Ledger:</strong> Both of you are overlooking the $3,500/mo Redis cluster. 12 shards is compute waste. We can scale from 4 shards safely and save $25k/yr.
                </div>
            </div>
        </div>
        """

    elif scene_num == 4:
        # Scene 4: Human Steering & Slash Commands
        header_title = "# review-desk"
        header_topic = "Human-in-the-Loop Steering: Interactive Fast Commands & Architectural Directives"
        content = """
        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=izigriss&backgroundColor=f59e0b" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#fbbf24;">izigriss [Lead Architect]</span>
                    <span class="msg-badge human">AUTHOR</span>
                    <span class="msg-time">Today at 8:03 AM</span>
                </div>
                <div class="msg-content"><code>!summary</code></div>
            </div>
        </div>

        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=AthenaChair&backgroundColor=6366f1" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#a5b4fc;">Athena [Council Chair]</span>
                    <span class="msg-badge">BOT</span>
                    <span class="msg-time">Today at 8:03 AM</span>
                </div>
                <div class="embed green">
                    <div class="embed-title">⚡ COUNCIL EXECUTIVE DIGEST</div>
                    <div class="embed-desc">
                        • <strong>Security vs Scalability:</strong> Deploy Redis Bloom Filter revocation cache at gateway layer. Solves token revocation without impacting p99 DB latency.<br>
                        • <strong>FinOps:</strong> Right-size cluster to 4 nodes with dynamic auto-scaling triggers at 75% memory. Saves <strong>$25,200/year</strong>.<br>
                        • <strong>Reliability:</strong> Enforce Postgres Transactional Outbox with Debezium CDC for stream replication.
                    </div>
                </div>
            </div>
        </div>

        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=izigriss&backgroundColor=f59e0b" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#fbbf24;">izigriss [Lead Architect]</span>
                    <span class="msg-badge human">AUTHOR</span>
                    <span class="msg-time">Today at 8:04 AM</span>
                </div>
                <div class="msg-content"><code>!diagram</code></div>
            </div>
        </div>

        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=AthenaChair&backgroundColor=6366f1" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#a5b4fc;">Athena [Council Chair]</span>
                    <span class="msg-badge">BOT</span>
                    <span class="msg-time">Today at 8:04 AM</span>
                </div>
                <div class="embed cyan">
                    <div class="embed-title">📊 MERMAID SYSTEM ARCHITECTURE FLOWCHART</div>
                    <pre>flowchart TD
  Client["Client Apps (100k WebSockets)"] --> LB["NLB (TLS Termination)"]
  LB --> WS["WebSocket Cluster (4 Nodes)"]
  WS --> BF["Redis Bloom Filter (Revocation Cache)"]
  WS --> Outbox["Postgres Transactional Outbox"]
  Outbox --> Debezium["Debezium CDC"] --> Kafka["Event Stream"]</pre>
                </div>
            </div>
        </div>
        """

    elif scene_num == 5:
        # Scene 5: Consensus, Official ADR & Handoff to Claude Code in #dev-implementation
        header_title = "🚀 # dev-implementation"
        header_topic = "Autonomous Code Implementation: Section 6 Scaffolding Spec Handoff to Terminal Coding Agents"
        content = """
        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=izigriss&backgroundColor=f59e0b" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#fbbf24;">izigriss [Lead Architect]</span>
                    <span class="msg-badge human">AUTHOR</span>
                    <span class="msg-time">Today at 8:05 AM</span>
                </div>
                <div class="msg-content" style="font-weight:700;color:#4ade80;">approve</div>
            </div>
        </div>

        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=AthenaChair&backgroundColor=6366f1" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#a5b4fc;">Athena [Council Chair]</span>
                    <span class="msg-badge">BOT</span>
                    <span class="msg-time">Today at 8:05 AM</span>
                </div>
                <div class="embed gold">
                    <div class="embed-title">🚀 [SWITCH IMPLEMENTER HANDOFF: BLINDCOUNCIL ➔ CLAUDE CODE / CODEX]</div>
                    <div class="embed-desc">
                        <strong>Target System:</strong> <code>RFC-042: Scalable Real-Time WebSocket Messaging Cluster</code><br>
                        <strong>Approved Architectural Decision:</strong> <code>ADR-042.md</code> (Michael Nygard standard)<br>
                        <strong>GitHub Sticky Comment:</strong> <code>PR_COMMENT_ADR-042.md</code><br>
                        <strong>Target Git Branch:</strong> <code>git checkout -b feat/adr-042-impl</code><br>
                        <strong>Verification Harness:</strong> <code>pytest tests/ -v</code><br><br>
                        <strong>📂 Approved Implementation File Manifest:</strong><br>
                        1. <code>[CREATE]</code> <strong>src/middleware/bloom_revocation.py</strong> — Redis Bloom filter revocation middleware<br>
                        2. <code>[CREATE]</code> <strong>src/cluster/config.yaml</strong> — 4-node auto-scaling spec ($25,200/yr savings)<br>
                        3. <code>[CREATE]</code> <strong>src/db/outbox_producer.py</strong> — Transactional Outbox pattern producer<br><br>
                        <strong>⚡ Terminal Agent Launch Execution Command:</strong>
                        <pre>claude -p "Read ADR-042.md Section 6. Switch to branch 'feat/adr-042-impl'. Implement the scaffolded files in '.'. Run 'pytest tests/ -v' and do not finish until all tests pass."</pre>
                        <br>
                        <span style="color:#4ade80;font-weight:700;">✅ Handed off to @ClaudeCode. Autonomous implementation pipeline active!</span>
                    </div>
                </div>
            </div>
        </div>
        """

    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>{CSS_DISCORD}</style>
</head>
<body>
    {sidebar}
    <div class="chat-container">
        <div class="chat-header">
            <div class="chat-header-title">{header_title}</div>
            <div class="chat-header-topic">{header_topic}</div>
        </div>
        <div class="messages-list">
            {content}
        </div>
        <div class="chat-input-bar">
            <div class="input-box">
                <span style="color:#b5bac1;font-size:18px;">+</span>
                <span>Message #{active_channel}</span>
                <span style="margin-left:auto;color:#b5bac1;font-size:16px;">🎁 GIF 😀</span>
            </div>
        </div>
    </div>
</body>
</html>
"""
    return html

def main():
    print("=== 1. GENERATING 5 SCENE HTML FILES ===")
    os.makedirs("demo_scenes", exist_ok=True)
    for i in range(1, 6):
        html_code = generate_scene_html(i)
        fn = f"demo_scenes/scene_{i}.html"
        with open(fn, "w", encoding="utf-8") as f:
            f.write(html_code)
        print(f"Generated {fn}")

    print("\n=== 2. RENDERING SCENES TO 1080P PNG FRAMES VIA BRAVE HEADLESS ===")
    png_frames = []
    for i in range(1, 6):
        html_abs = os.path.abspath(f"demo_scenes/scene_{i}.html")
        png_abs = os.path.abspath(f"demo_scenes/scene_{i}.png")
        cmd = [
            BRAVE_EXE,
            "--headless",
            "--disable-gpu",
            "--window-size=1920,1080",
            f"--screenshot={png_abs}",
            html_abs
        ]
        subprocess.run(cmd, check=True)
        print(f"Rendered scene {i} PNG: {png_abs} ({os.path.getsize(png_abs)} bytes)")
        png_frames.append(png_abs)

    print("\n=== 3. BUILDING SCENE VIDEO CLIPS SYNCED TO AUDIO SEGMENTS ===")
    # Exact segment durations from audio
    durations = [25.87, 27.06, 30.34, 20.30, 24.68]
    clip_files = []

    for i in range(1, 6):
        png = os.path.abspath(f"demo_scenes/scene_{i}.png")
        clip = os.path.abspath(f"demo_scenes/clip_{i}.mp4")
        dur = durations[i-1]
        cmd = [
            FFMPEG, "-y",
            "-loop", "1",
            "-i", png,
            "-t", str(dur),
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-pix_fmt", "yuv420p",
            clip
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"Clip {i} generated: {clip} (duration: {dur}s)")
        clip_files.append(clip)

    print("\n=== 4. CONCATENATING CLIPS INTO RAW VIDEO ===")
    concat_txt = "demo_scenes/concat_clips.txt"
    with open(concat_txt, "w") as f:
        for c in clip_files:
            f.write(f"file '{c.replace(os.sep, '/')}'\n")

    raw_video = "demo_scenes/blindcouncil_visual_track.mp4"
    subprocess.run([
        FFMPEG, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_txt,
        "-c:v", "copy",
        raw_video
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Visual track assembled: {raw_video}")

    print("\n=== 5. MUXING VISUAL TRACK WITH MASTER AUDIO VOICEOVER ===")
    audio_track = os.path.abspath("demo_narration_master.wav")
    final_video = os.path.abspath("blindcouncil_final_demo.mp4")

    subprocess.run([
        FFMPEG, "-y",
        "-i", raw_video,
        "-i", audio_track,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        final_video
    ], check=True)

    print(f"\n========================================================")
    print(f"🎉 MASTER DEMO VIDEO COMPLETE: {final_video}")
    print(f"File size: {os.path.getsize(final_video)} bytes")
    print(f"========================================================")

if __name__ == "__main__":
    main()

