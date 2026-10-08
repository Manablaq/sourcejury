import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { CaseDetail } from "@/components/case-detail";

export const metadata: Metadata = { title: "Case Detail" };

export default async function CasePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caseId = Number(id);

  if (!Number.isInteger(caseId) || caseId <= 0) notFound();

  return (
    <>
      <Navigation />
      <main id="main-content" className="page-shell">
        <div className="shell">
          <CaseDetail caseId={caseId} />
        </div>
      </main>
      <Footer />
    </>
  );
}
