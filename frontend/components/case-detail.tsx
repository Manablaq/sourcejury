"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, RefreshCw, ShieldAlert } from "lucide-react";
import { readCase, readChallenge } from "@/lib/genlayer";
import { VerdictBadge } from "@/components/verdict-badge";
import { compactAddress, hostFromUrl } from "@/lib/format";

export function CaseDetail({ caseId }: { caseId: number }) {
  const item = useQuery({
    queryKey: ["sourcejury", "case", caseId],
    queryFn: () => readCase(caseId)
  });

  const pendingChallengeId = item.data?.pending_challenge_id ?? 0;
  const latestChallengeId = item.data?.latest_challenge_id ?? 0;
  const challengeId = pendingChallengeId || latestChallengeId;

  const challenge = useQuery({
    queryKey: ["sourcejury", "challenge", challengeId],
    queryFn: () => readChallenge(challengeId),
    enabled: challengeId > 0
  });

  if (item.isPending) {
    return (
      <div className="detail-loading">
        <div className="skeleton-line" />
        <div className="skeleton-card large" />
      </div>
    );
  }

  if (item.isError || !item.data) {
    return (
      <div className="explorer-error">
        <ShieldAlert size={28} />
        <h2>Case {caseId} could not be read.</h2>
        <p>No substitute case state is displayed.</p>
        <button
          className="button button-primary"
          onClick={() => void item.refetch()}
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const c = item.data;

  return (
    <div className="case-detail-stack">
      <Link className="text-link" href="/explorer">
        <ArrowLeft size={16} />
        Back to court
      </Link>

      <section className="case-detail-hero">
        <div>
          <span className="eyebrow">Case {String(c.id).padStart(2, "0")}</span>
          <h1>{c.claim}</h1>
        </div>
        <VerdictBadge verdict={c.effective_verdict} />
      </section>

      <div className="detail-grid">
        <section className="detail-card detail-rationale">
          <span className="detail-label">Finalized rationale</span>
          <p>{c.rationale || "No rationale recorded."}</p>
        </section>

        <section className="detail-card">
          <span className="detail-label">Verdict state</span>
          <dl>
            <div><dt>Initial</dt><dd>{c.initial_verdict}</dd></div>
            <div><dt>Effective</dt><dd>{c.effective_verdict}</dd></div>
            <div><dt>Revision</dt><dd>{c.revision}</dd></div>
            <div><dt>State</dt><dd>{c.state}</dd></div>
          </dl>
        </section>

        <section className="detail-card">
          <span className="detail-label">Primary source</span>
          <strong>{c.primary_assessment}</strong>
          <span>{hostFromUrl(c.primary_url)}</span>
          <a href={c.primary_url} target="_blank" rel="noreferrer">
            Open evidence
            <ExternalLink size={14} />
          </a>
        </section>

        <section className="detail-card">
          <span className="detail-label">Corroborating source</span>
          <strong>{c.corroborating_assessment}</strong>
          <span>{hostFromUrl(c.corroborating_url)}</span>
          {c.corroborating_url ? (
            <a href={c.corroborating_url} target="_blank" rel="noreferrer">
              Open evidence
              <ExternalLink size={14} />
            </a>
          ) : (
            <span>No corroborating URL</span>
          )}
        </section>

        <section className="detail-card">
          <span className="detail-label">Case metadata</span>
          <dl>
            <div><dt>Policy</dt><dd>{c.policy}</dd></div>
            <div><dt>Submitter</dt><dd>{compactAddress(c.submitter, 7)}</dd></div>
            <div><dt>Source availability</dt><dd>{c.source_availability}</dd></div>
            <div><dt>Source conflict</dt><dd>{c.source_conflict ? "YES" : "NO"}</dd></div>
          </dl>
        </section>

        <section className="detail-card">
          <span className="detail-label">Challenge state</span>
          <dl>
            <div><dt>Total</dt><dd>{c.challenge_count}</dd></div>
            <div><dt>Latest ID</dt><dd>{c.latest_challenge_id || "—"}</dd></div>
            <div><dt>Pending ID</dt><dd>{c.pending_challenge_id || "—"}</dd></div>
          </dl>
        </section>
      </div>

      {challengeId > 0 && challenge.data && (
        <section className="challenge-detail">
          <div className="challenge-detail-heading">
            <div>
              <span className="eyebrow">Challenge {challenge.data.id}</span>
              <h2>{challenge.data.state}</h2>
            </div>
            <VerdictBadge verdict={challenge.data.revised_verdict} />
          </div>

          <div className="challenge-detail-grid">
            <div><span>Outcome</span><strong>{challenge.data.challenge_outcome}</strong></div>
            <div><span>Counter assessment</span><strong>{challenge.data.counter_assessment}</strong></div>
            <div><span>Prior verdict</span><strong>{challenge.data.prior_effective_verdict}</strong></div>
            <div><span>Revised verdict</span><strong>{challenge.data.revised_verdict}</strong></div>
          </div>

          <p>{challenge.data.rationale || challenge.data.note}</p>

          <a
            className="text-link"
            href={challenge.data.counter_url}
            target="_blank"
            rel="noreferrer"
          >
            Open counter-evidence
            <ExternalLink size={14} />
          </a>
        </section>
      )}
    </div>
  );
}
