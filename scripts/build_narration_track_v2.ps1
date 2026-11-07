Add-Type -AssemblyName System.Speech

$segments = @(
    @{
        File = "voice_v2_seg1.wav"
        Text = "Welcome to BlindCouncil. When engineering teams use multi-agent systems for architecture reviews, agents suffer from sycophancy, context pollution, and groupthink, blindly agreeing with the author. BlindCouncil solves this using Switch AI's server-enforced room isolation, placing specialist agents into soundproof audit chambers before debating on the public floor."
    },
    @{
        File = "voice_v2_seg2.wav"
        Text = "Here in Discord, an RFC for a high-throughput WebSocket cluster is submitted. Switch isolates each specialist into private chambers: Aegis on security, Vanguard on scale, Ledger on FinOps, and Titan on data reliability. Zero tokens leak between them, guaranteeing independent, un-anchored audits."
    },
    @{
        File = "voice_v2_seg3.wav"
        Text = "Now, the soundproof chambers open. Council Chair Athena publishes the Conflict Matrix, and immediate friction erupts. Aegis blocks approval over token revocation vulnerabilities. Vanguard warns that database lookups will spike p99 latency, demanding an in-memory Bloom filter. Meanwhile, Ledger proves a 12-node cluster is compute waste, right-sizing it to 4 nodes to save 25,000 dollars a year."
    },
    @{
        File = "voice_v2_seg4.wav"
        Text = "The human lead architect stays in total control. Using fast commands, the architect requests an executive summary, and generates a live visual system architecture diagram rendered directly into the chat. The concrete Section 6 implementation manifest is verified on the fly."
    },
    @{
        File = "voice_v2_seg5.wav"
        Text = "With approval granted, BlindCouncil publishes an official Michael Nygard Architecture Decision Record and a GitHub PR sticky comment. Finally, in dev-implementation, Athena hands off the approved file manifest and verification tests directly to Claude Code. From blind review to terminal code execution, this is enterprise-grade multi-agent governance."
    }
)

$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voices = $speak.GetInstalledVoices()
foreach ($v in $voices) {
    if ($v.VoiceInfo.Name -like "*David*") {
        $speak.SelectVoice($v.VoiceInfo.Name)
        break
    }
}
$speak.Rate = 0

foreach ($seg in $segments) {
    $outPath = Join-Path (Get-Location) $seg.File
    $speak.SetOutputToWaveFile($outPath)
    $speak.Speak($seg.Text)
    Write-Host "Generated: $($seg.File)"
}

$speak.Dispose()
Write-Host "Voice segments v2 generated successfully."
