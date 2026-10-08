"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FilePlus2,
  Gavel,
  LoaderCircle,
  MessageSquareWarning,
  Scale,
  ShieldCheck,
  WalletCards,
  X
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWallet } from "@/components/wallet-provider";
import { executeSourceJuryWrite } from "@/lib/genlayer";
import type {
  PreparedWrite,
  WriteMethod,
  WriteStage
} from "@/lib/types";
import { SOURCEJURY_CONTRACT, STUDIO_DEVNET } from "@/lib/config";
import { formatWalletError } from "@/lib/write-safety";

type FormState = {
  claim: string;
  primaryUrl: string;
  corroboratingUrl: string;
  policy: "DIRECT_SOURCE_V1" | "CORROBORATED_V1";
  caseId: string;
  challengeUrl: string;
  challengeNote: string;
  challengeId: string;
};

const initial: FormState = {
  claim: "",
  primaryUrl: "",
  corroboratingUrl: "",
  policy: "DIRECT_SOURCE_V1",
  caseId: "",
  challengeUrl: "",
  challengeNote: "",
  challengeId: ""
};

const tabs: Array<{
  method: WriteMethod;
  label: string;
  icon: typeof Scale;
}> = [
  { method: "create_case", label: "Create case", icon: FilePlus2 },
  { method: "evaluate_case", label: "Evaluate", icon: Scale },
  { method: "open_challenge", label: "Challenge", icon: MessageSquareWarning },
  { method: "resolve_challenge", label: "Resolve", icon: Gavel }
];

