@echo off
title Quorum Real Discord Recorder
cd /d "C:\ace\products\bb"
echo ==========================================================
echo [QUORUM] RECORDING REAL DISCORD ON YOUR DESKTOP
echo ==========================================================
echo.
echo Please bring your Brave / Discord window to the front and maximize it!
echo Recording starts in 5 seconds...
echo.
timeout /t 5 /nobreak

echo [RECORDING STARTED] Recording full desktop for 125 seconds...
echo Scroll through #review-desk, #audit chambers, and #dev-implementation!
echo.

"C:\Users\ace21\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe" -y -f gdigrab -framerate 30 -t 125 -i desktop -c:v libx264 -preset veryfast -pix_fmt yuv420p real_discord_raw.mp4

echo.
echo [RECORDING COMPLETE] Muxing with voiceover audio track...
"C:\Users\ace21\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe" -y -i real_discord_raw.mp4 -i demo_narration_master_v2.wav -c:v copy -c:a aac -b:a 192k -shortest quorum_real_discord_demo.mp4

echo.
echo ==========================================================
echo SUCCESS! Final Real Discord Demo: quorum_real_discord_demo.mp4
echo ==========================================================
pause

