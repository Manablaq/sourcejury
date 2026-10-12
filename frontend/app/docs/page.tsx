import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Braces,
  CircleCheck,
  Fingerprint,
  Gavel,
  Network,
  ShieldCheck
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
  CERTIFIED_BACKEND,
  SOURCEJURY_CONTRACT,
  STUDIO_DEVNET
} from "@/lib/config";

export const metadata: Metadata = {
  title: "Documentation",
  description: "SourceJury product and protocol documentation."
};

const methods = [
  ["get_protocol_info", "View", "Protocol metadata and supported policies."],
  ["get_case_count", "View", "Number of persisted cases."],
  ["get_challenge_count", "View", "Number of persisted challenges."],
  ["get_case(id)", "View", "Complete case state and verdict history."],
  ["get_challenge(id)", "View", "Complete challenge state and outcome."],
  ["get_evidence_snapshot(id)", "View", "Exact bounded evidence content and SHA-256 commitment used for adjudication."],
  ["verify_evidence_snapshot(id)", "View", "Contract-side verification of snapshot integrity."],
  ["create_case(...)", "Write", "Persist a claim and evidence references."],
  ["evaluate_case(id)", "Write", "Evaluate a case through consensus."],
  ["open_challenge(...)", "Write", "Attach bounded counter-evidence to authenticated original evidence."],
  ["resolve_challenge(id)", "Write", "Resolve counter-evidence through consensus."]
];

export default function DocsPage() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="page-shell docs-page">
        <section className="page-hero shell">
          <span className="eyebrow">SourceJury documentation</span>
          <h1>Evidence court, without the mystery.</h1>
          <p>
            This documentation describes what the interface does, what the
            contract decides, and where finality matters.
          </p>
          <Link className="button button-primary" href="/explorer">
            Open live court
            <ArrowRight size={17} />
          </Link>
        </section>

        <div className="shell docs-layout">
          <aside className="docs-nav">
            <strong>On this page</strong>
            <a href="#overview">Overview</a>
            <a href="#policies">Evidence policies</a>
            <a href="#commitments">Evidence commitments</a>
            <a href="#verdicts">Verdicts</a>
            <a href="#challenges">Challenges</a>
            <a href="#wallet">Wallet & network</a>
            <a href="#methods">Contract methods</a>
            <a href="#certification">Certification</a>
          </aside>

          <article className="docs-content">
            <DocSection id="overview" icon={BookOpen} title="Overview">
              <p>
                SourceJury stores a claim, source references, authenticated
                evidence commitments, source assessments, a verdict, rationale,
                revision, and challenge state. Reading the court does not require a wallet.
              </p>
              <p>
                The interface uses finalized contract state for durable
                results. It does not synthesize a replacement verdict when
                RPC data is unavailable.
              </p>
            </DocSection>

            <DocSection id="policies" icon={Braces} title="Evidence policies">
              <h3>DIRECT_SOURCE_V1</h3>
              <p>
                A primary source is evaluated directly. The result can support,
                contradict, or fail to provide enough relevant evidence.
              </p>
              <h3>CORROBORATED_V1</h3>
              <p>
                Primary and corroborating evidence are evaluated together.
                The UI requires a corroborating URL when this policy is selected.
                Distinct hosts provide source diversity only; they do not prove
                independent ownership, editorial independence, or factual provenance.
              </p>
            </DocSection>

            <DocSection id="commitments" icon={Fingerprint} title="Authenticated evidence commitments">
              <p>
                Every bounded evidence body used for adjudication is preserved as
                an immutable snapshot and committed with SHA-256 over the exact UTF-8
                rendered text. Case state records the snapshot ID, digest, and content length.
              </p>
              <p>
                The case page reads the stored snapshot, asks the contract to verify it,
                and independently recomputes both the content digest and snapshot ID in
                the browser. Evidence above the supported 8,000-character decision bound
                is never silently truncated; it fails closed as CONTENT_TOO_LARGE.
              </p>
            </DocSection>

            <DocSection id="verdicts" icon={CircleCheck} title="Verdicts">
              <ul className="docs-list">
                <li><strong>SUPPORTED</strong> — evidence supports the claim.</li>
                <li><strong>CONTRADICTED</strong> — relevant evidence opposes the claim.</li>
                <li>
                  <strong>INSUFFICIENT</strong> — evidence is unavailable,
                  irrelevant, conflicting, oversized, or otherwise inadequate for a directional verdict.
                </li>
              </ul>
            </DocSection>

            <DocSection id="challenges" icon={Gavel} title="Challenge lifecycle">
              <p>
                A challenge references a case, challenger, counter-evidence
                URL, and explanatory note. It is evaluated against the authenticated
                original evidence snapshots rather than substituting a later webpage version.
              </p>
              <p>
                The contract separately rechecks the live original URLs and records whether
                each is unchanged, modified, unavailable, or too large. A modified live page
                never replaces the evidence originally adjudicated.
              </p>
              <p>
                This is a bounded counter-evidence downgrade mechanism, not complete case
                reconsideration. One challenge may downgrade a directional verdict to
                INSUFFICIENT, but cannot directly reverse SUPPORTED into CONTRADICTED or vice versa.
              </p>
            </DocSection>

            <DocSection id="wallet" icon={Network} title="Wallet and network">
              <div className="docs-callout">
                <Network size={20} />
                <div>
                  <strong>{STUDIO_DEVNET.name}</strong>
                  <span>
                    Chain {STUDIO_DEVNET.id} · {STUDIO_DEVNET.rpc}
                  </span>
                </div>
              </div>
              <p>
                SourceJury discovers installed EIP-6963 wallets and falls back
                to an injected EIP-1193 provider. The wallet can add or switch
                to Studio Devnet before a write.
              </p>
              <p>
                A write performs a fresh method-specific fee estimate, asks the
                wallet to sign, then waits for finalization before refreshing durable state.
              </p>
            </DocSection>

            <DocSection id="methods" icon={Fingerprint} title="Public contract methods">
              <div className="method-table">
                {methods.map(([name, kind, copy]) => (
                  <div key={name} className="method-row">
                    <code>{name}</code>
                    <span>{kind}</span>
                    <p>{copy}</p>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="certification" icon={ShieldCheck} title="Certified backend binding">
              <dl className="cert-grid">
                <div><dt>Contract</dt><dd>{SOURCEJURY_CONTRACT}</dd></div>
                <div><dt>Contract SHA-256</dt><dd>{CERTIFIED_BACKEND.contractSha256}</dd></div>
                <div><dt>Backend checkpoint</dt><dd>{CERTIFIED_BACKEND.gitCheckpoint}</dd></div>
                <div><dt>Progress 6 certification</dt><dd>{CERTIFIED_BACKEND.progress6Certification}</dd></div>
              </dl>
            </DocSection>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

function DocSection({
  id,
  icon: Icon,
  title,
  children
}: {
  id: string;
  icon: typeof BookOpen;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="doc-section">
      <div className="doc-section-title">
        <Icon size={20} />
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}
