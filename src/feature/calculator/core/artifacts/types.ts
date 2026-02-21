import { StatTableLike, StatType } from "../types";

export type ArtifactType = "flower" | "feather" | "sands" | "goblet" | "circlet";

export type ArtifactRollQuality = "MAX" | "HIGH" | "MID" | "LOW" | "AVG";

export type ArtifactPiece = {
  type: ArtifactType;
  mainStat: StatType;
  level: number;
  rarity: number;
};

export type KqmcMode = "5-star" | "4+1";

export type KqmcRow = {
  stat: StatType;
  label: string;
  constraint: number;
  distributedExtra: number;
  distributedTotal: number;
  value: number;
};

export type KqmcSelectedMainStats = {
  flower: StatType;
  feather: StatType;
  sands: StatType;
  goblet: StatType;
  circlet: StatType;
};

export type KqmcOptimizerResult = {
  mode: KqmcMode;
  fiveStarSlot: ArtifactType;
  damage: number;
  selectedMainStats: KqmcSelectedMainStats;
  mainStats: StatTableLike;
  subStats: StatTableLike;
  combined: StatTableLike;
  rows: KqmcRow[];
  totalConstraint: number;
  totalDistributedExtra: number;
  totalDistributed: number;
};
