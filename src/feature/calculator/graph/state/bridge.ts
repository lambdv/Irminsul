import { cloneGraphDoc, graphDocsEqual, normalizeGraphDoc } from "./docUtils";
import { CalculatorGraphDocument, GraphMutationSource } from "./types";

type GraphStateSnapshot = {
  doc: CalculatorGraphDocument | null;
  revision: number;
  lastMutationSource: GraphMutationSource;
  replaceFromLiteGraph: (nextDoc: CalculatorGraphDocument) => void;
};

type StoreLike = {
  getState: () => GraphStateSnapshot;
  subscribe: (
    listener: (state: GraphStateSnapshot, previousState: GraphStateSnapshot) => void,
  ) => () => void;
};

type GraphLike = {
  serialize?: () => unknown;
  configure?: (doc: unknown) => void;
  setDirtyCanvas?: (fg: boolean, bg: boolean) => void;
  onAfterChange?: (...args: unknown[]) => void;
};

type GraphCanvasLike = {
  onNodeMoved?: (node: unknown) => void;
};

type AttachArgs = {
  graph: GraphLike;
  graphCanvas: GraphCanvasLike;
  store: StoreLike;
};

const requestFrame = (callback: FrameRequestCallback): number => {
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    return window.requestAnimationFrame(callback);
  }
  return setTimeout(() => callback(Date.now()), 16) as unknown as number;
};

const cancelFrame = (id: number) => {
  if (typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
    window.cancelAnimationFrame(id);
    return;
  }
  clearTimeout(id);
};

export const attachLiteGraphToStoreSync = ({
  graph,
  graphCanvas,
  store,
}: AttachArgs): (() => void) => {
  let isApplyingStore = false;
  let isCapturingFrame = false;
  let disposed = false;
  let pendingFrame: number | null = null;
  let lastAppliedRevision = store.getState().revision;

  const previousOnAfterChange = graph.onAfterChange;
  const previousOnNodeMoved = graphCanvas.onNodeMoved;

  const captureSnapshot = () => {
    if (disposed || isApplyingStore || isCapturingFrame) return;
    if (typeof graph.serialize !== "function") return;

    isCapturingFrame = true;
    pendingFrame = requestFrame(() => {
      isCapturingFrame = false;
      pendingFrame = null;
      if (disposed || isApplyingStore) return;

      const serialized = normalizeGraphDoc(graph.serialize?.());
      const current = store.getState().doc;
      if (current && graphDocsEqual(current, serialized)) {
        return;
      }
      store.getState().replaceFromLiteGraph(serialized);
    });
  };

  graph.onAfterChange = (...args: unknown[]) => {
    if (typeof previousOnAfterChange === "function") {
      previousOnAfterChange.apply(graph, args);
    }
    captureSnapshot();
  };

  graphCanvas.onNodeMoved = (node: unknown) => {
    if (typeof previousOnNodeMoved === "function") {
      previousOnNodeMoved(node);
    }
    captureSnapshot();
  };

  const unsubscribe = store.subscribe((state, previousState) => {
    if (state.revision === previousState.revision) return;
    if (state.revision === lastAppliedRevision) return;
    if (state.lastMutationSource === "litegraph") return;
    if (!state.doc || typeof graph.configure !== "function") return;

    isApplyingStore = true;
    try {
      graph.configure(cloneGraphDoc(state.doc));
      graph.setDirtyCanvas?.(true, true);
      lastAppliedRevision = state.revision;
    } finally {
      isApplyingStore = false;
    }
  });

  return () => {
    disposed = true;
    if (pendingFrame !== null) {
      cancelFrame(pendingFrame);
      pendingFrame = null;
    }
    graph.onAfterChange = previousOnAfterChange;
    graphCanvas.onNodeMoved = previousOnNodeMoved;
    unsubscribe();
  };
};

