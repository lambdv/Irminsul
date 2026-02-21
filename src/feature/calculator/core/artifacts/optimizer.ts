import { executeRotation } from "../engine";
import { mergeStatTables, normalizeStatTable } from "../statTable";
import {
  RotationPayload,
  RotationSpec,
  StatTableLike,
  StatType,
} from "../types";
import {
  getMainStatValueByRarityLevel,
  getSubStatAverageRoll,
  KQMC_SUBSTAT_LABELS,
  KQMC_SUBSTAT_ORDER,
  POSSIBLE_CIRCLET_STATS,
  POSSIBLE_GOBLET_STATS,
  POSSIBLE_SANDS_STATS,
  POSSIBLE_SUB_STATS,
} from "./constants";
import { ArtifactBuilder } from "./builder";
import {
  ArtifactType,
  KqmcMode,
  KqmcOptimizerResult,
  KqmcRow,
} from "./types";

const SILENT_LOGGER = {
  warn: () => {},
};

type SlotRarityLevel = {
  rarity: number;
  level: number;
};

type SlotRarityByType = Record<ArtifactType, SlotRarityLevel>;

const normalizeEnergyRechargeRequirement = (value: unknown): number => {
  if (!Number.isFinite(value)) return 1.0;
  return Math.max(0, value as number);
};

const buildSlotRarityByMode = (
  mode: KqmcMode,
  fiveStarSlot: ArtifactType,
): SlotRarityByType => {
  if (mode === "5-star") {
    return {
      flower: { rarity: 5, level: 20 },
      feather: { rarity: 5, level: 20 },
      sands: { rarity: 5, level: 20 },
      goblet: { rarity: 5, level: 20 },
      circlet: { rarity: 5, level: 20 },
    };
  }

  const base: SlotRarityByType = {
    flower: { rarity: 4, level: 16 },
    feather: { rarity: 4, level: 16 },
    sands: { rarity: 4, level: 16 },
    goblet: { rarity: 4, level: 16 },
    circlet: { rarity: 4, level: 16 },
  };
  base[fiveStarSlot] = { rarity: 5, level: 20 };
  return base;
};

const evaluateRotationDamage = (
  table: StatTableLike,
  rotation: RotationSpec,
  buffTablesById: Record<string, StatTableLike>,
): number => executeRotation(table, rotation, buffTablesById, SILENT_LOGGER);

const statGradients = (
  base: StatTableLike,
  rotation: RotationSpec,
  buffTablesById: Record<string, StatTableLike>,
  slopes: Map<StatType, number>,
): Map<StatType, number> => {
  const gradients = new Map<StatType, number>();
  const before = evaluateRotationDamage(base, rotation, buffTablesById);

  for (const [stat, delta] of slopes.entries()) {
    const direction: StatTableLike = { [stat]: delta };
    const adjusted = mergeStatTables(base, direction);
    const after = evaluateRotationDamage(adjusted, rotation, buffTablesById);
    gradients.set(stat, (after - before) / delta);
  }

  return gradients;
};

const reluHeuristic = (
  base: StatTableLike,
  rotation: RotationSpec,
  buffTablesById: Record<string, StatTableLike>,
  slopes: Map<StatType, number>,
): Set<StatType> => {
  const gradients = statGradients(base, rotation, buffTablesById, slopes);
  const output = new Set<StatType>();
  for (const [stat, gradient] of gradients.entries()) {
    if (gradient > 0) {
      output.add(stat);
    }
  }
  return output;
};

const pickMainStatPool = (effectiveSet: Set<StatType>, fallback: StatType[]): StatType[] => {
  const subset = fallback.filter((stat) => effectiveSet.has(stat));
  return subset.length > 0 ? subset : fallback;
};

