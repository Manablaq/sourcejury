export function compactAddress(value?: string, size = 4) {
  if (!value) return "—";
  if (value.length <= size * 2 + 2) return value;
  return `${value.slice(0, size + 2)}…${value.slice(-size)}`;
}

export function formatGen(wei?: bigint | string | number) {
  if (wei === undefined || wei === null) return "—";
  const value = typeof wei === "bigint" ? wei : BigInt(wei);
  const whole = value / 10n ** 18n;
  const fraction = (value % 10n ** 18n)
    .toString()
    .padStart(18, "0")
    .slice(0, 5)
    .replace(/0+$/, "");
  return fraction ? `${whole}.${fraction} GEN` : `${whole} GEN`;
}

export function safeNumber(value: unknown) {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

export function hostFromUrl(value?: string) {
  if (!value) return "No source";
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

export function verdictTone(value?: string) {
  switch (value) {
    case "SUPPORTED":
      return "supported";
    case "CONTRADICTED":
      return "contradicted";
    case "INSUFFICIENT":
      return "insufficient";
    default:
      return "neutral";
  }
}

export function copyText(value: string) {
  return navigator.clipboard.writeText(value);
}
