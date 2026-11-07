"""
Option C Master Demo Video Renderer (v2)
Generates high-fidelity 1080p Discord UI frames with:
- Right member sidebar (Online Specialists with status)
- Multi-turn heated technical clash
- RENDERED VISUAL ARCHITECTURE DIAGRAM PNG EMBED
- Michael Nygard ADR.md and Claude Code terminal handoff in #dev-implementation
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

/* 1. Server Navigation */
.guild-nav {
    width: 72px;
    background-color: #1e1f22;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0;
    gap: 10px;
    flex-shrink: 0;
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
    font-size: 20px;
    font-weight: bold;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}
.guild-icon.active {
    border-radius: 16px;
    background-color: #4752c4;
}

/* 2. Channel Sidebar */
.channel-sidebar {
    width: 250px;
    background-color: #2b2d31;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
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
}
.category-header {
    padding: 16px 14px 6px;
    font-size: 11.5px;
    font-weight: 800;
    color: #949ba4;
    letter-spacing: 0.5px;
}
.channel-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 2px 8px;
    padding: 6px 10px;
    border-radius: 4px;
    color: #949ba4;
    font-size: 14px;
    font-weight: 500;
}
.channel-item.active {
    background-color: #404249;
    color: #ffffff;
    font-weight: 600;
}
.channel-item .hash {
    font-size: 16px;
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
}

/* 3. Main Chat Container */
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
}
.chat-header-title {
    font-size: 15.5px;
    font-weight: 700;
    color: #f2f3f5;
    display: flex;
    align-items: center;
    gap: 8px;
}
.chat-header-topic {
    font-size: 13px;
    color: #949ba4;
    border-left: 1px solid #3f4147;
    padding-left: 12px;
    margin-left: 4px;
}
.messages-list {
    flex: 1;
    padding: 16px 20px;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    gap: 14px;
}
.message-card {
    display: flex;
    gap: 14px;
}
.msg-avatar {
    width: 40px;
    height: 40px;
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
    margin-bottom: 3px;
}
.msg-author {
    font-size: 14.5px;
    font-weight: 600;
    color: #f2f3f5;
}
.msg-badge {
    background-color: #5865f2;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 3px;
    text-transform: uppercase;
}
.msg-badge.human { background-color: #f59e0b; }
.msg-badge.sec { background-color: #ef4444; }
.msg-badge.scale { background-color: #3b82f6; }
.msg-badge.fin { background-color: #10b981; }
.msg-badge.data { background-color: #06b6d4; }

.msg-time {
    font-size: 11.5px;
    color: #949ba4;
}
.msg-content {
    font-size: 14px;
    line-height: 1.42;
    color: #dbdee1;
}

/* Discord Embed */
.embed {
    margin-top: 6px;
    padding: 12px 16px;
    background-color: #2b2d31;
    border-left: 4px solid #5865f2;
    border-radius: 4px;
    max-width: 1050px;
}
.embed.red { border-left-color: #ef4444; }
.embed.blue { border-left-color: #3b82f6; }
.embed.green { border-left-color: #10b981; }
.embed.cyan { border-left-color: #06b6d4; }
.embed.gold { border-left-color: #f59e0b; }

.embed-title {
    font-size: 14.5px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 6px;
}
.embed-desc {
    font-size: 13px;
    color: #dbdee1;
    line-height: 1.4;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
    font-size: 12.5px;
}
th, td {
    padding: 6px 10px;
    text-align: left;
    border-bottom: 1px solid #3f4147;
}
th {
    background-color: #1e1f22;
    color: #b5bac1;
    font-weight: 700;
}
pre {
    background-color: #1e1f22;
    border: 1px solid #232428;
    border-radius: 4px;
    padding: 8px 12px;
    margin-top: 6px;
    font-family: 'Consolas', monospace;
    font-size: 12px;
    color: #7dd3fc;
}

/* Chat Input Bar */
.chat-input-bar {
    height: 60px;
    padding: 0 18px 14px;
    background-color: #313338;
}
.input-box {
    height: 42px;
    background-color: #383a40;
    border-radius: 8px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    color: #80848e;
    font-size: 14px;
    gap: 12px;
}

/* 4. Right Member Sidebar */
.member-sidebar {
    width: 240px;
    background-color: #2b2d31;
    padding: 18px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex-shrink: 0;
}
.member-category {
    font-size: 11px;
    font-weight: 800;
    color: #949ba4;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}
.member-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border-radius: 4px;
}
.member-item.active { background-color: #35373c; }
.member-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    position: relative;
}
.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #23a55a;
    position: absolute;
    bottom: -1px;
    right: -1px;
    border: 2px solid #2b2d31;
}
.member-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #f2f3f5;
}
.member-role {
    font-size: 10.5px;
    color: #949ba4;
}

/* Chamber Cards */
.chamber-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 10px;
}
.chamber-card {
    background: #2b2d31;
    border-radius: 8px;
    padding: 14px;
    border: 1px solid #3f4147;
}
"""

