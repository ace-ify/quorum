Add-Type @"
  using System;
  using System.Runtime.InteropServices;

  public class DesktopAttacher {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr OpenWindowStation(string lpszWinSta, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetProcessWindowStation(IntPtr hWinSta);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr OpenDesktop(string lpszDesktop, uint dwFlags, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetThreadDesktop(IntPtr hDesktop);

    public static void Attach() {
      IntPtr hWinsta = OpenWindowStation("WinSta0", false, 0x037F);
      Console.WriteLine("OpenWindowStation: " + hWinsta + ", Error: " + Marshal.GetLastWin32Error());
      if (hWinsta != IntPtr.Zero) {
        bool res1 = SetProcessWindowStation(hWinsta);
        Console.WriteLine("SetProcessWindowStation: " + res1);
      }
      IntPtr hDesk = OpenDesktop("Default", 0, false, 0x01FF);
      Console.WriteLine("OpenDesktop: " + hDesk + ", Error: " + Marshal.GetLastWin32Error());
      if (hDesk != IntPtr.Zero) {
        bool res2 = SetThreadDesktop(hDesk);
        Console.WriteLine("SetThreadDesktop: " + res2);
      }
    }
  }
"@
[DesktopAttacher]::Attach()

