import subprocess
import time
import ctypes

user32 = ctypes.windll.user32

cmd = 'python -m src.main --simulate --sample realtime_chat'
p = subprocess.Popen([
    "powershell.exe",
    "-NoExit",
    "-Command",
    f"$host.ui.RawUI.WindowTitle = 'BlindCouncil Live Engine'; cd C:\\ace\\products\\bb; {cmd}"
])

print("Spawned process PID:", p.pid)
time.sleep(3)

def find_hwnd():
    matches = []
    def enum_cb(hwnd, lparam):
        if user32.IsWindowVisible(hwnd):
            length = user32.GetWindowTextLengthW(hwnd)
            if length > 0:
                buff = ctypes.create_unicode_buffer(length + 1)
                user32.GetWindowTextW(hwnd, buff, length + 1)
                title = buff.value.strip()
                if "BlindCouncil Live Engine" in title:
                    matches.append((hwnd, title))
        return True
    WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    user32.EnumWindows(WNDENUMPROC(enum_cb), 0)
    return matches[0][0] if matches else None

hwnd = find_hwnd()
print("Found HWND:", hwnd)
if hwnd:
    user32.keybd_event(0x12, 0, 0, 0)
    user32.keybd_event(0x12, 0, 2, 0)
    user32.ShowWindow(hwnd, 3) # Maximize
    user32.SetForegroundWindow(hwnd)
    print("Maximized terminal!")

time.sleep(3)
p.terminate()
print("Cleaned up!")

