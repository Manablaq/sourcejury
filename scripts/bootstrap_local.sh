#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PYTHON_BIN="${PYTHON_BIN:-python3.12}"

command -v "$PYTHON_BIN" >/dev/null 2>&1 || {
  echo "STOP: $PYTHON_BIN not found. SourceJury requires Python 3.12+."
  exit 1
}

if [ -e .venv ]; then
  echo "STOP: .venv already exists. Refusing to overwrite an existing environment."
  exit 1
fi

"$PYTHON_BIN" -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

./scripts/check_backend.sh
