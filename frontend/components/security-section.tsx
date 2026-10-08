import {
  Fingerprint,
  KeyRound,
  Network,
  ShieldCheck
} from "lucide-react";
import { CERTIFIED_BACKEND, SOURCEJURY_CONTRACT } from "@/lib/config";
import { compactAddress } from "@/lib/format";
import { ScrollReveal } from "@/components/scroll-reveal";

const items = [
  {
    icon: ShieldCheck,
    title: "Finalized by default",
    copy:
      "Durable application decisions are rendered from LATEST_FINAL state rather than optimistic non-final state."
  },
  {
    icon: KeyRound,
    title: "Wallet-local signing",
    copy:
      "SourceJury requests signatures from your browser wallet and never imports or stores your private key."
  },
  {
    icon: Network,
    title: "Network locked",
    copy:
      "Writes require GenLayer Studio Devnet chain 61997 and can add or switch the network through the wallet."
  },
  {
    icon: Fingerprint,
    title: "Certified backend",
    copy:
      "The UI binds to the frozen SourceJury contract and exposes its certification checkpoint for reviewers."
  }
];

export function SecuritySection() {
  return (
    <section className="section section-dark" id="security">
      <div className="shell security-layout">
        <ScrollReveal>
          <span className="eyebrow">Safety posture</span>
          <h2>Fast interface. Conservative truth.</h2>
          <p className="security-lead">
            A polished experience should never trade away evidence integrity.
          </p>

          <div className="fingerprint-card">
            <span>Contract</span>
            <strong>{compactAddress(SOURCEJURY_CONTRACT, 8)}</strong>
            <span>Backend checkpoint</span>
            <strong>{compactAddress(CERTIFIED_BACKEND.gitCheckpoint, 9)}</strong>
          </div>
        </ScrollReveal>

        <div className="security-grid">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.title} delay={index * 60}>
                <article>
                  <Icon size={20} />
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
