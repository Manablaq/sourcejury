"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { readEvidenceSnapshot } from "@/lib/genlayer";

function short(value?: string) {
  if (!value) return "—";
  if (value.length <= 24) return value;
  return `${value.slice(0, 12)}…${value.slice(-10)}`;
}

export function EvidenceCommitmentCard({
  title,
  snapshotId,
  status,
  digest,
  contentLength
}: {
  title: string;
  snapshotId?: string;
  status?: string;
  digest?: string;
  contentLength?: number;
}) {
  const verification = useQuery({
    queryKey: ["sourcejury", "evidence-snapshot", snapshotId],
    queryFn: () => readEvidenceSnapshot(snapshotId as string),
    enabled: Boolean(snapshotId)
  });

  const verified =
    verification.data?.contractVerified === true &&
    verification.data?.locallyVerified === true;

  return (
    <section className="detail-card">
      <span className="detail-label">{title}</span>

      <dl>
        <div><dt>Status</dt><dd>{status || "—"}</dd></div>
        <div><dt>Snapshot ID</dt><dd title={snapshotId}>{short(snapshotId)}</dd></div>
        <div><dt>SHA-256</dt><dd title={digest}>{short(digest)}</dd></div>
        <div><dt>Content length</dt><dd>{contentLength ?? "—"}</dd></div>
      </dl>

      {!snapshotId ? (
        <span>
          {status === "CONTENT_TOO_LARGE"
            ? "No adjudication snapshot was stored because the evidence exceeded the decision bound."
            : "No authenticated snapshot is available for this source."}
        </span>
      ) : verification.isPending ? (
        <span>Verifying snapshot commitment…</span>
      ) : verification.isError ? (
        <span>
          <ShieldAlert size={14} /> Snapshot verification could not be completed.
        </span>
      ) : (
        <span>
          {verified ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
          {verified
            ? "Verified by contract and independently recomputed in this browser."
            : "Snapshot commitment verification failed."}
        </span>
      )}
    </section>
  );
}
