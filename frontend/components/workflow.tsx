import {
  BadgeCheck,
  FileInput,
  Gavel,
  Link2,
  SearchCheck
} from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

const steps = [
  {
    number: "01",
    icon: FileInput,
    title: "Submit a claim",
    copy:
      "Define a precise claim, primary evidence URL, optional corroborating source, and evidence policy."
  },
  {
    number: "02",
    icon: SearchCheck,
    title: "Evaluate evidence",
    copy:
      "The Intelligent Contract assesses source relevance, agreement, availability, and policy requirements."
  },
  {
    number: "03",
    icon: BadgeCheck,
    title: "Receive a verdict",
    copy:
      "SUPPORTED, CONTRADICTED, or INSUFFICIENT is persisted with source assessments and rationale."
  },
  {
    number: "04",
    icon: Link2,
    title: "Challenge with evidence",
    copy:
      "A challenger links counter-evidence and a note. The prior effective verdict remains explicit."
  },
  {
    number: "05",
    icon: Gavel,
    title: "Resolve by consensus",
    copy:
      "The challenge finalizes with its own assessment, outcome, revised verdict, and explanation."
  }
];

export function Workflow() {
  return (
    <section className="section section-alt" id="how-it-works">
      <div className="shell">
        <ScrollReveal className="section-heading">
          <span className="eyebrow">Court procedure</span>
          <h2>Evidence in. Consensus out.</h2>
          <p>
            Every stage leaves a readable trail instead of hiding the result
            behind a black-box score.
          </p>
        </ScrollReveal>

        <div className="workflow-grid">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.number} delay={index * 70}>
                <article className="workflow-card">
                  <div className="workflow-index">{step.number}</div>
                  <Icon size={22} />
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
