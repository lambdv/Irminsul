import {
  ActionPayload,
  Amplifier,
  ArtifactType,
  BaseScaling,
  DamageActionSpec,
  DamageType,
  Element,
  isPercentStat,
  KqmcMode,
  KqmcOptimizationError,
  RotationPayload,
  STAT_TYPES,
  StatTableLike,
  StatType,
  executeRotation,
  mergeStatTables,
  optimizeKqmcArtifacts,
} from "../core";
import { FactoryStatRow } from "./factoryStatRows";

type LiteGraphLike = {
  registerNodeType: (path: string, nodeType: any) => void;
};

type StatRow = {
  stat: (typeof STAT_TYPES)[number];
  value: number;
};

type DisplayStatRow = {
  stat: (typeof STAT_TYPES)[number];
  label: string;
  value: number;
};

type FactoryEntityType = "character" | "weapon";

type FactoryCatalogEntry = {
  id: string;
  name: string;
  label: string;
};

type FactoryNodeProperties = {
  entityId: string;
  rowLabel: string;
};

type FactoryCatalogCache = {
  data: FactoryCatalogEntry[] | null;
  promise: Promise<FactoryCatalogEntry[]> | null;
  error: string | null;
};

type FactoryRowsCache = {
  data: FactoryStatRow[] | null;
  promise: Promise<FactoryStatRow[]> | null;
  error: string | null;
};

const normalizeRows = (rows: unknown): StatRow[] => {
  if (!Array.isArray(rows)) return [];
  const normalized: StatRow[] = [];
  for (const row of rows) {
    const stat = (row as { stat?: string }).stat;
    const value = (row as { value?: unknown }).value;
    if (!stat || !STAT_TYPES.includes(stat as any)) continue;
    normalized.push({
      stat: stat as StatRow["stat"],
      value: Number.isFinite(value) ? (value as number) : 0,
    });
  }
  return normalized;
};

const rowsToStatTable = (rows: StatRow[]): StatTableLike => {
  const table: StatTableLike = {};
  for (const row of rows) {
    table[row.stat] = (table[row.stat] || 0) + row.value;
  }
  return table;
};

const normalizeStatTable = (table: unknown): StatTableLike => {
  if (!table || typeof table !== "object") return {};
  const normalized: StatTableLike = {};
  for (const stat of STAT_TYPES) {
    const value = (table as Record<string, unknown>)[stat];
    if (!Number.isFinite(value)) continue;
    normalized[stat] = value as number;
  }
  return normalized;
};

const toDisplayStatLabel = (stat: (typeof STAT_TYPES)[number]): string =>
  stat
    .replace(/Percent/g, "%")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

const formatDisplayStatValue = (value: number, stat?: StatType): string => {
  if (!Number.isFinite(value)) return "0";
  if (stat && isPercentStat(stat)) {
    const pct = value * 100;
    const abs = Math.abs(pct);
    const precision = abs >= 100 ? 1 : abs >= 1 ? 2 : 3;
    return pct.toFixed(precision).replace(/\.?0+$/, "") + "%";
  }
  const abs = Math.abs(value);
  const precision = abs >= 100 ? 1 : abs >= 1 ? 3 : 4;
  return value.toFixed(precision).replace(/\.?0+$/, "");
};

const toDisplayStatRows = (table: StatTableLike): DisplayStatRow[] => {
  const rows: DisplayStatRow[] = [];
  for (const stat of STAT_TYPES) {
    const value = table[stat];
    if (!Number.isFinite(value)) continue;
    if (Math.abs(value as number) < 1e-12) continue;
    rows.push({
      stat,
      label: toDisplayStatLabel(stat),
      value: value as number,
    });
  }
  return rows;
};

const ELEMENT_OPTIONS: Element[] = [
  "Pyro",
  "Hydro",
  "Electro",
  "Anemo",
  "Geo",
  "Dendro",
  "Cryo",
  "Physical",
  "None",
];
const DAMAGE_TYPE_OPTIONS: DamageType[] = [
  "Normal",
  "Charged",
  "Plunging",
  "Skill",
  "Burst",
  "None",
];
const SCALING_OPTIONS: BaseScaling[] = ["ATK", "DEF", "HP"];
const AMPLIFIER_OPTIONS: Amplifier[] = ["None", "Forward", "Reverse"];
const FACTORY_ENDPOINTS: Record<
  FactoryEntityType,
  {
    list: string;
    byId: (id: string) => string;
    entityWidgetLabel: string;
  }
> = {
  character: {
    list: "/api/calc/factory/characters",
    byId: (id: string) => `/api/calc/factory/characters/${id}`,
    entityWidgetLabel: "character",
  },
  weapon: {
    list: "/api/calc/factory/weapons",
    byId: (id: string) => `/api/calc/factory/weapons/${id}`,
    entityWidgetLabel: "weapon",
  },
};

const factoryCatalogCaches: Record<FactoryEntityType, FactoryCatalogCache> = {
  character: { data: null, promise: null, error: null },
  weapon: { data: null, promise: null, error: null },
};

const factoryRowsCaches: Record<FactoryEntityType, Map<string, FactoryRowsCache>> = {
  character: new Map<string, FactoryRowsCache>(),
  weapon: new Map<string, FactoryRowsCache>(),
};

type KqmcNodeProperties = {
  mode: KqmcMode;
  fiveStarSlot: ArtifactType;
  locked: boolean;
};

const KQMC_MODE_OPTIONS: KqmcMode[] = ["5-star", "4+1"];
const KQMC_FIVE_STAR_SLOT_OPTIONS: ArtifactType[] = [
  "flower",
  "feather",
  "sands",
  "goblet",
  "circlet",
];

const normalizeKqmcProperties = (properties: unknown): KqmcNodeProperties => {
  const source = (properties || {}) as Partial<KqmcNodeProperties>;
  const mode = KQMC_MODE_OPTIONS.includes(source.mode as KqmcMode)
    ? (source.mode as KqmcMode)
    : "5-star";
  const fiveStarSlot = KQMC_FIVE_STAR_SLOT_OPTIONS.includes(source.fiveStarSlot as ArtifactType)
    ? (source.fiveStarSlot as ArtifactType)
    : "goblet";
  const locked = source.locked === true;
  return { mode, fiveStarSlot, locked };
};

