# SourceJury Backend

**SourceJury** is a GenLayer-native evidence court. A user submits a bounded claim and one or two public HTTPS evidence sources. Validators independently retrieve the evidence, classify how each source relates to the claim, and only then persist a consensus-backed result:

- `SUPPORTED`
- `CONTRADICTED`
- `INSUFFICIENT`

The backend also supports bounded counter-evidence challenges. Challenges are deliberately fail-closed: one new source can downgrade a directional verdict to `INSUFFICIENT`, but a single challenge can never flip `SUPPORTED` directly to `CONTRADICTED` or vice versa. The original verdict is never erased.

## Why this is a GenLayer application

The authoritative state transition depends on semantic interpretation of external web evidence. The frontend cannot decide the result and ask the contract to rubber-stamp it. The leader and validators independently retrieve/evaluate evidence, compare substantive decision fields, and fail closed on disagreement.

## Studio Next target

This project is designed for the current Studio development preview / Studio Next release train:

- canonical RPC: `https://studio-dev.genlayer.com/api`
- chain ID: `61997`
- gltest network: `studio_devnet`
- contract ABI line: `v0.3.0`
- runner: pinned `py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng`
- GenLayerPY: `0.19.0rc2`
- genlayer-test: `0.30.0rc2`
- genvm-linter: `0.11.1rc2`
- GenVM bundle: `v0.6.0-rc5` (the bundle pinned by Studio `v0.123.0-rc.7`)

Studio Next state is treated as disposable. Deployment identity, source hash, receipts and test evidence must be frozen before review.

## Backend architecture

The v1 backend intentionally uses **one Intelligent Contract** (`contracts/source_jury.py`) to avoid unnecessary asynchronous cross-contract messages and extra failure states.

### Public methods

| Method | Role |
|---|---|
| `get_protocol_info()` | Version, policies and hard limits |
| `get_case_count()` | Number of created cases |
| `get_challenge_count()` | Number of opened challenges |
| `get_case(case_id)` | Read complete case receipt/state |
| `get_challenge(challenge_id)` | Read challenge state |
| `create_case(...)` | Deterministically validate and create a pending case |
| `evaluate_case(case_id)` | Independent web + LLM evidence evaluation under consensus |
| `open_challenge(...)` | Add a bounded new counter-evidence source |
| `resolve_challenge(challenge_id)` | Independently re-evaluate challenge evidence under consensus |

## Evidence policies

### `DIRECT_SOURCE_V1`

The primary source alone determines the result:

- primary `SUPPORTS` -> `SUPPORTED`
- primary `CONTRADICTS` -> `CONTRADICTED`
- unavailable/irrelevant -> `INSUFFICIENT`

### `CORROBORATED_V1`

Two distinct HTTPS source hosts are required:

- both `SUPPORTS` -> `SUPPORTED`
- both `CONTRADICTS` -> `CONTRADICTED`
- conflict, irrelevance, or missing source -> `INSUFFICIENT`

This policy derives the final verdict deterministically from validator-agreed source assessments. The LLM does not directly choose the stored verdict.

## Security posture

The contract fails closed and keeps the nondeterministic surface bounded:

- HTTPS-only public evidence URLs
- credentials, query parameters, fragments, custom ports, IP literals, localhost and malformed DNS hosts rejected
- corroborated policy requires distinct source hosts
- claim <= 1,200 characters
- URL <= 512 characters
- each rendered source truncated to 8,000 characters
- rationale <= 800 characters
- challenge note <= 600 characters
- maximum 8 challenges per case, only one pending challenge at a time
- challenge evidence must come from a new host; each host can challenge a case only once
- submitter/challenger addresses and normalized source hosts are persisted for provenance
- source/claim/note content explicitly delimited as untrusted data in prompts
- no `strict_eq` on web or LLM output
- validator independently re-fetches/re-evaluates the evidence
- substantive decision fields must agree
- source conflict fails to `INSUFFICIENT`
- unavailable evidence fails to `INSUFFICIENT`
- challenge outcome/revised verdict are derived by contract logic from the validator-agreed counter-source assessment; the model cannot choose the state transition
- no EVM contracts, ERC-20/NFT calls, cross-chain calls, secrets, filesystem, environment variables or asynchronous messages in the critical path

See `docs/THREAT_MODEL.md` for the attack-by-attack analysis.

## Local backend certification

Create a Python 3.12+ virtual environment and install the pinned stack:

```bash
python3.12 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
./scripts/check_backend.sh
```

The local gate performs:

1. Python syntax compilation.
2. `genvm-lint typecheck`.
3. `genvm-lint check`.
4. Static guard tests.
5. Dependency-free stub-runtime behavioral tests.
6. Official `genlayer-test` Direct Mode tests, including validator agreement/disagreement.

## Studio Next certification

Live Studio Next certification is intentionally locked because it performs blockchain writes. After explicit authorization:

```bash
export SOURCEJURY_AUTHORIZE_STUDIO_WRITE=YES
./scripts/studio_next_certify.sh
```

The script targets `studio_devnet`, waits for finalization, verifies execution success and writes a fee profile to:

```text
artifacts/sourcejury-studio-next-fee-profile.json
```

Do not set the authorization variable merely to get around the gate.

## Current phase

Backend implementation is complete in this package. Frontend work must not begin until all local gates and the authorized Studio Next full-runtime certification pass against the exact frozen source.
