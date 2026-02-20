import {
  getStat,
  mergeStatTables,
  normalizeStatTable,
} from "@/feature/calculator/core";

describe("calculator statTable helpers", () => {
  test("mergeStatTables sums overlapping stats", () => {
    const merged = mergeStatTables(
      { BaseATK: 800, ATKPercent: 0.3 },
      { BaseATK: 200, FlatATK: 120, ATKPercent: 0.2 },
    );

    expect(merged.BaseATK).toBe(1000);
    expect(merged.ATKPercent).toBeCloseTo(0.5);
    expect(merged.FlatATK).toBe(120);
  });

  test("getStat returns 0 for missing stats", () => {
    expect(getStat({}, "CritRate")).toBe(0);
  });

  test("normalizeStatTable strips non-finite values", () => {
    const normalized = normalizeStatTable({
      BaseATK: 900,
      CritRate: Number.NaN,
      CritDMG: Number.POSITIVE_INFINITY,
    });

    expect(normalized.BaseATK).toBe(900);
    expect(normalized.CritRate).toBeUndefined();
    expect(normalized.CritDMG).toBeUndefined();
  });
});

