# SourceJury

**SourceJury** is a GenLayer-native evidence court for bounded claims backed by public HTTPS evidence.

A user submits a claim and one or two public evidence sources. GenLayer validators independently retrieve and interpret the evidence, compare the substantive decision fields, and persist a consensus-backed result:

- `SUPPORTED`
- `CONTRADICTED`
- `INSUFFICIENT`

SourceJury also supports bounded counter-evidence challenges. Challenges are deliberately fail-closed: one new source can downgrade a directional verdict to `INSUFFICIENT`, but a single challenge can never flip `SUPPORTED` directly to `CONTRADICTED` or vice versa. The original verdict remains part of the case history.

## Production deployment

- Frontend: `https://sourcejury.vercel.app`
- Vercel production deployment: `dpl_w8AnszLENYfpMqJMxAak3K3CJh1c`
- Frontend release commit: `7f82ba6b454e9d2473ba6c7e821f2952a42f67dc`
- Network: GenLayer Studio Devnet
- Chain ID: `61997`
- RPC: `https://studio-dev.genlayer.com/api`
- Explorer: `https://explorer-studio-dev.genlayer.com`
- SourceJury contract: `0x2E8968E2a47ED96dE89D83061190314d24719929`
- Certified backend contract SHA-256: `b70415770e5d4a9c1cd5371f1e400c3ae073dd5ac3c8f07b0de236ee5f9c3241`
- Certified backend repository checkpoint: `f6a2b86513e41de0f705c0c0bae527daa843eb7f`

The production frontend reads durable court state using GenLayer finalized-state semantics. It does not invent verdicts when RPC reads fail.

## Why this is a GenLayer application

The authoritative state transition depends on semantic interpretation of external web evidence. The frontend cannot decide the result and ask the contract to rubber-stamp it. The leader and validators independently retrieve and evaluate evidence, compare substantive decision fields, and fail closed on disagreement.

## Studio Devnet target

The certified backend targets the Studio development preview / Studio Next release line:

- canonical RPC: `https://studio-dev.genlayer.com/api`
- chain ID: `61997`
- gltest network: `studio_devnet`
- contract ABI line: `v0.3.0`
- runner: pinned `py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng`
- GenLayerPY: `0.19.0rc2`
- genlayer-test: `0.30.0rc2`
- genvm-linter: `0.11.1rc2`
- GenVM bundle: `v0.6.0-rc5` (the bundle pinned by Studio `v0.123.0-rc.7`)

Studio development state is treated as disposable. Deployment identity, source hash, receipts, and verification evidence are frozen before review.

## Architecture

The v1 backend intentionally uses **one Intelligent Contract** (`contracts/source_jury.py`) to avoid unnecessary asynchronous cross-contract messages and extra failure states.

### Public methods

| Method | Role |
|---|---|
| `get_protocol_info()` | Version, policies, and hard limits |
| `get_case_count()` | Number of created cases |
| `get_challenge_count()` | Number of opened challenges |
| `get_case(case_id)` | Read complete case receipt/state |
| `get_challenge(challenge_id)` | Read challenge state |
| `create_case(...)` | Deterministically validate and create a pending case |
| `evaluate_case(case_id)` | Independent web + LLM evidence evaluation under consensus |
| `open_challenge(...)` | Add a bounded new counter-evidence source |
| `resolve_challenge(challenge_id)` | Independently re-evaluate challenge evidence under consensus |

The frontend is in `frontend/` and provides guest reads, wallet-assisted write flows, network switching, fee review, finality tracking, case exploration, challenge workflows, and explicit failure states.

For the deeper backend design, see `docs/ARCHITECTURE.md`.

## Evidence policies

### `DIRECT_SOURCE_V1`

The primary source alone determines the result:

- primary `SUPPORTS` -> `SUPPORTED`
- primary `CONTRADICTS` -> `CONTRADICTED`
- unavailable or irrelevant evidence -> `INSUFFICIENT`

### `CORROBORATED_V1`

Two distinct HTTPS source hosts are required:

- both `SUPPORTS` -> `SUPPORTED`
- both `CONTRADICTS` -> `CONTRADICTED`
- conflict, irrelevance, or missing source -> `INSUFFICIENT`

The final verdict is derived deterministically from validator-agreed source assessments. The LLM does not directly choose the stored verdict.

## Challenge lifecycle

A case may have only one pending challenge at a time and at most eight challenges overall. A challenge must use a new evidence host that is distinct from the original evidence hosts and has not already been used to challenge that case.