const isRotationPayload = (value: unknown): value is RotationPayload => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as RotationPayload;
  if (!candidate.rotation || typeof candidate.rotation !== "object") return false;
  if (!Array.isArray(candidate.rotation.actions)) return false;
  if (!candidate.buffTablesById || typeof candidate.buffTablesById !== "object") return false;
  return true;
};

const formatDistributedRolls = (extra: number, total: number): string =>
  `+${extra} (${total})`;

let actionNodeKeyCounter = 0;

const toPercentWidgetDisplayValue = (value: number): number => value * 100;

const fromPercentWidgetInputValue = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  const abs = Math.abs(value);
  // Accept both decimal-style inputs (0.3 = 30%) and percent-style inputs (30 = 30%).
  if (abs <= 2) return value;
  return value / 100;
};

const getStableActionNodeKey = (node: any): string => {
  if (typeof node.__actionNodeKey === "string" && node.__actionNodeKey.length > 0) {
    return node.__actionNodeKey;
  }

  const nodeId = node.id;
  if (typeof nodeId === "number" || typeof nodeId === "string") {
    node.__actionNodeKey = `node:${String(nodeId)}`;
    return node.__actionNodeKey;
  }

  actionNodeKeyCounter += 1;
  node.__actionNodeKey = `action:${actionNodeKeyCounter}`;
  return node.__actionNodeKey;
};

const rebuildStatTableWidgets = (node: any) => {
  const rows = normalizeRows(node.properties.rows);
  node.properties.rows = rows;

  const signature = JSON.stringify(rows);
  if (node.__statTableWidgetSignature === signature) return;
  node.__statTableWidgetSignature = signature;

  node.widgets = [];
  node.addWidget("button", "+ Add Row", "", () => {
    node.properties.rows.push({ stat: "BaseATK", value: 0 });
    node.__statTableWidgetSignature = null;
    rebuildStatTableWidgets(node);
    if (node.setDirtyCanvas) node.setDirtyCanvas(true, true);
  });

  rows.forEach((row, index) => {
    node.addWidget(
      "combo",
      `Type ${index + 1}`,
      row.stat,
      (value: (typeof STAT_TYPES)[number]) => {
        row.stat = value;
        node.__statTableWidgetSignature = null;
        rebuildStatTableWidgets(node);
        if (node.setDirtyCanvas) node.setDirtyCanvas(true, true);
      },
      { values: STAT_TYPES },
    );
    const displayValue = isPercentStat(row.stat)
      ? toPercentWidgetDisplayValue(row.value)
      : row.value;
    node.addWidget("number", `Value ${index + 1}`, displayValue, (value: number) => {
      row.value = Number.isFinite(value)
        ? (isPercentStat(row.stat) ? fromPercentWidgetInputValue(value) : value)
        : 0;
      if (node.setDirtyCanvas) node.setDirtyCanvas(true, true);
    });
  });
};

const normalizeFactoryNodeProperties = (properties: unknown): FactoryNodeProperties => {
  const source = (properties || {}) as Partial<FactoryNodeProperties>;
  return {
    entityId: typeof source.entityId === "string" ? source.entityId : "",
    rowLabel: typeof source.rowLabel === "string" ? source.rowLabel : "",
  };
};

const normalizeFactoryTable = (table: unknown): StatTableLike => {
  if (!table || typeof table !== "object") return {};
  const normalized: StatTableLike = {};
  for (const stat of STAT_TYPES) {
    const value = (table as Record<string, unknown>)[stat];
    if (Number.isFinite(value)) {
      normalized[stat] = value as number;
    }
  }
  return normalized;
};

const normalizeFactoryRows = (rows: unknown): FactoryStatRow[] => {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => {
      const input = (row || {}) as Partial<FactoryStatRow>;
      const level = typeof input.level === "string" ? input.level : String(input.level || "");
      const ascensionPhase = Number.isFinite(input.ascensionPhase)
        ? (input.ascensionPhase as number)
        : 0;
      const table = normalizeFactoryTable(input.table);
      const label = typeof input.label === "string" ? input.label : level;

      return {
        label,
        level,
        ascensionPhase,
        table,
      };
    })
    .filter((row) => row.label && row.level)
    .sort((a, b) => {
      const aLevel = Number(a.level);
      const bLevel = Number(b.level);
      const levelDiff = (Number.isFinite(aLevel) ? aLevel : 0) - (Number.isFinite(bLevel) ? bLevel : 0);
      if (levelDiff !== 0) return levelDiff;
      return a.ascensionPhase - b.ascensionPhase;
    });
};

const normalizeFactoryCatalog = (data: unknown): FactoryCatalogEntry[] => {
  if (!Array.isArray(data)) return [];

  const byNameCount = new Map<string, number>();
  const normalizedBase = data
    .map((item) => {
      const entry = (item || {}) as { id?: unknown; name?: unknown };
      const id = typeof entry.id === "string" ? entry.id : "";
      const name = typeof entry.name === "string" ? entry.name : "";
      return { id, name };
    })
    .filter((entry) => entry.id && entry.name);

  for (const entry of normalizedBase) {
    byNameCount.set(entry.name, (byNameCount.get(entry.name) || 0) + 1);
  }

  return normalizedBase.map((entry) => ({
    ...entry,
    label: (byNameCount.get(entry.name) || 0) > 1 ? `${entry.name} (${entry.id})` : entry.name,
  }));
};

const getFactoryRowsCache = (entityType: FactoryEntityType, entityId: string): FactoryRowsCache => {
  const cache = factoryRowsCaches[entityType];
  const existing = cache.get(entityId);
  if (existing) return existing;

  const next: FactoryRowsCache = {
    data: null,
    promise: null,
    error: null,
  };
  cache.set(entityId, next);
  return next;
};

