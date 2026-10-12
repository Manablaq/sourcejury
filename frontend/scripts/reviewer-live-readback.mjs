import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";
import { TransactionHashVariant } from "genlayer-js/types";

const contract = process.env.SOURCEJURY_REVIEW_CONTRACT ?? "";
const rawCaseIds = process.env.SOURCEJURY_REVIEW_CASE_IDS ?? "";
const rawChallengeIds = process.env.SOURCEJURY_REVIEW_CHALLENGE_IDS ?? "";

if (!/^0x[0-9a-fA-F]{40}$/.test(contract)) {
  throw new Error("SOURCEJURY_REVIEW_CONTRACT must be an exact 20-byte hex address.");
}

function parseIds(raw, label) {
  const ids = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Number(value));

  if (!ids.length || ids.some((value) => !Number.isInteger(value) || value <= 0)) {
    throw new Error(`${label} must be a comma-separated list of positive integer IDs.`);
  }

  return ids;
}

const caseIds = parseIds(rawCaseIds, "SOURCEJURY_REVIEW_CASE_IDS");
const challengeIds = parseIds(rawChallengeIds, "SOURCEJURY_REVIEW_CHALLENGE_IDS");

const client = createClient({ chain: studioDevnet });

async function read(functionName, args = []) {
  return client.readContract({
    address: contract,
    functionName,
    args,
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL
  });
}

const protocolInfo = await read("get_protocol_info");
const caseCount = await read("get_case_count");
const challengeCount = await read("get_challenge_count");

const cases = [];
for (const id of caseIds) {
  const item = await read("get_case", [id]);
  const snapshots = [];

  for (const snapshotId of [
    item.primary_snapshot_id,
    item.corroborating_snapshot_id
  ]) {
    if (!snapshotId) continue;

    snapshots.push({
      snapshotId,
      snapshot: await read("get_evidence_snapshot", [snapshotId]),
      contractVerified: await read("verify_evidence_snapshot", [snapshotId])
    });
  }

  cases.push({ id, item, snapshots });
}

const challenges = [];
for (const id of challengeIds) {
  const item = await read("get_challenge", [id]);
  const counter =
    item.counter_snapshot_id
      ? {
          snapshotId: item.counter_snapshot_id,
          snapshot: await read("get_evidence_snapshot", [item.counter_snapshot_id]),
          contractVerified: await read("verify_evidence_snapshot", [item.counter_snapshot_id])
        }
      : null;

  challenges.push({ id, item, counter });
}

const output = {
  schema: "sourcejury-reviewer-finalized-readback-v1",
  network: "studio_devnet",
  chainId: 61997,
  contract,
  transactionHashVariant: "LATEST_FINAL",
  protocolInfo,
  caseCount,
  challengeCount,
  cases,
  challenges
};

process.stdout.write(
  `${JSON.stringify(
    output,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
    2
  )}\n`
);
