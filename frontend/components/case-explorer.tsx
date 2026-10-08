"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { useCourt } from "@/hooks/use-court";
import { VerdictBadge } from "@/components/verdict-badge";
import { hostFromUrl } from "@/lib/format";

const filters = ["ALL", "SUPPORTED", "CONTRADICTED", "INSUFFICIENT"] as const;

export function CaseExplorer() {
  const court = useCourt();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("ALL");

  const items = useMemo(() => {
    if (!court.data) return [];
    const q = query.trim().toLowerCase();

    return court.data.cases.filter((item) => {
      const matchesFilter =
        filter === "ALL" || item.effective_verdict === filter;
      const matchesQuery =
        !q ||
        String(item.id) === q ||
        item.claim.toLowerCase().includes(q) ||
        item.primary_url.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [court.data, filter, query]);

  if (court.isPending) {
    return (
      <div className="explorer-loading">
        <div className="skeleton-line" />
        <div className="skeleton-card large" />
        <div className="skeleton-card large" />
      </div>
    );
  }

  if (court.isError) {
    return (
      <div className="explorer-error">
        <ShieldAlert size={28} />
        <h2>Finalized court state could not be loaded.</h2>
        <p>No fallback verdicts are displayed. Retry the canonical GenLayer RPC.</p>
        <button
          className="button button-primary"
          onClick={() => void court.refetch()}
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="explorer-stack">
      <div className="explorer-toolbar">
        <label className="search-control">
          <Search size={17} />
          <input
            value={query}
            placeholder="Search by case ID, claim, or source…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="filter-control">
          <Filter size={16} />
          {filters.map((item) => (
            <button
              key={item}
              className={item === filter ? "active" : undefined}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="explorer-count">
        <span>
          Showing <strong>{items.length}</strong> of{" "}
          <strong>{court.data.caseCount}</strong> cases
        </span>
        <button
          className="text-link"
          onClick={() => void court.refetch()}
          type="button"
        >
          <RefreshCw size={15} />
          Refresh finalized state
        </button>
      </div>

      <div className="explorer-list">
        {items.map((item) => (
          <Link
            href={`/cases/${item.id}`}
            key={item.id}
            className="explorer-case"
          >
            <div className="explorer-case-id">
              <span>CASE</span>
              <strong>{String(item.id).padStart(2, "0")}</strong>
            </div>
            <div className="explorer-case-main">
              <div className="explorer-case-heading">
                <h3>{item.claim}</h3>
                <VerdictBadge verdict={item.effective_verdict} />
              </div>
              <p>{item.rationale || "No rationale recorded yet."}</p>
              <div className="explorer-case-meta">
                <span>{item.policy}</span>
                <span>{hostFromUrl(item.primary_url)}</span>
                <span>Revision {item.revision}</span>
                <span>{item.challenge_count} challenge(s)</span>
              </div>
            </div>
          </Link>
        ))}

        {!items.length && (
          <div className="empty-results">
            <Search size={24} />
            <strong>No matching cases</strong>
            <span>Change your search or verdict filter.</span>
          </div>
        )}
      </div>
    </div>
  );
}
