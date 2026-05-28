# php-dev.ps1 — Start the PHP dev server with .env variables loaded
# Usage: powershell -ExecutionPolicy Bypass -File scripts\php-dev.ps1
# Optional: pass a port as first argument, e.g. .\scripts\php-dev.ps1 9090

param([int]$Port = 8080)

$envFile = Join-Path $PSScriptRoot ".." ".env"
$envFile = Resolve-Path $envFile

if (-not (Test-Path $envFile)) {
    Write-Error ".env not found at $envFile"
    exit 1
}

# Parse .env — skip blank lines and comments
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $idx = $line.IndexOf("=")
        if ($idx -gt 0) {
            $key   = $line.Substring(0, $idx).Trim()
            $value = $line.Substring($idx + 1).Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

Write-Host "Starting PHP dev server on http://localhost:$Port"
Write-Host "APP_ENV=$env:APP_ENV  |  LOCAL_DEV_EMAIL=$env:LOCAL_DEV_EMAIL"
Write-Host "Press Ctrl+C to stop.`n"

php -S "localhost:$Port" -t public
