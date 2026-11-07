Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;
  using System.Threading;
  using System.Windows.Forms;

  public class BraveNewTabNav {
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

    public static void OpenDiscordTab() {
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
      Thread.Sleep(800);

      // Set clipboard text
      Clipboard.SetText("https://discord.com/channels/1567786487745880084/1568450323515842640");

      // Ctrl + T (New Tab)
      keybd_event(0x11, 0, 0, 0); // Ctrl down
      keybd_event(0x54, 0, 0, 0); // 'T' down
      keybd_event(0x54, 0, 2, 0); // 'T' up
      keybd_event(0x11, 0, 2, 0); // Ctrl up
      Thread.Sleep(500);

      // Ctrl + V (Paste)
      keybd_event(0x11, 0, 0, 0); // Ctrl down
      keybd_event(0x56, 0, 0, 0); // 'V' down
      keybd_event(0x56, 0, 2, 0); // 'V' up
      keybd_event(0x11, 0, 2, 0); // Ctrl up
      Thread.Sleep(300);

      // Enter
      keybd_event(0x0D, 0, 0, 0); // Enter down
      keybd_event(0x0D, 0, 2, 0); // Enter up

      Console.WriteLine("Sent Ctrl+T and navigated to Discord. Waiting for load...");
      Thread.Sleep(5000);

      StringBuilder checkSb = new StringBuilder(256);
      GetWindowText(braveHwnd, checkSb, 256);
      Console.WriteLine("Title after opening tab: " + checkSb.ToString());
    }
  }
"@ -ReferencedAssemblies System.Windows.Forms

[BraveNewTabNav]::OpenDiscordTab()