const fetchFactoryCatalog = async (entityType: FactoryEntityType): Promise<FactoryCatalogEntry[]> => {
  const response = await fetch(FACTORY_ENDPOINTS[entityType].list);
  if (!response.ok) {
    throw new Error(`Failed to load ${entityType} list: ${response.status}`);
  }
  const payload = (await response.json()) as { data?: unknown };
  return normalizeFactoryCatalog(payload.data);
};

const fetchFactoryRows = async (
  entityType: FactoryEntityType,
  entityId: string,
): Promise<FactoryStatRow[]> => {
  const response = await fetch(FACTORY_ENDPOINTS[entityType].byId(entityId));
  if (!response.ok) {
    throw new Error(`Failed to load ${entityType} rows: ${response.status}`);
  }
  const payload = (await response.json()) as { data?: { rows?: unknown } };
  return normalizeFactoryRows(payload?.data?.rows);
};

const ensureFactoryCatalog = (node: any, entityType: FactoryEntityType): FactoryCatalogEntry[] => {
  const cache = factoryCatalogCaches[entityType];
  if (cache.data) return cache.data;
  if (cache.promise) return [];

  cache.promise = fetchFactoryCatalog(entityType)
    .then((data) => {
      cache.data = data;
      cache.error = null;
      return data;
    })
    .catch((error) => {
      cache.data = [];
      cache.error = error instanceof Error ? error.message : "Unknown error";
      return [];
    })
    .finally(() => {
      cache.promise = null;
      if (node.setDirtyCanvas) node.setDirtyCanvas(true, true);
    });

  return [];
};

const ensureFactoryRows = (
  node: any,
  entityType: FactoryEntityType,
  entityId: string,
): FactoryStatRow[] => {
  if (!entityId) return [];
  const cache = getFactoryRowsCache(entityType, entityId);
  if (cache.data) return cache.data;
  if (cache.promise) return [];

  cache.promise = fetchFactoryRows(entityType, entityId)
    .then((data) => {
      cache.data = data;
      cache.error = null;
      return data;
    })
    .catch((error) => {
      cache.data = [];
      cache.error = error instanceof Error ? error.message : "Unknown error";
      return [];
    })
    .finally(() => {
      cache.promise = null;
      if (node.setDirtyCanvas) node.setDirtyCanvas(true, true);
    });

  return [];
};

const getFactoryPlaceholder = (
  entityType: FactoryEntityType,
  entityId: string,
): { entity: string; row: string } => {
  const catalogCache = factoryCatalogCaches[entityType];
  const rowCache = entityId ? getFactoryRowsCache(entityType, entityId) : null;

  const entity = catalogCache.error
    ? "List load failed"
    : catalogCache.promise
      ? "Loading..."
      : "No options";

  const row = rowCache?.error
    ? "Rows load failed"
    : rowCache?.promise
      ? "Loading..."
      : "No rows";

  return { entity, row };
};

const rebuildFactoryWidgets = (
  node: any,
  entityType: FactoryEntityType,
  entries: FactoryCatalogEntry[],
  rows: FactoryStatRow[],
) => {
  const properties = normalizeFactoryNodeProperties(node.properties);
  node.properties = properties;

  const placeholder = getFactoryPlaceholder(entityType, properties.entityId);
  const entityValues = entries.length ? entries.map((entry) => entry.label) : [placeholder.entity];
  const selectedEntityLabel =
    entries.find((entry) => entry.id === properties.entityId)?.label || entityValues[0];

  const rowValues = rows.length ? rows.map((row) => row.label) : [placeholder.row];
  const selectedRowLabel = rows.find((row) => row.label === properties.rowLabel)?.label || rowValues[0];

  const signature = JSON.stringify({
    entityType,
    selectedEntityLabel,
    selectedRowLabel,
    entityValues,
    rowValues,
  });
  if (node.__factoryWidgetSignature === signature) return;
  node.__factoryWidgetSignature = signature;

  node.widgets = [];

  const labelToEntityId = new Map(entries.map((entry) => [entry.label, entry.id] as const));
  node.addWidget(
    "combo",
    FACTORY_ENDPOINTS[entityType].entityWidgetLabel,
    selectedEntityLabel,
    (value: string) => {
      const nextEntityId = labelToEntityId.get(value);
      if (!nextEntityId || nextEntityId === node.properties.entityId) return;
      node.properties.entityId = nextEntityId;
      node.properties.rowLabel = "";
      node.__factoryWidgetSignature = null;
      if (node.setDirtyCanvas) node.setDirtyCanvas(true, true);
    },
    { values: entityValues },
  );

  node.addWidget(
    "combo",
    "level",
    selectedRowLabel,
    (value: string) => {
      if (!rows.some((row) => row.label === value)) return;
      if (node.properties.rowLabel === value) return;
      node.properties.rowLabel = value;
      node.__factoryWidgetSignature = null;
      if (node.setDirtyCanvas) node.setDirtyCanvas(true, true);
    },
    { values: rowValues },
  );
};

const configureFactoryNode = (node: any, entityType: FactoryEntityType) => {
  node.properties = normalizeFactoryNodeProperties(node.properties);
  const entries = factoryCatalogCaches[entityType].data || [];
  const rows = node.properties.entityId
    ? getFactoryRowsCache(entityType, node.properties.entityId).data || []
    : [];
  rebuildFactoryWidgets(node, entityType, entries, rows);
};

const executeFactoryNode = (node: any, entityType: FactoryEntityType) => {
  node.properties = normalizeFactoryNodeProperties(node.properties);

  const entries = ensureFactoryCatalog(node, entityType);
  if (entries.length > 0 && !entries.some((entry) => entry.id === node.properties.entityId)) {
    node.properties.entityId = entries[0].id;
    node.properties.rowLabel = "";
  }

  const rows = node.properties.entityId
    ? ensureFactoryRows(node, entityType, node.properties.entityId)
    : [];

  if (rows.length > 0 && !rows.some((row) => row.label === node.properties.rowLabel)) {
    node.properties.rowLabel = rows[rows.length - 1].label;
  }

  const selectedRow = rows.find((row) => row.label === node.properties.rowLabel);
  node.setOutputData(0, selectedRow?.table || {});
  rebuildFactoryWidgets(node, entityType, entries, rows);
};

