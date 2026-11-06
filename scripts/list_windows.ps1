Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;

  public class WinEnum {
      public delegate bool EnumWindowsProc(IntPtr hWnd, int lParam);

      [DllImport("user32.dll")]
      public static extern bool EnumWindows(EnumWindowsProc enumFunc, int lParam);

      [DllImport("user32.dll")]
      public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

      [DllImport("user32.dll")]
      public static extern int GetWindowTextLength(IntPtr hWnd);

      [DllImport("user32.dll")]
      public static extern bool IsWindowVisible(IntPtr hWnd);

      [DllImport("user32.dll")]
      public static extern bool SetForegroundWindow(IntPtr hWnd);

      [DllImport("user32.dll")]
      public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  }
"@

$windows = @()
[WinEnum]::EnumWindows({
    param($hWnd, $lParam)
    if ([WinEnum]::IsWindowVisible($hWnd)) {
        $len = [WinEnum]::GetWindowTextLength($hWnd)
        if ($len -gt 0) {
            $sb = New-Object System.Text.StringBuilder ($len + 1)
            [WinEnum]::GetWindowText($hWnd, $sb, $sb.Capacity) | Out-Null
            $title = $sb.ToString()
            if ($title.Trim() -ne "") {
                Write-Output "$hWnd | $title"
            }
        }
    }
    return $true
}, 0)

