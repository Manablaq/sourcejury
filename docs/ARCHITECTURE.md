# SourceJury v1 backend architecture

## Consensus boundary

SourceJury intentionally separates deterministic state handling from nondeterministic evidence interpretation.

```text
user claim + URLs
        |
        v
deterministic validation
        |
        v
pending Evidence Case
        |
        v
leader independently renders bounded web evidence
        |
        v
leader LLM classifies each source
        |
        v
validator independently renders + classifies again
        |
        v
exact comparison of substantive classification fields
        |
        v
deterministic policy derives verdict
        |
        v
persist Evidence Receipt
```

The stored verdict is never accepted solely because the leader emitted valid JSON.

## Why one contract

Studio Next does not need a multi-contract topology for SourceJury v1. A split design would introduce asynchronous internal messages, child transaction tracking, idempotency requirements and extra finality surfaces without increasing the quality of the core semantic decision.

The v1 contract therefore keeps:

- case registry
- evidence policy logic
- evaluation consensus
- challenge registry
- challenge consensus

inside one bounded contract.

If later versions require independent governance or an external settlement layer, those should be added only after a separate runtime design review.

## Case lifecycle

```text
PENDING
  |
  | evaluate_case
  v
RESOLVED
  |
  | open_challenge
  v
challenge PENDING
  |
  | resolve_challenge
  +--> UPHELD ------> directional verdict downgraded to INSUFFICIENT
  +--> REJECTED ----> case effective_verdict unchanged
  +--> INSUFFICIENT -> case effective_verdict unchanged
```

`initial_verdict` is immutable after the first evaluation. A single challenge is intentionally not allowed to flip `SUPPORTED` directly to `CONTRADICTED` or the reverse. If a counter-source materially points in the opposite direction, the challenge can only downgrade the effective verdict to `INSUFFICIENT`. This makes challenge settlement fail-closed. The revision counter increments only when that downgrade occurs.

## Policy derivation

The evaluator LLM classifies source-to-claim relationships. The contract derives the final result from these labels.

This prevents an otherwise valid JSON response such as `{"verdict":"SUPPORTED"}` from deciding a case by itself.

## Duplicate handling

Case duplication is prevented using a deterministic composite fingerprint of:

- protocol version
- policy
- normalized claim
- primary URL
- corroborating URL

Challenge duplication is prevented per case/counter-source **host**. A case can have only one pending challenge at a time, and challenge evidence must come from a host different from the original evidence hosts.

No cryptographic hash dependency is required inside GenVM for these indexes.

## Failure behavior

The contract intentionally prefers abstention over guessing:

- source unavailable -> `INSUFFICIENT`
- source irrelevant -> `INSUFFICIENT`
- corroborating sources conflict -> `INSUFFICIENT`
- leader/validator classification disagreement -> consensus disagreement / rotation rather than state update
- malformed LLM response -> user/LLM error rather than accepting partial fields
- challenge model attempts to provide a revised verdict -> ignored; contract derives the state transition from the agreed counter-source classification

## Studio Next constraints

SourceJury v1 does not depend on Studio surfaces known to diverge from a live network:

- no arbitrary EVM contract calls
- no token/NFT integration
- no cross-chain messaging
- no accepted-stage emitted messages
- no permanent-storage assumption

The final backend certification must still verify the exact RC toolchain and Studio Next runtime before the frontend is started.


## Runtime API line

The Studio Next build targets the current GenVM Python v0.3 contract API (`gl.contract.Contract`) and the pinned `py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng` runner. Custom leader/validator consensus uses `gl.vm.run_nondet`. Validators independently re-fetch and re-evaluate evidence; validator-side exceptions fail closed as disagreement instead of becoming an accepted state transition.