const initFactoryNode = (node: any, entityType: FactoryEntityType) => {
  node.addOutput("Table", "stat_table");
  node.properties = normalizeFactoryNodeProperties(node.properties);
  configureFactoryNode(node, entityType);
};

function StatTableNode(this: any) {
  this.addOutput("Table", "stat_table");
  this.properties = {
    rows: [
      { stat: "BaseATK", value: 1000 },
      { stat: "ATKPercent", value: 0.5 },
      { stat: "CritRate", value: 0.5 },
      { stat: "CritDMG", value: 1.0 },
    ] as StatRow[],
  };
  rebuildStatTableWidgets(this);
}
StatTableNode.title = "Stat Table";
StatTableNode.prototype.onConfigure = function onConfigure(this: any) {
  this.properties.rows = normalizeRows(this.properties.rows);
  rebuildStatTableWidgets(this);
};
StatTableNode.prototype.onExecute = function onExecute(this: any) {
  const rowsInput = Array.isArray(this.properties.rows) ? this.properties.rows : [];
  const rows: StatRow[] = [];

  for (const row of rowsInput) {
    const stat = (row as { stat?: unknown }).stat;
    if (typeof stat !== "string" || !STAT_TYPES.includes(stat as StatType)) continue;

    const rawValue = (row as { value?: unknown }).value;
    const nextValue = Number.isFinite(rawValue) ? (rawValue as number) : 0;

    (row as { stat: StatType }).stat = stat as StatType;
    (row as { value: number }).value = nextValue;
    rows.push({ stat: stat as StatType, value: nextValue });
  }

  this.setOutputData(0, rowsToStatTable(rows));
};

function AddTableNode(this: any) {
  this.addInput("A", "stat_table");
  this.addInput("B", "stat_table");
  this.addOutput("A+B", "stat_table");
}
AddTableNode.title = "Add Tables";
AddTableNode.prototype.onExecute = function onExecute(this: any) {
  const a = (this.getInputData(0) || {}) as StatTableLike;
  const b = (this.getInputData(1) || {}) as StatTableLike;
  this.setOutputData(0, mergeStatTables(a, b));
};

function DisplayTableNode(this: any) {
  this.addInput("Table", "stat_table");
  this.addOutput("Table", "stat_table");
  this.properties = {};
  this.__displayRows = [] as DisplayStatRow[];
  this.__displayTruncated = 0;
  this.size = [320, 150];
}
DisplayTableNode.title = "Display Table";
DisplayTableNode.prototype.onExecute = function onExecute(this: any) {
  const input = normalizeStatTable(this.getInputData(0) || {});
  this.setOutputData(0, input);

  const rows = toDisplayStatRows(input);
  const maxRows = 14;
  this.__displayTruncated = Math.max(0, rows.length - maxRows);
  this.__displayRows = rows.slice(0, maxRows);

  const visibleRows =
    Math.max(this.__displayRows.length, 1) + (this.__displayTruncated > 0 ? 1 : 0);
  const nextHeight = 86 + visibleRows * 18;
  if (!Array.isArray(this.size)) {
    this.size = [320, nextHeight];
  } else {
    this.size[0] = Math.max(320, Number(this.size[0]) || 320);
    this.size[1] = Math.max(140, nextHeight);
  }
};
DisplayTableNode.prototype.onDrawForeground = function onDrawForeground(this: any, ctx: any) {
  if (!ctx || this.flags?.collapsed) return;
  const rows = (this.__displayRows || []) as DisplayStatRow[];
  const truncated = Number(this.__displayTruncated) || 0;
  const width = Math.max(120, (this.size?.[0] || 320) - 16);
  const height = Math.max(56, (this.size?.[1] || 150) - 42);
  const panelX = 8;
  const panelY = 34;

  ctx.save();
  ctx.fillStyle = "rgba(20, 24, 30, 0.88)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(panelX, panelY, width, height, [8]);
  } else {
    ctx.rect(panelX, panelY, width, height);
  }
  ctx.fill();
  ctx.stroke();

  ctx.font = "12px sans-serif";
  if (!rows.length) {
    ctx.fillStyle = "rgba(220, 226, 238, 0.75)";
    ctx.textAlign = "left";
    ctx.fillText("Connect a stat table to preview values", panelX + 10, panelY + 22);
    ctx.restore();
    return;
  }

  let y = panelY + 18;
  for (const row of rows) {
    ctx.fillStyle = "rgba(220, 226, 238, 0.92)";
    ctx.textAlign = "left";
    ctx.fillText(row.label, panelX + 10, y);

    ctx.fillStyle = "rgba(150, 236, 190, 0.96)";
    ctx.textAlign = "right";
    ctx.fillText(formatDisplayStatValue(row.value, row.stat), panelX + width - 10, y);
    y += 16;
  }

  if (truncated > 0) {
    ctx.fillStyle = "rgba(220, 226, 238, 0.7)";
    ctx.textAlign = "left";
    ctx.fillText(`... +${truncated} more`, panelX + 10, y);
  }
  ctx.restore();
};

