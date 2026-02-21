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

export const buildStarterDoc = (runtime: LiteGraphRuntime): CalculatorGraphDocument => {
  const graph = new runtime.LGraph();

  const baseStatsNode = runtime.LiteGraph.createNode("calc/stat_table");
  const buffStatsNode = runtime.LiteGraph.createNode("calc/stat_table");
  const actionNode = runtime.LiteGraph.createNode("calc/damage_action");
  const rotationNode = runtime.LiteGraph.createNode("calc/rotation");
  const damageOutputNode = runtime.LiteGraph.createNode("calc/display_number");

  if (baseStatsNode && buffStatsNode && actionNode && rotationNode) {
    baseStatsNode.pos = [80, 120];
    buffStatsNode.pos = [80, 380];
    actionNode.pos = [420, 250];
    rotationNode.pos = [760, 250];
    if (damageOutputNode) {
      damageOutputNode.pos = [1040, 250];
      damageOutputNode.properties.label = "Rotation Damage";
    }

    buffStatsNode.properties.rows = [{ stat: "PyroDMGBonus", value: 0.2 }];
    if (typeof buffStatsNode.onConfigure === "function") {
      buffStatsNode.onConfigure();
    }

    graph.add(baseStatsNode);
    graph.add(buffStatsNode);
    graph.add(actionNode);
    graph.add(rotationNode);
    if (damageOutputNode) {
      graph.add(damageOutputNode);
    }

    baseStatsNode.connect(0, rotationNode, 0);
    buffStatsNode.connect(0, actionNode, 0);
    actionNode.connect(0, rotationNode, 1);
    if (damageOutputNode) {
      rotationNode.connect(0, damageOutputNode, 0);
    }
  }

  return normalizeGraphDoc(graph.serialize());
};
