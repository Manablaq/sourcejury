import assert from "node:assert/strict";
import test from "node:test";

import {
  assertProviderWriteContext,
  formatWalletError,
  parseProviderChainId
} from "../lib/write-safety.ts";

const ADDRESS =
  "0x1111111111111111111111111111111111111111" as `0x${string}`;

function provider({
  account = ADDRESS,
  chainId = "0xf22d"
}: {
  account?: string;
  chainId?: string | number;
}) {
  const calls: string[] = [];

  return {
    calls,

    async request({
      method
    }: {
      method: string;
    }) {
      calls.push(method);

      if (method === "eth_accounts") {
        return account
          ? [account]
          : [];
      }

      if (method === "eth_chainId") {
        return chainId;
      }

      throw new Error(
        `unexpected provider method: ${method}`
      );
    }
  };
}

test(
  "parseProviderChainId accepts Studio Devnet hex",
  () => {
    assert.equal(
      parseProviderChainId("0xf22d"),
      61997
    );
  }
);

test(
  "parseProviderChainId accepts Studio Devnet decimal string",
  () => {
    assert.equal(
      parseProviderChainId("61997"),
      61997
    );
  }
);

test(
  "parseProviderChainId accepts Studio Devnet number",
  () => {
    assert.equal(
      parseProviderChainId(61997),
      61997
    );
  }
);

test(
  "write context passes for reviewed account and chain",
  async () => {
    const mock =
      provider({});

    await assertProviderWriteContext({
      provider: mock,
      address: ADDRESS,
      expectedChainId: 61997
    });

    assert.deepEqual(
      [...mock.calls].sort(),
      [
        "eth_accounts",
        "eth_chainId"
      ].sort()
    );
  }
);

test(
  "write context stops on account change",
  async () => {
    const mock =
      provider({
        account:
          "0x2222222222222222222222222222222222222222"
      });

    await assert.rejects(
      () =>
        assertProviderWriteContext({
          provider: mock,
          address: ADDRESS,
          expectedChainId: 61997
        }),
      /active wallet account changed/i
    );

    assert.equal(
      mock.calls.includes(
        "eth_sendTransaction"
      ),
      false
    );
  }
);

test(
  "write context stops on chain change",
  async () => {
    const mock =
      provider({
        chainId: "0x1"
      });

    await assert.rejects(
      () =>
        assertProviderWriteContext({
          provider: mock,
          address: ADDRESS,
          expectedChainId: 61997
        }),
      /wallet network changed/i
    );

    assert.equal(
      mock.calls.includes(
        "eth_sendTransaction"
      ),
      false
    );
  }
);

test(
  "write context stops when wallet has no account",
  async () => {
    const mock =
      provider({
        account: ""
      });

    await assert.rejects(
      () =>
        assertProviderWriteContext({
          provider: mock,
          address: ADDRESS,
          expectedChainId: 61997
        }),
      /no active account/i
    );
  }
);

test(
  "user rejection message explicitly says nothing submitted",
  () => {
    assert.equal(
      formatWalletError({
        code: 4001
      }),
      "You rejected the request in your wallet. Nothing was submitted."
    );
  }
);

test(
  "unknown chain message is actionable",
  () => {
    assert.equal(
      formatWalletError({
        code: 4902
      }),
      "GenLayer Studio Devnet is not configured in this wallet."
    );
  }
);

test(
  "already pending wallet request message is actionable",
  () => {
    assert.equal(
      formatWalletError({
        code: -32002
      }),
      "Your wallet already has a request waiting for approval."
    );
  }
);

test(
  "invalid chain ID is rejected",
  () => {
    assert.throws(
      () =>
        parseProviderChainId(
          "not-a-chain"
        ),
      /invalid chain id/i
    );
  }
);