function DisplayNumberNode(this: any) {
  this.addInput("Value", "number");
  this.addOutput("Value", "number");
  this.properties = { label: "Value" };
  this.__displayText = "0";
  this.__hasValue = false;
  this.size = [240, 110];
}
DisplayNumberNode.title = "Display Number";
DisplayNumberNode.prototype.onExecute = function onExecute(this: any) {
  const input = this.getInputData(0);
  const numeric = Number(input);
  const hasValue = Number.isFinite(numeric);
  const nextValue = hasValue ? numeric : 0;
  this.__hasValue = hasValue;
  this.__displayText = formatDisplayStatValue(nextValue);
  this.setOutputData(0, nextValue);

  const nextHeight = 110;
  if (!Array.isArray(this.size)) {
    this.size = [240, nextHeight];
  } else {
    this.size[0] = Math.max(240, Number(this.size[0]) || 240);
    this.size[1] = Math.max(110, nextHeight);
  }
};
DisplayNumberNode.prototype.onDrawForeground = function onDrawForeground(this: any, ctx: any) {
  if (!ctx || this.flags?.collapsed) return;
  const hasValue = !!this.__hasValue;
  const displayText = this.__displayText || "0";
  const width = Math.max(120, (this.size?.[0] || 240) - 16);
  const height = Math.max(56, (this.size?.[1] || 110) - 42);
  const panelX = 8;
  const panelY = 34;

  ctx.save();
  ctx.fillStyle = "rgba(20, 24, 30, 0.88)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(panelX, panelY, width, height, [8]);
  } else {
    ctx.rect(panelX, panelY, width, height);
  }
  ctx.fill();
  ctx.stroke();

  ctx.font = "12px sans-serif";
  if (!hasValue) {
    ctx.fillStyle = "rgba(220, 226, 238, 0.75)";
    ctx.textAlign = "left";
    ctx.fillText("Connect a number to preview value", panelX + 10, panelY + 22);
    ctx.restore();
    return;
  }

  const label = typeof this.properties?.label === "string" ? this.properties.label : "Value";
  ctx.fillStyle = "rgba(228, 232, 241, 0.96)";
  ctx.textAlign = "left";
  ctx.fillText(label, panelX + 10, panelY + 18);

  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.fillStyle = "rgba(150, 236, 190, 0.96)";
  ctx.textAlign = "right";
  ctx.fillText(displayText, panelX + width - 10, panelY + 42);
  ctx.restore();
};

function NumberNode(this: any) {
  this.addOutput("Number", "number");
  this.properties = { value: 1.0 };
  this.__displayText = "1";
  this.size = [220, 96];
  this.addWidget("number", "value", this.properties.value, (value: number) => {
    this.properties.value = Number.isFinite(value) ? value : 0;
    if (typeof this.setDirtyCanvas === "function") {
      this.setDirtyCanvas(true, true);
    }
  });
}
NumberNode.title = "Number";
NumberNode.prototype.onExecute = function onExecute(this: any) {
  const numeric = Number(this.properties.value);
  const nextValue = Number.isFinite(numeric) ? numeric : 0;
  this.properties.value = nextValue;
  this.__displayText = formatDisplayStatValue(nextValue);
  this.setOutputData(0, nextValue);
};
NumberNode.prototype.onDrawForeground = function onDrawForeground(this: any, ctx: any) {
  if (!ctx || this.flags?.collapsed) return;
  const panelX = 8;
  const panelY = 34;
  const width = Math.max(120, (this.size?.[0] || 220) - 16);
  const height = Math.max(48, (this.size?.[1] || 96) - 42);

  ctx.save();
  ctx.fillStyle = "rgba(20, 24, 30, 0.88)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(panelX, panelY, width, height, [8]);
  } else {
    ctx.rect(panelX, panelY, width, height);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(228, 232, 241, 0.96)";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Output", panelX + 10, panelY + 18);

  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.fillStyle = "rgba(150, 236, 190, 0.96)";
  ctx.textAlign = "right";
  ctx.fillText(this.__displayText || "0", panelX + width - 10, panelY + 42);
  ctx.restore();
};

function DamageActionNode(this: any) {
  this.addInput("Buff1", "stat_table");
  this.addInput("Buff2", "stat_table");
  this.addInput("Buff3", "stat_table");
  this.addOutput("Action", "damage_action");
  this.properties = {
    id: "action",
    label: "Action",
    element: "Pyro" as Element,
    damageType: "Skill" as DamageType,
    motionValue: 2,
    instances: 1,
    scaling: "ATK" as BaseScaling,
    amplifier: "None" as Amplifier,
  };
  this.addWidget("text", "label", this.properties.label, (v: string) => {
    this.properties.label = v;
    if (this.setDirtyCanvas) this.setDirtyCanvas(true, true);
  });
  this.addWidget("combo", "element", this.properties.element, (v: Element) => {
    this.properties.element = v;
    if (this.setDirtyCanvas) this.setDirtyCanvas(true, true);
  }, { values: ELEMENT_OPTIONS });
  this.addWidget(
    "combo",
    "damageType",
    this.properties.damageType,
    (v: DamageType) => {
      this.properties.damageType = v;
      if (this.setDirtyCanvas) this.setDirtyCanvas(true, true);
    },
    { values: DAMAGE_TYPE_OPTIONS },
  );
  this.addWidget("number", "motionValue", this.properties.motionValue, (v: number) => {
    this.properties.motionValue = Math.max(0, v);
    if (this.setDirtyCanvas) this.setDirtyCanvas(true, true);
  });
  this.addWidget("number", "instances", this.properties.instances, (v: number) => {
    this.properties.instances = Math.max(1, Math.floor(v));
    if (this.setDirtyCanvas) this.setDirtyCanvas(true, true);
  });
  this.addWidget("combo", "scaling", this.properties.scaling, (v: BaseScaling) => {
    this.properties.scaling = v;
    if (this.setDirtyCanvas) this.setDirtyCanvas(true, true);
  }, { values: SCALING_OPTIONS });
  this.addWidget("combo", "amplifier", this.properties.amplifier, (v: Amplifier) => {
    this.properties.amplifier = v;
    if (this.setDirtyCanvas) this.setDirtyCanvas(true, true);
  }, { values: AMPLIFIER_OPTIONS });
  getStableActionNodeKey(this);
}
DamageActionNode.title = "Damage Action";
DamageActionNode.prototype.onExecute = function onExecute(this: any) {
  const buffTablesById: Record<string, StatTableLike> = {};
  const buffTableNodeIds: string[] = [];
  const ids = ["buff1", "buff2", "buff3"] as const;
  const actionKey = getStableActionNodeKey(this);

  for (let i = 0; i < ids.length; i++) {
    const input = this.getInputData(i) as StatTableLike | undefined;
    if (!input) continue;
    const scopedBuffId = `${actionKey}:${ids[i]}`;
    buffTablesById[scopedBuffId] = input;
    buffTableNodeIds.push(scopedBuffId);
  }

  const configuredId = typeof this.properties.id === "string" ? this.properties.id.trim() : "";
  const resolvedId = configuredId && configuredId !== "action" ? configuredId : actionKey;

  const spec: DamageActionSpec = {
    id: resolvedId,
    label: this.properties.label || "Action",
    element: this.properties.element,
    damageType: this.properties.damageType,
    motionValue: Math.max(0, this.properties.motionValue || 0),
    instances: Math.max(1, Math.floor(this.properties.instances || 1)),
    scaling: this.properties.scaling,
    amplifier: this.properties.amplifier,
    buffTableNodeIds,
  };

  const payload: ActionPayload = {
    spec,
    buffTablesById,
  };

  this.setOutputData(0, payload);
};

