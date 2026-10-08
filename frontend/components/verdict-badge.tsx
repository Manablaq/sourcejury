import { clsx } from "clsx";
import { verdictTone } from "@/lib/format";

export function VerdictBadge({ verdict }: { verdict?: string }) {
  return (
    <span className={clsx("verdict-badge", verdictTone(verdict))}>
      <span className="verdict-dot" />
      {verdict || "UNRESOLVED"}
    </span>
  );
}
