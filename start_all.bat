@echo off
setlocal enabledelayedexpansion
title AtmoGraph All-In-One Launcher

echo ==============================================================================
echo                 AtmoGraph Supply Chain Intelligence Platform
echo                         Launching Complete System
echo ==============================================================================
echo.
echo [1/3] Resolving Python runtime...
set "PYTHON_BIN=python"
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PYTHON_BIN=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
)

echo [2/3] Launching Backend Server in background window...
start "AtmoGraph Backend (FastAPI)" "%PYTHON_BIN%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir "%~dp0backend"

echo [3/3] Waiting for server initialization...
timeout /t 3 /nobreak >nul

echo [INFO] Opening AtmoGraph Enterprise Control Tower in your default browser...
start http://127.0.0.1:8000/

echo.
echo ==============================================================================
echo AtmoGraph is now active!
echo  - Frontend Application : http://127.0.0.1:8000/
echo  - REST API Swagger Docs: http://127.0.0.1:8000/docs
echo  - Redoc Documentation  : http://127.0.0.1:8000/redoc
echo ==============================================================================
echo To stop the application, simply close the backend terminal window.
echo.
pause
