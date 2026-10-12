# SourceJury reviewer-remediation final evidence

This directory is the repository copy of the frozen evidence used for the final reviewer-remediation submission-readiness checkpoint.

## Binding

- Network: GenLayer Studio Devnet
- Chain ID: `61997`
- Contract: `0x6Dbe8007192EF981a61fFf540d873F03cD8E3BaE`
- Contract source SHA-256: `004ad1ffc4432326a61bef0b7391cb33ec813b3d7578bba63d352fd841f03b5b`
- Reviewer release commit: `82efeb441ce20484e72518382bda1a175facf9d4`
- Production frontend commit: `850195e6b4d36afa6b2964abb85169ab8c19325a`
- Production frontend: `https://sourcejury.vercel.app`
- Production deployment: `dpl_Hv47YCFo5aHPKibiNS9K8DNhCya7`
- Final case count: `4`
- Final challenge count: `2`

The reviewer release commit remains the immutable binding for the primary reviewer fixtures and hardened contract release. The later frontend commits do not alter the contract source; they contain the authorized wallet-overlay/finality-waiter corrections used during the frontend-driven live matrix.

## Frozen roots

- Matrix SHA-256: `11836086f0d9862a9c9a17863da623884d200facfc7373a476b437ba80dcbd13`
- Execution binding SHA-256: `5b13c659e777fec551319830c8dce193ea7f37e55eedf73246bcf5d6b746dcf3`
- Prewrite `LATEST_FINAL` SHA-256: `7753cb5a1d502a7c78a75a3e8bb94ff501af9afd4f763267aad4d95b3967fa03`
- Finalized readback raw SHA-256: `e2f4d0f647805193c797026981b3e57076d4d4c3229a5132bab2d8eb1b8aec70`
- Final validation summary SHA-256: `563c842a1a68357b96bf1260798ce29a92a0bff2af94204b2bbb4664b047eb36`

## Final live result

- Scenario A: `SUPPORTED` -> rejected challenge (`SUPPORTS`) -> `SUPPORTED`
- Scenario B: primary `SUPPORTS` + corroborating `CONTRADICTS` -> conflict -> `INSUFFICIENT`
- Scenario C: unavailable primary -> no adjudication snapshot -> `INSUFFICIENT`
- Scenario D: `SUPPORTED` -> upheld challenge (`CONTRADICTS`) -> `INSUFFICIENT`
- Available evidence snapshots independently verified: `6`
- Contract-side snapshot verification: PASS
- Local SHA-256/snapshot-ID recomputation: PASS
- Authorized lifecycle writes finalized: `12/12`

No additional blockchain write is authorized by this evidence package.

## Layout

- `frozen/` contains the matrix, execution binding, prewrite state, raw final readback, and final validation summary.
- `writes/write01` through `writes/write12` contain the preserved per-write reconciliation artifacts.
- `release-bindings.json` records the immutable release identifiers and transaction hashes.
- `package-manifest.json` hashes every package file other than the manifest itself.
