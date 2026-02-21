type BaseScaling = "ATK" | "DEF" | "HP";
type Amplifier = "Forward" | "Reverse" | "None";

export class StatTable extends Map<string, number> {
  constructor(...kv: [string, number][]) {
    super();
    for (const [k, v] of kv) {
      this.set(k, (this.get(k) || 0) + v);
    }
  }

  override get(key: string): number {
    return super.get(key) || 0;
  }
}

const totalAttack = (s: StatTable) =>
  s.get("BaseATK") * (1 + s.get("ATKPercent")) + s.get("FlatATK");
const totalDefense = (s: StatTable) =>
  s.get("BaseDEF") * (1 + s.get("DEFPercent")) + s.get("FlatDEF");
const totalHealth = (s: StatTable) =>
  s.get("BaseHP") * (1 + s.get("HPPercent")) + s.get("FlatHP");

const avgCritMultiplier = (s: StatTable) => {
  const cr = Math.max(0, Math.min(1, s.get("CritRate")));
  return 1 + cr * s.get("CritDMG");
};

const withBuffs = (base: StatTable, buffs: StatTable): StatTable => {
  const merged = new StatTable(...(Array.from(base.entries()) as [string, number][]));
  for (const [k, v] of buffs.entries()) {
    merged.set(k, merged.get(k) + v);
  }
  return merged;
};

const elementBonusMap: Record<string, string> = {
  Pyro: "PyroDMGBonus",
  Hydro: "HydroDMGBonus",
  Electro: "ElectroDMGBonus",
  Anemo: "AnemoDMGBonus",
  Geo: "GeoDMGBonus",
  Dendro: "DendroDMGBonus",
  Cryo: "CryoDMGBonus",
  Physical: "PhysicalDMGBonus",
  None: "None",
};
const attackTypeBonusMap: Record<string, string> = {
  Normal: "NormalATKDMGBonus",
  Charged: "ChargeATKDMGBonus",
  Plunging: "PlungeATKDMGBonus",
  Skill: "SkillDMGBonus",
  Burst: "BurstDMGBonus",
  None: "None",
};

const amplifierMultiplier = (amp: number, em: number, reactionBonus: number): number =>
  amp * (1 + (2.78 * em) / (1400 + em) + reactionBonus);

export const calculate_damage = (
  element: string,
  damageType: string,
  scaling: BaseScaling,
  amplifier: Amplifier,
  instances: number,
  motionValue: number,
  character: StatTable,
  buffs?: StatTable,
): number => {
  if (amplifier === "Forward" || amplifier === "Reverse") {
    const valid = new Set(["Pyro", "Hydro", "Cryo", "Anemo"]);
    if (!valid.has(element)) {
      throw new Error(
        `Amplifier ${amplifier} requires Pyro, Hydro, Cryo, or Anemo element`,
      );
    }
  }

  const s = buffs ? withBuffs(character, buffs) : withBuffs(character, new StatTable());
  const scaleValue =
    scaling === "ATK" ? totalAttack(s) : scaling === "DEF" ? totalDefense(s) : totalHealth(s);
  const totalBonus =
    s.get("DMGBonus") +
    s.get("ElementalDMGBonus") +
    s.get(elementBonusMap[element] || "None") +
    s.get(attackTypeBonusMap[damageType] || "None");
  const amp =
    amplifier === "Forward"
      ? amplifierMultiplier(2, s.get("ElementalMastery"), s.get("ReactionBonus"))
      : amplifier === "Reverse"
        ? amplifierMultiplier(1.5, s.get("ElementalMastery"), s.get("ReactionBonus"))
        : 1;
  const crit = avgCritMultiplier(s);
  return scaleValue * motionValue * (1 + totalBonus) * crit * amp * instances;
};

export const dmg_formula =
  (
    element: string,
    damageType: string,
    motionValue: number,
    buffs = new StatTable(),
    instances = 1,
    scaling: BaseScaling = "ATK",
    amplifier: Amplifier = "None",
  ) =>
  (base: StatTable): number =>
    calculate_damage(
      element,
      damageType,
      scaling,
      amplifier,
      instances,
      motionValue,
      base,
      buffs,
    );
