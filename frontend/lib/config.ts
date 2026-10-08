export const SOURCEJURY_CONTRACT =
  (process.env.NEXT_PUBLIC_SOURCEJURY_CONTRACT_ADDRESS ??
    "0x2E8968E2a47ED96dE89D83061190314d24719929") as `0x${string}`;

export const STUDIO_DEVNET = {
  id: Number(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID ?? "61997"),
  hexId: "0xf22d",
  name: "GenLayer Studio Devnet",
  rpc:
    process.env.NEXT_PUBLIC_GENLAYER_RPC ??
    "https://studio-dev.genlayer.com/api",
  explorer:
    process.env.NEXT_PUBLIC_GENLAYER_EXPLORER ??
    "https://explorer-studio-dev.genlayer.com",
  currency: { name: "GEN", symbol: "GEN", decimals: 18 }
} as const;

export const CERTIFIED_BACKEND = {
  contractSha256:
    "b70415770e5d4a9c1cd5371f1e400c3ae073dd5ac3c8f07b0de236ee5f9c3241",
  gitCheckpoint: "f6a2b86513e41de0f705c0c0bae527daa843eb7f",
  progress6Certification:
    "74d0f8c8ffc7718d894516bc98ec9d2fbe833e9a21681f2f6bb08caf731d343d"
} as const;