The challenge flow is:

1. `open_challenge(...)` records the bounded counter-evidence submission.
2. `resolve_challenge(challenge_id)` independently evaluates the counter-source under consensus.
3. The contract derives the challenge outcome and revised effective verdict from the validator-agreed assessment.
4. The original verdict remains available as part of the case record.

This fail-closed design prevents a single counter-source from directly flipping one directional verdict into the opposite directional verdict.

## Security posture

The contract fails closed and keeps the nondeterministic surface bounded:

- HTTPS-only public evidence URLs
- credentials, query parameters, fragments, custom ports, IP literals, localhost, and malformed DNS hosts rejected
- corroborated policy requires distinct source hosts
- claim <= 1,200 characters
- URL <= 512 characters
- each rendered source truncated to 8,000 characters
- rationale <= 800 characters
- challenge note <= 600 characters
- maximum 8 challenges per case, only one pending challenge at a time
- challenge evidence must come from a new host; each host can challenge a case only once
- submitter/challenger addresses and normalized source hosts are persisted for provenance
- source/claim/note content is explicitly delimited as untrusted data in prompts
- no `strict_eq` on web or LLM output
- validators independently re-fetch and re-evaluate evidence
- substantive decision fields must agree
- source conflict fails to `INSUFFICIENT`
- unavailable evidence fails to `INSUFFICIENT`
- challenge outcome and revised verdict are derived by contract logic from the validator-agreed counter-source assessment
- no EVM contracts, ERC-20/NFT calls, cross-chain calls, secrets, filesystem access, environment variables, or asynchronous messages in the critical path

See `docs/THREAT_MODEL.md` for the attack-by-attack analysis.

## Reviewer quick start

### Backend verification

Create a Python 3.12+ environment and run the frozen backend gate:

```bash
python3.12 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
./scripts/check_backend.sh
```

The backend gate covers Python syntax, `genvm-lint typecheck`, `genvm-lint check`, static guards, stub-runtime behavior, and official `genlayer-test` Direct Mode coverage. The underlying suites are pytest-based.

### Frontend verification

```bash
cd frontend
npm ci
npm run typecheck
npm run test:write-safety
npm run build
npm run test:e2e
```

The browser suite exercises Chromium, Firefox, and WebKit. Write-flow interaction tests use an injected mock wallet and intentionally do not click the final write-confirmation action.

### Production smoke check

The production release is available at:

`https://sourcejury.vercel.app`

Verified public routes:

- `/`
- `/docs`
- `/explorer`
- `/cases/1`

The final production browser audit confirmed three finalized cases in the explorer and case 1 with effective verdict `SUPPORTED`, with zero unexpected browser application errors.

## Local backend certification

`./scripts/check_backend.sh` is the authoritative local backend gate. It performs:

1. Python syntax compilation.
2. `genvm-lint typecheck`.
3. `genvm-lint check`.
4. Static guard tests.
5. Dependency-free stub-runtime behavioral tests.
6. Official `genlayer-test` Direct Mode tests, including validator agreement/disagreement.

## Live-network certification

Live Studio certification performs blockchain writes and must **not** be run casually.

Only after explicit authorization:

```bash
export SOURCEJURY_AUTHORIZE_STUDIO_WRITE=YES
./scripts/studio_next_certify.sh
```

The script targets `studio_devnet`, waits for finality, verifies execution success, and writes a fee profile to:

```text
artifacts/sourcejury-studio-next-fee-profile.json
```

Do not set the authorization variable merely to get around the gate.

## Repository documentation

- `docs/ARCHITECTURE.md` — consensus boundary, lifecycle, policy derivation, and failure behavior
- `docs/THREAT_MODEL.md` — threat model and residual risks
- `docs/BACKEND_CHECKPOINT.md` — backend certification checkpoint record
- `docs/STUDIO_NEXT_RUNBOOK.md` — live-network certification runbook
- `frontend/README.md` — frontend setup, safety, and reviewer verification
- `frontend/PROGRESS.md` — final frontend release/certification record
- `frontend/DESIGN_REFERENCE.md` — visual design reference

## Release status

Backend implementation, live-network certification, frontend implementation, cross-browser QA, production deployment, and the final production browser audit are complete for this release.

The repository release is bound to frontend commit `7f82ba6b454e9d2473ba6c7e821f2952a42f67dc` and the live application at `https://sourcejury.vercel.app`.
