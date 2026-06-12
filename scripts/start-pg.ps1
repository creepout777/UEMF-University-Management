$pgRoot = "c:\Users\creepout\Desktop\project_web\UEMF-University-Management\.postgres\pgsql"
$dataDir = "c:\Users\creepout\Desktop\project_web\UEMF-University-Management\.postgres\data"

if (-not (Test-Path $dataDir)) {
    Write-Host "Initializing PostgreSQL database..."
    & "$pgRoot\bin\initdb.exe" -D $dataDir -U postgres --auth=trust
}

Write-Host "Starting PostgreSQL database server on port 5433..."
& "$pgRoot\bin\pg_ctl.exe" start -D $dataDir -o "-p 5433"

# Wait a couple of seconds for postgres to be ready
Start-Sleep -Seconds 3

Write-Host "Creating database 'uemf'..."
& "$pgRoot\bin\createdb.exe" -U postgres uemf -h localhost -p 5433

Write-Host "PostgreSQL is ready on port 5433!"
