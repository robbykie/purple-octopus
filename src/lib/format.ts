/** Formatting helpers. Everything the UI prints as a number goes through here. */

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const UNITS = [
  { threshold: 1e12, suffix: "T" },
  { threshold: 1e9, suffix: "B" },
  { threshold: 1e6, suffix: "M" },
  { threshold: 1e3, suffix: "K" },
] as const;

/**
 * Compact headline form: $61.5K, $1.2M.
 *
 * Scaled by hand rather than with Intl's `notation: "compact"`, whose rounding
 * differs between ICU builds — Node renders 0 as "$0.0" where Chrome renders
 * "$0", which is a hydration mismatch on every server-rendered figure.
 */
export function formatCompactCurrency(value: number, currency = "USD"): string {
  const magnitude = Math.abs(value);
  const unit = UNITS.find((candidate) => magnitude >= candidate.threshold);

  if (!unit) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  }

  const scaled = value / unit.threshold;
  // One decimal below 100 (61.5K), none above it (124K) — same as Intl compact.
  const digits = Math.abs(scaled) < 100 ? 1 : 0;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(scaled);

  return `${formatted}${unit.suffix}`;
}

export function formatSignedCurrency(value: number, currency = "USD"): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatCurrency(Math.abs(value), currency)}`;
}

export function formatPercent(value: number, withSign = true): string {
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 }).format(value);
}

export function formatTime(epochMillis: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(epochMillis));
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
