Add-Type -AssemblyName System.Speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.Rate = 0
$speak.SetOutputToWaveFile("test_voice.wav")
$speak.Speak("Welcome to BlindCouncil. Eliminating sycophancy and groupthink in AI architecture reviews.")
$speak.Dispose()
Write-Host "Audio generated successfully."

