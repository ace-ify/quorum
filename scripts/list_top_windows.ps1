Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;

  public class WinList {
    [DllImport("user32.dll")]
    public static extern bool EnumDesktopWindows(IntPtr hDesktop, EnumDelegate lpfn, IntPtr lParam);
    public delegate bool EnumDelegate(IntPtr hWnd, int lParam);

    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    public static void ListWindows() {
      EnumDesktopWindows(IntPtr.Zero, (hWnd, lParam) => {
        if (IsWindowVisible(hWnd)) {
          StringBuilder sb = new StringBuilder(256);
          GetWindowText(hWnd, sb, 256);
          string title = sb.ToString().Trim();
          if (!string.IsNullOrEmpty(title)) {
            Console.WriteLine(hWnd + " | " + title);
          }
        }
        return true;
      }, IntPtr.Zero);
    }
  }
"@
[WinList]::ListWindows()

