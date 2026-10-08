# SourceJury Frontend

Premium evidence-first interface for the certified SourceJury Intelligent Contract.

## Certified backend binding

- Contract: `0x2E8968E2a47ED96dE89D83061190314d24719929`
- Network: GenLayer Studio Devnet
- Chain ID: `61997`
- RPC: `https://studio-dev.genlayer.com/api`
- Backend contract SHA-256: `b70415770e5d4a9c1cd5371f1e400c3ae073dd5ac3c8f07b0de236ee5f9c3241`
- Backend Git checkpoint: `f6a2b86513e41de0f705c0c0bae527daa843eb7f`

## UX guarantees

- Guest read mode works without a wallet.
- State-changing actions require an explicit wallet connection.
- Durable results use finalized contract state.
- No UI-invented verdicts on RPC failure.
- EIP-6963 multi-wallet discovery plus EIP-1193 fallback.
- Network add/switch support for Studio Devnet.
- Fee-aware writes and explicit finality tracking.
- Responsive layout, keyboard focus, reduced-motion support, empty/error/loading states.

## Development

```bash
cp .env.example .env.local
npm install
npm run typecheck
npm run build
npm run dev
```
