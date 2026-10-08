# SourceJury backend checkpoint

## Implemented

- Studio Next v0.3 contract API and current pinned py-genlayer runner

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
- official Direct Mode test suite source
- gated Studio Next integration test source
- fee-profile certification script
- threat model and deployment runbook

## Not yet claimed

This repository must **not** claim a Studio Next deployment or full-runtime certification until an explicitly authorized run has actually finalized against the current Studio Next environment and the resulting raw receipts/readbacks have been recorded.

Frontend work is intentionally not started.

- Challenge state transitions are contract-derived and fail closed; one new source can only downgrade an opposing directional verdict to `INSUFFICIENT`.
- Provenance stores submitter/challenger and normalized source host identities.
- Only one challenge may be pending per case; challenge hosts cannot be replayed.
