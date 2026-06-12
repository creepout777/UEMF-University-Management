$ErrorActionPreference = "Stop"
$projectRoot = "c:\Users\creepout\Desktop\project_web\UEMF-University-Management"
$pgRoot = "$projectRoot\.postgres\pgsql"
$dataDir = "$projectRoot\.postgres\data"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  UEMF University Management System" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Start PostgreSQL ─────────────────────────────────────────────
Write-Host "[1/3] Starting PostgreSQL on port 5433..." -ForegroundColor Yellow
$pgProcess = Get-Process -Name postgres -ErrorAction SilentlyContinue
if ($pgProcess) {
    Write-Host "  PostgreSQL is already running." -ForegroundColor Green
} else {
    & "$pgRoot\bin\pg_ctl.exe" start -D $dataDir -o "-p 5433" -l "$projectRoot\.postgres\pg.log"
    Start-Sleep -Seconds 2
    Write-Host "  PostgreSQL started." -ForegroundColor Green
}

# ── Step 2: Start API Server ─────────────────────────────────────────────
Write-Host "[2/3] Starting API server on port 8080..." -ForegroundColor Yellow
$env:PORT = "8080"
$env:DATABASE_URL = "postgresql://postgres@127.0.0.1:5433/uemf"
$env:SESSION_SECRET = "super-secret-session-key"
$env:NODE_ENV = "development"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; `$env:PORT='8080'; `$env:DATABASE_URL='postgresql://postgres@127.0.0.1:5433/uemf'; `$env:SESSION_SECRET='super-secret-session-key'; `$env:NODE_ENV='development'; pnpm --filter @workspace/api-server run dev"
Start-Sleep -Seconds 5
Write-Host "  API server starting in new window." -ForegroundColor Green

# ── Step 3: Start Frontend ───────────────────────────────────────────────
Write-Host "[3/3] Starting frontend on port 22006..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; `$env:PORT='22006'; `$env:BASE_PATH='/'; pnpm --filter @workspace/university-app run dev"
Start-Sleep -Seconds 3
Write-Host "  Frontend starting in new window." -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  All services started!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend:  http://localhost:22006" -ForegroundColor White
Write-Host "  API:       http://localhost:8080/api" -ForegroundColor White
Write-Host ""
Write-Host "  Login credentials:" -ForegroundColor White
Write-Host "    admin / admin123" -ForegroundColor Gray
Write-Host "    student / student123" -ForegroundColor Gray
Write-Host "    teacher / teacher123" -ForegroundColor Gray
Write-Host ""
