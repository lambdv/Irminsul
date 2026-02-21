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

const createNodeInstanceWithWidgets = (Ctor: any) => {
  const node: any = {
    properties: {},
    widgets: [] as any[],
    _inputsData: [] as any[],
    _outputsData: [] as any[],
    addInput: jest.fn(),
    addOutput: jest.fn(),
    addWidget(type: string, name: string, value: unknown, callback: (...args: any[]) => void, options?: Record<string, unknown>) {
      const widget = { type, name, value, callback, options: options || {} };
      this.widgets.push(widget);
      return widget;
    },
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

describe("calculator graph nodes", () => {
  test("registers required node types", () => {
    const nodeTypes: Record<string, NodeCtor> = {};
    registerCalculatorNodes({
      registerNodeType: (path: string, nodeType: NodeCtor) => {
        nodeTypes[path] = nodeType;
      },
    });

    expect(nodeTypes["calc/stat_table"]).toBeDefined();
    expect(nodeTypes["calc/number"]).toBeDefined();
    expect(nodeTypes["calc/add_table"]).toBeDefined();
    expect(nodeTypes["calc/display_table"]).toBeDefined();
    expect(nodeTypes["calc/character_factory"]).toBeDefined();
    expect(nodeTypes["calc/weapon_factory"]).toBeDefined();
    expect(nodeTypes["calc/damage_action"]).toBeDefined();
    expect(nodeTypes["calc/rotation"]).toBeDefined();
    expect(nodeTypes["calc/kqmc_optimizer"]).toBeDefined();
  });

  test("stat_table -> damage_action -> rotation returns finite number", () => {
    const nodeTypes: Record<string, any> = {};
    registerCalculatorNodes({
      registerNodeType: (path: string, nodeType: any) => {
        nodeTypes[path] = nodeType;
      },
    });

    const StatNode = nodeTypes["calc/stat_table"];
    const ActionNode = nodeTypes["calc/damage_action"];
    const RotationNode = nodeTypes["calc/rotation"];

    const base = createNodeInstance(StatNode);
    base.properties.rows = [
      { stat: "BaseATK", value: 1000 },
      { stat: "ATKPercent", value: 0.5 },
      { stat: "FlatATK", value: 200 },
      { stat: "CritRate", value: 0.6 },
      { stat: "CritDMG", value: 1.2 },
      { stat: "PyroDMGBonus", value: 0.4 },
    ];
    StatNode.prototype.onExecute.call(base);
    const baseOutput = base._outputsData[0];

    const buff = createNodeInstance(StatNode);
    buff.properties.rows = [{ stat: "SkillDMGBonus", value: 0.2 }];
    StatNode.prototype.onExecute.call(buff);
    const buffOutput = buff._outputsData[0];

    const action = createNodeInstance(ActionNode);
    action._inputsData[0] = buffOutput;
    ActionNode.prototype.onExecute.call(action);
    const actionOutput = action._outputsData[0];

    const rotation = createNodeInstance(RotationNode);
    rotation._inputsData[0] = baseOutput;
    rotation._inputsData[1] = actionOutput;
    RotationNode.prototype.onExecute.call(rotation);

    expect(Number.isFinite(rotation._outputsData[0])).toBe(true);
    expect(rotation._outputsData[0]).toBeGreaterThan(0);
    expect(rotation._outputsData[1]).toBeDefined();
    expect(rotation._outputsData[1].rotation.actions).toHaveLength(1);
    expect(rotation._outputsData[1].buffTablesById).toBeDefined();
  });

  test("display_table forwards table and computes preview rows", () => {
    const nodeTypes: Record<string, any> = {};
    registerCalculatorNodes({
      registerNodeType: (path: string, nodeType: any) => {
        nodeTypes[path] = nodeType;
      },
    });

    const DisplayNode = nodeTypes["calc/display_table"];
    const display = createNodeInstance(DisplayNode);
    display._inputsData[0] = {
      BaseATK: 1000,
      CritRate: 0.5,
      ATKPercent: 0.466,
      None: 0,
    };

    DisplayNode.prototype.onExecute.call(display);

    expect(display._outputsData[0]).toMatchObject({
      BaseATK: 1000,
      CritRate: 0.5,
      ATKPercent: 0.466,
      None: 0,
    });
    expect(Array.isArray(display.__displayRows)).toBe(true);
    expect(display.__displayRows.length).toBeGreaterThan(0);
  });

  test("changing buff value propagates to rotation damage output", () => {
    const nodeTypes: Record<string, any> = {};
    registerCalculatorNodes({
      registerNodeType: (path: string, nodeType: any) => {
        nodeTypes[path] = nodeType;
      },
    });

    const StatNode = nodeTypes["calc/stat_table"];
    const ActionNode = nodeTypes["calc/damage_action"];
    const RotationNode = nodeTypes["calc/rotation"];

    const base = createNodeInstance(StatNode);
    base.properties.rows = [
      { stat: "BaseATK", value: 1000 },
      { stat: "ATKPercent", value: 0.5 },
      { stat: "CritRate", value: 0.5 },
      { stat: "CritDMG", value: 1.0 },
      { stat: "PyroDMGBonus", value: 0.4 },
    ];
    StatNode.prototype.onExecute.call(base);
    const baseOutput = base._outputsData[0];

    const buff = createNodeInstance(StatNode);
    buff.properties.rows = [{ stat: "PyroDMGBonus", value: 0.2 }];
    StatNode.prototype.onExecute.call(buff);
    const buffOutput1 = buff._outputsData[0];

    const action = createNodeInstance(ActionNode);
    action._inputsData[0] = buffOutput1;
    ActionNode.prototype.onExecute.call(action);
    const actionOutput = action._outputsData[0];

    const rotation = createNodeInstance(RotationNode);
    rotation._inputsData[0] = baseOutput;
    rotation._inputsData[1] = actionOutput;
    RotationNode.prototype.onExecute.call(rotation);
    const damage1 = rotation._outputsData[0];

    buff.properties.rows[0].value = 0.5;
    StatNode.prototype.onExecute.call(buff);
    const buffOutput2 = buff._outputsData[0];
    action._inputsData[0] = buffOutput2;
    ActionNode.prototype.onExecute.call(action);
    rotation._inputsData[1] = action._outputsData[0];
    RotationNode.prototype.onExecute.call(rotation);
    const damage2 = rotation._outputsData[0];

    expect(Number.isFinite(damage1)).toBe(true);
    expect(Number.isFinite(damage2)).toBe(true);
    expect(damage2).not.toBe(damage1);
    expect(damage2).toBeGreaterThan(damage1);
  });

  test("number node outputs its configured value", () => {
    const nodeTypes: Record<string, any> = {};
    registerCalculatorNodes({
      registerNodeType: (path: string, nodeType: any) => {
        nodeTypes[path] = nodeType;
      },
    });

    const NumberNode = nodeTypes["calc/number"];
    const node = createNodeInstance(NumberNode);
    node.properties.value = 1.35;
    NumberNode.prototype.onExecute.call(node);

    expect(node._outputsData[0]).toBeCloseTo(1.35);
  });

  test("action buff tables are scoped per action node and do not collide", () => {
    const nodeTypes: Record<string, any> = {};
    registerCalculatorNodes({
      registerNodeType: (path: string, nodeType: any) => {
        nodeTypes[path] = nodeType;
      },
    });

    const ActionNode = nodeTypes["calc/damage_action"];
    const RotationNode = nodeTypes["calc/rotation"];

    const actionA = createNodeInstance(ActionNode);
    actionA._inputsData[0] = { SkillDMGBonus: 0.2 };
    ActionNode.prototype.onExecute.call(actionA);

    const actionB = createNodeInstance(ActionNode);
    actionB._inputsData[0] = { SkillDMGBonus: 0.7 };
    ActionNode.prototype.onExecute.call(actionB);

    const payloadA = actionA._outputsData[0];
    const payloadB = actionB._outputsData[0];
    expect(payloadA.spec.buffTableNodeIds[0]).not.toBe(payloadB.spec.buffTableNodeIds[0]);

    const rotation = createNodeInstance(RotationNode);
    rotation._inputsData[0] = {
      BaseATK: 1000,
      ATKPercent: 0.5,
      CritRate: 0.5,
      CritDMG: 1.0,
      PyroDMGBonus: 0.4,
    };
    rotation._inputsData[1] = payloadA;
    rotation._inputsData[2] = payloadB;
    RotationNode.prototype.onExecute.call(rotation);

    const mergedBuffTables = rotation._outputsData[1]?.buffTablesById || {};
    expect(Object.keys(mergedBuffTables)).toHaveLength(2);
  });

  test("percent stat widgets accept both decimal and percent input forms", () => {
    const nodeTypes: Record<string, any> = {};
    registerCalculatorNodes({
      registerNodeType: (path: string, nodeType: any) => {
        nodeTypes[path] = nodeType;
      },
    });

    const StatNode = nodeTypes["calc/stat_table"];
    const node = createNodeInstanceWithWidgets(StatNode);
    node.properties.rows = [{ stat: "PyroDMGBonus", value: 0.2 }];
    StatNode.prototype.onConfigure.call(node);
    StatNode.prototype.onExecute.call(node);

    const valueWidget = (node.widgets || []).find((w: any) => w.name === "Value 1");
    expect(valueWidget).toBeDefined();

    valueWidget.callback(0.3);
    StatNode.prototype.onExecute.call(node);
    expect(node.properties.rows[0].value).toBeCloseTo(0.3, 8);
    expect((node._outputsData[0] || {}).PyroDMGBonus).toBeCloseTo(0.3, 8);

    valueWidget.callback(30);
    StatNode.prototype.onExecute.call(node);
    expect(node.properties.rows[0].value).toBeCloseTo(0.3, 8);
    expect((node._outputsData[0] || {}).PyroDMGBonus).toBeCloseTo(0.3, 8);
  });

  test("stat type widget updates persist across execute ticks", () => {
    const nodeTypes: Record<string, any> = {};
    registerCalculatorNodes({
      registerNodeType: (path: string, nodeType: any) => {
        nodeTypes[path] = nodeType;
      },
    });

    const StatNode = nodeTypes["calc/stat_table"];
    const node = createNodeInstanceWithWidgets(StatNode);
    node.properties.rows = [{ stat: "PyroDMGBonus", value: 0.2 }];
    StatNode.prototype.onConfigure.call(node);
    StatNode.prototype.onExecute.call(node);

    const getTypeWidget = () => (node.widgets || []).find((w: any) => w.name === "Type 1");

    getTypeWidget().callback("HydroDMGBonus");
    StatNode.prototype.onExecute.call(node);
    expect(node.properties.rows[0].stat).toBe("HydroDMGBonus");
    expect((node._outputsData[0] || {}).HydroDMGBonus).toBeCloseTo(0.2, 8);

    // Reacquire because type callback rebuilds widgets.
    getTypeWidget().callback("PyroDMGBonus");
    StatNode.prototype.onExecute.call(node);
    expect(node.properties.rows[0].stat).toBe("PyroDMGBonus");
    expect((node._outputsData[0] || {}).PyroDMGBonus).toBeCloseTo(0.2, 8);
  });
});
