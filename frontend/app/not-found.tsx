import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="center-page">
      <section className="error-panel">
        <span className="eyebrow">404</span>
        <h1>That court record is not here.</h1>
        <p>Return to the live case explorer and choose an existing case.</p>
        <Link className="button button-primary" href="/explorer">
          <ArrowLeft size={17} />
          Back to explorer
        </Link>
      </section>
    </main>
  );
}
