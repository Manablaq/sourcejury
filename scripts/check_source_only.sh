#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PYTHON="${PYTHON:-python3}"
TMP_ARTIFACTS="$(mktemp -d "${TMPDIR:-/tmp}/sourcejury-source-only-artifacts.XXXXXX")"
trap 'rm -rf "$TMP_ARTIFACTS"' EXIT

printf '%s\n' "===== SOURCEJURY SOURCE-ONLY SAFETY GATE ====="
"$PYTHON" -m py_compile \
  contracts/source_jury.py \
  tests/test_contract_static.py \
  tests/stub_runtime/test_source_jury_stub_runtime.py \
  tests/test_source_jury_direct.py \
  tests/integration/test_source_jury_studio_next.py

"$PYTHON" -m pytest -q --artifacts-dir "$TMP_ARTIFACTS" \
  tests/test_contract_static.py \
  tests/stub_runtime/test_source_jury_stub_runtime.py

echo "SOURCEJURY_SOURCE_ONLY_GATE=PASS"
echo "OFFICIAL_GENVM_LINTER_EXECUTED=NO"
echo "OFFICIAL_GENLAYER_DIRECT_MODE_EXECUTED=NO"
echo "STUDIO_NEXT_WRITE_PERFORMED=NO"
echo "FRONTEND_WORK_STARTED=NO"
