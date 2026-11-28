$ErrorActionPreference = "Stop"

Push-Location (Split-Path -Parent $PSScriptRoot)

try {
    Write-Host "Rebuilding frontend..." -ForegroundColor Cyan

    docker compose up -d --build --force-recreate --no-deps --wait --wait-timeout 180 frontend

    if ($LASTEXITCODE -ne 0) {
        throw "Build or startup failed: frontend"
    }

    docker compose ps frontend

    if ($LASTEXITCODE -ne 0) {
        throw "Service status check failed"
    }

    Write-Host "frontend: BUILD AND STARTUP OK" -ForegroundColor Green
}
finally {
    Pop-Location
}