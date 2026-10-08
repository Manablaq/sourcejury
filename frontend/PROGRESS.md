# SourceJury frontend release record

SourceJury is implemented against the certified GenLayer Studio Devnet backend and has completed local runtime validation, finalized-read verification, wallet/write-safety hardening, and cross-browser browser QA before production deployment.

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
- Chain ID: 61997
- RPC: https://studio-dev.genlayer.com/api
- Contract: 0x2E8968E2a47ED96dE89D83061190314d24719929
- Finalized reads: TransactionHashVariant.LATEST_FINAL

The frontend is bound to the certified SourceJury backend contract and does not substitute locally fabricated verdicts when live RPC reads fail.

## Certified browser QA

The release candidate has been exercised in Chromium, Firefox, and WebKit.

The certification covers:

- live finalized explorer state;
- live case-detail state;
- mock EIP-6963 / EIP-1193 wallet flow;
- network switching;
- transaction-review cancellation without submission;
- keyboard navigation;
- mobile navigation;
- responsive overflow;
- reduced-motion behavior;
- scroll-reveal behavior;
- automated accessibility analysis.

The certified browser run produced 12 accessibility reports with zero serious or critical accessibility violations. Known GenLayer Studio Devnet transport-capacity conditions are recorded separately from frontend application failures and do not replace the mandatory finalized-state assertions.

## Safety boundary

SourceJury does not import, store, or expose a user's wallet private key.

Frontend write flows require the user's browser wallet. The application presents transaction details for review before continuing, revalidates the active account and chain before fee estimation, waits for GenLayer finality after submission, and refreshes finalized state after completion.

Frontend certification did not submit an additional blockchain transaction.

## Reviewer verification

From the `frontend` directory:

```bash
npm ci
npm run typecheck
npm run build
npm run test:write-safety
npm run test:e2e
```

The browser suite uses an injected mock wallet for write-flow interaction testing and intentionally does not click the final write-confirmation action.

## Release boundary

The frontend has not been deployed to Vercel during this certification workflow.

Production deployment and the post-deployment final frontend audit are the remaining release actions. They must preserve the certified backend contract address, Studio Devnet binding, wallet-safety behavior, and finalized-read semantics.
