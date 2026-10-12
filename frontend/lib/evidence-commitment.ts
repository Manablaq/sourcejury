import type { EvidenceSnapshot } from "@/lib/types";

export const SNAPSHOT_VERSION = "sourcejury-evidence-snapshot-v1";
export const EVIDENCE_COMMITMENT_SCHEME = "SHA256_UTF8_RENDERED_TEXT_V1";

function codePointLength(value: string) {
  return Array.from(value).length;
}

export async function sha256Utf8(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyEvidenceSnapshotLocally(
  snapshot: EvidenceSnapshot
) {
  if (snapshot.snapshot_version !== SNAPSHOT_VERSION) return false;
  if (snapshot.commitment_scheme !== EVIDENCE_COMMITMENT_SCHEME) return false;
  if (codePointLength(snapshot.content) !== snapshot.content_length) return false;

  const contentDigest = await sha256Utf8(snapshot.content);
  if (contentDigest !== snapshot.content_sha256) return false;

  const expectedSnapshotId = await sha256Utf8(
    `${SNAPSHOT_VERSION}\n${snapshot.url}\n${contentDigest}`
  );

  return expectedSnapshotId === snapshot.snapshot_id;
}