def generate_scene_html_v2(scene_num: int) -> str:
    active_channel = "dev-implementation" if scene_num == 5 else "review-desk"
    diagram_abs = os.path.abspath("assets/diagram_rfc042_resolved.png").replace(os.sep, "/")

    channel_list = f"""
    <div class="guild-nav">
        <div class="guild-icon active">🏛️</div>
        <div class="guild-icon">SW</div>
        <div class="guild-icon">GH</div>
    </div>
    <div class="channel-sidebar">
        <div class="server-header">
            <span>🏛️ BlindCouncil Review</span>
            <span style="font-size:12px;">▼</span>
        </div>
        <div class="category-header">▼ BLINDCOUNCIL REVIEW DESK</div>
        <div class="channel-item {'active' if active_channel=='review-desk' else ''}">
            <span class="hash">#</span> review-desk
        </div>
        <div class="channel-item">
            <span class="hash">🔒</span> audit-security
        </div>
        <div class="channel-item">
            <span class="hash">🔒</span> audit-scalability
        </div>
        <div class="channel-item">
            <span class="hash">🔒</span> audit-finops
        </div>
        <div class="channel-item">
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

    member_sidebar = """
    <div class="member-sidebar">
        <div class="member-category">COUNCIL CHAIR — 1</div>
        <div class="member-item">
            <div class="member-avatar">
                <img style="width:32px;height:32px;border-radius:50%;" src="https://api.dicebear.com/7.x/bottts/svg?seed=AthenaChair&backgroundColor=6366f1" />
                <div class="status-dot"></div>
            </div>
            <div>
                <div class="member-name" style="color:#a5b4fc;">Athena</div>
                <div class="member-role">Council Chair</div>
            </div>
        </div>

        <div class="member-category" style="margin-top:12px;">AUTONOMOUS SPECIALISTS — 4</div>
        <div class="member-item">
            <div class="member-avatar">
                <img style="width:32px;height:32px;border-radius:50%;" src="https://api.dicebear.com/7.x/bottts/svg?seed=AegisSecurity&backgroundColor=ef4444" />
                <div class="status-dot"></div>
            </div>
            <div>
                <div class="member-name" style="color:#f87171;">Aegis</div>
                <div class="member-role">Staff Security Auditor</div>
            </div>
        </div>
        <div class="member-item">
            <div class="member-avatar">
                <img style="width:32px;height:32px;border-radius:50%;" src="https://api.dicebear.com/7.x/bottts/svg?seed=VanguardScale&backgroundColor=3b82f6" />
                <div class="status-dot"></div>
            </div>
            <div>
                <div class="member-name" style="color:#60a5fa;">Vanguard</div>
                <div class="member-role">Distributed Systems</div>
            </div>
        </div>
        <div class="member-item">
            <div class="member-avatar">
                <img style="width:32px;height:32px;border-radius:50%;" src="https://api.dicebear.com/7.x/bottts/svg?seed=LedgerFinOps&backgroundColor=10b981" />
                <div class="status-dot"></div>
            </div>
            <div>
                <div class="member-name" style="color:#34d399;">Ledger</div>
                <div class="member-role">Lead Cloud Economics</div>
            </div>
        </div>
        <div class="member-item">
            <div class="member-avatar">
                <img style="width:32px;height:32px;border-radius:50%;" src="https://api.dicebear.com/7.x/bottts/svg?seed=TitanDatabase&backgroundColor=06b6d4" />
                <div class="status-dot"></div>
            </div>
            <div>
                <div class="member-name" style="color:#22d3ee;">Titan</div>
                <div class="member-role">Data & State Reliability</div>
            </div>
        </div>

        <div class="member-category" style="margin-top:12px;">HUMAN LEAD — 1</div>
        <div class="member-item">
            <div class="member-avatar">
                <img style="width:32px;height:32px;border-radius:50%;" src="https://api.dicebear.com/7.x/avataaars/svg?seed=izigriss&backgroundColor=f59e0b" />
                <div class="status-dot"></div>
            </div>
            <div>
                <div class="member-name" style="color:#fbbf24;">izigriss</div>
                <div class="member-role">Lead Architect</div>
            </div>
        </div>
    </div>
    """

    content = ""
    header_title = "# review-desk"
    header_topic = "🏛️ Main Council Chamber: RFC Submission, Conflict Synthesis, Human Steering & Consensus"

    if scene_num == 1:
        # Scene 1: Intake & Convening
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
                    🏛️ <strong>[BLINDCOUNCIL REVIEW DESK CONVENED: RFC-042]</strong><br><br>
                    <strong>Target System:</strong> <code>RFC-042: Scalable Real-Time WebSocket Messaging Cluster (100k Concurrent Connections)</code><br>
                    <strong>Lead Architect:</strong> <code>@izigriss [Lead Architect]</code><br>
                    <strong>Chamber Isolation Protocol:</strong> <span style="color:#4ade80;font-weight:700;">ACTIVE (Switch AI Server-Enforced Zero-Leakage)</span>
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
        # Scene 2: Soundproof Chambers Audit
        header_title = "🔒 Soundproof Audit Chambers (Switch Server Isolation)"
        header_topic = "Zero-Leakage Multi-Chamber Deliberation: Specialists Evaluating Without Cross-Anchoring"
        content = """
        <div style="background:#232428;padding:12px 18px;border-radius:6px;border:1px solid #3b82f6;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
            <div>
                <span style="font-weight:700;color:#60a5fa;font-size:14.5px;">🛡️ SWITCH SERVER ISOLATION STATUS:</span>
                <span style="color:#4ade80;font-weight:700;margin-left:8px;">✅ 100% BLIND ISOLATION VERIFIED (0 BYTES LEAKED)</span>
            </div>
            <div style="font-size:12.5px;color:#949ba4;">RFC-042 Dispatched to 4 Soundproof Chambers</div>
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
                <div style="font-size:12.5px;line-height:1.4;">
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
                <div style="font-size:12.5px;line-height:1.4;">
                    <strong>Bottleneck:</strong> Synchronous auth DB lookups on 100k reconnects will spike p99 past 140ms.<br>
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
                <div style="font-size:12.5px;line-height:1.4;">
                    <strong>Economic Waste:</strong> Provisioned 12-node cluster costs $3,500/mo ($42,000/yr).<br>
                    <strong>Mandate:</strong> Launch 4 nodes with 75% autoscale. Saves $25,200/year.<br>
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
                <div style="font-size:12.5px;line-height:1.4;">
                    <strong>Race Condition:</strong> Dual-writing to Redis and Postgres causes message loss.<br>
                    <strong>Mandate:</strong> Enforce Transactional Outbox pattern with Debezium CDC.<br>
                    <span style="color:#22d3ee;font-weight:700;">Verdict: CONDITIONAL APPROVAL (Score: 7.2/10)</span>
                </div>
            </div>
        </div>
        """

    elif scene_num == 3:
        # Scene 3: The Multi-Turn Heated Clash
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
                        <tr><td><b>Security</b></td><td>Aegis</td><td style="color:#ef4444;font-weight:700;">❌ Blocking</td><td>Token revocation requires synchronous lookup</td></tr>
                        <tr><td><b>Scalability</b></td><td>Vanguard</td><td style="color:#60a5fa;font-weight:700;">⚠️ Conditional</td><td>Sync lookups will destroy p99 latency (>140ms)</td></tr>
                        <tr><td><b>FinOps</b></td><td>Ledger</td><td style="color:#34d399;font-weight:700;">💡 Optimize</td><td>12-node cluster is $3,500/mo waste; needs 4 nodes</td></tr>
                        <tr><td><b>Database</b></td><td>Titan</td><td style="color:#22d3ee;font-weight:700;">⚠️ Conditional</td><td>Dual-write race conditions; needs Outbox</td></tr>
                    </table>
                </div>
            </div>
        </div>

        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=AegisSecurity&backgroundColor=ef4444" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#f87171;">Aegis [Staff Security Auditor]</span>
                    <span class="msg-badge sec">SECURITY</span>
                    <span class="msg-time">Today at 8:02 AM</span>
                </div>
                <div class="msg-content">
                    🚨 <strong>BLOCKING:</strong> RFC-042 relies on in-band heartbeat JWT validation. If a user token is revoked, our gateway allows 15 minutes of unauthorized socket frames before TTL expiry. This is an active CVE risk under SOC2 Article 4.
                </div>
            </div>
        </div>

        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=VanguardScale&backgroundColor=3b82f6" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#60a5fa;">Vanguard [Principal Distributed Systems Architect]</span>
                    <span class="msg-badge scale">SCALE</span>
                    <span class="msg-time">Today at 8:02 AM</span>
                </div>
                <div class="msg-content">
                    ⚡ <strong>HOLD ON AEGIS:</strong> If we do synchronous DB queries on 100k WebSockets during pod rolling restarts, the connection pool will instantly exhaust and crash the database! p99 latency will spike past 140ms.
                </div>
            </div>
        </div>

        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=LedgerFinOps&backgroundColor=10b981" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#34d399;">Ledger [Lead Cloud Economics Specialist]</span>
                    <span class="msg-badge fin">FINOPS</span>
                    <span class="msg-time">Today at 8:03 AM</span>
                </div>
                <div class="msg-content">
                    💰 <strong>CHECK YOUR BUDGET BOTH OF YOU:</strong> The author spec'd a 12-node provisioned MemoryDB cluster at $3,500/month for an off-peak baseline of only 20,000 connections! That is $42,000/year in compute waste. We can safely launch with a 4-node cluster with 75% memory autoscale. That saves <strong>$25,200/year</strong> while meeting peak surges.
                </div>
            </div>
        </div>
        """

    elif scene_num == 4:
        # Scene 4: Human Steering & Rendered Visual Architecture Diagram Embed!
        content = f"""
        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=izigriss&backgroundColor=f59e0b" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#fbbf24;">izigriss [Lead Architect]</span>
                    <span class="msg-badge human">AUTHOR</span>
                    <span class="msg-time">Today at 8:03 AM</span>
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
                    <span class="msg-time">Today at 8:03 AM</span>
                </div>
                <div class="embed cyan" style="max-width:980px;">
                    <div class="embed-title">📊 RENDERED ARCHITECTURAL TOPOLOGY (RFC-042 SYNTHESIS)</div>
                    <div class="embed-desc">
                        Visualizing the Council's orthogonal compromises: <strong>Redis Bloom Revocation Cache</strong> (Security + Scale), <strong>4-Node Cluster</strong> (-$25.2k/yr FinOps), and <strong>Transactional Outbox</strong> (Titan ACID state):
                    </div>
                    <img src="{diagram_abs}" style="width:100%;border-radius:6px;margin-top:10px;box-shadow:0 4px 12px rgba(0,0,0,0.4);" />
                </div>
            </div>
        </div>
        """

    elif scene_num == 5:
        # Scene 5: Consensus, Official ADR & Claude Code Terminal Handoff
        header_title = "🚀 # dev-implementation"
        header_topic = "Autonomous Code Implementation: Section 6 Scaffolding Spec Handoff to Terminal Coding Agents"
        content = """
        <div class="message-card">
            <img class="msg-avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=izigriss&backgroundColor=f59e0b" />
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-author" style="color:#fbbf24;">izigriss [Lead Architect]</span>
                    <span class="msg-badge human">AUTHOR</span>
                    <span class="msg-time">Today at 8:04 AM</span>
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
                    <span class="msg-time">Today at 8:04 AM</span>
                </div>
                <div class="embed gold">
                    <div class="embed-title">🚀 [SWITCH IMPLEMENTER HANDOFF: BLINDCOUNCIL ➔ CLAUDE CODE / CODEX]</div>
                    <div class="embed-desc">
                        <strong>Target System:</strong> <code>RFC-042: Scalable Real-Time WebSocket Messaging Cluster</code><br>
                        <strong>Approved Architectural Decision:</strong> <code>ADR-042.md</code> (Michael Nygard standard)<br>
                        <strong>GitHub Sticky Comment:</strong> <code>PR_COMMENT_ADR-042.md</code><br>
                        <strong>Target Git Branch:</strong> <code>git checkout -b feat/adr-042-impl</code><br>
                        <strong>Verification Test Command:</strong> <code>pytest tests/ -v</code><br><br>
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
    {channel_list}
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
    {member_sidebar}
</body>
</html>
"""
    return html

