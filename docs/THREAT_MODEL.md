# SourceJury v1 threat model

## Security objective

SourceJury does **not** claim to prove absolute truth. It certifies the relationship between a bounded claim and identified public evidence under a named evidence policy.

The contract must never silently upgrade this scoped conclusion into a broader truth claim.

## Threats and controls

| Threat | Control |
|---|---|
| Leader fabricates an allowed verdict | Validator independently re-fetches/re-evaluates and exact-matches substantive fields |
| Schema-only validation bypass | Validator does not merely check JSON shape; it reruns the evidence task |
| Prompt injection in a webpage | Claim/source/note bodies are delimited as untrusted data; prompt explicitly forbids following embedded instructions |
| Malformed LLM JSON | `response_format="json"` plus explicit type/enum validation; malformed output errors |
| LLM prose differs | Rationale is not consensus-critical; only stable decision fields must match |
| Source conflict | Corroborated policy returns `INSUFFICIENT`, with `source_conflict=true` |
| Source outage | Unavailable source becomes `UNAVAILABLE`; policy fails closed |
| SSRF/local resource URL | HTTPS required; credentials, query strings, fragments, custom ports, IP literals, localhost and malformed DNS hosts rejected |
| Evidence-volume denial of service | Hard URL/claim/source-text/rationale limits |
| Challenge spam per case | Maximum eight challenges, one pending at a time; each challenge host can be used only once |
| Reusing original authority as "new" challenge evidence | Counter-evidence host must differ from both original evidence hosts |
| LLM directly flips a verdict during challenge | Model only classifies counter-evidence; contract deterministically derives challenge outcome and can only downgrade an opposing directional verdict to `INSUFFICIENT` |
| Duplicate case spam | Deterministic case fingerprint rejects exact duplicates |
| Same-host fake corroboration | `CORROBORATED_V1` requires distinct source hosts |
| Unbounded state scan | Direct `TreeMap` indexing; no O(n) case/challenge scans |
| User-supplied secret | No secret fields exist; evidence must be public HTTPS content |
| Re-execution side effects | No internal/external message emission in v1 |
| EVM interoperability mismatch in Studio | Critical path has no EVM contract interaction |
| EVM receipt mistaken for GenLayer success | Certification waits for GenLayer finalization and checks execution success |
| Studio reset | Source + hashes + receipts + reproducible deployment steps are the authority, not persistence of preview state |

## Known residual risks

No application using live web evidence can eliminate every source-level risk. Remaining risks include:

1. A public source can publish false information.
2. Two distinct domains are not guaranteed to be organizationally independent.
3. DNS rebinding or a public hostname resolving to private infrastructure cannot be completely prevented by string-level URL validation inside this contract; the GenLayer web sandbox remains an important network boundary.
4. A webpage can change between validator fetches and cause liveness/consensus failure.
5. LLM models can still interpret ambiguous evidence differently; the contract treats disagreement as failure to settle rather than silently choosing one answer.
6. The eight-challenge cap is a bounded-state defense, not a Sybil-proof anti-spam mechanism.
7. Studio Next is a release-candidate preview and can reset or change.

These are explicitly represented as evidence-policy/liveness constraints rather than hidden assumptions.