const globalKqmcMainStatOptimizer = (
  base: StatTableLike,
  rotation: RotationSpec,
  buffTablesById: Record<string, StatTableLike>,
  slotRarityByType: SlotRarityByType,
): [StatType, StatType, StatType] => {
  const pool = new Set<StatType>([
    ...POSSIBLE_SANDS_STATS,
    ...POSSIBLE_GOBLET_STATS,
    ...POSSIBLE_CIRCLET_STATS,
  ]);
  const slopes = new Map<StatType, number>();
  for (const stat of pool) {
    slopes.set(stat, 1.0);
  }

  const effectiveSet = reluHeuristic(base, rotation, buffTablesById, slopes);
  const sandsPool = pickMainStatPool(effectiveSet, POSSIBLE_SANDS_STATS);
  const gobletPool = pickMainStatPool(effectiveSet, POSSIBLE_GOBLET_STATS);
  const circletPool = pickMainStatPool(effectiveSet, POSSIBLE_CIRCLET_STATS);

  let bestCombo: [StatType, StatType, StatType] = [
    sandsPool[0],
    gobletPool[0],
    circletPool[0],
  ];
  let bestValue = Number.NEGATIVE_INFINITY;

  for (const sands of sandsPool) {
    for (const goblet of gobletPool) {
      for (const circlet of circletPool) {
        const tables: StatTableLike = {
          [sands]: getMainStatValueByRarityLevel(
            sands,
            slotRarityByType.sands.rarity,
            slotRarityByType.sands.level,
          ),
          [goblet]: getMainStatValueByRarityLevel(
            goblet,
            slotRarityByType.goblet.rarity,
            slotRarityByType.goblet.level,
          ),
          [circlet]: getMainStatValueByRarityLevel(
            circlet,
            slotRarityByType.circlet.rarity,
            slotRarityByType.circlet.level,
          ),
        };
        const value = evaluateRotationDamage(
          mergeStatTables(base, tables),
          rotation,
          buffTablesById,
        );
        if (value > bestValue) {
          bestValue = value;
          bestCombo = [sands, goblet, circlet];
        }
      }
    }
  }

  return bestCombo;
};

const getRollRarityCandidates = (mode: KqmcMode): number[] =>
  mode === "5-star" ? [5] : [5, 4];

const pickBestErRarity = (
  builder: ArtifactBuilder,
  candidates: number[],
): number | null => {
  const available = candidates
    .filter((rarity) => builder.rollsLeftForGiven("EnergyRecharge", "AVG", rarity) > 0)
    .sort(
      (a, b) =>
        getSubStatAverageRoll(b, "EnergyRecharge") -
        getSubStatAverageRoll(a, "EnergyRecharge"),
    );
  return available.length > 0 ? available[0] : null;
};

const buildOptimizerRows = (
  builder: ArtifactBuilder,
  baselineByStat: Map<StatType, number>,
  rarities: number[],
): {
  rows: KqmcRow[];
  totalConstraint: number;
  totalDistributedExtra: number;
  totalDistributed: number;
} => {
  const rows: KqmcRow[] = [];
  const subStats = builder.subStats();
  const finalByStat = builder.totalRollsByStat();

  let totalDistributedExtra = 0;
  let totalDistributed = 0;
  const baselineTotal = Array.from(baselineByStat.values()).reduce((sum, value) => sum + value, 0);

  for (const stat of KQMC_SUBSTAT_ORDER) {
    const baseline = baselineByStat.get(stat) || 0;
    const distributedTotal = finalByStat.get(stat) || 0;
    const distributedExtra = Math.max(0, distributedTotal - baseline);

    let currentCapacity = distributedTotal;
    for (const rarity of rarities) {
      currentCapacity += Math.max(0, builder.rollsLeftForGiven(stat, "AVG", rarity));
    }
    const constraint = Math.max(0, currentCapacity - baseline);

    totalDistributedExtra += distributedExtra;
    totalDistributed += distributedTotal;

    rows.push({
      stat,
      label: KQMC_SUBSTAT_LABELS[stat] || stat,
      constraint,
      distributedExtra,
      distributedTotal,
      value: Number(subStats[stat] || 0),
    });
  }

  return {
    rows,
    totalConstraint: Math.max(0, builder.maxRolls() - baselineTotal),
    totalDistributedExtra,
    totalDistributed,
  };
};

export class KqmcOptimizationError extends Error {
  code: "UNMET_ER" | "INVALID_INPUT";

  constructor(code: "UNMET_ER" | "INVALID_INPUT", message: string) {
    super(message);
    this.code = code;
  }
}

