@echo off
setlocal enabledelayedexpansion
title AtmoGraph Frontend Dev Server

echo ==============================================================================
echo                 AtmoGraph Supply Chain Intelligence Platform
echo                     Launching Frontend Dev Server (Vite)
echo ==============================================================================

cd /d "%~dp0"

REM Prepend local Node.js v20 to PATH if available
if exist "%~dp0.tools\node-v20.18.0-win-x64\node.exe" (
    set "PATH=%~dp0.tools\node-v20.18.0-win-x64;%PATH%"
    echo [INFO] Prepending portable Node.js v20 to PATH.
)

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH or .tools directory.
    pause
    exit /b 1
)

echo [INFO] Node version:
node -v
echo [INFO] NPM version:
npm -v

cd frontend
echo [INFO] Starting Vite Development Server at http://localhost:5173 ...
npm run dev

pause
