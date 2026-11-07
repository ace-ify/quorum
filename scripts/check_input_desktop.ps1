Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;

  public class WinStaCheck {
    [DllImport("user32.dll")]
    public static extern IntPtr OpenInputDesktop(uint dwFlags, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll")]
    public static extern bool EnumDesktopWindows(IntPtr hDesktop, EnumDelegate lpfn, IntPtr lParam);
    public delegate bool EnumDelegate(IntPtr hWnd, int lParam);

    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    public static void Check() {
      IntPtr desk = OpenInputDesktop(0, false, 0x01FF);
      Console.WriteLine("Input Desktop Handle: " + desk);
      if (desk != IntPtr.Zero) {
        EnumDesktopWindows(desk, (hWnd, lParam) => {
          StringBuilder sb = new StringBuilder(256);
          GetWindowText(hWnd, sb, 256);
          string title = sb.ToString().Trim();
          if (!string.IsNullOrEmpty(title)) {
            Console.WriteLine(hWnd + " | " + title);
          }
          return true;
        }, IntPtr.Zero);
      }
    }
  }
"@
[WinStaCheck]::Check()

