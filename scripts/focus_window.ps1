param([string]$target = "Discord")
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;

  public class WinFocus {
    [DllImport("user32.dll")]
    public static extern IntPtr OpenInputDesktop(uint dwFlags, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll")]
    public static extern bool EnumDesktopWindows(IntPtr hDesktop, EnumDelegate lpfn, IntPtr lParam);
    public delegate bool EnumDelegate(IntPtr hWnd, int lParam);

    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);

    public static void Focus(string query) {
      IntPtr desk = OpenInputDesktop(0, false, 0x01FF);
      EnumDesktopWindows(desk, (hWnd, lParam) => {
        StringBuilder sb = new StringBuilder(256);
        GetWindowText(hWnd, sb, 256);
        string title = sb.ToString().Trim();
        if (title.ToLower().Contains(query.ToLower())) {
          Console.WriteLine("Found matching window: " + hWnd + " -> " + title);
          keybd_event(0x12, 0, 0, 0); // Alt down
          keybd_event(0x12, 0, 2, 0); // Alt up
          ShowWindow(hWnd, 3); // SW_MAXIMIZE
          SetForegroundWindow(hWnd);
          return false; // stop enumeration
        }
        return true;
      }, IntPtr.Zero);
    }
  }
"@
[WinFocus]::Focus($target)

