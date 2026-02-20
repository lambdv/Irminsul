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

type LiteGraphLike = {
  registerNodeType: (path: string, nodeType: any) => void;
};

type StatRow = {
  stat: (typeof STAT_TYPES)[number];
  value: number;
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

export const registerCalculatorNodes = (liteGraph: LiteGraphLike) => {
  liteGraph.registerNodeType("calc/stat_table", StatTableNode);
  liteGraph.registerNodeType("calc/add_table", AddTableNode);
  liteGraph.registerNodeType("calc/damage_action", DamageActionNode);
  liteGraph.registerNodeType("calc/rotation", RotationNode);
};
