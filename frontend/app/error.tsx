"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="center-page">
      <section className="error-panel">
        <AlertTriangle size={28} />
        <span className="eyebrow">Interface recovery</span>
        <h1>Something interrupted the court interface.</h1>
        <p>
          No verdict is inferred from a UI failure. Retry the interface and the
          app will read durable finalized state again.
        </p>
        <button className="button button-primary" onClick={reset}>
          <RotateCcw size={17} />
          Retry
        </button>
      </section>
    </main>
  );
}
