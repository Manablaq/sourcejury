import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { LiveOverview } from "@/components/live-overview";
import { Workflow } from "@/components/workflow";
import { VerdictSection } from "@/components/verdict-section";
import { SecuritySection } from "@/components/security-section";
import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/scroll-reveal";

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main id="main-content">
        <Hero />
        <LiveOverview />
        <Workflow />
        <VerdictSection />
        <SecuritySection />

        <section className="section docs-cta">
          <div className="shell">
            <ScrollReveal className="docs-cta-card">
              <div className="docs-cta-icon"><BookOpenCheck size={26} /></div>
              <div>
                <span className="eyebrow">Documentation</span>
                <h2>Understand the court before you use it.</h2>
                <p>
                  Read the evidence policies, transaction lifecycle, challenge
                  model, network binding, and safety assumptions in plain language.
                </p>
              </div>
              <Link className="button button-primary" href="/docs">
                Open docs
                <ArrowRight size={17} />
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
