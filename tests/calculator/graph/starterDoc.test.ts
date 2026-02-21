import { buildStarterDoc } from "@/feature/calculator/graph/state/starterDoc";

type MockNode = {
  id?: number;
  type: string;
  pos: number[];
  properties: Record<string, unknown>;
  graph?: MockGraph;
  onConfigure?: jest.Mock;
  connect: (outputSlot: number, targetNode: MockNode, targetSlot: number) => void;
};

class MockGraph {
  public last_node_id = 0;
  public last_link_id = 0;
  public nodes: MockNode[] = [];
  public links: Array<[number, number, number, number, number, string]> = [];

  add(node: MockNode) {
    this.last_node_id += 1;
    node.id = this.last_node_id;
    node.graph = this;
    this.nodes.push(node);
  }

  serialize() {
    return {
      last_node_id: this.last_node_id,
      last_link_id: this.last_link_id,
      nodes: this.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        pos: [...node.pos],
        properties: { ...node.properties },
      })),
      links: this.links.map((link) => [...link]),
      groups: [],
      config: {},
      version: "mock",
    };
  }
}

const createMockNode = (type: string): MockNode => {
  const node: MockNode = {
    type,
    pos: [0, 0],
    properties:
      type === "calc/stat_table"
        ? {
            rows: [
              { stat: "BaseATK", value: 1000 },
              { stat: "ATKPercent", value: 0.5 },
            ],
          }
        : {},
    connect(outputSlot, targetNode, targetSlot) {
      if (!this.graph || !targetNode.graph || this.graph !== targetNode.graph) return;
      this.graph.last_link_id += 1;
      this.graph.links.push([
        this.graph.last_link_id,
        this.id || 0,
        outputSlot,
        targetNode.id || 0,
        targetSlot,
        "",
      ]);
    },
  };

  if (type === "calc/stat_table") {
    node.onConfigure = jest.fn(() => {
      const rows = node.properties.rows;
      if (!Array.isArray(rows)) {
        node.properties.rows = [];
      }
    });
  }

  return node;
};

describe("calculator starter graph document", () => {
  test("buildStarterDoc creates 4 starter nodes and 3 starter links", () => {
    const runtime = {
      LGraph: MockGraph,
      LiteGraph: {
        createNode: jest.fn((type: string) => createMockNode(type)),
      },
    };

    const doc = buildStarterDoc(runtime as any);
    expect(doc.nodes).toHaveLength(4);
    expect(doc.links).toHaveLength(3);

    const buffNode = doc.nodes.find(
      (node) =>
        node.type === "calc/stat_table" &&
        Array.isArray(node.pos) &&
        node.pos[0] === 80 &&
        node.pos[1] === 380,
    );
    expect(buffNode).toBeDefined();
    expect((buffNode?.properties as any)?.rows).toEqual([
      { stat: "PyroDMGBonus", value: 0.2 },
    ]);
  });
});

