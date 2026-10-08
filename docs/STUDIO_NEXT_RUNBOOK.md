# Studio Next backend certification runbook

## Frozen target identity

Before any deployment, re-check the live official release information. The intended target at backend creation time is:

```text
NETWORK=studio_devnet
CANONICAL_RPC=https://studio-dev.genlayer.com/api
CHAIN_ID=61997
STUDIO_FAMILY=v0.123 RC
GENLAYER_PY=0.19.0rc2
GENLAYER_TEST=0.30.0rc2
GENVM_LINTER=0.11.1rc2
GENVM_BUNDLE=v0.6.0-rc5
CONTRACT_ABI=v0.3.0
RUNNER=py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng
```

If the official Studio Next release train changes, **stop**. Do not mix a new network release with this pinned dependency set. Re-certify the compatibility matrix first.

## Gate 1 — source freeze

Record:

```bash
shasum -a 256 contracts/source_jury.py
python --version
gltest --version
genvm-lint --version
pyright --version
```

Worktree must be clean before certification.

## Gate 2 — local contract quality

```bash
./scripts/check_backend.sh
```

Required:

```text
SOURCEJURY_BACKEND_LOCAL_CERTIFICATION=PASS
STUDIO_NEXT_WRITE_PERFORMED=NO
FRONTEND_WORK_STARTED=NO
```

## Gate 3 — explicit write authorization

Do not deploy or transact against Studio Next until the exact deployment/test write scope is authorized.

The environment variable below is only a mechanical lock; it is not itself authorization:

```bash
export SOURCEJURY_AUTHORIZE_STUDIO_WRITE=YES
```

Set it only inside an explicitly authorized run.

## Gate 4 — Studio Next full runtime

```bash
./scripts/studio_next_certify.sh
```

This performs the deployment and consensus transactions in `tests/integration/test_source_jury_studio_next.py`, waits for `finalized`, checks execution success and records the fee profile.

Required semantic branches:

- supported claim
- contradicted claim
- irrelevant evidence -> insufficient

Before reviewer freeze, challenges must also have a live finalized test transaction, either through an additional authorized integration test or a manually recorded Studio run.

## Gate 5 — evidence capture

Persist at minimum:

- exact contract SHA-256
- exact dependency versions
- chain ID
- contract address
- deployment transaction ID
- each case transaction ID
- final GenLayer status
- execution result
- case readback
- fee profile SHA-256
- raw receipts before any normalization/decoding used for the reviewer record

## Gate 6 — frontend unlock

Frontend development begins only after the backend source and runtime evidence are frozen. The frontend must bind to the exact deployed address and must never claim a transaction succeeded from an outer EVM receipt alone.
