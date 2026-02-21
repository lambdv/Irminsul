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

describe("calculator graph nodes", () => {
  test("registers required node types", () => {
    const nodeTypes: Record<string, NodeCtor> = {};
    registerCalculatorNodes({
      registerNodeType: (path: string, nodeType: NodeCtor) => {
        nodeTypes[path] = nodeType;
      },
    });

    expect(nodeTypes["calc/stat_table"]).toBeDefined();
    expect(nodeTypes["calc/add_table"]).toBeDefined();
    expect(nodeTypes["calc/display_table"]).toBeDefined();
    expect(nodeTypes["calc/character_factory"]).toBeDefined();
    expect(nodeTypes["calc/weapon_factory"]).toBeDefined();
    expect(nodeTypes["calc/damage_action"]).toBeDefined();
    expect(nodeTypes["calc/rotation"]).toBeDefined();
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
});
