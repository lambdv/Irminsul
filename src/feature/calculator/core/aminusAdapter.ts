import { StatTable as AminusStatTable, dmg_formula } from "aminus";
import { mergeStatTables } from "./statTable";
import {
  DamageActionSpec,
  DamageCompute,
  STAT_TYPES,
  StatTableLike,
} from "./types";

const toTupleEntries = (table: StatTableLike): [typeof STAT_TYPES[number], number][] =>
  STAT_TYPES.map((stat) => [stat, table[stat] || 0]);

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
    const formula = dmg_formula(
      spec.element,
      spec.damageType,
      motionValue,
      toAminusStatTable(mergedBuffs),
      instances,
      scaling,
      amplifier,
    );

    return formula(toAminusStatTable(base));
  };
};