export function CourtActions() {
  const wallet = useWallet();
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<WriteMethod>("create_case");
  const [form, setForm] = useState<FormState>(initial);
  const [stage, setStage] = useState<WriteStage>("idle");
  const [detail, setDetail] = useState("");
  const [lastTx, setLastTx] = useState<string>();
  const [reviewOpen, setReviewOpen] = useState(false);
  const submissionLockRef = useRef(false);

  const busy = !["idle", "finalized", "failed"].includes(stage);

  const prepared = useMemo<PreparedWrite | null>(() => {
    switch (method) {
      case "create_case":
        if (!form.claim.trim() || !form.primaryUrl.trim()) return null;
        if (
          form.policy === "CORROBORATED_V1" &&
          !form.corroboratingUrl.trim()
        ) return null;
        return {
          method,
          args: [
            form.claim.trim(),
            form.primaryUrl.trim(),
            form.corroboratingUrl.trim(),
            form.policy
          ],
          title: "Create evidence case",
          description: "Persist the claim and evidence references before evaluation."
        };

      case "evaluate_case": {
        const id = Number(form.caseId);
        if (!Number.isInteger(id) || id <= 0) return null;
        return {
          method,
          args: [id],
          title: `Evaluate case ${id}`,
          description: "Run the selected evidence policy through GenLayer consensus."
        };
      }

      case "open_challenge": {
        const id = Number(form.caseId);
        if (
          !Number.isInteger(id) ||
          id <= 0 ||
          !form.challengeUrl.trim() ||
          !form.challengeNote.trim()
        ) return null;
        return {
          method,
          args: [id, form.challengeUrl.trim(), form.challengeNote.trim()],
          title: `Challenge case ${id}`,
          description: "Attach counter-evidence to the current effective verdict."
        };
      }

      case "resolve_challenge": {
        const id = Number(form.challengeId);
        if (!Number.isInteger(id) || id <= 0) return null;
        return {
          method,
          args: [id],
          title: `Resolve challenge ${id}`,
          description:
            "Ask consensus to assess the counter-evidence and finalize the challenge."
        };
      }
    }
  }, [form, method]);

  const beginReview = (event: FormEvent) => {
    event.preventDefault();

    if (!prepared) {
      return;
    }

    if (
      !wallet.connected ||
      !wallet.address ||
      !wallet.provider
    ) {
      toast.error(
        "Connect a wallet before reviewing a court action."
      );
      return;
    }

    if (busy) {
      return;
    }

    setReviewOpen(true);
  };

  const confirmWrite = async () => {
    if (
      !prepared ||
      !wallet.address ||
      !wallet.provider
    ) {
      setReviewOpen(false);

      toast.error(
        "Wallet context changed. Review the action again."
      );

      return;
    }

    if (
      busy ||
      submissionLockRef.current
    ) {
      return;
    }

    submissionLockRef.current =
      true;

    const reviewedAddress =
      wallet.address;

    const reviewedProvider =
      wallet.provider;

    try {
      setReviewOpen(false);
      setLastTx(undefined);
      setDetail("");
      setStage("network");

      if (!wallet.correctNetwork) {
        await wallet.ensureStudioDevnet();
      }

      const result =
        await executeSourceJuryWrite({
          prepared,
          address: reviewedAddress,
          provider: reviewedProvider,
          onStage: (
            next,
            nextDetail
          ) => {
            setStage(next);
            setDetail(
              nextDetail ?? ""
            );

            if (
              (
                next === "submitted" ||
                next === "finalizing"
              ) &&
              nextDetail?.startsWith("0x")
            ) {
              setLastTx(
                nextDetail
              );
            }
          }
        });

      setLastTx(
        result.txHash
      );

      setStage(
        "finalized"
      );

      toast.success(
        "Finalized successfully"
      );

      await queryClient.invalidateQueries({
        queryKey: [
          "sourcejury",
          "court-snapshot"
        ]
      });

      await wallet.refresh();

      if (
        method === "create_case"
      ) {
        setForm(
          (current) => ({
            ...current,
            claim: "",
            primaryUrl: "",
            corroboratingUrl: ""
          })
        );
      }
    } catch (error) {
      setStage(
        "failed"
      );

      const message =
        formatWalletError(error);

      setDetail(
        message
      );

      toast.error(
        message
      );
    } finally {
      submissionLockRef.current =
        false;
    }
  };

  return (
    <section className="action-console">
      <div className="action-console-heading">
        <div>
          <span className="eyebrow">Court controls</span>
          <h2>Submit an action</h2>
        </div>
        <span className="contract-chip">
          Contract {SOURCEJURY_CONTRACT.slice(0, 8)}…
        </span>
      </div>

      <div className="action-tabs" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.method}
              className={method === tab.method ? "active" : undefined}
              onClick={() => {
                if (busy) return;
                setMethod(tab.method);
                setStage("idle");
                setDetail("");
              }}
              role="tab"
              aria-selected={method === tab.method}
              type="button"
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form className="court-form" onSubmit={beginReview}>
        {method === "create_case" && (
          <>
            <label>
              Claim
              <textarea
                rows={3}
                value={form.claim}
                maxLength={320}
                placeholder="Example: The GenLayer Studio development preview uses chain ID 61997."
                onChange={(event) =>
                  setForm({ ...form, claim: event.target.value })
                }
              />
              <small>{form.claim.length}/320</small>
            </label>

            <label>
              Primary evidence URL
              <input
                type="url"
                value={form.primaryUrl}
                placeholder="https://..."
                onChange={(event) =>
                  setForm({ ...form, primaryUrl: event.target.value })
                }
              />
            </label>

            <label>
              Evidence policy
              <select
                value={form.policy}
                onChange={(event) =>
                  setForm({
                    ...form,
                    policy: event.target.value as FormState["policy"]
                  })
                }
              >
                <option value="DIRECT_SOURCE_V1">DIRECT_SOURCE_V1</option>
                <option value="CORROBORATED_V1">CORROBORATED_V1</option>
              </select>
            </label>

            <label>
              Corroborating evidence URL
              <input
                type="url"
                value={form.corroboratingUrl}
                placeholder={
                  form.policy === "CORROBORATED_V1"
                    ? "Required for corroborated policy"
                    : "Optional"
                }
                onChange={(event) =>
                  setForm({ ...form, corroboratingUrl: event.target.value })
                }
              />
            </label>
          </>
        )}

        {(method === "evaluate_case" || method === "open_challenge") && (
          <label>
            Case ID
            <input
              type="number"
              min={1}
              step={1}
              value={form.caseId}
              placeholder="1"
              onChange={(event) =>
                setForm({ ...form, caseId: event.target.value })
              }
            />
          </label>
        )}

        {method === "open_challenge" && (
          <>
            <label>
              Counter-evidence URL
              <input
                type="url"
                value={form.challengeUrl}
                placeholder="https://..."
                onChange={(event) =>
                  setForm({ ...form, challengeUrl: event.target.value })
                }
              />
            </label>
            <label>
              Challenge note
              <textarea
                rows={3}
                value={form.challengeNote}
                maxLength={500}
                placeholder="Explain why this source should change or confirm the verdict."
                onChange={(event) =>
                  setForm({ ...form, challengeNote: event.target.value })
                }
              />
              <small>{form.challengeNote.length}/500</small>
            </label>
          </>
        )}

        {method === "resolve_challenge" && (
          <label>
            Challenge ID
            <input
              type="number"
              min={1}
              step={1}
              value={form.challengeId}
              placeholder="1"
              onChange={(event) =>
                setForm({ ...form, challengeId: event.target.value })
              }
            />
          </label>
        )}

        <div className="action-submit-row">
          <button
            className="button button-primary button-large"
            disabled={!prepared || busy}
            type="submit"
          >
            {busy ? (
              <LoaderCircle className="spin" size={18} />
            ) : wallet.connected ? (
              <Gavel size={18} />
            ) : (
              <WalletCards size={18} />
            )}
            {busy
              ? stageLabel(stage)
              : wallet.connected
                ? "Review action"
                : "Connect wallet to continue"}
          </button>

          {!wallet.connected && (
            <span className="form-hint">
              Reading the court never requires a wallet.
            </span>
          )}
        </div>

        {stage !== "idle" && (
          <div className={`tx-status tx-${stage}`}>
            <div className="tx-status-icon">
              {stage === "failed" ? (
                <AlertTriangle size={18} />
              ) : stage === "finalized" ? (
                <CheckCircle2 size={18} />
              ) : (
                <LoaderCircle className="spin" size={18} />
              )}
            </div>
            <div>
              <strong>{stageLabel(stage)}</strong>
              {detail && <span>{detail}</span>}
              {lastTx && <code>{lastTx}</code>}
            </div>
          </div>
        )}
      </form>

      {reviewOpen && prepared && wallet.address && (
        <div
          className="sheet-backdrop"
          role="presentation"
          onMouseDown={() => {
            if (!busy) {
              setReviewOpen(false);
            }
          }}
        >
          <section
            className="wallet-sheet action-review-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sourcejury-action-review-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="sheet-heading">
              <div>
                <span className="eyebrow">
                  Final review
                </span>

                <h2 id="sourcejury-action-review-title">
                  {prepared.title}
                </h2>
              </div>

              <button
                className="icon-button"
                type="button"
                disabled={busy}
                onClick={() =>
                  setReviewOpen(false)
                }
                aria-label="Close action review"
              >
                <X size={18} />
              </button>
            </div>

            <p className="sheet-copy">
              {prepared.description}
            </p>

            <div className="review-warning">
              <ShieldCheck size={18} />

              <div>
                <strong>
                  Review before signing
                </strong>

                <span>
                  The next step can request a wallet signature and submit a real GenLayer transaction. Nothing is submitted until you confirm here and approve the request in your wallet.
                </span>
              </div>
            </div>

            <dl className="review-grid">
              <div>
                <dt>Method</dt>
                <dd>{prepared.method}</dd>
              </div>

              <div>
                <dt>Wallet</dt>
                <dd>{wallet.address}</dd>
              </div>

              <div>
                <dt>Network</dt>
                <dd>
                  {wallet.correctNetwork
                    ? `${STUDIO_DEVNET.name} (${STUDIO_DEVNET.id})`
                    : `Will switch to ${STUDIO_DEVNET.name} (${STUDIO_DEVNET.id})`}
                </dd>
              </div>

              <div>
                <dt>Contract</dt>
                <dd>{SOURCEJURY_CONTRACT}</dd>
              </div>
            </dl>

            <div className="review-arguments">
              <span className="detail-label">
                Arguments
              </span>

              {prepared.args.map(
                (value, index) => (
                  <div
                    key={`${prepared.method}-${index}`}
                  >
                    <span>
                      arg {index + 1}
                    </span>

                    <code>
                      {String(value)}
                    </code>
                  </div>
                )
              )}
            </div>

            <div className="review-actions">
              <button
                className="button button-ghost"
                type="button"
                disabled={busy}
                onClick={() =>
                  setReviewOpen(false)
                }
              >
                Cancel
              </button>

              <button
                className="button button-primary"
                type="button"
                disabled={busy}
                onClick={() =>
                  void confirmWrite()
                }
              >
                <ShieldCheck size={17} />
                Estimate fee & continue
              </button>
            </div>

            <p className="microcopy">
              SourceJury re-checks the active wallet account and chain immediately before fee estimation. If either changed after this review, submission is stopped.
            </p>
          </section>
        </div>
      )}
    </section>
  );
}

function stageLabel(stage: WriteStage) {
  switch (stage) {
    case "network": return "Checking network";
    case "estimating": return "Estimating fee";
    case "awaiting-signature": return "Confirm in wallet";
    case "submitted": return "Transaction submitted";
    case "finalizing": return "Waiting for finality";
    case "finalized": return "Finalized successfully";
    case "failed": return "Action failed";
    default: return "Ready";
  }
}
