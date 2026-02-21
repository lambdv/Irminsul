import { CharacterBaseStat } from "@/types/character";
import { WeaponBaseStat } from "@/types/weapon";
import { STAT_TYPES, StatTableLike, StatType, isPercentStat } from "../core";

export type FactoryStatRow = {
  label: string;
  level: string;
  ascensionPhase: number;
  table: StatTableLike;
};

type RawFactoryRow = {
  level: string;
  ascensionPhase: number;
  table: StatTableLike;
};

type ParsedScalar = {
  value: number;
  explicitPercent: boolean;
};

const STAT_TYPE_SET = new Set<StatType>(STAT_TYPES);

const STAT_NAME_TO_TYPE: Record<string, StatType> = {
  "ATK%": "ATKPercent",
  "HP%": "HPPercent",
  "DEF%": "DEFPercent",
  "CRIT RATE": "CritRate",
  "CRITICAL RATE": "CritRate",
  "CRIT DMG": "CritDMG",
  "CRITICAL DAMAGE": "CritDMG",
  "ENERGY RECHARGE": "EnergyRecharge",
  "ELEMENTAL MASTERY": "ElementalMastery",
  "HEALING BONUS": "HealingBonus",
  "PYRO DMG BONUS": "PyroDMGBonus",
  "HYDRO DMG BONUS": "HydroDMGBonus",
  "ELECTRO DMG BONUS": "ElectroDMGBonus",
  "CRYO DMG BONUS": "CryoDMGBonus",
  "ANEMO DMG BONUS": "AnemoDMGBonus",
  "GEO DMG BONUS": "GeoDMGBonus",
  "DENDRO DMG BONUS": "DendroDMGBonus",
  "PHYSICAL DMG BONUS": "PhysicalDMGBonus",
};

/** Minimum stat floors for character factory (decimal: 0.05 = 5% crit, 0.5 = 50% cdmg, 1.0 = 100% er) */
const CHARACTER_STAT_MINIMA: Partial<Record<StatType, number>> = {
  CritRate: 0.05,
  CritDMG: 0.5,
  EnergyRecharge: 1.0,
};

const normalizeStatName = (value: string): string =>
  value
    .toUpperCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toSupportedStatType = (value: string | null | undefined): StatType | null => {
  if (!value) return null;
  const normalized = normalizeStatName(value);
  const mapped = STAT_NAME_TO_TYPE[normalized];
  if (mapped && STAT_TYPE_SET.has(mapped)) {
    return mapped;
  }
  return null;
};

const parseScalar = (value: string | number | null | undefined): ParsedScalar | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return { value, explicitPercent: false };
  }

  const raw = value.trim();
  if (!raw) return null;

  const explicitPercent = raw.includes("%");
  const normalized = raw.replace(/,/g, "").replace(/%/g, "").trim();
  if (!normalized) return null;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return { value: parsed, explicitPercent };
};

const toStatValue = (statType: StatType, value: string | number | null | undefined): number | null => {
  const parsed = parseScalar(value);
  if (!parsed) return null;
  if (parsed.explicitPercent || isPercentStat(statType)) {
    return parsed.value / 100;
  }
  return parsed.value;
};

const withStat = (
  table: StatTableLike,
  statType: StatType | null,
  value: string | number | null | undefined,
) => {
  if (!statType) return;
  const parsed = toStatValue(statType, value);
  if (!Number.isFinite(parsed)) return;
  table[statType] = (table[statType] || 0) + (parsed as number);
};

const withBaseStat = (table: StatTableLike, statType: StatType, value: string | null | undefined) => {
  const parsed = parseScalar(value);
  if (!parsed) return;
  table[statType] = (table[statType] || 0) + parsed.value;
};

const applyCharacterStatMinima = (table: StatTableLike): void => {
  for (const [stat, min] of Object.entries(CHARACTER_STAT_MINIMA) as [StatType, number][]) {
    const curr = table[stat] ?? 0;
    if (curr < min) table[stat] = min;
  }
};

const toCharacterRawRows = (baseStats: CharacterBaseStat[]): RawFactoryRow[] =>
  baseStats.map((row, index) => {
    const table: StatTableLike = {};
    withBaseStat(table, "BaseHP", row.BaseHP);
    withBaseStat(table, "BaseATK", row.BaseATK);
    withBaseStat(table, "BaseDEF", row.BaseDEF);
    withStat(table, toSupportedStatType(row.AscensionStatType), row.AscensionStatValue);
    applyCharacterStatMinima(table);

    return {
      level: row.LVL,
      ascensionPhase: Number.isFinite(row.AscensionPhase) ? row.AscensionPhase : index,
      table,
    };
  });

const toWeaponRawRows = (baseStats: WeaponBaseStat[]): RawFactoryRow[] =>
  baseStats.map((row, index) => {
    const table: StatTableLike = {};
    withBaseStat(table, "BaseATK", row.base_atk);
    withStat(table, toSupportedStatType(row.sub_stat_type), row.sub_stat_value);

    return {
      level: row.level,
      ascensionPhase: Number.isFinite(row.ascension_phase) ? (row.ascension_phase as number) : index,
      table,
    };
  });

const sortRows = (rows: RawFactoryRow[]): RawFactoryRow[] =>
  [...rows].sort((a, b) => {
    const aLevel = Number(a.level);
    const bLevel = Number(b.level);
    const levelDiff = (Number.isFinite(aLevel) ? aLevel : 0) - (Number.isFinite(bLevel) ? bLevel : 0);
    if (levelDiff !== 0) return levelDiff;
    return a.ascensionPhase - b.ascensionPhase;
  });

const buildLabelByLevel = (rows: RawFactoryRow[], row: RawFactoryRow, indexWithinLevel: number): string => {
  const duplicates = rows.filter((item) => item.level === row.level).length;
  if (duplicates <= 1) {
    return row.level;
  }

  if (indexWithinLevel === 0) {
    return `${row.level} (Unascended)`;
  }
  if (indexWithinLevel === 1) {
    return `${row.level} (Ascended)`;
  }
  return `${row.level} (Ascended ${indexWithinLevel})`;
};

const toFactoryRows = (rows: RawFactoryRow[]): FactoryStatRow[] => {
  const sorted = sortRows(rows);
  const seenByLevel = new Map<string, number>();

  return sorted.map((row) => {
    const indexWithinLevel = seenByLevel.get(row.level) || 0;
    seenByLevel.set(row.level, indexWithinLevel + 1);

    return {
      label: buildLabelByLevel(sorted, row, indexWithinLevel),
      level: row.level,
      ascensionPhase: row.ascensionPhase,
      table: row.table,
    };
  });
};

export const buildCharacterFactoryStatRows = (baseStats: CharacterBaseStat[]): FactoryStatRow[] =>
  toFactoryRows(toCharacterRawRows(baseStats || []));

export const buildWeaponFactoryStatRows = (baseStats: WeaponBaseStat[]): FactoryStatRow[] =>
  toFactoryRows(toWeaponRawRows(baseStats || []));
