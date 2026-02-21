import { StatType } from "../types";
import { ArtifactPiece, ArtifactRollQuality, ArtifactType } from "./types";
import {
  MAIN_STAT_VALUES_FIXTURE,
  SUBSTAT_ROLL_TIERS_FIXTURE,
} from "./fixtureData";

export const ARTIFACT_TYPES: ArtifactType[] = [
  "flower",
  "feather",
  "sands",
  "goblet",
  "circlet",
];

export const POSSIBLE_SANDS_STATS: StatType[] = [
  "HPPercent",
  "ATKPercent",
  "DEFPercent",
  "ElementalMastery",
  "EnergyRecharge",
];

export const POSSIBLE_GOBLET_STATS: StatType[] = [
  "HPPercent",
  "ATKPercent",
  "DEFPercent",
  "ElementalMastery",
  "PyroDMGBonus",
  "CryoDMGBonus",
  "GeoDMGBonus",
  "DendroDMGBonus",
  "ElectroDMGBonus",
  "HydroDMGBonus",
  "AnemoDMGBonus",
  "PhysicalDMGBonus",
];

export const POSSIBLE_CIRCLET_STATS: StatType[] = [
  "HPPercent",
  "ATKPercent",
  "DEFPercent",
  "ElementalMastery",
  "CritRate",
  "CritDMG",
  "HealingBonus",
];

export const POSSIBLE_SUB_STATS: StatType[] = [
  "HPPercent",
  "FlatHP",
  "ATKPercent",
  "FlatATK",
  "DEFPercent",
  "FlatDEF",
  "ElementalMastery",
  "CritRate",
  "CritDMG",
  "EnergyRecharge",
];

export const KQMC_SUBSTAT_ORDER: StatType[] = [...POSSIBLE_SUB_STATS];

const MAIN_STAT_OPTIONS: Record<ArtifactType, StatType[]> = {
  flower: ["FlatHP"],
  feather: ["FlatATK"],
  sands: POSSIBLE_SANDS_STATS,
  goblet: POSSIBLE_GOBLET_STATS,
  circlet: POSSIBLE_CIRCLET_STATS,
};

const MAIN_STAT_VALUES_TABLE = MAIN_STAT_VALUES_FIXTURE;
const SUBSTAT_ROLL_TIERS_TABLE = SUBSTAT_ROLL_TIERS_FIXTURE;

export const KQMC_SUBSTAT_LABELS: Record<StatType, string> = {
  BaseHP: "Base HP",
  FlatHP: "Flat HP",
  HPPercent: "HP%",
  BaseATK: "Base ATK",
  FlatATK: "Flat ATK",
  ATKPercent: "ATK%",
  BaseDEF: "Base DEF",
  FlatDEF: "Flat DEF",
  DEFPercent: "DEF%",
  ElementalMastery: "EM",
  CritRate: "CR",
  CritDMG: "CD",
  EnergyRecharge: "ER",
  DMGBonus: "DMG Bonus",
  ElementalDMGBonus: "Elemental DMG Bonus",
  PyroDMGBonus: "Pyro DMG Bonus",
  CryoDMGBonus: "Cryo DMG Bonus",
  GeoDMGBonus: "Geo DMG Bonus",
  DendroDMGBonus: "Dendro DMG Bonus",
  ElectroDMGBonus: "Electro DMG Bonus",
  HydroDMGBonus: "Hydro DMG Bonus",
  AnemoDMGBonus: "Anemo DMG Bonus",
  PhysicalDMGBonus: "Physical DMG Bonus",
  NormalATKDMGBonus: "Normal ATK DMG Bonus",
  ChargeATKDMGBonus: "Charge ATK DMG Bonus",
  PlungeATKDMGBonus: "Plunge ATK DMG Bonus",
  SkillDMGBonus: "Skill DMG Bonus",
  BurstDMGBonus: "Burst DMG Bonus",
  HealingBonus: "Healing Bonus",
  None: "None",
  ReactionBonus: "Reaction Bonus",
  DefReduction: "DEF Reduction",
  DefIgnore: "DEF Ignore",
  PyroResistanceReduction: "Pyro RES Shred",
  HydroResistanceReduction: "Hydro RES Shred",
  ElectroResistanceReduction: "Electro RES Shred",
  CryoResistanceReduction: "Cryo RES Shred",
  AnemoResistanceReduction: "Anemo RES Shred",
  GeoResistanceReduction: "Geo RES Shred",
  DendroResistanceReduction: "Dendro RES Shred",
  PhysicalResistanceReduction: "Physical RES Shred",
};

export const isValidSubstatType = (statType: StatType): boolean =>
  POSSIBLE_SUB_STATS.includes(statType);

export const isValidMainStatForSlot = (
  artifactType: ArtifactType,
  statType: StatType,
): boolean => MAIN_STAT_OPTIONS[artifactType].includes(statType);

export const rollQualityMultiplier = (quality: ArtifactRollQuality): number => {
  switch (quality) {
    case "MAX":
      return 1.0;
    case "HIGH":
      return 0.9;
    case "MID":
      return 0.8;
    case "LOW":
      return 0.7;
    case "AVG":
      return (1.0 + 0.9 + 0.8 + 0.7) / 4.0;
    default:
      return 1.0;
  }
};

export const maxRollsFor = (artifact: ArtifactPiece): number => {
  const baseSubstats = artifact.rarity - 1;
  const upgrades = Math.floor(artifact.level / 4);
  return baseSubstats + upgrades;
};

export const maxRollsForGiven = (
  artifact: ArtifactPiece,
  substatType: StatType,
  worseCase = false,
): number => {
  if (artifact.mainStat === substatType) return 0;
  const upgrades = Math.floor(artifact.level / 4);
  return worseCase ? upgrades : upgrades + 1;
};

export const getMainStatValueByRarityLevel = (
  stat: StatType,
  rarity: number,
  level: number,
): number => {
  const rarityTable = MAIN_STAT_VALUES_TABLE[rarity];
  if (!rarityTable) return 0;
  const levelTable = rarityTable[level];
  if (!levelTable) return 0;
  return Number(levelTable[stat] || 0);
};

export const getSubStatAverageRoll = (rarity: number, stat: StatType): number => {
  const rarityTiers = SUBSTAT_ROLL_TIERS_TABLE[rarity];
  if (!rarityTiers) return 0;
  const statTiers = rarityTiers[stat];
  if (!Array.isArray(statTiers) || statTiers.length === 0) return 0;
  const sum = statTiers.reduce((acc, value) => acc + value, 0);
  return sum / statTiers.length;
};

export const validateArtifactPieces = (
  flower?: ArtifactPiece,
  feather?: ArtifactPiece,
  sands?: ArtifactPiece,
  goblet?: ArtifactPiece,
  circlet?: ArtifactPiece,
) => {
  if (flower && flower.mainStat !== "FlatHP") {
    throw new Error("Flower must have FlatHP main stat");
  }
  if (feather && feather.mainStat !== "FlatATK") {
    throw new Error("Feather must have FlatATK main stat");
  }
  if (sands && !POSSIBLE_SANDS_STATS.includes(sands.mainStat)) {
    throw new Error("Invalid sands main stat");
  }
  if (goblet && !POSSIBLE_GOBLET_STATS.includes(goblet.mainStat)) {
    throw new Error("Invalid goblet main stat");
  }
  if (circlet && !POSSIBLE_CIRCLET_STATS.includes(circlet.mainStat)) {
    throw new Error("Invalid circlet main stat");
  }
};
