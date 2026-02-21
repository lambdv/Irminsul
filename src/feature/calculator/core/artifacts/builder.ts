import { mergeStatTables } from "../statTable";
import { StatTableLike, StatType } from "../types";
import {
  ARTIFACT_TYPES,
  getMainStatValueByRarityLevel,
  getSubStatAverageRoll,
  isValidSubstatType,
  KQMC_SUBSTAT_ORDER,
  maxRollsFor,
  maxRollsForGiven,
  rollQualityMultiplier,
  validateArtifactPieces,
} from "./constants";
import { ArtifactPiece, ArtifactRollQuality, ArtifactType } from "./types";

type RollKey = `${StatType}|${ArtifactRollQuality}|${number}`;
type ConstraintKey = `${StatType}|${number}`;

const toRollKey = (
  statType: StatType,
  quality: ArtifactRollQuality,
  rarity: number,
): RollKey => `${statType}|${quality}|${rarity}`;

const parseRollKey = (key: RollKey): [StatType, ArtifactRollQuality, number] => {
  const [stat, quality, rarity] = key.split("|");
  return [stat as StatType, quality as ArtifactRollQuality, Number(rarity)];
};

const toConstraintKey = (statType: StatType, rarity: number): ConstraintKey =>
  `${statType}|${rarity}`;

export type ArtifactBuilderRollEntry = {
  stat: StatType;
  quality: ArtifactRollQuality;
  rarity: number;
  count: number;
};

export class ArtifactBuilder {
  flower?: ArtifactPiece;
  feather?: ArtifactPiece;
  sands?: ArtifactPiece;
  goblet?: ArtifactPiece;
  circlet?: ArtifactPiece;
  rolls = new Map<RollKey, number>();
  constraints = new Map<ConstraintKey, number>();
  rollLimit?: number;

  constructor(
    flower?: ArtifactPiece,
    feather?: ArtifactPiece,
    sands?: ArtifactPiece,
    goblet?: ArtifactPiece,
    circlet?: ArtifactPiece,
  ) {
    validateArtifactPieces(flower, feather, sands, goblet, circlet);
    this.flower = flower;
    this.feather = feather;
    this.sands = sands;
    this.goblet = goblet;
    this.circlet = circlet;
    this.initConstraints();
  }

  private pieces(): ArtifactPiece[] {
    return [this.flower, this.feather, this.sands, this.goblet, this.circlet].filter(
      Boolean,
    ) as ArtifactPiece[];
  }

  private getConstraint(statType: StatType, rarity: number): number {
    return this.constraints.get(toConstraintKey(statType, rarity)) || 0;
  }

  private setConstraint(statType: StatType, rarity: number, value: number): void {
    this.constraints.set(toConstraintKey(statType, rarity), value);
  }

  private initConstraints() {
    const pieces = this.pieces();
    for (const stat of KQMC_SUBSTAT_ORDER) {
      for (const piece of pieces) {
        if (piece.mainStat === stat) continue;
        const current = this.getConstraint(stat, piece.rarity);
        this.setConstraint(stat, piece.rarity, current + maxRollsForGiven(piece, stat));
      }
    }
  }

  static kqmc(
    flower?: ArtifactPiece,
    feather?: ArtifactPiece,
    sands?: ArtifactPiece,
    goblet?: ArtifactPiece,
    circlet?: ArtifactPiece,
  ): ArtifactBuilder {
    validateArtifactPieces(flower, feather, sands, goblet, circlet);
    const pieces = [flower, feather, sands, goblet, circlet].filter(Boolean) as ArtifactPiece[];
    for (const piece of pieces) {
      if (piece.rarity <= 3) {
        throw new Error("Rarity must be > 3");
      }
      const validLevelRarity =
        (piece.rarity === 5 && piece.level === 20) ||
        (piece.rarity === 4 && piece.level === 16);
      if (!validLevelRarity) {
        throw new Error("Invalid level/rarity combination");
      }
    }

    const rarities = new Set(pieces.map((piece) => piece.rarity));
    const rollRarity = rarities.size === 1 ? [...rarities][0] : Math.max(...rarities);
    const rollRarities = [...rarities].sort((a, b) => b - a);

    const builder = new ArtifactBuilder(flower, feather, sands, goblet, circlet);

    for (const stat of KQMC_SUBSTAT_ORDER) {
      for (const piece of pieces) {
        if (piece.mainStat === stat) continue;
        const current = builder.substatConstraint(stat, piece.rarity);
        builder.setConstraint(stat, piece.rarity, current + 2);
      }
    }

    const base = pieces.reduce((sum, piece) => sum + maxRollsFor(piece), 0);
    builder.rollLimit = base - pieces.length;

    for (const stat of KQMC_SUBSTAT_ORDER) {
      let remaining = 2;
      for (const rarity of rollRarities) {
        if (remaining <= 0) break;
        const available = Math.max(0, builder.rollsLeftForGiven(stat, "AVG", rarity));
        const next = Math.min(remaining, available);
        if (next <= 0) continue;
        builder.roll(stat, "AVG", rarity, next);
        remaining -= next;
      }
      const current = builder.substatConstraint(stat, rollRarity);
      builder.setConstraint(stat, rollRarity, current + 2);
    }

    return builder;
  }