export const optimizeKqmcArtifacts = ({
  base,
  rotationPayload,
  energyRechargeRequirement,
  mode = "5-star",
  fiveStarSlot = "goblet",
}: {
  base: StatTableLike;
  rotationPayload: RotationPayload;
  energyRechargeRequirement?: number;
  mode?: KqmcMode;
  fiveStarSlot?: ArtifactType;
}): KqmcOptimizerResult => {
  if (!rotationPayload?.rotation || !Array.isArray(rotationPayload.rotation.actions)) {
    throw new KqmcOptimizationError("INVALID_INPUT", "Missing rotation payload");
  }

  const normalizedBase = normalizeStatTable(base || {});
  const baseEnergyRecharge = normalizedBase.EnergyRecharge;
  if (!Number.isFinite(baseEnergyRecharge) || baseEnergyRecharge <= 0) {
    normalizedBase.EnergyRecharge = 1.0;
  }
  const normalizedBuffTables = rotationPayload.buffTablesById || {};
  const requiredEr = normalizeEnergyRechargeRequirement(energyRechargeRequirement);
  const slotRarityByType = buildSlotRarityByMode(mode, fiveStarSlot);
  const [sandsMain, gobletMain, circletMain] = globalKqmcMainStatOptimizer(
    normalizedBase,
    rotationPayload.rotation,
    normalizedBuffTables,
    slotRarityByType,
  );

  const builder =
    mode === "5-star"
      ? ArtifactBuilder.kqmAll5Star(sandsMain, gobletMain, circletMain)
      : ArtifactBuilder.kqm4StarPlusOne5Star(
          sandsMain,
          gobletMain,
          circletMain,
          fiveStarSlot,
        );
  const baselineByStat = builder.totalRollsByStat();
  const rarities = getRollRarityCandidates(mode);

  while (true) {
    const current = mergeStatTables(normalizedBase, builder.build());
    if ((current.EnergyRecharge || 0) >= requiredEr) break;
    if (builder.rollsLeft() <= 0) {
      throw new KqmcOptimizationError(
        "UNMET_ER",
        "Energy Recharge requirements cannot be met with substats alone",
      );
    }
    const erRarity = pickBestErRarity(builder, rarities);
    if (erRarity === null) {
      throw new KqmcOptimizationError(
        "UNMET_ER",
        "Energy Recharge requirements cannot be met with substats alone",
      );
    }
    builder.roll("EnergyRecharge", "AVG", erRarity, 1);
  }

  while (builder.rollsLeft() > 0) {
    let best: { stat: StatType; rarity: number; value: number } | null = null;

    for (const stat of POSSIBLE_SUB_STATS) {
      for (const rarity of rarities) {
        if (builder.rollsLeftForGiven(stat, "AVG", rarity) <= 0) continue;
        try {
          builder.roll(stat, "AVG", rarity, 1);
        } catch {
          continue;
        }
        const candidate = evaluateRotationDamage(
          mergeStatTables(normalizedBase, builder.build()),
          rotationPayload.rotation,
          normalizedBuffTables,
        );
        builder.unroll(stat, "AVG", rarity, 1);

        if (!best || candidate > best.value) {
          best = { stat, rarity, value: candidate };
        }
      }
    }

    if (!best) break;
    builder.roll(best.stat, "AVG", best.rarity, 1);
  }

  const mainStats = builder.mainStats();
  const subStats = builder.subStats();
  const combined = mergeStatTables(normalizedBase, mainStats, subStats);
  const damage = evaluateRotationDamage(
    combined,
    rotationPayload.rotation,
    normalizedBuffTables,
  );
  const rowTotals = buildOptimizerRows(builder, baselineByStat, rarities);

  return {
    mode,
    fiveStarSlot,
    damage,
    selectedMainStats: {
      flower: "FlatHP",
      feather: "FlatATK",
      sands: sandsMain,
      goblet: gobletMain,
      circlet: circletMain,
    },
    mainStats,
    subStats,
    combined,
    rows: rowTotals.rows,
    totalConstraint: rowTotals.totalConstraint,
    totalDistributedExtra: rowTotals.totalDistributedExtra,
    totalDistributed: rowTotals.totalDistributed,
  };
};
