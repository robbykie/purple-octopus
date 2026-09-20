import { describe, expect, it } from "vitest";
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
} from "../src/lib/format";

describe("formatCompactCurrency", () => {
  it("renders zero without a decimal, matching every ICU build", () => {
    // Intl's own compact notation disagrees here between Node and browsers,
    // which is why this formatter scales by hand.
    expect(formatCompactCurrency(0)).toBe("$0");
  });

  it("leaves values under a thousand whole", () => {
    expect(formatCompactCurrency(920)).toBe("$920");
    expect(formatCompactCurrency(999.4)).toBe("$999");
  });

  it("scales thousands, millions and billions", () => {
    expect(formatCompactCurrency(61_500)).toBe("$61.5K");
    expect(formatCompactCurrency(32_800)).toBe("$32.8K");
    expect(formatCompactCurrency(1_240_000)).toBe("$1.2M");
    expect(formatCompactCurrency(3_500_000_000)).toBe("$3.5B");
  });

  it("drops the decimal past a hundred units", () => {
    expect(formatCompactCurrency(124_000)).toBe("$124K");
  });

  it("keeps the sign on negatives", () => {
    expect(formatCompactCurrency(-61_500)).toBe("-$61.5K");
  });
});

describe("formatSignedCurrency", () => {
  it("marks gains, losses and flat", () => {
    expect(formatSignedCurrency(1234.5)).toBe("+$1,234.50");
    expect(formatSignedCurrency(-1234.5)).toBe("-$1,234.50");
    expect(formatSignedCurrency(0)).toBe("$0.00");
  });
});

describe("formatPercent", () => {
  it("adds a plus only to gains", () => {
    expect(formatPercent(2.5)).toBe("+2.50%");
    expect(formatPercent(-2.5)).toBe("-2.50%");
    expect(formatPercent(2.5, false)).toBe("2.50%");
  });
});

describe("formatCurrency", () => {
  it("always shows cents", () => {
    expect(formatCurrency(80358)).toBe("$80,358.00");
  });
});
