import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { CaseExplorer } from "@/components/case-explorer";
import { CourtActions } from "@/components/court-actions";

export const metadata: Metadata = {
  title: "Live Court",
  description: "Inspect finalized SourceJury cases and submit court actions."
};

export default function ExplorerPage() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="page-shell">
        <section className="page-hero shell">
          <span className="eyebrow">Live court</span>
          <h1>Inspect the record. Act on evidence.</h1>
          <p>
            Finalized state is available to everyone. Wallet connection is
            required only for state-changing court actions.
          </p>
        </section>

        <div className="shell explorer-layout">
          <CaseExplorer />
          <CourtActions />
        </div>
      </main>
      <Footer />
    </>
  );
}
