$pgDir = "c:\Users\creepout\Desktop\project_web\UEMF-University-Management\.postgres"
if (-not (Test-Path $pgDir)) {
    New-Item -ItemType Directory -Force -Path $pgDir
}
$zipPath = "$pgDir\postgres.zip"
Write-Host "Downloading PostgreSQL binaries using curl.exe..."
curl.exe -L -o $zipPath "https://get.enterprisedb.com/postgresql/postgresql-16.6-1-windows-x64-binaries.zip"
Write-Host "Extracting PostgreSQL..."
Expand-Archive -Path $zipPath -DestinationPath $pgDir -Force
Remove-Item $zipPath
Write-Host "PostgreSQL portable downloaded and extracted successfully."