def main():
    print("=== 1. GENERATING 5 HIGH-FIDELITY SCENE HTMLs ===")
    os.makedirs("demo_scenes_v2", exist_ok=True)
    for i in range(1, 6):
        html_code = generate_scene_html_v2(i)
        fn = f"demo_scenes_v2/scene_{i}.html"
        with open(fn, "w", encoding="utf-8") as f:
            f.write(html_code)
        print(f"Generated {fn}")

    print("\n=== 2. RENDERING SCENES TO 1080P PNG FRAMES VIA BRAVE HEADLESS ===")
    for i in range(1, 6):
        html_abs = os.path.abspath(f"demo_scenes_v2/scene_{i}.html")
        png_abs = os.path.abspath(f"demo_scenes_v2/scene_{i}.png")
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

    print("\n=== 3. BUILDING 5 VIDEO CLIPS SYNCED TO EXACT NARRATION SEGMENTS ===")
    # Exact durations matching audio track v2:
    durations = [25.57, 23.71, 31.24, 20.07, 24.07]
    clip_files = []

    for i in range(1, 6):
        png = os.path.abspath(f"demo_scenes_v2/scene_{i}.png")
        clip = os.path.abspath(f"demo_scenes_v2/clip_{i}.mp4")
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

    print("\n=== 4. CONCATENATING CLIPS INTO VISUAL TRACK ===")
    concat_txt = "demo_scenes_v2/concat_clips.txt"
    with open(concat_txt, "w") as f:
        for c in clip_files:
            f.write(f"file '{c.replace(os.sep, '/')}'\n")

    raw_video = "demo_scenes_v2/visual_track_v2.mp4"
    subprocess.run([
        FFMPEG, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_txt,
        "-c:v", "copy",
        raw_video
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Visual track assembled: {raw_video}")

    print("\n=== 5. MUXING VISUAL TRACK WITH NARRATION AUDIO ===")
    audio_track = os.path.abspath("demo_narration_master_v2.wav")
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

    print(f"DEMO VIDEO COMPLETE: {final_video}")
    print(f"File size: {os.path.getsize(final_video)} bytes")

if __name__ == "__main__":
    main()

