Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;
  using System.Threading;

  public class BraveSendKeys {
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

    public static IntPtr FocusBrave() {
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

      if (braveHwnd != IntPtr.Zero) {
        ShowWindow(braveHwnd, 3); // SW_MAXIMIZE
        SetForegroundWindow(braveHwnd);
        Thread.Sleep(500);
      }
      return braveHwnd;
    }
  }
"@

$hwnd = [BraveSendKeys]::FocusBrave()
if ($hwnd -ne [IntPtr]::Zero) {
    Write-Host "Focused Brave ($hwnd). Sending navigation keystrokes..."
    [System.Windows.Forms.SendKeys]::SendWait("^l")
    Start-Sleep -Milliseconds 400
    [System.Windows.Forms.SendKeys]::SendWait("https://discord.com/channels/1567786487745880084/1568450323515842640{ENTER}")
    Write-Host "Navigation sent. Waiting 5s for page to load..."
    Start-Sleep -Seconds 5
    & ".\scripts\check_input_desktop.ps1"
}

