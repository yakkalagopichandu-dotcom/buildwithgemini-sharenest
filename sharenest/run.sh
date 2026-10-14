#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=== 🕊️ Starting ShareNest Unified Web Application ==="
echo "Port: ${PORT:-8080}"
echo "Project: ${GOOGLE_CLOUD_PROJECT:-qwiklabs-gcp-04-f3ca7b5378f0}"

# Run backend FastAPI server with the embedded React UI and Agent
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port "${PORT:-8080}" --reload