  static kqmAll5Star(
    sandsMain: StatType,
    gobletMain: StatType,
    circletMain: StatType,
  ): ArtifactBuilder {
    return ArtifactBuilder.kqmc(
      { type: "flower", rarity: 5, level: 20, mainStat: "FlatHP" },
      { type: "feather", rarity: 5, level: 20, mainStat: "FlatATK" },
      { type: "sands", rarity: 5, level: 20, mainStat: sandsMain },
      { type: "goblet", rarity: 5, level: 20, mainStat: gobletMain },
      { type: "circlet", rarity: 5, level: 20, mainStat: circletMain },
    );
  }

  static kqm4StarPlusOne5Star(
    sandsMain: StatType,
    gobletMain: StatType,
    circletMain: StatType,
    fiveStarSlot: ArtifactType,
  ): ArtifactBuilder {
    if (!ARTIFACT_TYPES.includes(fiveStarSlot)) {
      throw new Error("Invalid five star slot");
    }

    const toPiece = (slot: ArtifactType, mainStat: StatType): ArtifactPiece => {
      const rarity = slot === fiveStarSlot ? 5 : 4;
      const level = rarity === 5 ? 20 : 16;
      return { type: slot, rarity, level, mainStat };
    };

    const builder = ArtifactBuilder.kqmc(
      toPiece("flower", "FlatHP"),
      toPiece("feather", "FlatATK"),
      toPiece("sands", sandsMain),
      toPiece("goblet", gobletMain),
      toPiece("circlet", circletMain),
    );

    for (const stat of KQMC_SUBSTAT_ORDER) {
      builder.unroll(stat, "AVG", 5, 2);
      const maxShiftToFourStar = Math.max(0, builder.rollsLeftForGiven(stat, "AVG", 4));
      const shifted = Math.min(2, maxShiftToFourStar);
      if (shifted > 0) {
        builder.roll(stat, "AVG", 4, shifted);
      }
      const remaining = 2 - shifted;
      if (remaining > 0) {
        builder.roll(stat, "AVG", 5, remaining);
      }
    }

    return builder;
  }

  build(): StatTableLike {
    return mergeStatTables(this.mainStats(), this.subStats());
  }

  mainStats(): StatTableLike {
    const table: StatTableLike = {};
    for (const piece of this.pieces()) {
      const value = getMainStatValueByRarityLevel(piece.mainStat, piece.rarity, piece.level);
      table[piece.mainStat] = (table[piece.mainStat] || 0) + value;
    }
    return table;
  }

  subStats(): StatTableLike {
    const table: StatTableLike = {};
    for (const [key, count] of this.rolls.entries()) {
      if (!count) continue;
      const [stat, quality, rarity] = parseRollKey(key);
      const base = getSubStatAverageRoll(rarity, stat);
      const value = base * rollQualityMultiplier(quality) * count;
      table[stat] = (table[stat] || 0) + value;
    }
    return table;
  }

  roll(
    substatValue: StatType,
    quality: ArtifactRollQuality,
    rarity: number,
    num: number,
  ): void {
    if (!isValidSubstatType(substatValue)) {
      throw new Error("Invalid substat type");
    }
    const current = this.currentRollsForGiven(substatValue, quality, rarity);
    if (current + num > this.substatConstraint(substatValue, rarity)) {
      throw new Error("Exceeds constraint");
    }
    const key = toRollKey(substatValue, quality, rarity);
    this.rolls.set(key, (this.rolls.get(key) || 0) + num);
  }

  unroll(
    substatValue: StatType,
    quality: ArtifactRollQuality,
    rarity: number,
    num: number,
  ): void {
    if (!isValidSubstatType(substatValue)) {
      throw new Error("Invalid substat type");
    }
    const key = toRollKey(substatValue, quality, rarity);
    const current = this.rolls.get(key) || 0;
    if (current < num) return;
    const next = current - num;
    if (next <= 0) {
      this.rolls.delete(key);
      return;
    }
    this.rolls.set(key, next);
  }

  currentRolls(): number {
    return Array.from(this.rolls.values()).reduce((sum, value) => sum + value, 0);
  }

  currentRollsForGiven(
    statType: StatType,
    quality: ArtifactRollQuality,
    rarity: number,
  ): number {
    return this.rolls.get(toRollKey(statType, quality, rarity)) || 0;
  }

  maxRolls(): number {
    if (Number.isFinite(this.rollLimit)) {
      return this.rollLimit as number;
    }
    return this.pieces().reduce((sum, piece) => sum + maxRollsFor(piece), 0);
  }

  substatConstraint(statType: StatType, rarity: number): number {
    return this.getConstraint(statType, rarity);
  }

  substatConstraintTotal(statType: StatType): number {
    let total = 0;
    for (const [key, value] of this.constraints.entries()) {
      const [stat] = key.split("|");
      if (stat === statType) {
        total += value;
      }
    }
    return total;
  }

  rollsLeft(): number {
    return this.maxRolls() - this.currentRolls();
  }

  rollsLeftForGiven(
    statType: StatType,
    quality: ArtifactRollQuality,
    rarity: number,
  ): number {
    return this.substatConstraint(statType, rarity) - this.currentRollsForGiven(statType, quality, rarity);
  }

  rollEntries(): ArtifactBuilderRollEntry[] {
    const entries: ArtifactBuilderRollEntry[] = [];
    for (const [key, count] of this.rolls.entries()) {
      const [stat, quality, rarity] = parseRollKey(key);
      entries.push({ stat, quality, rarity, count });
    }
    return entries;
  }

  totalRollsByStat(): Map<StatType, number> {
    const counts = new Map<StatType, number>();
    for (const { stat, count } of this.rollEntries()) {
      counts.set(stat, (counts.get(stat) || 0) + count);
    }
    return counts;
  }
}
