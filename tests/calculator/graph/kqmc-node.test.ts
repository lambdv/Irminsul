import { mergeStatTables } from "@/feature/calculator/core";
import { registerCalculatorNodes } from "@/feature/calculator/graph/registerCalculatorNodes";

type NodeCtor = new (...args: any[]) => any;

const createNodeInstance = (Ctor: any) => {
  const node: any = {
    properties: {},
    _inputsData: [] as any[],
    _outputsData: [] as any[],
    addInput: jest.fn(),
    addOutput: jest.fn(),
    addWidget: jest.fn(),
    getInputData(index: number) {
      return this._inputsData[index];
    },
    setOutputData(index: number, value: unknown) {
      this._outputsData[index] = value;
    },
  };
  Ctor.call(node);
  return node;
};

const expectTablesClose = (actual: Record<string, number>, expected: Record<string, number>) => {
  for (const [key, value] of Object.entries(expected)) {
    expect(actual[key] || 0).toBeCloseTo(value, 8);
  }
};

describe("kqmc optimizer graph node", () => {
  test("returns sub/main/combined tables and keeps merge invariant", () => {
    const nodeTypes: Record<string, NodeCtor> = {};
    registerCalculatorNodes({
      registerNodeType: (path: string, nodeType: NodeCtor) => {
        nodeTypes[path] = nodeType;
      },
    });

    const ActionNode = nodeTypes["calc/damage_action"];
    const RotationNode = nodeTypes["calc/rotation"];
    const KqmcNode = nodeTypes["calc/kqmc_optimizer"];

    const target = {
      BaseATK: 1000,
      ATKPercent: 0.5,
      FlatATK: 200,
      CritRate: 0.6,
      CritDMG: 1.2,
      PyroDMGBonus: 0.4,
      EnergyRecharge: 1.0,
    };

    const action = createNodeInstance(ActionNode);
    action._inputsData[0] = { SkillDMGBonus: 0.2 };
    ActionNode.prototype.onExecute.call(action);

    const rotation = createNodeInstance(RotationNode);
    rotation._inputsData[0] = target;
    rotation._inputsData[1] = action._outputsData[0];
    RotationNode.prototype.onExecute.call(rotation);

    const kqmc = createNodeInstance(KqmcNode);
    kqmc._inputsData[0] = target;
    kqmc._inputsData[1] = 1.2;
    kqmc._inputsData[2] = rotation._outputsData[1];
    KqmcNode.prototype.onExecute.call(kqmc);

    const sub = kqmc._outputsData[0] || {};
    const main = kqmc._outputsData[1] || {};
    const combined = kqmc._outputsData[2] || {};
    const damage = kqmc._outputsData[3];
    const expected = mergeStatTables(target, main, sub);

    expectTablesClose(combined, expected);
    expect(Number.isFinite(damage)).toBe(true);
    expect(damage).toBeGreaterThan(0);
    expect(Array.isArray(kqmc.__kqmcRows)).toBe(true);
    expect(kqmc.__kqmcRows.length).toBeGreaterThan(0);
    expect(
      kqmc.__kqmcRows.every(
        (row: any) =>
          Number.isFinite(row.distributedExtra) && Number.isFinite(row.distributedTotal),
      ),
    ).toBe(true);
  });

  test("supports 4+1 mode with all five possible five-star slots", () => {
    const nodeTypes: Record<string, NodeCtor> = {};
    registerCalculatorNodes({
      registerNodeType: (path: string, nodeType: NodeCtor) => {
        nodeTypes[path] = nodeType;
      },
    });

    const ActionNode = nodeTypes["calc/damage_action"];
    const RotationNode = nodeTypes["calc/rotation"];
    const KqmcNode = nodeTypes["calc/kqmc_optimizer"];
    const target = {
      BaseATK: 900,
      ATKPercent: 0.45,
      FlatATK: 150,
      CritRate: 0.5,
      CritDMG: 1.0,
      EnergyRecharge: 1.0,
    };

    const action = createNodeInstance(ActionNode);
    ActionNode.prototype.onExecute.call(action);

    const rotation = createNodeInstance(RotationNode);
    rotation._inputsData[0] = target;
    rotation._inputsData[1] = action._outputsData[0];
    RotationNode.prototype.onExecute.call(rotation);
    const payload = rotation._outputsData[1];

    for (const slot of ["flower", "feather", "sands", "goblet", "circlet"] as const) {
      const kqmc = createNodeInstance(KqmcNode);
      kqmc.properties.mode = "4+1";
      kqmc.properties.fiveStarSlot = slot;
      kqmc._inputsData[0] = target;
      kqmc._inputsData[1] = 1.0;
      kqmc._inputsData[2] = payload;

      KqmcNode.prototype.onExecute.call(kqmc);

      expect(kqmc._outputsData[2]).toBeDefined();
      expect(kqmc.__kqmcMessage || "").toBe("");
      expect(Array.isArray(kqmc.__kqmcRows)).toBe(true);
    }
  });

  test("locks optimizer outputs until lock is lifted", () => {
    const nodeTypes: Record<string, NodeCtor> = {};
    registerCalculatorNodes({
      registerNodeType: (path: string, nodeType: NodeCtor) => {
        nodeTypes[path] = nodeType;
      },
    });

    const ActionNode = nodeTypes["calc/damage_action"];
    const RotationNode = nodeTypes["calc/rotation"];
    const KqmcNode = nodeTypes["calc/kqmc_optimizer"];

    const action = createNodeInstance(ActionNode);
    action._inputsData[0] = { SkillDMGBonus: 0.2 };
    ActionNode.prototype.onExecute.call(action);

    const baseA = {
      BaseATK: 900,
      ATKPercent: 0.45,
      FlatATK: 200,
      CritRate: 0.5,
      CritDMG: 1.0,
      EnergyRecharge: 1.0,
    };
    const baseB = {
      BaseATK: 2200,
      ATKPercent: 1.2,
      FlatATK: 500,
      CritRate: 0.7,
      CritDMG: 1.8,
      EnergyRecharge: 1.0,
    };

    const rotation = createNodeInstance(RotationNode);
    rotation._inputsData[0] = baseA;
    rotation._inputsData[1] = action._outputsData[0];
    RotationNode.prototype.onExecute.call(rotation);

    const kqmc = createNodeInstance(KqmcNode);
    kqmc._inputsData[0] = baseA;
    kqmc._inputsData[1] = 1.1;
    kqmc._inputsData[2] = rotation._outputsData[1];
    KqmcNode.prototype.onExecute.call(kqmc);

    const lockedDamage = kqmc._outputsData[3];
    const lockedCombined = { ...(kqmc._outputsData[2] || {}) };

    kqmc.properties.locked = true;
    kqmc._inputsData[0] = baseB;
    KqmcNode.prototype.onExecute.call(kqmc);

    expect(kqmc._outputsData[3]).toBeCloseTo(lockedDamage, 10);
    expectTablesClose(kqmc._outputsData[2] || {}, lockedCombined);

    kqmc.properties.locked = false;
    KqmcNode.prototype.onExecute.call(kqmc);
    expect(kqmc._outputsData[3]).toBeGreaterThan(lockedDamage);
  });
});
