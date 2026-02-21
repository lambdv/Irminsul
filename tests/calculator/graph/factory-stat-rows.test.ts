import {
  buildCharacterFactoryStatRows,
  buildWeaponFactoryStatRows,
} from "@/feature/calculator/graph/factoryStatRows";
import { CharacterBaseStat } from "@/types/character";
import { WeaponBaseStat } from "@/types/weapon";

describe("factory stat row builder", () => {
  test("maps character base and ascension stats to stat table", () => {
    const input: CharacterBaseStat[] = [
      {
        LVL: "20",
        BaseHP: "1000",
        BaseATK: "100",
        BaseDEF: "50",
        AscensionStatType: "CRIT Rate",
        AscensionStatValue: "5.0%",
        AscensionPhase: 1,
      },
    ];

    const rows = buildCharacterFactoryStatRows(input);
    expect(rows).toHaveLength(1);
    expect(rows[0].table.BaseHP).toBe(1000);
    expect(rows[0].table.BaseATK).toBe(100);
    expect(rows[0].table.BaseDEF).toBe(50);
    expect(rows[0].table.CritRate).toBeCloseTo(0.05);
  });

  test("maps weapon percent substat to decimal value", () => {
    const input: WeaponBaseStat[] = [
      {
        level: "1",
        base_atk: "46",
        sub_stat_type: "ATK%",
        sub_stat_value: "10.8",
        ascension_phase: 0,
      },
    ];

    const rows = buildWeaponFactoryStatRows(input);
    expect(rows).toHaveLength(1);
    expect(rows[0].table.BaseATK).toBe(46);
    expect(rows[0].table.ATKPercent).toBeCloseTo(0.108);
  });

  test("labels duplicate levels as unascended and ascended", () => {
    const input: CharacterBaseStat[] = [
      {
        LVL: "20",
        BaseHP: "1000",
        BaseATK: "100",
        BaseDEF: "50",
        AscensionStatType: "CRIT Rate",
        AscensionStatValue: "5.0%",
        AscensionPhase: 1,
      },
      {
        LVL: "20",
        BaseHP: "1200",
        BaseATK: "120",
        BaseDEF: "60",
        AscensionStatType: "CRIT Rate",
        AscensionStatValue: "5.0%",
        AscensionPhase: 2,
      },
    ];

    const rows = buildCharacterFactoryStatRows(input);
    expect(rows.map((row) => row.label)).toEqual([
      "20 (Unascended)",
      "20 (Ascended)",
    ]);
  });

  test("applies minimum crit rate 5%, crit dmg 50%, er 100%", () => {
    const input: CharacterBaseStat[] = [
      {
        LVL: "1",
        BaseHP: "1000",
        BaseATK: "100",
        BaseDEF: "50",
        AscensionStatType: "",
        AscensionStatValue: "",
        AscensionPhase: 0,
      },
    ];

    const rows = buildCharacterFactoryStatRows(input);
    expect(rows[0].table.CritRate).toBeCloseTo(0.05);
    expect(rows[0].table.CritDMG).toBeCloseTo(0.5);
    expect(rows[0].table.EnergyRecharge).toBeCloseTo(1.0);
  });

  test("keeps higher values when above minimum", () => {
    const input: CharacterBaseStat[] = [
      {
        LVL: "90",
        BaseHP: "1000",
        BaseATK: "100",
        BaseDEF: "50",
        AscensionStatType: "CRIT RATE",
        AscensionStatValue: "19.2%",
        AscensionPhase: 6,
      },
    ];

    const rows = buildCharacterFactoryStatRows(input);
    expect(rows[0].table.CritRate).toBeCloseTo(0.192);
    expect(rows[0].table.CritDMG).toBeCloseTo(0.5);
    expect(rows[0].table.EnergyRecharge).toBeCloseTo(1.0);
  });

  test("skips unsupported stat names", () => {
    const input: CharacterBaseStat[] = [
      {
        LVL: "40",
        BaseHP: "2000",
        BaseATK: "200",
        BaseDEF: "100",
        AscensionStatType: "Unsupported Stat",
        AscensionStatValue: "99.9%",
        AscensionPhase: 2,
      },
    ];

    const rows = buildCharacterFactoryStatRows(input);
    expect(rows).toHaveLength(1);
    expect(rows[0].table.BaseHP).toBe(2000);
    expect(rows[0].table.BaseATK).toBe(200);
    expect(rows[0].table.BaseDEF).toBe(100);
    expect((rows[0].table as Record<string, number>).UnsupportedStat).toBeUndefined();
  });
});
