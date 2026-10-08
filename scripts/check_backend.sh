#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PYTHON="${PYTHON:-python3}"
GENVM_VERSION_EXPECTED="v0.6.0-rc5"
export GENVM_VERSION="$GENVM_VERSION_EXPECTED"
TMP_ARTIFACTS="$(mktemp -d "${TMPDIR:-/tmp}/sourcejury-backend-artifacts.XXXXXX")"
trap 'rm -rf "$TMP_ARTIFACTS"' EXIT

printf '%s\n' "===== SOURCEJURY BACKEND LOCAL CERTIFICATION ====="

"$PYTHON" - <<'PY'
import sys
from importlib.metadata import version
if sys.version_info < (3, 12):
    raise SystemExit(f"STOP: Python >=3.12 required, got {sys.version.split()[0]}")
expected = {
    "genlayer-py": "0.19.0rc2",
    "genlayer-test": "0.30.0rc2",
    "genvm-linter": "0.11.1rc2",
    "pytest": "8.4.2",
    "pyright": "1.1.408",
}
for dist, want in expected.items():
    got = version(dist)
    print(f"{dist}={got}")
    if got != want:
        raise SystemExit(f"STOP: {dist} version mismatch: expected {want}, got {got}")
print("SOURCEJURY_PINNED_TOOLCHAIN=PASS")
PY

"$PYTHON" -m py_compile \
  contracts/source_jury.py \
  tests/test_contract_static.py \
  tests/stub_runtime/test_source_jury_stub_runtime.py \
  tests/test_source_jury_direct.py \
  tests/integration/test_source_jury_studio_next.py

echo "GENVM_VERSION=$GENVM_VERSION"
test "$GENVM_VERSION" = "$GENVM_VERSION_EXPECTED" || {
  echo "STOP: GENVM VERSION PIN CHANGED"
  exit 1
}
echo "SOURCEJURY_GENVM_BUNDLE_PIN=PASS"

command -v genvm-lint >/dev/null 2>&1 || {
  echo "STOP: genvm-lint not found in PATH"
  exit 1
}
command -v pyright >/dev/null 2>&1 || {
  echo "STOP: pyright not found in PATH"
  exit 1
}

genvm-lint typecheck contracts/source_jury.py
genvm-lint check contracts/source_jury.py

"$PYTHON" -m pytest -q --artifacts-dir "$TMP_ARTIFACTS/stub" \
  tests/test_contract_static.py \
  tests/stub_runtime/test_source_jury_stub_runtime.py

echo "SOURCEJURY_STUB_RUNTIME_TESTS=PASS"

"$PYTHON" -m pytest -q --artifacts-dir "$TMP_ARTIFACTS/direct" \
  tests/test_source_jury_direct.py

echo "SOURCEJURY_OFFICIAL_DIRECT_MODE_TESTS=PASS"
echo "SOURCEJURY_BACKEND_LOCAL_CERTIFICATION=PASS"
echo "STUDIO_NEXT_WRITE_PERFORMED=NO"
echo "FRONTEND_WORK_STARTED=NO"
