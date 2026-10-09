# SourceJury Frontend

Premium evidence-first interface for the certified SourceJury Intelligent Contract.

## Production deployment

- Live application: `https://sourcejury.vercel.app`
- Vercel project: `sourcejury`
- Vercel production deployment: `dpl_w8AnszLENYfpMqJMxAak3K3CJh1c`
- Deployed Git commit: `7f82ba6b454e9d2473ba6c7e821f2952a42f67dc`
- Production deployment count at certification: `1`

The final production audit verified `/`, `/docs`, `/explorer`, and `/cases/1` with HTTP 200, three finalized cases in the explorer, case 1 with effective verdict `SUPPORTED`, zero recoverable transport errors, and zero unexpected browser application errors.

## Certified backend binding

- Contract: `0x2E8968E2a47ED96dE89D83061190314d24719929`
- Network: GenLayer Studio Devnet
- Chain ID: `61997`
- RPC: `https://studio-dev.genlayer.com/api`
- Explorer: `https://explorer-studio-dev.genlayer.com`
- Backend contract SHA-256: `b70415770e5d4a9c1cd5371f1e400c3ae073dd5ac3c8f07b0de236ee5f9c3241`
- Backend Git checkpoint: `f6a2b86513e41de0f705c0c0bae527daa843eb7f`

Durable reads use `TransactionHashVariant.LATEST_FINAL`. The UI does not substitute locally fabricated verdicts when live RPC reads fail.

## UX and safety guarantees

- Guest read mode works without a wallet.
- State-changing actions require an explicit wallet connection.
- Durable results use finalized contract state.
- No UI-invented verdicts on RPC failure.
- EIP-6963 multi-wallet discovery plus EIP-1193 fallback.
- Network add/switch support for Studio Devnet.
- Fee-aware writes and explicit finality tracking.
- Transaction details are reviewed before continuing.
- Active account and chain are revalidated before fee estimation.
- Duplicate submissions are locked.
- Wallet rejection and failure states are handled explicitly.
- SourceJury never imports or stores a user's wallet private key.
- Responsive layout, keyboard focus, reduced-motion support, and empty/error/loading states are covered.

## Development

```bash
cp .env.example .env.local
npm install
npm run typecheck
npm run build
npm run dev
```

For a clean reviewer install, prefer `npm ci` instead of `npm install`.

## Reviewer verification

From `frontend/`:

```bash
npm ci
npm run typecheck
npm run test:write-safety
npm run build
npm run test:e2e
```

The write-safety suite contains 11 tests and the certified release passed 11/11.

The browser suite covers Chromium, Firefox, and WebKit, including:

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

The browser write-flow tests use an injected mock wallet and intentionally do not click the final write-confirmation action.

## Environment

The frontend uses four public production values:

```text
NEXT_PUBLIC_SOURCEJURY_CONTRACT_ADDRESS=0x2E8968E2a47ED96dE89D83061190314d24719929
NEXT_PUBLIC_GENLAYER_RPC=https://studio-dev.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61997
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio-dev.genlayer.com
```

No private signer or secret value belongs in the frontend environment.

## Release status

Frontend progress is complete through 7/7: architecture, local runtime validation, live finalized-read validation, wallet/write hardening, cross-browser QA, production polish, Vercel deployment, and final production audit all passed.

Production: `https://sourcejury.vercel.app`
