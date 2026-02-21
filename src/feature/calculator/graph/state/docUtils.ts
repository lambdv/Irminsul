import {
  CalculatorGraphDocument,
  CalculatorGraphSerializedLink,
  CalculatorGraphSerializedNode,
  GraphNodeId,
} from "./types";

const DEFAULT_DOC: CalculatorGraphDocument = {
  last_node_id: 0,
  last_link_id: 0,
  nodes: [],
  links: [],
  groups: [],
  config: {},
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toNumericId = (value: unknown): number | null =>
  Number.isFinite(value) ? Number(value) : null;

const clone = <T>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const stableSerialize = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  const body = keys
    .map((key) => `${JSON.stringify(key)}:${stableSerialize((value as Record<string, unknown>)[key])}`)
    .join(",");
  return `{${body}}`;
};

const getLinkEndpoints = (
  link: CalculatorGraphSerializedLink,
): { originId: GraphNodeId | null; targetId: GraphNodeId | null } => {
  if (Array.isArray(link)) {
    // Runtime serialize() format: [id, origin_id, origin_slot, target_id, target_slot, type]
    // d.ts alt format: [id, type, origin_id, origin_slot, target_id, target_slot]
    if (typeof link[1] === "string") {
      return {
        originId: (link as unknown[])[2] as GraphNodeId,
        targetId: (link as unknown[])[4] as GraphNodeId,
      };
    }
    return {
      originId: (link as unknown[])[1] as GraphNodeId,
      targetId: (link as unknown[])[3] as GraphNodeId,
    };
  }
  return {
    originId: (link.origin_id ?? null) as GraphNodeId | null,
    targetId: (link.target_id ?? null) as GraphNodeId | null,
  };
};

const readLinkId = (link: CalculatorGraphSerializedLink): number | null => {
  if (Array.isArray(link)) {
    return toNumericId(link[0]);
  }
  return toNumericId(link.id);
};

const withNormalizedLinkId = (
  link: CalculatorGraphSerializedLink,
  linkId: number,
): CalculatorGraphSerializedLink => {
  if (Array.isArray(link)) {
    const next = [...link] as unknown[];
    next[0] = linkId;
    return next as CalculatorGraphSerializedLink;
  }
  return { ...link, id: linkId };
};

const toNodeIdKey = (id: GraphNodeId): string => String(id);

const normalizeNodes = (
  nodesInput: unknown,
  lastNodeIdInput: unknown,
): { nodes: CalculatorGraphSerializedNode[]; lastNodeId: number } => {
  const source = Array.isArray(nodesInput) ? nodesInput : [];
  const lastNodeIdFromDoc = toNumericId(lastNodeIdInput) ?? 0;
  let nextGeneratedId = Math.max(0, lastNodeIdFromDoc);
  const seen = new Set<string>();
  const normalized: CalculatorGraphSerializedNode[] = [];
  let maxNumericId = lastNodeIdFromDoc;

  for (const rawNode of source) {
    if (!isObject(rawNode)) continue;
    const node = clone(rawNode) as CalculatorGraphSerializedNode;
    let nodeId = node.id;
    const key = toNodeIdKey(nodeId);
    const idIsUsable = (typeof nodeId === "number" || typeof nodeId === "string") && !seen.has(key);

    if (!idIsUsable) {
      nextGeneratedId += 1;
      nodeId = nextGeneratedId;
      node.id = nodeId;
    }

    seen.add(toNodeIdKey(nodeId));

    const numericId = toNumericId(nodeId);
    if (numericId !== null) {
      maxNumericId = Math.max(maxNumericId, numericId);
      nextGeneratedId = Math.max(nextGeneratedId, numericId);
    }

    if (!Array.isArray(node.pos)) {
      node.pos = [0, 0];
    }

    normalized.push(node);
  }

  return { nodes: normalized, lastNodeId: maxNumericId };
};

const normalizeLinks = (
  linksInput: unknown,
  nodeIdSet: Set<string>,
  lastLinkIdInput: unknown,
): { links: CalculatorGraphSerializedLink[]; lastLinkId: number } => {
  const source = Array.isArray(linksInput) ? linksInput : [];
  const lastLinkIdFromDoc = toNumericId(lastLinkIdInput) ?? 0;
  let nextGeneratedLinkId = Math.max(0, lastLinkIdFromDoc);
  const seen = new Set<number>();
  const normalized: CalculatorGraphSerializedLink[] = [];
  let maxNumericLinkId = lastLinkIdFromDoc;

  for (const rawLink of source) {
    if (!Array.isArray(rawLink) && !isObject(rawLink)) continue;
    const link = clone(rawLink as CalculatorGraphSerializedLink);
    const { originId, targetId } = getLinkEndpoints(link);
    if (originId === null || targetId === null) continue;
    if (!nodeIdSet.has(toNodeIdKey(originId)) || !nodeIdSet.has(toNodeIdKey(targetId))) {
      continue;
    }

    let linkId = readLinkId(link);
    if (linkId === null || seen.has(linkId)) {
      nextGeneratedLinkId += 1;
      linkId = nextGeneratedLinkId;
    }
    seen.add(linkId);
    maxNumericLinkId = Math.max(maxNumericLinkId, linkId);
    nextGeneratedLinkId = Math.max(nextGeneratedLinkId, linkId);

    normalized.push(withNormalizedLinkId(link, linkId));
  }

  return { links: normalized, lastLinkId: maxNumericLinkId };
};

export const cloneGraphDoc = (doc: CalculatorGraphDocument): CalculatorGraphDocument =>
  clone(doc);

export const normalizeGraphDoc = (doc: unknown): CalculatorGraphDocument => {
  if (!isObject(doc)) {
    return clone(DEFAULT_DOC);
  }

  const source = clone(doc) as Record<string, unknown>;
  const { nodes, lastNodeId } = normalizeNodes(source.nodes, source.last_node_id);
  const nodeIdSet = new Set(nodes.map((node) => toNodeIdKey(node.id)));
  const { links, lastLinkId } = normalizeLinks(source.links, nodeIdSet, source.last_link_id);

  return {
    ...source,
    last_node_id: Math.max(lastNodeId, toNumericId(source.last_node_id) ?? 0),
    last_link_id: Math.max(lastLinkId, toNumericId(source.last_link_id) ?? 0),
    nodes,
    links,
    groups: Array.isArray(source.groups) ? (clone(source.groups) as unknown[]) : [],
    config: isObject(source.config) ? (clone(source.config) as Record<string, unknown>) : {},
  } as CalculatorGraphDocument;
};

export const graphDocsEqual = (
  a: CalculatorGraphDocument | null | undefined,
  b: CalculatorGraphDocument | null | undefined,
): boolean => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return stableSerialize(a) === stableSerialize(b);
};

