import { AlertOctagon, BadgeCheck, HelpCircle } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

const verdicts = [
  {
    tone: "supported",
    icon: BadgeCheck,
    name: "SUPPORTED",
    title: "Evidence supports the claim",
    copy:
      "The available source evidence satisfies the active policy and points in the claim's direction."
  },
  {
    tone: "contradicted",
    icon: AlertOctagon,
    name: "CONTRADICTED",
    title: "Evidence opposes the claim",
    copy:
      "Relevant source evidence directly conflicts with the claim under the selected policy."
  },
  {
    tone: "insufficient",
    icon: HelpCircle,
    name: "INSUFFICIENT",
    title: "Evidence cannot carry the claim",
    copy:
      "Sources may be unavailable, irrelevant, conflicting, or inadequate for a directional verdict."
  }
];

export function VerdictSection() {
  return (
    <section className="section" id="verdicts">
      <div className="shell">
        <ScrollReveal className="section-heading">
          <span className="eyebrow">Three-way reasoning</span>
          <h2>No forced yes/no answer.</h2>
          <p>
            SourceJury explicitly separates contradiction from insufficient
            evidence.
          </p>
        </ScrollReveal>

        <div className="verdict-grid">
          {verdicts.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.name} delay={index * 80}>
                <article className={`verdict-panel ${item.tone}`}>
                  <div className="verdict-icon"><Icon size={22} /></div>
                  <span>{item.name}</span>
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
