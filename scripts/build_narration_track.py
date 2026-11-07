import subprocess
import wave
import os

FFMPEG = r"C:\Users\ace21\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"

def get_duration(fn):
    with wave.open(fn, 'r') as w:
        return w.getnframes() / float(w.getframerate())

def main():
    durations = [get_duration(f"voice_seg{i}.wav") for i in range(1, 6)]
    print("Segment durations:", durations)

    # Generate 1.5s silence wav
    silence_wav = "silence_1500ms.wav"
    subprocess.run([
        FFMPEG, "-y", "-f", "lavfi", "-i", "anullsrc=r=22050:cl=mono",
        "-t", "1.5", "-c:a", "pcm_s16le", silence_wav
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Build concat file list
    concat_txt = "concat_narration.txt"
    with open(concat_txt, "w") as f:
        for i in range(1, 6):
            f.write(f"file 'voice_seg{i}.wav'\n")
            if i < 5:
                f.write(f"file '{silence_wav}'\n")

    # Concat all segments into master narration track
    master_wav = "demo_narration_master.wav"
    subprocess.run([
        FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", concat_txt,
        "-c:a", "pcm_s16le", master_wav
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    total_dur = get_duration(master_wav)
    print(f"Master narration track generated: {master_wav} ({total_dur:.2f} seconds)")

if __name__ == "__main__":
    main()

