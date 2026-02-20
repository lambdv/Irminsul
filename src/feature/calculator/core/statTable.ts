import { STAT_TYPES, StatTableLike, StatType } from "./types";

export const getStat = (table: StatTableLike, stat: StatType): number =>
  Number.isFinite(table[stat]) ? (table[stat] as number) : 0;

export const normalizeStatTable = (table: StatTableLike): StatTableLike => {
  const normalized: StatTableLike = {};
  for (const stat of STAT_TYPES) {
    const value = table[stat];
    if (Number.isFinite(value)) {
      normalized[stat] = value as number;
    }
  }
  return normalized;
};

export const mergeStatTables = (...tables: StatTableLike[]): StatTableLike => {
  const merged: StatTableLike = {};
  for (const stat of STAT_TYPES) {
    merged[stat] = 0;
  }

  for (const table of tables) {
    if (!table) continue;
    for (const stat of STAT_TYPES) {
      const value = table[stat];
      if (Number.isFinite(value)) {
        merged[stat] = (merged[stat] || 0) + (value as number);
      }
    }
  }

  return merged;
};

