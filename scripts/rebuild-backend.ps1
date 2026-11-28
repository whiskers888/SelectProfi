$ErrorActionPreference = "Stop"

Push-Location (Split-Path -Parent $PSScriptRoot)

try {
    Write-Host "Rebuilding app..." -ForegroundColor Cyan

    docker compose up -d --build --force-recreate --no-deps --wait --wait-timeout 180 app

    if ($LASTEXITCODE -ne 0) {
        throw "Build or startup failed: app"
    }

    docker compose ps app

    if ($LASTEXITCODE -ne 0) {
        throw "Service status check failed"
    }

    Write-Host "app: BUILD AND STARTUP OK" -ForegroundColor Green
}
finally {
    Pop-Location
}