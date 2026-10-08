import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";
import {
  ExecutionResult,
  TransactionHashVariant
} from "genlayer-js/types";
import { SOURCEJURY_CONTRACT } from "@/lib/config";
import type {
  Challenge,
  CourtCase,
  CourtSnapshot,
  PreparedWrite,
  WriteStage
} from "@/lib/types";
import { safeNumber } from "@/lib/format";
import type { EIP1193Provider } from "@/components/wallet-provider";
import { assertProviderWriteContext } from "@/lib/write-safety";

const readClient = createClient({ chain: studioDevnet });

function asCase(value: unknown): CourtCase {
  return value as CourtCase;
}

function asChallenge(value: unknown): Challenge {
  return value as Challenge;
}

export async function readCourtSnapshot(): Promise<CourtSnapshot> {
  const read = <T,>(
    functionName: string,
    args: Array<string | number | boolean | bigint> = []
  ) =>
    readClient.readContract({
      address: SOURCEJURY_CONTRACT,
      functionName,
      args,
      transactionHashVariant: TransactionHashVariant.LATEST_FINAL
    }) as Promise<T>;

  const [protocolInfo, rawCaseCount, rawChallengeCount] = await Promise.all([
    read<unknown>("get_protocol_info"),
    read<unknown>("get_case_count"),
    read<unknown>("get_challenge_count")
  ]);

  const caseCount = safeNumber(rawCaseCount);
  const challengeCount = safeNumber(rawChallengeCount);

  const caseIds = Array.from(
    { length: Math.min(caseCount, 24) },
    (_, index) => caseCount - index
  ).filter((id) => id > 0);

  const challengeIds = Array.from(
    { length: Math.min(challengeCount, 24) },
    (_, index) => challengeCount - index
  ).filter((id) => id > 0);

  const [cases, challenges] = await Promise.all([
    Promise.all(
      caseIds.map((id) => read<unknown>("get_case", [id]).then(asCase))
    ),
    Promise.all(
      challengeIds.map((id) =>
        read<unknown>("get_challenge", [id]).then(asChallenge)
      )
    )
  ]);

  return {
    protocolInfo,
    caseCount,
    challengeCount,
    cases,
    challenges,
    refreshedAt: Date.now()
  };
}

export async function readCase(caseId: number) {
  return (await readClient.readContract({
    address: SOURCEJURY_CONTRACT,
    functionName: "get_case",
    args: [caseId],
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL
  })) as CourtCase;
}

export async function readChallenge(challengeId: number) {
  return (await readClient.readContract({
    address: SOURCEJURY_CONTRACT,
    functionName: "get_challenge",
    args: [challengeId],
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL
  })) as Challenge;
}

export async function executeSourceJuryWrite({
  prepared,
  address,
  provider,
  onStage
}: {
  prepared: PreparedWrite;
  address: `0x${string}`;
  provider: EIP1193Provider;
  onStage: (stage: WriteStage, detail?: string) => void;
}) {
  const client = createClient({
    chain: studioDevnet,
    account: address,
    provider: provider as never
  });

  await assertProviderWriteContext({
    provider,
    address,
    expectedChainId: Number(studioDevnet.id)
  });

  onStage("estimating");

  const estimate = await client.estimateTransactionFeesForWrite({
    address: SOURCEJURY_CONTRACT,
    functionName: prepared.method,
    args: prepared.args
  });

  onStage(
    "awaiting-signature",
    `Estimated fee deposit: ${estimate.feeValue.toString()} wei`
  );

  const txHash = await client.writeContract({
    address: SOURCEJURY_CONTRACT,
    functionName: prepared.method,
    args: prepared.args,
    consensusMaxRotations: 3,
    fees: {
      distribution: estimate.distribution,
      messageAllocations: estimate.messageAllocations,
      feeValue: estimate.feeValue
    }
  });

  onStage("submitted", txHash);
  onStage("finalizing", txHash);

  const receipt = await readClient.waitForFinalization({ hash: txHash });

  if (
    receipt.txExecutionResultName !== ExecutionResult.FINISHED_WITH_RETURN
  ) {
    throw new Error(
      `Consensus finalized but execution did not finish successfully (${String(
        receipt.txExecutionResultName
      )}).`
    );
  }

  onStage("finalized", txHash);

  return { txHash, estimate, receipt };
}
