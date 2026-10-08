export type RequestProvider = {
  request: (args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }) => Promise<unknown>;
};

export type WriteContext = {
  provider: RequestProvider;
  address: `0x${string}`;
  expectedChainId: number;
};

export function parseProviderChainId(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (/^0x[0-9a-f]+$/i.test(normalized)) {
      return Number.parseInt(normalized.slice(2), 16);
    }

    if (/^[0-9]+$/.test(normalized)) {
      return Number(normalized);
    }
  }

  throw new Error(
    `Wallet returned an invalid chain ID: ${String(value)}`
  );
}

export function formatWalletError(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    const code = Number(
      (error as { code?: unknown }).code
    );

    if (code === 4001) {
      return "You rejected the request in your wallet. Nothing was submitted.";
    }

    if (code === 4902) {
      return "GenLayer Studio Devnet is not configured in this wallet.";
    }

    if (code === -32002) {
      return "Your wallet already has a request waiting for approval.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The wallet request failed.";
}

export async function assertProviderWriteContext({
  provider,
  address,
  expectedChainId
}: WriteContext): Promise<void> {
  const [accountsValue, chainValue] =
    await Promise.all([
      provider.request({
        method: "eth_accounts"
      }),
      provider.request({
        method: "eth_chainId"
      })
    ]);

  const accounts =
    Array.isArray(accountsValue)
      ? accountsValue
      : [];

  const active =
    typeof accounts[0] === "string"
      ? accounts[0].toLowerCase()
      : "";

  if (!active) {
    throw new Error(
      "The wallet has no active account. Reconnect before submitting."
    );
  }

  if (active !== address.toLowerCase()) {
    throw new Error(
      "The active wallet account changed after review. Review the action again."
    );
  }

  const chainId =
    parseProviderChainId(chainValue);

  if (chainId !== expectedChainId) {
    throw new Error(
      `Wallet network changed after review. Expected chain ${expectedChainId}, got ${chainId}.`
    );
  }
}
