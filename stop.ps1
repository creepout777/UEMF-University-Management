$projectRoot = "c:\Users\creepout\Desktop\project_web\UEMF-University-Management"
$pgRoot = "$projectRoot\.postgres\pgsql"
$dataDir = "$projectRoot\.postgres\data"

Write-Host ""
Write-Host "Stopping UEMF services..." -ForegroundColor Yellow
Write-Host ""

# Stop PostgreSQL
$pgProcess = Get-Process -Name postgres -ErrorAction SilentlyContinue
if ($pgProcess) {
    Write-Host "Stopping PostgreSQL..." -ForegroundColor Yellow
    & "$pgRoot\bin\pg_ctl.exe" stop -D $dataDir -m fast
    Write-Host "  PostgreSQL stopped." -ForegroundColor Green
} else {
    Write-Host "  PostgreSQL is not running." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Done. You can now safely shut down your PC." -ForegroundColor Green
Write-Host ""
