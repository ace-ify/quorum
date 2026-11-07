param([string]$target = "Brave")
$wsh = New-Object -ComObject WScript.Shell
$result = $wsh.AppActivate($target)
Write-Host "AppActivate('$target') returned: $result"

