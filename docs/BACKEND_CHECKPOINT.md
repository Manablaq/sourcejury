# SourceJury backend checkpoint

This document records the final certified backend checkpoint for the SourceJury release.

## Release status

Backend implementation and reviewer-remediation Studio Devnet certification are complete for this release.

- Network: GenLayer Studio Devnet
- Chain ID: `61997`
- RPC: `https://studio-dev.genlayer.com/api`
- Contract: `0x6Dbe8007192EF981a61fFf540d873F03cD8E3BaE`
- Contract source SHA-256: `004ad1ffc4432326a61bef0b7391cb33ec813b3d7578bba63d352fd841f03b5b`
- Reviewer release commit: `82efeb441ce20484e72518382bda1a175facf9d4`
- Production deployment observed after `main` promotion: `dpl_EivdtWBXmtaH5Rgpj8LH3bWKy82n`
- Repository commit served by that deployment: `ab52041713ba756ca332e1372cfdbf637bc843c4`
- Certified reviewer-matrix deployment: `dpl_Hv47YCFo5aHPKibiNS9K8DNhCya7`
- Certified reviewer-matrix frontend commit: `850195e6b4d36afa6b2964abb85169ab8c19325a`
- Production frontend: `https://sourcejury.vercel.app`
- Finalized case count: `4`
- Finalized challenge count: `2`
- Frozen reviewer matrix SHA-256: `11836086f0d9862a9c9a17863da623884d200facfc7373a476b437ba80dcbd13`
- Finalized readback raw SHA-256: `e2f4d0f647805193c797026981b3e57076d4d4c3229a5132bab2d8eb1b8aec70`
- Final validation summary SHA-256: `563c842a1a68357b96bf1260798ce29a92a0bff2af94204b2bbb4664b047eb36`

The deployed reviewer-remediation backend is the frozen hardened contract source bound to the reviewer release. The later authorized frontend fixes do not alter the contract source. The 12-write reviewer matrix was executed against deployment `dpl_Hv47YCFo5aHPKibiNS9K8DNhCya7` at frontend commit `850195e6b4d36afa6b2964abb85169ab8c19325a`. The subsequent repository-only documentation/evidence synchronization commit `ab52041713ba756ca332e1372cfdbf637bc843c4` changed no frontend application code and was served as production deployment `dpl_EivdtWBXmtaH5Rgpj8LH3bWKy82n` after the `main` promotion. A later metadata-only automatic production rebuild does not change the certified frontend application-code binding.

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

The finalized reviewer-remediation matrix established four cases and two challenges:

- Scenario A / case 1:
  - initial verdict `SUPPORTED`
  - challenge 1 outcome `REJECTED`
  - counter assessment `SUPPORTS`
  - effective verdict remains `SUPPORTED`
- Scenario B / case 2:
  - primary assessment `SUPPORTS`
  - corroborating assessment `CONTRADICTS`
  - `source_conflict=true`
  - effective verdict `INSUFFICIENT`
- Scenario C / case 3:
  - primary source `UNAVAILABLE`
  - no adjudication snapshot stored for unavailable content
  - effective verdict `INSUFFICIENT`
- Scenario D / case 4:
  - initial verdict `SUPPORTED`
  - challenge 2 outcome `UPHELD`
  - counter assessment `CONTRADICTS`
  - revised/effective verdict `INSUFFICIENT`

All 12 authorized lifecycle writes finalized with `FINISHED_WITH_RETURN`. Six available evidence snapshots passed contract-side verification and independent local SHA-256/snapshot-ID recomputation. Scenario D also proved that one contradictory counter-source downgrades a directional verdict to `INSUFFICIENT` rather than directly reversing it to `CONTRADICTED`.

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
