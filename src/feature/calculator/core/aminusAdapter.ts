import { StatTable as AminusStatTable, calculate_damage, dmg_formula } from "aminus";
import { mergeStatTables } from "./statTable";
import {
  DamageActionSpec,
  DamageCompute,
  STAT_TYPES,
  StatTableLike,
} from "./types";

const toTupleEntries = (table: StatTableLike): [typeof STAT_TYPES[number], number][] =>
  STAT_TYPES.map((stat) => [stat, table[stat] || 0]);

const hasWorkingDmgFormula = (() => {
  try {
    const base = new AminusStatTable(
      ["BaseATK", 1000],
      ["ATKPercent", 0],
      ["FlatATK", 0],
      ["CritRate", 0],
      ["CritDMG", 0],
    );
    const low = dmg_formula("Pyro", "Skill", 1, new AminusStatTable(), 1, "ATK", "None")(base);
    const high = dmg_formula("Pyro", "Skill", 2, new AminusStatTable(), 1, "ATK", "None")(base);
    return Number.isFinite(low) && Number.isFinite(high) && Math.abs(high - low) > 1e-9;
  } catch {
    return false;
  }
})();

export const toAminusStatTable = (table: StatTableLike): AminusStatTable =>
  new AminusStatTable(...toTupleEntries(table));

export const fromAminusStatTable = (table: AminusStatTable): StatTableLike => {
  const output: StatTableLike = {};
  for (const stat of STAT_TYPES) {
    output[stat] = table.get(stat as any) || 0;
  }
  return output;
};

export const buildDamageComputeFromSpec = (
  spec: DamageActionSpec,
): DamageCompute => {
  const instances =
    Number.isFinite(spec.instances) && (spec.instances as number) > 0
      ? Math.floor(spec.instances as number)
      : 1;
  const scaling = spec.scaling ?? "ATK";
  const amplifier = spec.amplifier ?? "None";
  const motionValue = Number.isFinite(spec.motionValue) ? spec.motionValue : 0;

  return (base, linkedBuffs = []) => {
    const mergedBuffs = mergeStatTables(...linkedBuffs);
    const baseStats = toAminusStatTable(base);
    const buffStats = linkedBuffs.length > 0 ? toAminusStatTable(mergedBuffs) : undefined;

    if (hasWorkingDmgFormula) {
      const formula = dmg_formula(
        spec.element,
        spec.damageType,
        motionValue,
        buffStats || new AminusStatTable(),
        instances,
        scaling,
        amplifier,
      );
      return formula(baseStats);
    }

    return calculate_damage(
      spec.element,
      spec.damageType,
      scaling,
      amplifier,
      instances,
      motionValue,
      baseStats,
      buffStats,
    );
  };
};
