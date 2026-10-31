@echo off
setlocal enabledelayedexpansion
title AtmoGraph Backend API Server

echo ==============================================================================
echo                 AtmoGraph Supply Chain Intelligence Platform
echo                         Launching Backend Service
echo ==============================================================================

cd /d "%~dp0"

REM Resolve Python 3.11 binary
set "PYTHON_BIN=python"
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PYTHON_BIN=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
)

echo [INFO] Using Python: %PYTHON_BIN%
"%PYTHON_BIN%" --version
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python 3.11 could not be executed. Please verify installation.
    pause
    exit /b 1
)

echo [INFO] Starting FastAPI Uvicorn Server at http://127.0.0.1:8000 ...
echo [INFO] Documentation available at: http://127.0.0.1:8000/docs
echo [INFO] Full Web Application served at: http://127.0.0.1:8000/
echo.

set PYTHONPATH=%~dp0backend
"%PYTHON_BIN%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --app-dir "%~dp0backend"

pause
