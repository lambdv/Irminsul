export type GraphNodeId = number | string;

export type GraphLinkId = number;

export type LiteGraphSerializedLinkTuple = [
  GraphLinkId,
  GraphNodeId,
  number,
  GraphNodeId,
  number,
  string?,
];

export type LiteGraphSerializedLinkTupleAlt = [
  GraphLinkId,
  string,
  GraphNodeId,
  number,
  GraphNodeId,
  number,
];

export type LiteGraphSerializedLinkObject = {
  id: GraphLinkId;
  origin_id: GraphNodeId;
  origin_slot: number;
  target_id: GraphNodeId;
  target_slot: number;
  type?: string;
  [key: string]: unknown;
};

export type CalculatorGraphSerializedLink =
  | LiteGraphSerializedLinkTuple
  | LiteGraphSerializedLinkTupleAlt
  | LiteGraphSerializedLinkObject;

export type CalculatorGraphSerializedNode = {
  id: GraphNodeId;
  type?: string | null;
  pos?: number[];
  size?: number[];
  flags?: Record<string, unknown>;
  mode?: number;
  inputs?: unknown[];
  outputs?: unknown[];
  title?: string;
  properties?: Record<string, unknown>;
  widgets_values?: unknown[];
  [key: string]: unknown;
};

export type CalculatorGraphDocument = {
  last_node_id: number;
  last_link_id: number;
  nodes: CalculatorGraphSerializedNode[];
  links: CalculatorGraphSerializedLink[];
  groups: unknown[];
  config: Record<string, unknown>;
  extra?: unknown;
  version?: unknown;
  [key: string]: unknown;
};

export type GraphMutationSource = "bootstrap" | "litegraph" | "store";

