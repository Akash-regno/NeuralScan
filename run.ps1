Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "       NEURALSCAN 2.0 - STARTING ALL SERVICES" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""
$root = $PSScriptRoot
Write-Host "[1/2] Starting FastAPI Backend on port 8000..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$root\backend`" && .\venv\Scripts\activate && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
Write-Host "[2/2] Starting Vite Frontend on port 5173..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$root\frontend`" && npm run dev"
Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Both services are launching in dedicated windows!" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:5173/" -ForegroundColor White
Write-Host "  Backend  : http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  API Docs : http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Cyan
