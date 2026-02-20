export const STAT_TYPES = [
  "BaseHP",
  "FlatHP",
  "HPPercent",
  "BaseATK",
  "FlatATK",
  "ATKPercent",
  "BaseDEF",
  "FlatDEF",
  "DEFPercent",
  "ElementalMastery",
  "CritRate",
  "CritDMG",
  "EnergyRecharge",
  "DMGBonus",
  "ElementalDMGBonus",
  "PyroDMGBonus",
  "CryoDMGBonus",
  "GeoDMGBonus",
  "DendroDMGBonus",
  "ElectroDMGBonus",
  "HydroDMGBonus",
  "AnemoDMGBonus",
  "PhysicalDMGBonus",
  "NormalATKDMGBonus",
  "ChargeATKDMGBonus",
  "PlungeATKDMGBonus",
  "SkillDMGBonus",
  "BurstDMGBonus",
  "HealingBonus",
  "None",
  "ReactionBonus",
  "DefReduction",
  "DefIgnore",
  "PyroResistanceReduction",
  "HydroResistanceReduction",
  "ElectroResistanceReduction",
  "CryoResistanceReduction",
  "AnemoResistanceReduction",
  "GeoResistanceReduction",
  "DendroResistanceReduction",
  "PhysicalResistanceReduction",
] as const;

export type StatType = (typeof STAT_TYPES)[number];

export type StatTableLike = Partial<Record<StatType, number>>;

export type DamageType =
  | "Normal"
  | "Charged"
  | "Plunging"
  | "Skill"
  | "Burst"
  | "None";

export type Element =
  | "Pyro"
  | "Hydro"
  | "Electro"
  | "Anemo"
  | "Geo"
  | "Dendro"
  | "Cryo"
  | "Physical"
  | "None";

export type BaseScaling = "ATK" | "DEF" | "HP";

export type Amplifier = "Forward" | "Reverse" | "None";

export type DamageActionSpec = {
  id: string;
  label: string;
  element: Element;
  damageType: DamageType;
  motionValue: number;
  instances?: number;
  scaling?: BaseScaling;
  amplifier?: Amplifier;
  buffTableNodeIds?: string[];
};

export type RotationSpec = {
  id: string;
  actions: DamageActionSpec[];
};

export type DamageCompute = (
  base: StatTableLike,
  linkedBuffs?: StatTableLike[],
) => number;

export type ActionPayload = {
  spec: DamageActionSpec;
  buffTablesById: Record<string, StatTableLike>;
};

