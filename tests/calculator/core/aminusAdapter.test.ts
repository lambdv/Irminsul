import { calculate_damage, dmg_formula } from "aminus";
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

  test("damage compute responds to motion value, buffs, and scaling", () => {
    const base = {
      BaseATK: 1000,
      BaseDEF: 400,
      ATKPercent: 0.5,
      DEFPercent: 0.2,
      FlatATK: 150,
      FlatDEF: 50,
      CritRate: 0.5,
      CritDMG: 1.0,
      PyroDMGBonus: 0.2,
    };

    const skillLowMv = buildDamageComputeFromSpec({
      id: "a",
      label: "A",
      element: "Pyro",
      damageType: "Skill",
      motionValue: 1,
      scaling: "ATK",
      amplifier: "None",
    });
    const skillHighMv = buildDamageComputeFromSpec({
      id: "a",
      label: "A",
      element: "Pyro",
      damageType: "Skill",
      motionValue: 3,
      scaling: "ATK",
      amplifier: "None",
    });
    const skillWithBuff = buildDamageComputeFromSpec({
      id: "a",
      label: "A",
      element: "Pyro",
      damageType: "Skill",
      motionValue: 2,
      scaling: "ATK",
      amplifier: "None",
    });
    const defScaled = buildDamageComputeFromSpec({
      id: "a",
      label: "A",
      element: "Pyro",
      damageType: "Skill",
      motionValue: 2,
      scaling: "DEF",
      amplifier: "None",
    });

    const lowMv = skillLowMv(base, []);
    const highMv = skillHighMv(base, []);
    const withoutBuff = skillWithBuff(base, []);
    const withBuff = skillWithBuff(base, [{ SkillDMGBonus: 0.5 }]);
    const defDamage = defScaled(base, []);

    expect(highMv).toBeGreaterThan(lowMv);
    expect(withBuff).toBeGreaterThan(withoutBuff);
    expect(defDamage).not.toBeCloseTo(withoutBuff, 8);
  });

  test("adapter output matches calculate_damage for equivalent inputs", () => {
    const base = {
      BaseATK: 1000,
      ATKPercent: 0.5,
      FlatATK: 200,
      CritRate: 0.6,
      CritDMG: 1.2,
      PyroDMGBonus: 0.3,
    };
    const buffs = mergeStatTables({ SkillDMGBonus: 0.2 }, { PyroResistanceReduction: 0.2 });

    const compute = buildDamageComputeFromSpec({
      id: "skill-hit",
      label: "Skill Hit",
      element: "Pyro",
      damageType: "Skill",
      motionValue: 2.5,
      instances: 2,
      scaling: "ATK",
      amplifier: "None",
    });

    const expected = calculate_damage(
      "Pyro",
      "Skill",
      "ATK",
      "None",
      2,
      2.5,
      toAminusStatTable(base),
      toAminusStatTable(buffs),
    );
    const actual = compute(base, [buffs]);
    expect(actual).toBeCloseTo(expected, 8);
  });
});
