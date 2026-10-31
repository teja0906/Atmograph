@echo off
setlocal enabledelayedexpansion
title AtmoGraph Test Runner

echo ==============================================================================
echo                 AtmoGraph Supply Chain Intelligence Platform
echo                         Executing Verification Suite
echo ==============================================================================
echo.

cd /d "%~dp0"

REM Resolve Python 3.11 binary
set "PYTHON_BIN=python"
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PYTHON_BIN=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
)

echo [INFO] Using Python: %PYTHON_BIN%
"%PYTHON_BIN%" --version
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python 3.11 could not be executed.
    pause
    exit /b 1
)

echo.
echo [1/2] Running 7-Step End-to-End System Integration Suite...
"%PYTHON_BIN%" tests/run_tests.py

echo.
echo [2/2] Running FastAPI REST Endpoint Contract Pytest Suite...
"%PYTHON_BIN%" -m pytest tests/test_backend.py -v

echo.
echo ==============================================================================
echo Test execution complete.
echo ==============================================================================
pause
