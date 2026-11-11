@echo off
title NeuralScan 2.0 Runner
echo ========================================================
echo        NEURALSCAN 2.0 - STARTING ALL SERVICES
echo =======================================================
echo
set ROOT_DIR=%~dp0
echo [1/2] Starting FastAPI Backend (Port 8000)...
start "NeuralScan Backend" cmd /k "cd /d %ROOT_DIR%backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
echo [2/2] Starting Vite Frontend (Port 5173)...
start "NeuralScan Frontend" cmd /k "cd /d %ROOT_DIR%frontend && npm run dev"
echo
echo ========================================================
echo Both servers are launching in separate windows!
echo - Frontend URL : http://localhost:5173/
echo - Backend API  : http://127.0.0.1:8000
echo - Swagger Docs : http://127.0.0.1:8000/docs
echo ========================================================
echo
pause
