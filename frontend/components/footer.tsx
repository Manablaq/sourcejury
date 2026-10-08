import Link from "next/link";
import { Scale } from "lucide-react";
import { SOURCEJURY_CONTRACT } from "@/lib/config";
import { compactAddress } from "@/lib/format";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div>
          <div className="brand">
            <span className="brand-mark"><Scale size={19} /></span>
            <span>
              <strong>SourceJury</strong>
              <small>Evidence court</small>
            </span>
          </div>
          <p>
            Explainable evidence verdicts and challenge resolution on GenLayer.
          </p>
        </div>

        <div>
          <strong>Navigate</strong>
          <Link href="/explorer">Live court</Link>
          <Link href="/docs">Documentation</Link>
          <Link href="/#security">Security</Link>
        </div>

        <div>
          <strong>Network</strong>
          <span>Studio Devnet · 61997</span>
          <span>{compactAddress(SOURCEJURY_CONTRACT, 7)}</span>
          <span>Reads use finalized state</span>
        </div>
      </div>
    </footer>
  );
}
