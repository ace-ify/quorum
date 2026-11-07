import os
import wave
import subprocess

FFMPEG = r"C:\Users\ace21\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"

def get_duration(fn):
    with wave.open(fn, 'r') as w:
        return w.getnframes() / float(w.getframerate())

def main():
    durations = [get_duration(f"voice_v2_seg{i}.wav") for i in range(1, 6)]
    print("Segment durations:", durations)

    # 1.2s silence wav
    silence_wav = "silence_1200ms.wav"
    subprocess.run([
        FFMPEG, "-y", "-f", "lavfi", "-i", "anullsrc=r=22050:cl=mono",
        "-t", "1.2", "-c:a", "pcm_s16le", silence_wav
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    concat_txt = "concat_narration_v2.txt"
    with open(concat_txt, "w") as f:
        for i in range(1, 6):
            f.write(f"file 'voice_v2_seg{i}.wav'\n")
            if i < 5:
                f.write(f"file '{silence_wav}'\n")

    master_wav = "demo_narration_master_v2.wav"
    subprocess.run([
        FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", concat_txt,
        "-c:a", "pcm_s16le", master_wav
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    total_dur = get_duration(master_wav)
    print(f"Master v2 narration track: {master_wav} ({total_dur:.2f} seconds)")

if __name__ == "__main__":
    main()

