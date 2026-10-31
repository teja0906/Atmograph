@echo off
setlocal enabledelayedexpansion
title Push AtmoGraph to GitHub

echo ==============================================================================
echo                 Push AtmoGraph Repository to GitHub
echo              Target: https://github.com/teja0906/Atmograph.git
echo ==============================================================================
echo.

cd /d "%~dp0"

REM Prepend local git to PATH
set "PATH=%~dp0.tools\git\cmd;%PATH%"

echo [1/2] Local git commit status:
git log -n 1 --oneline
echo.

echo ==============================================================================
echo GitHub Authentication Options:
echo.
echo Option A: Paste a GitHub Personal Access Token (PAT) with 'repo' scope.
echo           (Generate one at: https://github.com/settings/tokens)
echo.
echo Option B: Press ENTER without typing anything to use your standard git/browser login.
echo ==============================================================================
echo.
set /p "GITHUB_TOKEN=Enter your GitHub Token (or press Enter for standard login): "

echo.
if "%GITHUB_TOKEN%"=="" (
    echo [2/2] Attempting standard git push...
    git push -u origin main
) else (
    echo [2/2] Pushing with provided Personal Access Token...
    git push -u https://%GITHUB_TOKEN%@github.com/teja0906/Atmograph.git main
)

echo.
if %ERRORLEVEL% equ 0 (
    echo ==============================================================================
    echo [SUCCESS] All code has been successfully pushed to:
    echo           https://github.com/teja0906/Atmograph
    echo ==============================================================================
) else (
    echo ==============================================================================
    echo [ERROR] Push failed. Please verify your token permissions (repo scope) or credentials.
    echo ==============================================================================
)

echo.
pause
