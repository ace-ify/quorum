"""
BlindCouncil: Master Demo Video Recorder & Orchestrator (2m 00s)
Captures a crisp 1080p demo video covering:
1. Architecture & Core Value Proposition in Antigravity IDE
2. Switch Console Server & Room Isolation
3. Live Discord Review Desk & Audit Chambers in Brave
4. Live Delphi Simulation Engine & Room Isolation Audit Table in Terminal
5. Michael Nygard ADR.md & GitHub PR Sticky Comment Deliverables
6. Section 6 Implementation Manifest & Claude Code Bridge
7. Automated Test Suite (5/5 tests passing)
"""
import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import ctypes
import os
import subprocess
import time

user32 = ctypes.windll.user32
PYTHON_EXE = r"C:\Users\ace21\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe"
OUTPUT_RAW = r"C:\ace\products\bb\blindcouncil_demo_raw.mp4"
OUTPUT_FINAL = r"C:\ace\products\bb\blindcouncil_hackathon_demo.mp4"
SUBTITLES_FILE = "demo_subtitles.srt"

def find_hwnd_by_title_substring(sub: str):
    matches = []
    def enum_cb(hwnd, lparam):
        if user32.IsWindowVisible(hwnd):
            length = user32.GetWindowTextLengthW(hwnd)
            if length > 0:
                buff = ctypes.create_unicode_buffer(length + 1)
                user32.GetWindowTextW(hwnd, buff, length + 1)
                title = buff.value.strip()
                if sub.lower() in title.lower():
                    matches.append((hwnd, title))
        return True
    
    WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    user32.EnumWindows(WNDENUMPROC(enum_cb), 0)
    return matches[0][0] if matches else None

def focus_window(hwnd):
    if not hwnd:
        return False
    user32.keybd_event(0x12, 0, 0, 0) # Alt down
    user32.keybd_event(0x12, 0, 2, 0) # Alt up
    user32.ShowWindow(hwnd, 3)         # SW_MAXIMIZE
    user32.SetForegroundWindow(hwnd)
    return True

def main():
    print("==========================================================")
    print("[START] BLINDCOUNCIL MASTER DEMO RECORDING (2m 00s)")
    print("==========================================================")
    
    os.chdir(r"C:\ace\products\bb")
    
    # Pre-discover windows
    ide_hwnd = find_hwnd_by_title_substring("bb - Antigravity IDE")
    switch_hwnd = find_hwnd_by_title_substring("Switch Console")
    discord_hwnd = find_hwnd_by_title_substring("Discord")
    
    print(f"Windows Found: IDE={ide_hwnd}, Switch={switch_hwnd}, Discord={discord_hwnd}")
    
    # Clean previous raw video
    if os.path.exists(OUTPUT_RAW):
        try:
            os.remove(OUTPUT_RAW)
        except Exception:
            pass

    # 1. Start ffmpeg recording (Duration: 120 seconds = 2m00s)
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "gdigrab",
        "-framerate", "20",
        "-t", "120",
        "-i", "desktop",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        OUTPUT_RAW
    ]
    print("Launching ffmpeg screen recording in background...")
    recorder = subprocess.Popen(ffmpeg_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)
    
    # --- SCENE 1: Antigravity IDE & Architecture Overview (0s - 15s) ---
    print("\n[Scene 1] Focusing Antigravity IDE (Architecture & Overview)...")
    focus_window(ide_hwnd)
    time.sleep(13)
    
    # --- SCENE 2: Switch Console Showcase (15s - 35s) ---
    print("\n[Scene 2] Focusing Switch Console (Server-Enforced Room Isolation)...")
    focus_window(switch_hwnd)
    time.sleep(20)
    
    # --- SCENE 3: Discord in Brave (35s - 60s) ---
    print("\n[Scene 3] Focusing Discord in Brave (#review-desk & isolated audit chambers)...")
    focus_window(discord_hwnd)
    time.sleep(25)
    
    # --- SCENE 4: Live Delphi Blind Review Engine in Terminal (60s - 95s) ---
    print("\n[Scene 4] Launching and Focusing Live Delphi Simulation in Terminal...")
    subprocess.Popen([
        "powershell.exe", "-Command",
        f"Start-Process cmd.exe -ArgumentList '/k', 'title BlindCouncil_Simulation && cd /d C:\\ace\\products\\bb && \"{PYTHON_EXE}\" -m src.main --simulate --sample realtime_chat'"
    ])
    time.sleep(3)
    sim_hwnd = find_hwnd_by_title_substring("BlindCouncil_Simulation")
    if not sim_hwnd:
        sim_hwnd = find_hwnd_by_title_substring("cmd.exe")
    focus_window(sim_hwnd)
    time.sleep(32)
    
    # --- SCENE 5: Deliverables Inspection in Antigravity IDE (95s - 110s) ---
    print("\n[Scene 5] Focusing Antigravity IDE (ADR.md & Section 6 Implementation Manifest)...")
    focus_window(ide_hwnd)
    time.sleep(15)
    
    # --- SCENE 6: Automated Test Suite & Outro (110s - 120s) ---
    print("\n[Scene 6] Launching and Focusing Automated Test Suite...")
    subprocess.Popen([
        "powershell.exe", "-Command",
        f"Start-Process cmd.exe -ArgumentList '/k', 'title BlindCouncil_Tests && cd /d C:\\ace\\products\\bb && \"{PYTHON_EXE}\" tests/run_tests.py'"
    ])
    time.sleep(2)
    test_hwnd = find_hwnd_by_title_substring("BlindCouncil_Tests")
    if not test_hwnd:
        test_hwnd = find_hwnd_by_title_substring("cmd.exe")
    focus_window(test_hwnd)
    time.sleep(8)
    
    print("\nWaiting for ffmpeg recording to conclude gracefully...")
    recorder.wait()
    raw_size = os.path.getsize(OUTPUT_RAW)
    print(f"[OK] Raw video captured: {OUTPUT_RAW} ({raw_size} bytes)")

if __name__ == "__main__":
    main()
