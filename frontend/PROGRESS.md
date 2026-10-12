# SourceJury frontend release record

SourceJury is implemented against the certified GenLayer Studio Devnet backend and has completed all seven frontend release stages, including production deployment and the final production browser audit.

## Final status

- Frontend progress: `7/7 COMPLETE`
- Production URL: `https://sourcejury.vercel.app`
- Vercel project ID: `prj_EKEh2yKQ1l5YRgbhWfortzgw4w8M`
- Reviewer-remediation production deployment: `dpl_Hv47YCFo5aHPKibiNS9K8DNhCya7`
- Deployment state: `READY`
- Reviewer release commit: `82efeb441ce20484e72518382bda1a175facf9d4`
- Wallet-overlay fix commit: `394f3229b33ca58f444cf7d332d843a92efb93c4`
- Production frontend commit: `850195e6b4d36afa6b2964abb85169ab8c19325a`
- Bound reviewer-remediation contract: `0x6Dbe8007192EF981a61fFf540d873F03cD8E3BaE`
- Finalized reviewer case count: `4`
- Finalized reviewer challenge count: `2`

## Verified application surface

- Responsive public landing page and documentation experience.
- Live finalized case explorer and individual case-detail route.
- EIP-6963 wallet discovery with EIP-1193 fallback support.
- Wallet connect, disconnect, refresh, balance, and network-state handling.
- GenLayer Studio Devnet add/switch flow.
- Create-case, evaluate-case, challenge, and challenge-resolution interfaces.
- Explicit pre-signing transaction review.
- Active account and chain revalidation immediately before fee estimation.
- Duplicate-submission locking.
- Wallet rejection and failure-state handling.
- GenLayer transaction finality tracking and finalized-state refresh.
- Loading, empty, error, keyboard, reduced-motion, and responsive states.

## Certified network binding

- Network: GenLayer Studio Devnet
- Chain ID: `61997`
- RPC: `https://studio-dev.genlayer.com/api`
- Explorer: `https://explorer-studio-dev.genlayer.com`
- Contract: `0x6Dbe8007192EF981a61fFf540d873F03cD8E3BaE`
- Contract source SHA-256: `004ad1ffc4432326a61bef0b7391cb33ec813b3d7578bba63d352fd841f03b5b`
- Reviewer release commit: `82efeb441ce20484e72518382bda1a175facf9d4`
- Production frontend commit: `850195e6b4d36afa6b2964abb85169ab8c19325a`
- Finalized reads: `TransactionHashVariant.LATEST_FINAL`

The production frontend is bound to the reviewer-remediation contract and does not substitute locally fabricated verdicts when live RPC reads fail. The finality waiter on the production frontend uses an explicit extended polling budget so accepted GenLayer transactions are not incorrectly reported as failed merely because they exceed the SDK's short default wait window.

## Certified browser QA

The release candidate was exercised in Chromium, Firefox, and WebKit.

Certification covered:

- live finalized explorer state
- live case-detail state
- mock EIP-6963 / EIP-1193 wallet flow
- network switching
- transaction-review cancellation without submission
- keyboard navigation
- mobile navigation
- responsive overflow
- reduced-motion behavior
- scroll-reveal behavior
- automated accessibility analysis

The certified cross-browser run produced 12 accessibility reports with zero serious or critical accessibility violations. Known GenLayer Studio Devnet transport-capacity conditions were recorded separately from frontend application failures and did not replace mandatory finalized-state assertions.

## Safety boundary

SourceJury does not import, store, or expose a user's wallet private key.

Frontend write flows require the user's browser wallet. The application presents transaction details for review before continuing, revalidates the active account and chain before fee estimation, waits for GenLayer finality after submission, and refreshes finalized state after completion.

Frontend certification did not submit an additional blockchain transaction.

## Reviewer verification

From the `frontend` directory:

```bash
npm ci
npm run typecheck
npm run test:write-safety
npm run build
npm run test:e2e
```

The write-safety suite passed 11/11.

The browser suite uses an injected mock wallet for write-flow interaction testing and intentionally does not click the final write-confirmation action.

## Reviewer-remediation production certification

The production frontend was used to execute the explicitly authorized 12-write reviewer matrix against `0x6Dbe8007192EF981a61fFf540d873F03cD8E3BaE`.

The final authoritative `LATEST_FINAL` certification confirmed:

- case count `4`
- challenge count `2`
- Scenario A: rejected supporting challenge, effective verdict `SUPPORTED`
- Scenario B: conflicting primary/corroborating evidence, effective verdict `INSUFFICIENT`
- Scenario C: unavailable evidence, effective verdict `INSUFFICIENT`
- Scenario D: upheld contradictory challenge, effective verdict `INSUFFICIENT`
- six available evidence snapshots independently verified
- all contract snapshot verification calls returned `true`
- all local SHA-256/snapshot-ID recomputations passed
- all 12 authorized lifecycle transactions finalized with `FINISHED_WITH_RETURN`

Frozen matrix SHA-256:

`11836086f0d9862a9c9a17863da623884d200facfc7373a476b437ba80dcbd13`

Finalized raw readback SHA-256:

`e2f4d0f647805193c797026981b3e57076d4d4c3229a5132bab2d8eb1b8aec70`

Final validation summary SHA-256:

`563c842a1a68357b96bf1260798ce29a92a0bff2af94204b2bbb4664b047eb36`

No additional blockchain transaction, funding operation, signing operation, contract deployment, environment-variable mutation, domain mutation, or Vercel deployment is authorized by this certification.

## Release result

`SOURCEJURY_FRONTEND_STATUS=COMPLETE`

The production frontend is live at `https://sourcejury.vercel.app`, is bound to contract `0x6Dbe8007192EF981a61fFf540d873F03cD8E3BaE`, and is deployed from production frontend commit `850195e6b4d36afa6b2964abb85169ab8c19325a`.

The immutable primary reviewer fixtures and hardened reviewer release remain bound to commit `82efeb441ce20484e72518382bda1a175facf9d4`. Final reviewer-remediation evidence is retained under `evidence/reviewer-remediation-final/`.
