"use client";

import Link from "next/link";
import { ArrowUpRight, Database, Gavel, RefreshCw, Scale } from "lucide-react";
import { useCourt } from "@/hooks/use-court";
import { ScrollReveal } from "@/components/scroll-reveal";
import { VerdictBadge } from "@/components/verdict-badge";
import { hostFromUrl } from "@/lib/format";

export function LiveOverview() {
  const court = useCourt();

  return (
    <section className="section" id="live-court">
      <div className="shell">
        <ScrollReveal className="section-heading split-heading">
          <div>
            <span className="eyebrow">Finalized court state</span>
            <h2>Live evidence. Durable verdicts.</h2>
          </div>
          <Link className="text-link" href="/explorer">
            Explore every case
            <ArrowUpRight size={16} />
          </Link>
        </ScrollReveal>

        {court.isPending ? (
          <div className="live-skeleton-grid">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : court.isError ? (
          <div className="inline-error">
            <div>
              <strong>Live court data is temporarily unavailable.</strong>
              <span>
                The interface will never invent a verdict while RPC data is
                unavailable.
              </span>
            </div>
            <button
              className="button button-ghost"
              onClick={() => void court.refetch()}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="court-stat-strip">
              <article><Database size={19} /><span>Cases</span><strong>{court.data.caseCount}</strong></article>
              <article><Gavel size={19} /><span>Challenges</span><strong>{court.data.challengeCount}</strong></article>
              <article><Scale size={19} /><span>State</span><strong>FINAL</strong></article>
            </div>

            <div className="case-card-grid">
              {court.data.cases.slice(0, 3).map((item) => (
                <Link
                  className="case-card"
                  key={item.id}
                  href={`/cases/${item.id}`}
                >
                  <div className="case-card-topline">
                    <span>Case {String(item.id).padStart(2, "0")}</span>
                    <VerdictBadge verdict={item.effective_verdict} />
                  </div>
                  <h3>{item.claim}</h3>
                  <p>{item.rationale || "Awaiting rationale."}</p>
                  <div className="case-card-meta">
                    <span>{item.policy}</span>
                    <span>{hostFromUrl(item.primary_url)}</span>
                    <span>rev {item.revision}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
