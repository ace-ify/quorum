"""
Generates a stunning, production-grade visual system architecture diagram for RFC-042.
Outputs both standalone SVG and high-resolution PNG for Discord embeds and video display.
"""
import os
import subprocess

BRAVE_EXE = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"

SVG_CONTENT = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 680" width="1200" height="680" style="background:#18191c; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;">
  <defs>
    <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.1"/>
    </linearGradient>
    <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#047857" stop-opacity="0.1"/>
    </linearGradient>
    <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#b91c1c" stop-opacity="0.1"/>
    </linearGradient>
    <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#0e7490" stop-opacity="0.1"/>
    </linearGradient>
    <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#6d28d9" stop-opacity="0.1"/>
    </linearGradient>

    <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#3b82f6" flood-opacity="0.3"/>
    </filter>
    <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#10b981" flood-opacity="0.3"/>
    </filter>
    <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#ef4444" flood-opacity="0.3"/>
    </filter>
    <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#06b6d4" flood-opacity="0.3"/>
    </filter>

    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#60a5fa"/>
    </marker>
    <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#34d399"/>
    </marker>
    <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#22d3ee"/>
    </marker>
  </defs>

  <!-- Header Section -->
  <rect x="0" y="0" width="1200" height="90" fill="#1e1f22" border-bottom="1px solid #2b2d31"/>
  <text x="40" y="42" font-size="22" font-weight="700" fill="#f8fafc">🏛️ RFC-042: RESOLVED WEBSOCKET CLUSTER ARCHITECTURE</text>
  <text x="40" y="68" font-size="13" font-weight="500" fill="#94a3b8">BlindCouncil Multi-Agent Architectural Consensus | Michael Nygard ADR Implementation Spec</text>

  <!-- Council Invariant Score Badges -->
  <g transform="translate(730, 25)">
    <rect x="0" y="0" width="105" height="30" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="1.2"/>
    <text x="10" y="20" font-size="11" font-weight="700" fill="#f87171">🛡️ SEC: 9.8/10</text>

    <rect x="115" y="0" width="115" height="30" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="125" y="20" font-size="11" font-weight="700" fill="#60a5fa">⚡ SCALE: 9.5/10</text>

    <rect x="240" y="0" width="115" height="30" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1.2"/>
    <text x="250" y="20" font-size="11" font-weight="700" fill="#34d399">💰 -$25.2k/YR</text>

    <rect x="365" y="0" width="105" height="30" rx="6" fill="#1e293b" stroke="#06b6d4" stroke-width="1.2"/>
    <text x="375" y="20" font-size="11" font-weight="700" fill="#22d3ee">🏛️ ACID CDC</text>
  </g>

  <!-- Node 1: Clients -->
  <g transform="translate(50, 140)" filter="url(#glow-blue)">
    <rect width="210" height="110" rx="10" fill="url(#grad-blue)" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="20" y="34" font-size="16" font-weight="700" fill="#ffffff">📱 Client Applications</text>
    <text x="20" y="58" font-size="12" fill="#cbd5e1">• 100,000 Concurrent Sockets</text>
    <text x="20" y="78" font-size="12" fill="#cbd5e1">• Mobile (iOS/Android) &amp; Web</text>
    <text x="20" y="96" font-size="11" font-weight="600" fill="#60a5fa">TLS 1.3 Transport Encryption</text>
  </g>

  <!-- Arrow 1 to 2 -->
  <line x1="260" y1="195" x2="330" y2="195" stroke="#60a5fa" stroke-width="2.5" marker-end="url(#arrow)"/>
  <text x="272" y="185" font-size="10" font-weight="600" fill="#94a3b8">WSS Frames</text>

  <!-- Node 2: Network Load Balancer -->
  <g transform="translate(340, 140)">
    <rect width="200" height="110" rx="10" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
    <text x="20" y="34" font-size="16" font-weight="700" fill="#ffffff">⚖️ AWS L4 NLB</text>
    <text x="20" y="58" font-size="12" fill="#cbd5e1">• TLS Termination at Edge</text>
    <text x="20" y="78" font-size="12" fill="#cbd5e1">• Least-Conn Balancing</text>
    <text x="20" y="96" font-size="11" font-weight="600" fill="#94a3b8">Cross-Zone High Availability</text>
  </g>

  <!-- Arrow 2 to 3 -->
  <line x1="540" y1="195" x2="610" y2="195" stroke="#60a5fa" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- Node 3: WebSocket Cluster (Right-Sized) -->
  <g transform="translate(620, 120)" filter="url(#glow-green)">
    <rect width="270" height="150" rx="10" fill="url(#grad-green)" stroke="#10b981" stroke-width="2"/>
    <text x="20" y="32" font-size="16" font-weight="700" fill="#ffffff">🚀 WebSocket Cluster</text>
    <text x="20" y="54" font-size="12" font-weight="700" fill="#34d399">✅ RIGHT-SIZED: 4 Pods (Not 12)</text>
    <text x="20" y="76" font-size="12" fill="#e2e8f0">• Mandated by Ledger (FinOps)</text>
    <text x="20" y="96" font-size="12" fill="#e2e8f0">• Dynamic Autoscale @ 75% RAM</text>
    <text x="20" y="116" font-size="12" fill="#e2e8f0">• Handles 25k to 100k Bursts</text>
    <rect x="20" y="124" width="225" height="18" rx="4" fill="#047857"/>
    <text x="26" y="137" font-size="10" font-weight="800" fill="#ffffff">ANNUAL SAVINGS: $25,200 / YEAR</text>
  </g>

  <!-- Arrow Down to Security Cache -->
  <path d="M 755 270 L 755 350" stroke="#60a5fa" stroke-width="2.5" marker-end="url(#arrow)"/>
  <text x="765" y="315" font-size="11" font-weight="700" fill="#f87171">Frame Check</text>

  <!-- Node 4: Redis Bloom Filter (The Aegis/Vanguard Compromise) -->
  <g transform="translate(620, 360)" filter="url(#glow-red)">
    <rect width="270" height="145" rx="10" fill="url(#grad-red)" stroke="#ef4444" stroke-width="2"/>
    <text x="20" y="32" font-size="16" font-weight="700" fill="#ffffff">🛡️ Redis Bloom Revocation</text>
    <text x="20" y="54" font-size="12" font-weight="700" fill="#f87171">✅ THE ORTHOGONAL COMPROMISE</text>
    <text x="20" y="76" font-size="12" fill="#e2e8f0">• Mandated by Aegis (Security)</text>
    <text x="20" y="96" font-size="12" fill="#e2e8f0">• Validated by Vanguard (Scale)</text>
    <text x="20" y="116" font-size="12" fill="#e2e8f0">• Sub-0.2ms Lookups (Zero DB Hits)</text>
    <text x="20" y="134" font-size="11" font-weight="600" fill="#fca5a5">In-Memory Bitset Revocation (1.5MB)</text>
  </g>

  <!-- Arrow Right from Cluster to Database Layer -->
  <path d="M 890 195 L 960 195 L 960 350" stroke="#22d3ee" stroke-width="2.5" marker-end="url(#arrow-cyan)"/>
  <text x="915" y="185" font-size="10" font-weight="700" fill="#22d3ee">Persistence</text>

  <!-- Node 5: Postgres Transactional Outbox (Titan's Mandate) -->
  <g transform="translate(930, 360)" filter="url(#glow-cyan)">
    <rect width="220" height="145" rx="10" fill="url(#grad-cyan)" stroke="#06b6d4" stroke-width="2"/>
    <text x="20" y="32" font-size="16" font-weight="700" fill="#ffffff">🏛️ Transactional Outbox</text>
    <text x="20" y="54" font-size="12" font-weight="700" fill="#22d3ee">✅ MANDATED BY TITAN</text>
    <text x="20" y="76" font-size="12" fill="#e2e8f0">• Postgres `outbox_events` Table</text>
    <text x="20" y="96" font-size="12" fill="#e2e8f0">• Eliminates Dual-Write Race</text>
    <text x="20" y="116" font-size="12" fill="#e2e8f0">• Zero Ghost Rows on Crash</text>
    <text x="20" y="134" font-size="11" font-weight="600" fill="#67e8f9">ACID Guaranteed State</text>
  </g>

  <!-- Arrow from Outbox to CDC -->
  <path d="M 1040 505 L 1040 550" stroke="#22d3ee" stroke-width="2.5" marker-end="url(#arrow-cyan)"/>

  <!-- Node 6: Debezium CDC & Kafka -->
  <g transform="translate(930, 560)">
    <rect width="220" height="85" rx="8" fill="#1e293b" stroke="#0ea5e9" stroke-width="1.5"/>
    <text x="20" y="28" font-size="14" font-weight="700" fill="#ffffff">🔄 Debezium CDC ➔ Kafka</text>
    <text x="20" y="48" font-size="12" fill="#cbd5e1">• Stream Changes Log</text>
    <text x="20" y="68" font-size="11" font-weight="600" fill="#38bdf8">At-Least-Once Fanout Delivery</text>
  </g>

  <!-- Bottom Terminal Agent Bridge Banner -->
  <g transform="translate(50, 560)">
    <rect width="840" height="85" rx="10" fill="#1e1f22" stroke="#8b5cf6" stroke-width="1.8"/>
    <text x="24" y="30" font-size="15" font-weight="700" fill="#a78bfa">⚡ SECTION 6 IMPLEMENTATION HANDOFF ➔ CLAUDE CODE / CODEX</text>
    <text x="24" y="52" font-size="12" fill="#cbd5e1">Repository Scaffold: <code>src/middleware/bloom_revocation.py</code> | <code>src/cluster/config.yaml</code> | <code>src/db/outbox_producer.py</code></text>
    <text x="24" y="72" font-size="12" font-weight="600" fill="#34d399">Target Git Branch: <code>feat/adr-042-impl</code> | Test Verification Command: <code>pytest tests/ -v</code></text>
  </g>

</svg>
"""

def main():
    os.makedirs("assets", exist_ok=True)
    svg_path = os.path.abspath("assets/diagram_rfc042_resolved.svg")
    png_path = os.path.abspath("assets/diagram_rfc042_resolved.png")

    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(SVG_CONTENT)
    print(f"SVG Diagram written: {svg_path}")

    # Create HTML wrapper for rendering
    wrapper_html = os.path.abspath("assets/render_diagram_wrapper.html")
    with open(wrapper_html, "w", encoding="utf-8") as f:
        f.write(f"""<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#18191c;display:flex;align-items:center;justify-content:center;height:100vh;">
  <img src="{svg_path.replace(os.sep, '/')}" style="width:1200px;height:680px;" />
</body>
</html>""")

    cmd = [
        BRAVE_EXE,
        "--headless",
        "--disable-gpu",
        "--window-size=1200,680",
        f"--screenshot={png_path}",
        wrapper_html
    ]
    subprocess.run(cmd, check=True)
    size = os.path.getsize(png_path)
    print(f"High-Res PNG Diagram generated: {png_path} ({size} bytes)")

if __name__ == "__main__":
    main()
