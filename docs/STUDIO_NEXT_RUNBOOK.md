# Studio Next backend certification runbook

This runbook documents the controlled live-network certification procedure used by SourceJury. It is retained for reproducibility and future recertification.

## Completed release record

The current SourceJury release has already satisfied the live-network gate described below.

- Network: `studio_devnet`
- Canonical RPC: `https://studio-dev.genlayer.com/api`
- Chain ID: `61997`
- Certified contract: `0x2E8968E2a47ED96dE89D83061190314d24719929`
- Contract SHA-256: `b70415770e5d4a9c1cd5371f1e400c3ae073dd5ac3c8f07b0de236ee5f9c3241`
- Production frontend: `https://sourcejury.vercel.app`
- Frontend release commit: `7f82ba6b454e9d2473ba6c7e821f2952a42f67dc`

The release includes finalized `SUPPORTED`, `CONTRADICTED`, and `INSUFFICIENT` cases plus a finalized challenge path.

**Do not rerun this live-write procedure merely to reproduce documentation.** A new live run requires a new explicit blockchain-write authorization.

## Frozen target identity

Before any future recertification, re-check the live official release information. The dependency set used for this certified release is:

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

If the official Studio release train changes, stop. Do not mix a new network release with this pinned dependency set. Re-certify the compatibility matrix first.

## Gate 1 — source freeze

Record:

```bash
shasum -a 256 contracts/source_jury.py
python --version
gltest --version
genvm-lint --version
pyright --version
```

The worktree must be clean before certification.

## Gate 2 — local contract quality

```bash
./scripts/check_backend.sh
```

For a fresh pre-live certification, require the local gate to pass before authorizing any network write.

The historical pre-live workflow also required that no Studio write had yet occurred at this point. That condition is a gate-order assertion, not the current release status.

## Gate 3 — explicit write authorization

Do not deploy or transact against Studio Devnet until the exact deployment/test write scope is authorized.

The environment variable below is only a mechanical lock; it is not itself authorization:

```bash
export SOURCEJURY_AUTHORIZE_STUDIO_WRITE=YES
```

Set it only inside an explicitly authorized run.

## Gate 4 — Studio Devnet full runtime

```bash
./scripts/studio_next_certify.sh
```

This performs the authorized deployment and consensus transactions in `tests/integration/test_source_jury_studio_next.py`, waits for `finalized`, checks execution success, and records the fee profile.

Required semantic branches:

- supported claim
- contradicted claim
- irrelevant evidence -> insufficient

Reviewer freeze also requires a live finalized challenge transaction. The current certified release satisfied that requirement and records a finalized challenge outcome separately from the primary-case branches.

## Gate 5 — evidence capture

Persist at minimum:

- exact contract SHA-256
- exact dependency versions
- chain ID
- contract address
- deployment transaction ID
- each case transaction ID
- challenge transaction ID
- final GenLayer status
- execution result
- case/challenge readback
- fee profile SHA-256
- raw receipts before any normalization or decoding used for the reviewer record

Do not infer finality from submission or an outer EVM receipt alone.

## Gate 6 — frontend unlock

Frontend development may begin only after the backend source and runtime evidence are frozen.

The current release has passed this gate. Its production frontend is bound to:

`0x2E8968E2a47ED96dE89D83061190314d24719929`

Durable frontend reads use finalized state and the frontend must never claim a transaction succeeded from an outer EVM receipt alone.

## Future recertification rule

This runbook is not standing authorization.

If the contract source, dependency matrix, network release, or deployed contract identity changes, create a new frozen checkpoint and obtain fresh explicit authorization before any live write.
