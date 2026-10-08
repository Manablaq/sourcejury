import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid-overlay" aria-hidden="true" />
      <div className="shell hero-layout">
        <ScrollReveal className="hero-copy">
          <div className="hero-kicker">
            <span className="pulse-dot" />
            Live on GenLayer Studio Devnet
          </div>

          <h1>
            Put evidence
            <span>on trial.</span>
          </h1>

          <p className="hero-lead">
            SourceJury turns web evidence into explainable, challengeable
            verdicts — with consensus handling the hard calls and finalized
            state keeping the interface honest.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary button-large" href="/explorer">
              Open live court
              <ArrowRight size={18} />
            </Link>
            <Link className="button button-ghost button-large" href="/docs">
              Read documentation
            </Link>
          </div>

          <div className="trust-row">
            <span><ShieldCheck size={16} />Finalized reads</span>
            <span><CheckCircle2 size={16} />Challengeable verdicts</span>
            <span><FileSearch size={16} />Source-linked rationale</span>
          </div>
        </ScrollReveal>

        <ScrollReveal className="hero-visual" delay={120}>
          <div className="court-orbit" aria-hidden="true">
            <div className="orbit-ring orbit-ring-one" />
            <div className="orbit-ring orbit-ring-two" />
            <div className="court-core">
              <Sparkles size={26} />
              <strong>JURY</strong>
              <span>GENLAYER</span>
            </div>
          </div>

          <article className="floating-case floating-case-a">
            <span>CASE 01</span>
            <strong>SUPPORTED</strong>
            <small>2 independent sources</small>
          </article>

          <article className="floating-case floating-case-b">
            <span>CASE 02</span>
            <strong>CONTRADICTED</strong>
            <small>Primary source conflicts</small>
          </article>

          <article className="floating-case floating-case-c">
            <span>CHALLENGE</span>
            <strong>REJECTED</strong>
            <small>Counter-evidence supports verdict</small>
          </article>

          <div className="speed-lines" aria-hidden="true">
            <span /><span /><span />
          </div>
        </ScrollReveal>
      </div>

      <div className="hero-marquee" aria-hidden="true">
        <div>
          SOURCE • CORROBORATE • CONSENSUS • CHALLENGE • FINALIZE •
          SOURCE • CORROBORATE • CONSENSUS • CHALLENGE • FINALIZE •
        </div>
      </div>
    </section>
  );
}
