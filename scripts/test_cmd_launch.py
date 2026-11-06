import subprocess
import time
import ctypes

user32 = ctypes.windll.user32

p = subprocess.Popen('start "BlindCouncil_Live_Engine" cmd /k "cd /d C:\\ace\\products\\bb && python -m src.main --simulate --sample realtime_chat"', shell=True)
time.sleep(2)

def find_hwnd():
    matches = []
    def enum_cb(hwnd, lparam):
        if user32.IsWindowVisible(hwnd):
            length = user32.GetWindowTextLengthW(hwnd)
            if length > 0:
                buff = ctypes.create_unicode_buffer(length + 1)
                user32.GetWindowTextW(hwnd, buff, length + 1)
                title = buff.value.strip()
                if "BlindCouncil_Live_Engine" in title:
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
    print("Maximized terminal successfully!")
time.sleep(4)

