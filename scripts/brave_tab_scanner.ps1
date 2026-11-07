Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;
  using System.Threading;

  public class BraveTabScanner {
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

    public static void ScanTabs() {
      IntPtr desk = OpenInputDesktop(0, false, 0x01FF);
      IntPtr braveHwnd = IntPtr.Zero;
      EnumDesktopWindows(desk, (hWnd, lParam) => {
        StringBuilder sb = new StringBuilder(256);
        GetWindowText(hWnd, sb, 256);
        string title = sb.ToString();
        if (title.Contains("Brave")) {
          braveHwnd = hWnd;
          return false;
        }
        return true;
      }, IntPtr.Zero);

      if (braveHwnd == IntPtr.Zero) return;

      ShowWindow(braveHwnd, 3);
      SetForegroundWindow(braveHwnd);
      Thread.Sleep(300);

      for (int i = 0; i < 20; i++) {
        StringBuilder sb = new StringBuilder(256);
        GetWindowText(braveHwnd, sb, 256);
        string t = sb.ToString();
        Console.WriteLine("Tab [" + i + "]: " + t);
        if (t.ToLower().Contains("discord")) {
          Console.WriteLine("--> FOUND DISCORD TAB!");
          return;
        }

        // Ctrl + Tab
        keybd_event(0x11, 0, 0, 0); // Ctrl down
        keybd_event(0x09, 0, 0, 0); // Tab down
        keybd_event(0x09, 0, 2, 0); // Tab up
        keybd_event(0x11, 0, 2, 0); // Ctrl up
        Thread.Sleep(400);
      }
    }
  }
"@
[BraveTabScanner]::ScanTabs()

