#!/usr/bin/env bash
# ==============================================================================
# AtmoGraph Backend API Server Launcher (Linux / macOS / WSL)
# ==============================================================================
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=============================================================================="
echo "                AtmoGraph Supply Chain Intelligence Platform"
echo "                        Launching Backend Service"
echo "=============================================================================="

PYTHON_BIN=$(command -v python3 || command -v python)
echo "[INFO] Using Python: $PYTHON_BIN"
export PYTHONPATH="$SCRIPT_DIR/backend:$PYTHONPATH"

"$PYTHON_BIN" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --app-dir "$SCRIPT_DIR/backend"
