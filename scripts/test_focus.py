import ctypes
import time

user32 = ctypes.windll.user32

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
    # Press Alt to bypass Windows foreground lock
    user32.keybd_event(0x12, 0, 0, 0)
    user32.keybd_event(0x12, 0, 2, 0)
    user32.ShowWindow(hwnd, 3) # SW_MAXIMIZE
    user32.SetForegroundWindow(hwnd)
    return True

print("Focusing Discord in Brave...")
discord_hwnd = find_hwnd_by_title_substring("Discord")
print("Discord HWND:", discord_hwnd)
focus_window(discord_hwnd)
time.sleep(2)

print("Focusing Switch Console...")
switch_hwnd = find_hwnd_by_title_substring("Switch Console")
print("Switch HWND:", switch_hwnd)
focus_window(switch_hwnd)
time.sleep(2)

print("Focusing Antigravity IDE...")
ide_hwnd = find_hwnd_by_title_substring("bb - Antigravity IDE")
print("IDE HWND:", ide_hwnd)
focus_window(ide_hwnd)
print("Done!")