function RotationNode(this: any) {
  this.addInput("Base", "stat_table");
  this.addInput("Action1", "damage_action");
  this.addInput("Action2", "damage_action");
  this.addInput("Action3", "damage_action");
  this.addInput("Action4", "damage_action");
  this.addInput("Action5", "damage_action");
  this.addInput("Action6", "damage_action");
  this.addOutput("Damage", "number");
  this.addOutput("Rotation", "rotation");
  this.properties = { id: "rotation" };
}
RotationNode.title = "Rotation";
RotationNode.prototype.onExecute = function onExecute(this: any) {
  const base = (this.getInputData(0) || {}) as StatTableLike;
  const actions: DamageActionSpec[] = [];
  const buffTablesById: Record<string, StatTableLike> = {};

  for (let i = 1; i <= 6; i++) {
    const payload = this.getInputData(i) as ActionPayload | undefined;
    if (!payload?.spec) continue;
    actions.push(payload.spec);
    Object.assign(buffTablesById, payload.buffTablesById || {});
  }

  const rotationPayload: RotationPayload = {
    rotation: {
      id: this.properties.id || "rotation",
      actions,
    },
    buffTablesById,
  };
  this.setOutputData(1, rotationPayload);

  if (actions.length === 0) {
    this.setOutputData(0, 0);
    return;
  }

  const total = executeRotation(
    base,
    { id: this.properties.id || "rotation", actions },
    buffTablesById,
  );
  this.setOutputData(0, total);
};

