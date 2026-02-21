import {
  ActionPayload,
  Amplifier,
  BaseScaling,
  DamageActionSpec,
  DamageType,
  Element,
  STAT_TYPES,
  StatTableLike,
  executeRotation,
  mergeStatTables,
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

const formatDisplayStatValue = (value: number): string => {
  if (!Number.isFinite(value)) return "0";
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

const rebuildStatTableWidgets = (node: any) => {
  const rows = normalizeRows(node.properties.rows);
  node.properties.rows = rows;

  node.widgets = [];
  node.addWidget("button", "+ Add Row", "", () => {
    node.properties.rows.push({ stat: "BaseATK", value: 0 });
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
      },
      { values: STAT_TYPES },
    );
    node.addWidget("number", `Value ${index + 1}`, row.value, (value: number) => {
      row.value = Number.isFinite(value) ? value : 0;
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
  const rows = normalizeRows(this.properties.rows);
  this.properties.rows = rows;
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
    ctx.fillText(formatDisplayStatValue(row.value), panelX + width - 10, y);
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
  this.__hasValue = false;
  this.__displayValue = 0;
  this.__displayText = "0";
  this.size = [240, 110];
  this.addWidget("text", "label", this.properties.label, (value: string) => {
    this.properties.label = value;
  });
}
DisplayNumberNode.title = "Display Number";
DisplayNumberNode.prototype.onExecute = function onExecute(this: any) {
  const input = this.getInputData(0);
  const numeric = Number(input);
  const hasValue = Number.isFinite(numeric);
  const nextValue = hasValue ? numeric : 0;
  this.__hasValue = hasValue;
  this.__displayValue = nextValue;
  this.__displayText = formatDisplayStatValue(nextValue);
  this.setOutputData(0, nextValue);

  const label = typeof this.properties.label === "string" ? this.properties.label : "Value";
  const estimatedWidth = Math.max(
    220,
    label.length * 7 + this.__displayText.length * 10 + 48,
  );
  if (!Array.isArray(this.size)) {
    this.size = [estimatedWidth, 110];
  } else {
    this.size[0] = Math.max(estimatedWidth, Number(this.size[0]) || estimatedWidth);
    this.size[1] = Math.max(110, Number(this.size[1]) || 110);
  }

  if (typeof this.setDirtyCanvas === "function") {
    this.setDirtyCanvas(true, true);
  }
};
DisplayNumberNode.prototype.onDrawForeground = function onDrawForeground(this: any, ctx: any) {
  if (!ctx || this.flags?.collapsed) return;
  const hasValue = !!this.__hasValue;
  const label = typeof this.properties.label === "string" ? this.properties.label : "Value";
  const displayText = this.__displayText || "0";

  const panelX = 8;
  const panelY = 34;
  const width = Math.max(120, (this.size?.[0] || 240) - 16);
  const height = Math.max(56, (this.size?.[1] || 110) - 42);

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

  ctx.save();
  ctx.fillStyle = "rgba(228, 232, 241, 0.96)";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(label, panelX + 10, panelY + 18);

  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.fillStyle = "rgba(150, 236, 190, 0.96)";
  ctx.textAlign = "right";
  ctx.fillText(displayText, panelX + width - 10, panelY + 42);
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
  });
  this.addWidget("combo", "element", this.properties.element, (v: Element) => {
    this.properties.element = v;
  }, { values: ELEMENT_OPTIONS });
  this.addWidget(
    "combo",
    "damageType",
    this.properties.damageType,
    (v: DamageType) => {
      this.properties.damageType = v;
    },
    { values: DAMAGE_TYPE_OPTIONS },
  );
  this.addWidget("number", "motionValue", this.properties.motionValue, (v: number) => {
    this.properties.motionValue = Math.max(0, v);
  });
  this.addWidget("number", "instances", this.properties.instances, (v: number) => {
    this.properties.instances = Math.max(1, Math.floor(v));
  });
  this.addWidget("combo", "scaling", this.properties.scaling, (v: BaseScaling) => {
    this.properties.scaling = v;
  }, { values: SCALING_OPTIONS });
  this.addWidget("combo", "amplifier", this.properties.amplifier, (v: Amplifier) => {
    this.properties.amplifier = v;
  }, { values: AMPLIFIER_OPTIONS });
}
DamageActionNode.title = "Damage Action";
DamageActionNode.prototype.onExecute = function onExecute(this: any) {
  const buffTablesById: Record<string, StatTableLike> = {};
  const buffTableNodeIds: string[] = [];
  const ids = ["buff1", "buff2", "buff3"] as const;

  for (let i = 0; i < ids.length; i++) {
    const input = this.getInputData(i) as StatTableLike | undefined;
    if (!input) continue;
    buffTablesById[ids[i]] = input;
    buffTableNodeIds.push(ids[i]);
  }

  const spec: DamageActionSpec = {
    id: this.properties.id || this.properties.label || "action",
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
  liteGraph.registerNodeType("calc/stat_table", StatTableNode);
  liteGraph.registerNodeType("calc/add_table", AddTableNode);
  liteGraph.registerNodeType("calc/display_table", DisplayTableNode);
  liteGraph.registerNodeType("calc/display_number", DisplayNumberNode);
  liteGraph.registerNodeType("calc/damage_action", DamageActionNode);
  liteGraph.registerNodeType("calc/rotation", RotationNode);
  liteGraph.registerNodeType("calc/character_factory", CharacterFactoryNode);
  liteGraph.registerNodeType("calc/weapon_factory", WeaponFactoryNode);
};
