# SourceJury backend checkpoint

This document records the final certified backend checkpoint for the SourceJury release.

## Release status

Backend implementation and live Studio Devnet certification are complete for this release.

- Network: GenLayer Studio Devnet
- Chain ID: `61997`
- RPC: `https://studio-dev.genlayer.com/api`
- Contract: `0x2E8968E2a47ED96dE89D83061190314d24719929`
- Contract SHA-256: `b70415770e5d4a9c1cd5371f1e400c3ae073dd5ac3c8f07b0de236ee5f9c3241`
- Network config SHA-256: `3aecdcc51d1628b73191b176ccf3ddc7498570453a0225059ff98f5605683712`
- Certified backend repository checkpoint: `f6a2b86513e41de0f705c0c0bae527daa843eb7f`
- Frontend release commit: `7f82ba6b454e9d2473ba6c7e821f2952a42f67dc`
- Production frontend: `https://sourcejury.vercel.app`

The deployed backend is the same frozen contract source certified by the local and live-network gates.

## Implemented

- Studio Next v0.3 contract API and pinned py-genlayer runner
- single-contract case registry
- direct-source and corroborated-source policies
- deterministic source/claim validation
- bounded web rendering
- prompt-injection delimiters
- structured LLM source classification
- independent validator re-fetch/re-evaluation
- deterministic verdict derivation
- case receipts with immutable initial verdict and mutable effective verdict
- bounded counter-evidence challenges
- challenge consensus and upheld/rejected/insufficient outcomes
- duplicate guards
- SSRF-oriented URL guards
- static guard suite
- dependency-free behavioral stub-runtime suite
- official Direct Mode test suite
- gated Studio Devnet integration test
- fee-profile certification
- threat model and deployment runbook
- finalized live-network evidence capture
- production frontend bound to the certified backend address

## Certified live state

The reviewer-facing live certification established:

- finalized case count: `3`
- finalized challenge count: `1`
- case 1 effective verdict: `SUPPORTED`
- case 2 effective verdict: `CONTRADICTED`
- case 3 effective verdict: `INSUFFICIENT`
- challenge 1 outcome: `REJECTED`
- challenge 1 counter-source assessment: `SUPPORTS`
- challenge 1 revised verdict: `SUPPORTED`
- case 1 pending challenge after resolution: `0`

These branches demonstrate the three primary verdict classes and a finalized challenge path without relying on UI-fabricated state.

## Security properties retained at release

- Challenge state transitions are contract-derived and fail closed.
- One new source cannot directly flip one directional verdict to the opposite directional verdict.
- Provenance stores submitter/challenger and normalized source-host identities.
- Only one challenge may be pending per case.
- Challenge hosts cannot be replayed for the same case.
- Public evidence inputs remain bounded and HTTPS-only.
- Validator disagreement does not silently choose a result.
- Frontend durable reads use finalized contract state.

## Reviewer verification

For local backend verification:

```bash
python3.12 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
./scripts/check_backend.sh
```

The live-network certification procedure is retained in `docs/STUDIO_NEXT_RUNBOOK.md`. It performs blockchain writes and must not be rerun without a new explicit authorization.

For the production application, use:

`https://sourcejury.vercel.app`

## Checkpoint boundary

This checkpoint is a release record, not authorization for additional writes.

Any new Studio Devnet deployment, contract transaction, funding operation, or signing operation requires a separately scoped authorization and a new evidence record.
