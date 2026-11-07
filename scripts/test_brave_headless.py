import subprocess
import os

html_path = os.path.abspath("test_render.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write("""<!DOCTYPE html>
<html>
<body style="background:#1e1f22;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
    <h1>Discord Test Screen</h1>
</body>
</html>""")

brave_exe = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
png_path = os.path.abspath("test_render.png")
cmd = [brave_exe, "--headless", "--disable-gpu", "--window-size=1920,1080", f"--screenshot={png_path}", html_path]
subprocess.run(cmd, check=True)

if os.path.exists(png_path):
    print("SUCCESS: Headless screenshot created!", os.path.getsize(png_path), "bytes")
else:
    print("FAILED: Screenshot not found")

