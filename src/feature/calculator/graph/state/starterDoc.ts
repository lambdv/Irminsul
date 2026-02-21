import { normalizeGraphDoc } from "./docUtils";
import { CalculatorGraphDocument } from "./types";

type LiteGraphRuntime = {
  LGraph: new () => {
    add: (node: any) => void;
    serialize: () => unknown;
  };
  LiteGraph: {
    createNode: (path: string) => any;
  };
};

const DEFAULT_STARTER_DOC: CalculatorGraphDocument = {
  last_node_id: 27,
  last_link_id: 25,
  nodes: [
    {
      id: 8,
      type: "calc/character_factory",
      pos: [-8, 60],
      size: [210, 82],
      flags: {},
      order: 0,
      mode: 0,
      outputs: [{ name: "Table", type: "stat_table", links: [6], slot_index: 0 }],
      properties: { entityId: "hu-tao", rowLabel: "90 (Ascended)" },
    },
    {
      id: 3,
      type: "calc/damage_action",
      pos: [24, 425],
      size: [210, 242],
      flags: {},
      order: 4,
      mode: 0,
      inputs: [
        { name: "Buff1", type: "stat_table", link: 21 },
        { name: "Buff2", type: "stat_table", link: null, slot_index: 1 },
        { name: "Buff3", type: "stat_table", link: null },
      ],
      outputs: [{ name: "Action", type: "damage_action", links: [3] }],
      properties: {
        id: "action",
        label: "Action",
        element: "Pyro",
        damageType: "Burst",
        motionValue: 4.000000000000002,
        instances: 1,
        scaling: "ATK",
        amplifier: "Forward",
      },
    },
    {
      id: 2,
      type: "calc/stat_table",
      pos: [25, 722],
      size: [210, 106],
      flags: {},
      order: 2,
      mode: 0,
      outputs: [{ name: "Table", type: "stat_table", links: [21], slot_index: 0 }],
      properties: { rows: [{ stat: "PyroDMGBonus", value: 0.20900000000000013 }] },
    },
    {
      id: 26,
      type: "calc/weapon_factory",
      pos: [-4, 214],
      size: [210, 82],
      flags: {},
      order: 3,
      mode: 0,
      outputs: [{ name: "Table", type: "stat_table", links: [24], slot_index: 0 }],
      properties: { entityId: "staff-of-homa", rowLabel: "90" },
    },
    {
      id: 19,
      type: "calc/kqmc_optimizer",
      pos: [815, 195],
      size: [460, 576],
      flags: {},
      order: 7,
      mode: 0,
      inputs: [
        { name: "Target", type: "stat_table", link: 17, slot_index: 0 },
        { name: "ER Req", type: "number", link: null },
        { name: "Rotation", type: "rotation", link: 18, slot_index: 2 },
      ],
      outputs: [
        { name: "Sub Stats", type: "stat_table", links: null },
        { name: "Main Stats", type: "stat_table", links: null },
        { name: "Combined", type: "stat_table", links: [25], slot_index: 2 },
        { name: "Damage", type: "number", links: [19], slot_index: 3 },
      ],
      properties: { mode: "5-star", fiveStarSlot: "goblet", locked: false },
    },
    {
      id: 10,
      type: "calc/add_table",
      pos: [339, 147],
      size: [140, 46],
      flags: {},
      order: 5,
      mode: 0,
      inputs: [
        { name: "A", type: "stat_table", link: 6 },
        { name: "B", type: "stat_table", link: 24 },
      ],
      outputs: [{ name: "A+B", type: "stat_table", links: [8, 17], slot_index: 0 }],
      properties: {},
    },
    {
      id: 27,
      type: "calc/display_table",
      pos: [1311, 200],
      size: [320, 338],
      flags: {},
      order: 8,
      mode: 0,
      inputs: [{ name: "Table", type: "stat_table", link: 25 }],
      outputs: [{ name: "Table", type: "stat_table", links: null }],
      properties: {},
    },
    {
      id: 22,
      type: "calc/display_number",
      pos: [1317, 587],
      size: [240, 110],
      flags: {},
      order: 9,
      mode: 0,
      inputs: [{ name: "Value", type: "number", link: 19 }],
      outputs: [{ name: "Value", type: "number", links: null }],
      properties: { label: "Value" },
    },
    {
      id: 14,
      type: "calc/damage_action",
      pos: [300, 432],
      size: [210, 242],
      flags: {},
      order: 1,
      mode: 0,
      inputs: [
        { name: "Buff1", type: "stat_table", link: null, slot_index: 0 },
        { name: "Buff2", type: "stat_table", link: null },
        { name: "Buff3", type: "stat_table", link: null },
      ],
      outputs: [{ name: "Action", type: "damage_action", links: [12], slot_index: 0 }],
      properties: {
        id: "action",
        label: "Action",
        element: "Pyro",
        damageType: "Skill",
        motionValue: 4.4,
        instances: 1,
        scaling: "ATK",
        amplifier: "None",
      },
    },
    {
      id: 4,
      type: "calc/rotation",
      pos: [591, 448],
      size: [140, 146],
      flags: {},
      order: 6,
      mode: 0,
      inputs: [
        { name: "Base", type: "stat_table", link: 8 },
        { name: "Action1", type: "damage_action", link: 3 },
        { name: "Action2", type: "damage_action", link: 12 },
        { name: "Action3", type: "damage_action", link: null },
        { name: "Action4", type: "damage_action", link: null },
        { name: "Action5", type: "damage_action", link: null },
        { name: "Action6", type: "damage_action", link: null },
      ],
      outputs: [
        { name: "Damage", type: "number", links: [], slot_index: 0 },
        { name: "Rotation", type: "rotation", links: [18] },
      ],
      properties: { id: "rotation" },
    },
  ],
  links: [
    [3, 3, 0, 4, 1, "damage_action"],
    [6, 8, 0, 10, 0, "stat_table"],
    [8, 10, 0, 4, 0, "stat_table"],
    [12, 14, 0, 4, 2, "damage_action"],
    [17, 10, 0, 19, 0, "stat_table"],
    [18, 4, 1, 19, 2, "rotation"],
    [19, 19, 3, 22, 0, "number"],
    [21, 2, 0, 3, 0, "stat_table"],
    [24, 26, 0, 10, 1, "stat_table"],
    [25, 19, 2, 27, 0, "stat_table"],
  ],
  groups: [],
  config: {},
};

export const buildStarterDoc = (_runtime: LiteGraphRuntime): CalculatorGraphDocument => {
  return normalizeGraphDoc(DEFAULT_STARTER_DOC);
};
