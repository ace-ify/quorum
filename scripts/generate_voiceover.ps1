Add-Type -AssemblyName System.Speech

$segments = @(
    @{
        File = "voice_seg1.wav"
        Text = "Welcome to BlindCouncil. When engineering teams use multi-agent systems for architecture reviews, agents suffer from sycophancy, context pollution, and groupthink, blindly agreeing with the author. BlindCouncil solves this using Switch AI's server-enforced room isolation, placing specialist agents into soundproof audit chambers before debating on the public floor."
    },
    @{
        File = "voice_seg2.wav"
        Text = "Here in Discord, our review desk is convened for a mission-critical RFC: a high-throughput WebSocket messaging cluster. Switch AI isolates each specialist into private chambers: Aegis for security, Vanguard for scalability, Ledger for FinOps, and Titan for data reliability. Zero tokens leak between them, guaranteeing independent, un-anchored audits."
    },
    @{
        File = "voice_seg3.wav"
        Text = "Council Chair Athena now opens the floor and publishes the conflict matrix. Real friction emerges. Aegis demands strict token revocation. Vanguard warns that database lookups will spike p99 latency and proposes a Redis Bloom filter. Meanwhile, Ledger intervenes on cloud economics, proving a 12-node cluster is compute waste, right-sizing it to 4 nodes to save 25,000 dollars a year."
    },
    @{
        File = "voice_seg4.wav"
        Text = "The human lead architect stays in total control. Using fast commands or natural language, the architect can inspect an executive summary, view live architecture diagrams, or review the concrete implementation manifest. Human oversight is built in at every step."
    },
    @{
        File = "voice_seg5.wav"
        Text = "With approval granted, BlindCouncil publishes an official Michael Nygard Architecture Decision Record and a GitHub PR sticky comment. Finally, in dev-implementation, Athena hands off the exact file manifest and verification tests directly to Claude Code and Codex. From blind review to terminal execution, this is the future of enterprise software engineering."
    }
)

$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
# Select Voice
$voices = $speak.GetInstalledVoices()
foreach ($v in $voices) {
    if ($v.VoiceInfo.Name -like "*David*") {
        $speak.SelectVoice($v.VoiceInfo.Name)
        break
    }
}
$speak.Rate = 0  # Normal speed, natural pacing

foreach ($seg in $segments) {
    $outPath = Join-Path (Get-Location) $seg.File
    $speak.SetOutputToWaveFile($outPath)
    $speak.Speak($seg.Text)
    Write-Host "Generated: $($seg.File)"
}

$speak.Dispose()
Write-Host "All voice segments generated successfully."