function KqmcOptimizerNode(this: any) {
  this.addInput("Target", "stat_table");
  this.addInput("ER Req", "number");
  this.addInput("Rotation", "rotation");
  this.addOutput("Sub Stats", "stat_table");
  this.addOutput("Main Stats", "stat_table");
  this.addOutput("Combined", "stat_table");
  this.addOutput("Damage", "number");
  this.properties = normalizeKqmcProperties(this.properties);
  this.__kqmcCache = null;
  this.__kqmcRecomputeCount = 0;
  this.__kqmcRows = [];
  this.__kqmcTotals = {
    totalConstraint: 0,
    totalDistributedExtra: 0,
    totalDistributed: 0,
    totalStatValue: 0,
  };
  this.__kqmcSelectedMainStats = {
    flower: "FlatHP",
    feather: "FlatATK",
    sands: "ATKPercent",
    goblet: "PyroDMGBonus",
    circlet: "CritRate",
  };
  this.__kqmcMessage = "Connect target stats, ER requirement, and rotation payload";
  this.size = [460, 380];

  this.addWidget("combo", "mode", this.properties.mode, (value: KqmcMode) => {
    if (this.properties.mode === value) return;
    this.properties.mode = value;
    if (this.setDirtyCanvas) this.setDirtyCanvas(true, true);
  }, { values: KQMC_MODE_OPTIONS });
  this.addWidget(
    "combo",
    "5-star slot",
    this.properties.fiveStarSlot,
    (value: ArtifactType) => {
      if (this.properties.fiveStarSlot === value) return;
      this.properties.fiveStarSlot = value;
      if (this.setDirtyCanvas) this.setDirtyCanvas(true, true);
    },
    { values: KQMC_FIVE_STAR_SLOT_OPTIONS },
  );
  this.addWidget("toggle", "lock", this.properties.locked, (value: boolean) => {
    this.properties.locked = !!value;
    if (this.setDirtyCanvas) this.setDirtyCanvas(true, true);
  });
}
KqmcOptimizerNode.title = "KQMC Optimizer";
KqmcOptimizerNode.prototype.onConfigure = function onConfigure(this: any) {
  this.properties = normalizeKqmcProperties(this.properties);
};
KqmcOptimizerNode.prototype.onExecute = function onExecute(this: any) {
  this.properties = normalizeKqmcProperties(this.properties);
  const target = normalizeStatTable(this.getInputData(0) || {});
  const erRequirement = Number(this.getInputData(1));
  const rotationInput = this.getInputData(2);
  const signature = JSON.stringify({
    target,
    erRequirement: Number.isFinite(erRequirement) ? erRequirement : null,
    rotationInput,
    mode: this.properties.mode,
    fiveStarSlot: this.properties.fiveStarSlot,
  });

  const applyCachedResult = (cache: any) => {
    this.setOutputData(0, cache.subStats || {});
    this.setOutputData(1, cache.mainStats || {});
    this.setOutputData(2, cache.combined || target);
    this.setOutputData(3, Number(cache.damage) || 0);
    this.__kqmcRows = cache.rows || [];
    this.__kqmcSelectedMainStats = cache.selectedMainStats || this.__kqmcSelectedMainStats;
    this.__kqmcTotals = cache.totals || this.__kqmcTotals;
    this.__kqmcMessage = cache.message || "";
  };

  const cacheCurrentResult = (next: {
    subStats: StatTableLike;
    mainStats: StatTableLike;
    combined: StatTableLike;
    damage: number;
    rows: unknown[];
    selectedMainStats: Record<string, string>;
    totals: {
      totalConstraint: number;
      totalDistributedExtra: number;
      totalDistributed: number;
      totalStatValue: number;
    };
    message: string;
  }) => {
    this.__kqmcCache = {
      signature,
      subStats: next.subStats,
      mainStats: next.mainStats,
      combined: next.combined,
      damage: next.damage,
      rows: next.rows,
      selectedMainStats: next.selectedMainStats,
      totals: next.totals,
      message: next.message,
    };
  };

  if (this.properties.locked && this.__kqmcCache) {
    applyCachedResult(this.__kqmcCache);
    return;
  }

  if (!this.properties.locked && this.__kqmcCache?.signature === signature) {
    applyCachedResult(this.__kqmcCache);
    return;
  }

  const logRecompute = (reason: "primary" | "fallback") => {
    this.__kqmcRecomputeCount = (Number(this.__kqmcRecomputeCount) || 0) + 1;
    const nodeId = this.id ?? "unknown";
    console.log(
      `[kqmc_optimizer] recompute #${this.__kqmcRecomputeCount} node=${nodeId} reason=${reason}`,
    );
  };

  const clearResult = () => {
    this.setOutputData(0, {});
    this.setOutputData(1, {});
    this.setOutputData(2, target);
    this.setOutputData(3, 0);
    this.__kqmcRows = [];
    this.__kqmcTotals = {
      totalConstraint: 0,
      totalDistributedExtra: 0,
      totalDistributed: 0,
      totalStatValue: 0,
    };
  };

  if (!isRotationPayload(rotationInput)) {
    clearResult();
    this.__kqmcMessage = "Rotation payload missing. Use Rotation node output 2.";
    cacheCurrentResult({
      subStats: {},
      mainStats: {},
      combined: target,
      damage: 0,
      rows: [],
      selectedMainStats: this.__kqmcSelectedMainStats || {},
      totals: this.__kqmcTotals,
      message: this.__kqmcMessage,
    });
    return;
  }

  try {
    logRecompute("primary");
    const result = optimizeKqmcArtifacts({
      base: target,
      rotationPayload: rotationInput,
      energyRechargeRequirement: erRequirement,
      mode: this.properties.mode,
      fiveStarSlot: this.properties.fiveStarSlot,
    });

    this.setOutputData(0, result.subStats);
    this.setOutputData(1, result.mainStats);
    this.setOutputData(2, result.combined);
    this.setOutputData(3, result.damage);
    this.__kqmcRows = result.rows;
    this.__kqmcSelectedMainStats = result.selectedMainStats;
    const totalStatValue = result.rows.reduce(
      (sum: number, row: { value: number }) => sum + (row.value || 0),
      0,
    );
    this.__kqmcTotals = {
      totalConstraint: result.totalConstraint,
      totalDistributedExtra: result.totalDistributedExtra,
      totalDistributed: result.totalDistributed,
      totalStatValue,
    };
    this.__kqmcMessage = "";
  } catch (error) {
    if (error instanceof KqmcOptimizationError && error.code === "UNMET_ER") {
      try {
        logRecompute("fallback");
        const fallback = optimizeKqmcArtifacts({
          base: target,
          rotationPayload: rotationInput,
          energyRechargeRequirement: 0,
          mode: this.properties.mode,
          fiveStarSlot: this.properties.fiveStarSlot,
        });
        this.setOutputData(0, fallback.subStats);
        this.setOutputData(1, fallback.mainStats);
        this.setOutputData(2, fallback.combined);
        this.setOutputData(3, fallback.damage);
        this.__kqmcRows = fallback.rows;
        this.__kqmcSelectedMainStats = fallback.selectedMainStats;
        const totalStatValue = fallback.rows.reduce(
          (sum: number, row: { value: number }) => sum + (row.value || 0),
          0,
        );
        this.__kqmcTotals = {
          totalConstraint: fallback.totalConstraint,
          totalDistributedExtra: fallback.totalDistributedExtra,
          totalDistributed: fallback.totalDistributed,
          totalStatValue,
        };
        this.__kqmcMessage = "ER target unmet; showing best damage without ER constraint.";
        cacheCurrentResult({
          subStats: fallback.subStats,
          mainStats: fallback.mainStats,
          combined: fallback.combined,
          damage: fallback.damage,
          rows: fallback.rows,
          selectedMainStats: fallback.selectedMainStats as Record<string, string>,
          totals: this.__kqmcTotals,
          message: this.__kqmcMessage,
        });
        return;
      } catch {
        clearResult();
        this.__kqmcMessage = "KQMC optimization failed";
        cacheCurrentResult({
          subStats: {},
          mainStats: {},
          combined: target,
          damage: 0,
          rows: [],
          selectedMainStats: this.__kqmcSelectedMainStats || {},
          totals: this.__kqmcTotals,
          message: this.__kqmcMessage,
        });
        return;
      }
    }
    clearResult();
    if (error instanceof KqmcOptimizationError) {
      this.__kqmcMessage = error.message;
    } else if (error instanceof Error) {
      this.__kqmcMessage = error.message;
    } else {
      this.__kqmcMessage = "KQMC optimization failed";
    }
    cacheCurrentResult({
      subStats: {},
      mainStats: {},
      combined: target,
      damage: 0,
      rows: [],
      selectedMainStats: this.__kqmcSelectedMainStats || {},
      totals: this.__kqmcTotals,
      message: this.__kqmcMessage,
    });
    return;
  }

  const rowCount = Array.isArray(this.__kqmcRows) ? this.__kqmcRows.length : 0;
  const fieldsHeight = 150; // title(30) + 3 inputs(60) + 3 widgets(60)
  const nextHeight = rowCount > 0 ? fieldsHeight + 250 + (rowCount + 1) * 16 : fieldsHeight + 220;
  if (!Array.isArray(this.size)) {
    this.size = [460, nextHeight];
  } else {
    this.size[0] = Math.max(460, Number(this.size[0]) || 460);
    this.size[1] = Math.max(370, nextHeight);
  }
  cacheCurrentResult({
    subStats: this.getOutputData ? (this.getOutputData(0) || {}) : this._outputsData?.[0] || {},
    mainStats: this.getOutputData ? (this.getOutputData(1) || {}) : this._outputsData?.[1] || {},
    combined: this.getOutputData ? (this.getOutputData(2) || target) : this._outputsData?.[2] || target,
    damage: this.getOutputData ? Number(this.getOutputData(3)) || 0 : Number(this._outputsData?.[3]) || 0,
    rows: this.__kqmcRows || [],
    selectedMainStats: this.__kqmcSelectedMainStats || {},
    totals: this.__kqmcTotals,
    message: this.__kqmcMessage || "",
  });
};
KqmcOptimizerNode.prototype.onDrawForeground = function onDrawForeground(this: any, ctx: any) {
  if (!ctx || this.flags?.collapsed) return;

  const panelX = 8;
  const panelY = 150; // below title + 3 inputs + 3 widgets
  const width = Math.max(220, (this.size?.[0] || 460) - 16);
  const height = Math.max(120, (this.size?.[1] || 380) - panelY - 8);

  ctx.save();
  ctx.fillStyle = "rgba(20, 24, 30, 0.92)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(panelX, panelY, width, height, [8]);
  } else {
    ctx.rect(panelX, panelY, width, height);
  }
  ctx.fill();
  ctx.stroke();

  ctx.font = "12px sans-serif";
  const mains = this.__kqmcSelectedMainStats || {};
  const mainLine1 = `Flower: ${toDisplayStatLabel(mains.flower || "FlatHP")}  Feather: ${toDisplayStatLabel(mains.feather || "FlatATK")}`;
  const mainLine2 = `Sands: ${toDisplayStatLabel(mains.sands || "ATKPercent")}  Goblet: ${toDisplayStatLabel(mains.goblet || "PyroDMGBonus")}  Circlet: ${toDisplayStatLabel(mains.circlet || "CritRate")}`;

  ctx.fillStyle = "rgba(220, 226, 238, 0.9)";
  ctx.textAlign = "left";
  ctx.fillText(mainLine1, panelX + 10, panelY + 18);
  ctx.fillText(mainLine2, panelX + 10, panelY + 34);

  const message = typeof this.__kqmcMessage === "string" ? this.__kqmcMessage : "";
  if (message) {
    ctx.fillStyle = "rgba(255, 180, 170, 0.95)";
    ctx.fillText(message, panelX + 10, panelY + 52);
    ctx.restore();
    return;
  }

  const rows = Array.isArray(this.__kqmcRows) ? this.__kqmcRows : [];
  if (rows.length === 0) {
    ctx.fillStyle = "rgba(220, 226, 238, 0.75)";
    ctx.fillText("No KQMC rows to display", panelX + 10, panelY + 52);
    ctx.restore();
    return;
  }

  const colStat = panelX + 10;
  const colConstraint = panelX + width - 220;
  const colDistributed = panelX + width - 145;
  const colStats = panelX + width - 10;

  ctx.fillStyle = "rgba(220, 226, 238, 0.8)";
  ctx.textAlign = "left";
  ctx.fillText("KQMC", colStat, panelY + 56);
  ctx.fillText("Constraint", colConstraint, panelY + 56);
  ctx.fillText("Distributed", colDistributed, panelY + 56);
  ctx.textAlign = "right";
  ctx.fillText("Stats", colStats, panelY + 56);

  let y = panelY + 74;
  for (const row of rows) {
    ctx.fillStyle = "rgba(220, 226, 238, 0.92)";
    ctx.textAlign = "left";
    ctx.fillText(row.label, colStat, y);
    ctx.fillText(String(Math.max(0, Math.round(row.constraint))), colConstraint, y);

    ctx.fillStyle = "rgba(255, 224, 168, 0.96)";
    ctx.fillText(
      formatDistributedRolls(row.distributedExtra, row.distributedTotal),
      colDistributed,
      y,
    );

    ctx.fillStyle = "rgba(150, 236, 190, 0.96)";
    ctx.textAlign = "right";
    ctx.fillText(formatDisplayStatValue(row.value, row.stat), colStats, y);
    y += 16;
  }

  const totals = this.__kqmcTotals || {
    totalConstraint: 0,
    totalDistributedExtra: 0,
    totalDistributed: 0,
    totalStatValue: 0,
  };
  ctx.fillStyle = "rgba(220, 226, 238, 0.95)";
  ctx.textAlign = "left";
  ctx.fillText("Total", colStat, y);
  ctx.fillText(String(Math.max(0, Math.round(totals.totalConstraint || 0))), colConstraint, y);
  ctx.fillStyle = "rgba(255, 224, 168, 0.96)";
  ctx.fillText(
    formatDistributedRolls(
      Math.max(0, Math.round(totals.totalDistributedExtra || 0)),
      Math.max(0, Math.round(totals.totalDistributed || 0)),
    ),
    colDistributed,
    y,
  );
  ctx.fillStyle = "rgba(150, 236, 190, 0.96)";
  ctx.textAlign = "right";
  ctx.fillText(formatDisplayStatValue(Number(totals.totalStatValue || 0)), colStats, y);
  ctx.restore();
};

