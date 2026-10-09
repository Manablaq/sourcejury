# SourceJury frontend release record

SourceJury is implemented against the certified GenLayer Studio Devnet backend and has completed all seven frontend release stages, including production deployment and the final production browser audit.

## Final status

- Frontend progress: `7/7 COMPLETE`
- Production URL: `https://sourcejury.vercel.app`
- Vercel project ID: `prj_EKEh2yKQ1l5YRgbhWfortzgw4w8M`
- Vercel deployment ID: `dpl_w8AnszLENYfpMqJMxAak3K3CJh1c`
- Deployment state: `READY`
- Production deployment count at certification: `1`
- Deployed release commit: `7f82ba6b454e9d2473ba6c7e821f2952a42f67dc`

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
- Contract: `0x2E8968E2a47ED96dE89D83061190314d24719929`
- Finalized reads: `TransactionHashVariant.LATEST_FINAL`

The frontend is bound to the certified SourceJury backend contract and does not substitute locally fabricated verdicts when live RPC reads fail.

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

## Production certification

The single authorized production deployment completed successfully and reached `READY`.

The final browser audit verified:

- `/` -> HTTP 200
- `/docs` -> HTTP 200
- `/explorer` -> HTTP 200
- `/cases/1` -> HTTP 200
- finalized explorer case count -> `3`
- case 1 effective verdict -> `SUPPORTED`
- desktop horizontal overflow -> `NO`
- recoverable production transport errors -> `0`
- unexpected production browser application errors -> `0`
- production runtime errors reported by Vercel -> `0`

No additional Git commit, Git push, Vercel deployment, blockchain write, live transaction, signing, funding, backend-contract change, or backend-config change occurred during the final production audit.

## Release result

`SOURCEJURY_FRONTEND_STATUS=COMPLETE`

The production frontend is live at `https://sourcejury.vercel.app` and is bound to release commit `7f82ba6b454e9d2473ba6c7e821f2952a42f67dc`.
