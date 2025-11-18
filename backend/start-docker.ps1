# PowerShell script to start Docker services for ViWoApp

Write-Host "🐳 Starting ViWoApp Docker Services..." -ForegroundColor Cyan

# Check if Docker Desktop is running
$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue

if (-not $dockerProcess) {
    Write-Host "⚠️  Docker Desktop is not running!" -ForegroundColor Yellow
    Write-Host "Please start Docker Desktop from the Start Menu and try again." -ForegroundColor Yellow
    Write-Host "`nPress any key to exit..."
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    exit 1
}

# Wait for Docker to be ready
Write-Host "Waiting for Docker to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Try to find docker.exe
$dockerPaths = @(
    "C:\Program Files\Docker\Docker\resources\bin\docker.exe",
    "C:\Program Files\Docker\Docker\resources\docker.exe",
    "$env:ProgramFiles\Docker\Docker\resources\bin\docker.exe"
)

$dockerExe = $null
foreach ($path in $dockerPaths) {
    if (Test-Path $path) {
        $dockerExe = $path
        break
    }
}

if (-not $dockerExe) {
    Write-Host "❌ Could not find docker.exe" -ForegroundColor Red
    Write-Host "Please make sure Docker Desktop is installed correctly." -ForegroundColor Red
    Write-Host "`nTrying alternative method..."
    
    # Try using docker from PATH
    try {
        & docker compose up -d
        Write-Host "✅ Docker services started successfully!" -ForegroundColor Green
        exit 0
    } catch {
        Write-Host "❌ Failed to start Docker services" -ForegroundColor Red
        Write-Host "Please start Docker services manually using Docker Desktop UI" -ForegroundColor Yellow
        exit 1
    }
}

# Start docker compose
try {
    Set-Location -Path $PSScriptRoot
    & $dockerExe compose up -d
    
    Write-Host "`n✅ Docker services started successfully!" -ForegroundColor Green
    Write-Host "`n📊 Services Running:" -ForegroundColor Cyan
    Write-Host "  - PostgreSQL:      localhost:5432" -ForegroundColor White
    Write-Host "  - Redis:           localhost:6379" -ForegroundColor White
    Write-Host "  - pgAdmin:         http://localhost:5050" -ForegroundColor White
    Write-Host "  - Redis Commander: http://localhost:8081" -ForegroundColor White
    Write-Host "`n👉 Use 'docker ps' to verify containers are running" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Failed to start Docker services: $_" -ForegroundColor Red
    exit 1
}

