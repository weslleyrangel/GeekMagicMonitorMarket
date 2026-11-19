param(
    [string]$Port = "COM7"
)

try {
    $sp = New-Object System.IO.Ports.SerialPort $Port, 115200, None, 8, one
    $sp.DtrEnable = $false
    $sp.RtsEnable = $false
    $sp.Open()
    $sp.DtrEnable = $true
    $sp.RtsEnable = $true
    Start-Sleep -Milliseconds 200
    $sp.DtrEnable = $false
    $sp.RtsEnable = $false
    $sp.Close()
    Write-Output "SUCCESS"
} catch {
    Write-Output ("ERROR: " + $_.Exception.Message)
}
