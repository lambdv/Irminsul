import { dmg_formula } from "aminus";
import {
  buildDamageComputeFromSpec,
  fromAminusStatTable,
  mergeStatTables,
  toAminusStatTable,
} from "@/feature/calculator/core";

describe("calculator aminus adapter", () => {
  test("toAminusStatTable and fromAminusStatTable round-trip values", () => {
    const original = {
      BaseATK: 1000,
      ATKPercent: 0.4,
      FlatATK: 311,
      CritRate: 0.6,
      CritDMG: 1.2,
    };
    const roundTrip = fromAminusStatTable(toAminusStatTable(original));

    expect(roundTrip.BaseATK).toBe(1000);
    expect(roundTrip.ATKPercent).toBeCloseTo(0.4);
    expect(roundTrip.FlatATK).toBe(311);
    expect(roundTrip.CritRate).toBeCloseTo(0.6);
    expect(roundTrip.CritDMG).toBeCloseTo(1.2);
  });

  test("buildDamageComputeFromSpec matches direct aminus dmg_formula", () => {
    const base = {
      BaseATK: 1000,
      ATKPercent: 0.5,
      FlatATK: 200,
      CritRate: 0.6,
      CritDMG: 1.4,
      PyroDMGBonus: 0.466,
    };
    const buffs = [{ SkillDMGBonus: 0.2 }, { PyroResistanceReduction: 0.2 }];

    const compute = buildDamageComputeFromSpec({
      id: "skill-hit",
      label: "Skill Hit",
      element: "Pyro",
      damageType: "Skill",
      motionValue: 2.5,
      instances: 2,
      scaling: "ATK",
      amplifier: "None",
      buffTableNodeIds: ["a", "b"],
    });

    const actual = compute(base, buffs);

    const mergedBuff = mergeStatTables(...buffs);
    const expectedFormula = dmg_formula(
      "Pyro",
      "Skill",
      2.5,
      toAminusStatTable(mergedBuff),
      2,
      "ATK",
      "None",
    );
    const expected = expectedFormula(toAminusStatTable(base));

    expect(actual).toBeCloseTo(expected, 8);
  });
});
