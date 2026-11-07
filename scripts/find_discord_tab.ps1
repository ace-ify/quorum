Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;
  using System.Threading;

  public class BraveTabFinder {
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

    public static void FindDiscordTab() {
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

      if (braveHwnd == IntPtr.Zero) {
        Console.WriteLine("Brave window not found.");
        return;
      }

      Console.WriteLine("Focusing Brave: " + braveHwnd);
      ShowWindow(braveHwnd, 3); // SW_MAXIMIZE
      SetForegroundWindow(braveHwnd);
      Thread.Sleep(500);

      // Try Ctrl+1, Ctrl+2, Ctrl+3, etc.
      for (int i = 1; i <= 8; i++) {
        byte key = (byte)(0x30 + i);
        keybd_event(0x11, 0, 0, 0); // Ctrl down
        keybd_event(key, 0, 0, 0);   // number down
        keybd_event(key, 0, 2, 0);   // number up
        keybd_event(0x11, 0, 2, 0); // Ctrl up
        Thread.Sleep(400);

        StringBuilder sb = new StringBuilder(256);
        GetWindowText(braveHwnd, sb, 256);
        string currentTitle = sb.ToString();
        Console.WriteLine("Tab " + i + ": " + currentTitle);
        if (currentTitle.ToLower().Contains("discord")) {
          Console.WriteLine("Found Discord on Tab " + i + "!");
          break;
        }
      }
    }
  }
"@
[BraveTabFinder]::FindDiscordTab()

