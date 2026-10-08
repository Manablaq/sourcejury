#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ "${SOURCEJURY_AUTHORIZE_STUDIO_WRITE:-NO}" != "YES" ]; then
  echo "STOP: Studio Next writes are locked."
  echo "Set SOURCEJURY_AUTHORIZE_STUDIO_WRITE=YES only after explicit blockchain-write authorization."
  exit 1
fi

command -v gltest >/dev/null 2>&1 || {
  echo "STOP: gltest not found in PATH"
  exit 1
}

mkdir -p artifacts

gltest \
  tests/integration/test_source_jury_studio_next.py \
  --network studio_devnet \
  --fee-profile artifacts/sourcejury-studio-next-fee-profile.json \
  --fee-profile-headroom 1.5 \
  -v

echo "SOURCEJURY_STUDIO_NEXT_CERTIFICATION=PASS"
echo "NETWORK=studio_devnet"
echo "EXPECTED_CHAIN_ID=61997"
echo "FEE_PROFILE=artifacts/sourcejury-studio-next-fee-profile.json"