function CharacterFactoryNode(this: any) {
  initFactoryNode(this, "character");
}
CharacterFactoryNode.title = "Character Factory";
CharacterFactoryNode.prototype.onConfigure = function onConfigure(this: any) {
  configureFactoryNode(this, "character");
};
CharacterFactoryNode.prototype.onExecute = function onExecute(this: any) {
  executeFactoryNode(this, "character");
};

function WeaponFactoryNode(this: any) {
  initFactoryNode(this, "weapon");
}
WeaponFactoryNode.title = "Weapon Factory";
WeaponFactoryNode.prototype.onConfigure = function onConfigure(this: any) {
  configureFactoryNode(this, "weapon");
};
WeaponFactoryNode.prototype.onExecute = function onExecute(this: any) {
  executeFactoryNode(this, "weapon");
};

export const registerCalculatorNodes = (liteGraph: LiteGraphLike) => {
  liteGraph.registerNodeType("calc/number", NumberNode);
  liteGraph.registerNodeType("calc/stat_table", StatTableNode);
  liteGraph.registerNodeType("calc/add_table", AddTableNode);
  liteGraph.registerNodeType("calc/display_table", DisplayTableNode);
  liteGraph.registerNodeType("calc/display_number", DisplayNumberNode);
  liteGraph.registerNodeType("calc/damage_action", DamageActionNode);
  liteGraph.registerNodeType("calc/rotation", RotationNode);
  liteGraph.registerNodeType("calc/kqmc_optimizer", KqmcOptimizerNode);
  liteGraph.registerNodeType("calc/character_factory", CharacterFactoryNode);
  liteGraph.registerNodeType("calc/weapon_factory", WeaponFactoryNode);
};
