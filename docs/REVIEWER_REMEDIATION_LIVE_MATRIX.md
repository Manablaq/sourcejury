# SourceJury reviewer-remediation live matrix

This matrix is the controlled live verification plan for the reviewer-remediation release. It is a plan, not standing authorization. No Studio Devnet write may be executed until the exact deployment and transaction scope is explicitly authorized.

## Purpose

The reviewer requested successful frontend-driven Studio Devnet transactions proving:

- case creation;
- independent GenLayer evaluation;
- a successful/upheld challenge;
- a rejected challenge;
- conflicting evidence;
- unavailable evidence;
- finalized GenVM execution; and
- authoritative finalized state readback.

The hardened contract also adds SHA-256 commitments over the exact bounded evidence content used for adjudication, immutable on-chain evidence snapshots, authenticated-original-snapshot challenge evaluation, explicit live-source drift status, and fail-closed handling of oversized evidence.

## Controlled fixtures

The live matrix intentionally uses small, deterministic reviewer fixtures so no decision-critical information can be hidden beyond the contract's 8,000-character bound.

Primary fixtures are served from an immutable `raw.githubusercontent.com` URL pinned to the release commit. Counter/corroborating fixtures are served from the released SourceJury frontend host. Those are distinct hosts for the contract's host-diversity rule, but **distinct hosts do not establish independent ownership, editorial independence, or factual provenance**. These are controlled verification fixtures.

## Final URL binding

After the reviewer-remediation commit exists, run:

```bash
cd frontend
SOURCEJURY_RELEASE_COMMIT=<40-char-release-commit> \
SOURCEJURY_REVIEW_BASE_URL=https://sourcejury.vercel.app \
npm run reviewer:matrix-plan
```

The output must be frozen before any live transaction is authorized.

## Required 12-write sequence

### Scenario A — directional verdict + rejected challenge

1. `create_case`
   - claim: `Reviewer fixture A reports status ENABLED.`
   - primary: immutable raw GitHub `reviewer-fixtures/case-a-primary-support.txt`
   - policy: `DIRECT_SOURCE_V1`
2. `evaluate_case`
   - expected initial/effective verdict: `SUPPORTED`
   - primary evidence snapshot must exist and verify by contract and independent browser recomputation
3. `open_challenge`
   - counter: released frontend `/reviewer-fixtures/case-a-counter-support.txt`
4. `resolve_challenge`
   - expected: `REJECTED`
   - counter assessment: `SUPPORTS`
   - effective verdict remains `SUPPORTED`
   - original authenticated snapshot remains the decision basis

### Scenario B — conflicting evidence

5. `create_case`
   - claim: `Reviewer fixture B reports status ENABLED.`
   - primary: immutable raw GitHub `reviewer-fixtures/case-b-primary-support.txt`
   - corroborating: released frontend `/reviewer-fixtures/case-b-conflict-contradict.txt`
   - policy: `CORROBORATED_V1`
6. `evaluate_case`
   - expected: `INSUFFICIENT`
   - expected `source_conflict=true`
   - primary assessment `SUPPORTS`
   - corroborating assessment `CONTRADICTS`
   - both bounded snapshots must verify independently

### Scenario C — unavailable source

7. `create_case`
   - claim: `Reviewer unavailable fixture C reports status ENABLED.`
   - primary: `https://sourcejury-unavailable.invalid/evidence`
   - policy: `DIRECT_SOURCE_V1`
8. `evaluate_case`
   - expected: `INSUFFICIENT`
   - primary assessment/status: `UNAVAILABLE`
   - no adjudication snapshot should be stored for unavailable content

### Scenario D — directional verdict + successful/upheld challenge

9. `create_case`
   - claim: `Reviewer fixture D reports status ENABLED.`
   - primary: immutable raw GitHub `reviewer-fixtures/case-d-primary-support.txt`
   - policy: `DIRECT_SOURCE_V1`
10. `evaluate_case`
    - expected: `SUPPORTED`
    - primary snapshot must verify independently
11. `open_challenge`
    - counter: released frontend `/reviewer-fixtures/case-d-counter-contradict.txt`
12. `resolve_challenge`
    - expected: `UPHELD`
    - counter assessment: `CONTRADICTS`
    - revised/effective verdict: `INSUFFICIENT`
    - direct reversal to `CONTRADICTED` must not occur

## Frontend-driven evidence requirements for every write

Every one of the 12 writes must be initiated from the SourceJury frontend transaction interface against the newly deployed reviewer-remediation contract.

For every write capture:

- action/method and displayed arguments before signing;
- wallet address and Studio Devnet chain ID `61997`;
- transaction hash returned by the frontend;
- raw finalization receipt captured before reviewer-facing normalization;
- final GenLayer status;
- `txExecutionResultName`;
- proof that successful writes ended in `FINISHED_WITH_RETURN`;
- screenshot of the finalized frontend state;
- authoritative `LATEST_FINAL` readback after the write;
- case/challenge IDs and state relevant to the scenario.

Do not treat an outer EVM receipt or submission hash alone as final success.

## Snapshot verification evidence

For each available adjudicated source, capture:

- snapshot ID;
- SHA-256 content commitment;
- content length;
- contract-side `verify_evidence_snapshot(snapshot_id) == true`;
- browser-side independent SHA-256/snapshot-ID recomputation == true.

For challenge resolution also capture:

- `original_primary_snapshot_id`;
- `original_corroborating_snapshot_id` when applicable;
- `original_snapshot_consistent`;
- `primary_live_status`;
- `corroborating_live_status`;
- `original_source_drift`;
- counter snapshot commitment.

## Modified/unavailable-original challenge behavior

The local certified Direct Mode and stub-runtime tests cover both modified and unavailable original-source re-fetches during challenge resolution. In those tests the immutable original snapshot remains the adjudication basis while the current live source is recorded as `MODIFIED` or `UNAVAILABLE`. A later webpage version is never silently substituted for the evidence originally assessed.

The required live matrix above separately demonstrates unavailable evidence through Scenario C and demonstrates authenticated-snapshot challenge resolution through Scenarios A and D.

## Readback

After the frontend-driven matrix completes, perform read-only authoritative readback:

```bash
cd frontend
SOURCEJURY_REVIEW_CONTRACT=<new-contract-address> \
SOURCEJURY_REVIEW_CASE_IDS=<A,B,C,D> \
SOURCEJURY_REVIEW_CHALLENGE_IDS=<rejected,upheld> \
npm run reviewer:readback
```

Freeze the raw JSON output before writing reviewer-facing summaries.

## Scope boundary

This document does not authorize:

- deployment;
- funding;
- signing;
- Studio Devnet writes;
- Git commit/push;
- Vercel deployment.

Those actions require separately scoped authorization.
