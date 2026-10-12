import assert from "node:assert/strict";
import test from "node:test";

import {
  EVIDENCE_COMMITMENT_SCHEME,
  SNAPSHOT_VERSION,
  sha256Utf8,
  verifyEvidenceSnapshotLocally
} from "../lib/evidence-commitment.ts";

test("sha256Utf8 matches the contract SHA-256 UTF-8 commitment", async () => {
  assert.equal(
    await sha256Utf8("supports"),
    "66312e5e57ebd0b4fff4ef544c5a4abd86f89a0e2f003d9209dad1a641694bca"
  );
});

test("snapshot verifier independently recomputes content and snapshot commitments", async () => {
  const url = "https://example.com/evidence";
  const content = "Authenticated evidence snapshot.";
  const contentDigest = await sha256Utf8(content);
  const snapshotId = await sha256Utf8(
    `${SNAPSHOT_VERSION}\n${url}\n${contentDigest}`
  );

  assert.equal(
    await verifyEvidenceSnapshotLocally({
      snapshot_version: SNAPSHOT_VERSION,
      commitment_scheme: EVIDENCE_COMMITMENT_SCHEME,
      snapshot_id: snapshotId,
      url,
      host: "example.com",
      content_sha256: contentDigest,
      content_length: Array.from(content).length,
      content
    }),
    true
  );
});

test("snapshot verifier rejects modified content", async () => {
  const url = "https://example.com/evidence";
  const original = "Original evidence.";
  const contentDigest = await sha256Utf8(original);
  const snapshotId = await sha256Utf8(
    `${SNAPSHOT_VERSION}\n${url}\n${contentDigest}`
  );

  assert.equal(
    await verifyEvidenceSnapshotLocally({
      snapshot_version: SNAPSHOT_VERSION,
      commitment_scheme: EVIDENCE_COMMITMENT_SCHEME,
      snapshot_id: snapshotId,
      url,
      host: "example.com",
      content_sha256: contentDigest,
      content_length: Array.from(original).length,
      content: "Modified evidence."
    }),
    false
  );
});
