import { attachLiteGraphToStoreSync } from "@/feature/calculator/graph/state/bridge";
import { CalculatorGraphDocument } from "@/feature/calculator/graph/state/types";
import {
  resetCalculatorGraphStore,
  useCalculatorGraphStore,
} from "@/store/CalculatorGraph";

const createDoc = (): CalculatorGraphDocument => ({
  last_node_id: 2,
  last_link_id: 1,
  nodes: [
    { id: 1, type: "calc/stat_table", pos: [80, 120], properties: {} },
    { id: 2, type: "calc/rotation", pos: [760, 250], properties: {} },
  ],
  links: [[1, 1, 0, 2, 0, "stat_table"]],
  groups: [],
  config: {},
  version: "0.7",
});

type GraphStub = {
  serialize: jest.Mock;
  configure: jest.Mock;
  setDirtyCanvas: jest.Mock;
  onAfterChange?: () => void;
};

type CanvasStub = {
  onNodeMoved?: (node: unknown) => void;
};

describe("litegraph/store bridge", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetCalculatorGraphStore();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("captures LiteGraph changes into Zustand state", () => {
    useCalculatorGraphStore.getState().initIfEmpty(createDoc());
    const changedDoc: CalculatorGraphDocument = {
      ...createDoc(),
      nodes: [
        createDoc().nodes[0],
        { ...createDoc().nodes[1], pos: [900, 260] },
      ],
    };

    const graph: GraphStub = {
      serialize: jest.fn(() => changedDoc),
      configure: jest.fn(),
      setDirtyCanvas: jest.fn(),
    };
    const graphCanvas: CanvasStub = {};

    const detach = attachLiteGraphToStoreSync({
      graph,
      graphCanvas,
      store: useCalculatorGraphStore,
    });

    graph.onAfterChange?.();
    jest.runOnlyPendingTimers();

    const state = useCalculatorGraphStore.getState();
    expect(state.lastMutationSource).toBe("litegraph");
    expect(state.revision).toBe(2);
    expect(state.doc?.nodes[1]?.pos).toEqual([900, 260]);

    detach();
  });

  test("replays store-origin changes back into LiteGraph", () => {
    useCalculatorGraphStore.getState().initIfEmpty(createDoc());

    const graph: GraphStub = {
      serialize: jest.fn(() => createDoc()),
      configure: jest.fn(),
      setDirtyCanvas: jest.fn(),
    };
    const graphCanvas: CanvasStub = {};
    const detach = attachLiteGraphToStoreSync({
      graph,
      graphCanvas,
      store: useCalculatorGraphStore,
    });

    const fromStoreDoc: CalculatorGraphDocument = {
      ...createDoc(),
      nodes: [
        createDoc().nodes[0],
        { ...createDoc().nodes[1], pos: [880, 300] },
      ],
    };
    useCalculatorGraphStore.getState().replaceFromStore(fromStoreDoc);

    expect(graph.configure).toHaveBeenCalledTimes(1);
    expect(graph.configure.mock.calls[0][0]).toEqual(fromStoreDoc);
    expect(graph.configure.mock.calls[0][0]).not.toBe(fromStoreDoc);
    expect(graph.setDirtyCanvas).toHaveBeenCalledWith(true, true);

    detach();
  });

  test("guard prevents configure -> capture sync loop", () => {
    useCalculatorGraphStore.getState().initIfEmpty(createDoc());
    const nextDoc: CalculatorGraphDocument = {
      ...createDoc(),
      nodes: [
        createDoc().nodes[0],
        { ...createDoc().nodes[1], pos: [1000, 310] },
      ],
    };

    const graph: GraphStub = {
      serialize: jest.fn(() => nextDoc),
      configure: jest.fn(() => {
        graph.onAfterChange?.();
      }),
      setDirtyCanvas: jest.fn(),
    };
    const graphCanvas: CanvasStub = {};
    const detach = attachLiteGraphToStoreSync({
      graph,
      graphCanvas,
      store: useCalculatorGraphStore,
    });

    useCalculatorGraphStore.getState().replaceFromStore(nextDoc);
    jest.runOnlyPendingTimers();

    const state = useCalculatorGraphStore.getState();
    expect(graph.configure).toHaveBeenCalledTimes(1);
    expect(graph.serialize).not.toHaveBeenCalled();
    expect(state.revision).toBe(2);
    expect(state.lastMutationSource).toBe("store");

    detach();
  });
});

