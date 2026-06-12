$pgDir = "c:\Users\creepout\Desktop\project_web\UEMF-University-Management\.postgres"
if (-not (Test-Path $pgDir)) {
    New-Item -ItemType Directory -Force -Path $pgDir
}
$zipPath = "$pgDir\postgres.zip"
Write-Host "Downloading PostgreSQL binaries from EnterpriseDB..."
Invoke-WebRequest -Uri "https://get.enterprisedb.com/postgresql/postgresql-16.6-1-windows-x64-binaries.zip" -OutFile $zipPath
Write-Host "Extracting PostgreSQL..."
Expand-Archive -Path $zipPath -DestinationPath $pgDir -Force
Remove-Item $zipPath
Write-Host "PostgreSQL portable downloaded and extracted successfully."
