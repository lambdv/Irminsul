import { graphDocsEqual } from "@/feature/calculator/graph/state/docUtils";
import { CalculatorGraphDocument } from "@/feature/calculator/graph/state/types";
import {
  resetCalculatorGraphStore,
  useCalculatorGraphStore,
} from "@/store/CalculatorGraph";

const createDoc = (): CalculatorGraphDocument => ({
  last_node_id: 2,
  last_link_id: 1,
  nodes: [
    {
      id: 1,
      type: "calc/stat_table",
      pos: [80, 120],
      properties: {},
    },
    {
      id: 2,
      type: "calc/rotation",
      pos: [760, 250],
      properties: {},
    },
  ],
  links: [[1, 1, 0, 2, 0, "stat_table"]],
  groups: [],
  config: {},
  version: "0.7",
});

describe("calculator graph zustand store", () => {
  beforeEach(() => {
    resetCalculatorGraphStore();
  });

  test("initIfEmpty seeds exactly once", () => {
    const starter = createDoc();
    useCalculatorGraphStore.getState().initIfEmpty(starter);

    const firstState = useCalculatorGraphStore.getState();
    expect(firstState.doc).not.toBeNull();
    expect(firstState.lastMutationSource).toBe("bootstrap");
    expect(firstState.revision).toBe(1);
    expect(graphDocsEqual(firstState.doc, starter)).toBe(true);

    useCalculatorGraphStore.getState().initIfEmpty({
      ...starter,
      last_node_id: 99,
    });

    const secondState = useCalculatorGraphStore.getState();
    expect(secondState.revision).toBe(1);
    expect(secondState.doc?.last_node_id).toBe(2);
  });

  test("replaceFromLiteGraph updates revision/source and ignores unchanged docs", () => {
    const starter = createDoc();
    useCalculatorGraphStore.getState().initIfEmpty(starter);

    const nextDoc: CalculatorGraphDocument = {
      ...createDoc(),
      nodes: [
        createDoc().nodes[0],
        {
          ...createDoc().nodes[1],
          pos: [900, 260],
        },
      ],
    };
    useCalculatorGraphStore.getState().replaceFromLiteGraph(nextDoc);

    const updatedState = useCalculatorGraphStore.getState();
    expect(updatedState.lastMutationSource).toBe("litegraph");
    expect(updatedState.revision).toBe(2);
    expect(updatedState.doc?.nodes[1]?.pos).toEqual([900, 260]);

    useCalculatorGraphStore.getState().replaceFromLiteGraph(nextDoc);
    const unchangedState = useCalculatorGraphStore.getState();
    expect(unchangedState.revision).toBe(2);
  });

  test("sanitize drops links that reference missing nodes", () => {
    const invalidDoc: CalculatorGraphDocument = {
      ...createDoc(),
      links: [[1, 999, 0, 2, 0, "stat_table"]],
    };

    useCalculatorGraphStore.getState().replaceFromLiteGraph(invalidDoc);
    const state = useCalculatorGraphStore.getState();
    expect(state.doc?.links).toEqual([]);
    expect(state.lastMutationSource).toBe("litegraph");
  });

  test("hydrates once from localStorage and then keeps Zustand as source of truth", () => {
    const stored = createDoc();
    window.localStorage.setItem("calculator-graph-doc-v1", JSON.stringify(stored));

    useCalculatorGraphStore.getState().hydrateFromStorage();
    const hydrated = useCalculatorGraphStore.getState();
    expect(hydrated.storageHydrated).toBe(true);
    expect(hydrated.doc?.last_node_id).toBe(2);

    const fromStore = {
      ...createDoc(),
      nodes: [createDoc().nodes[0], { ...createDoc().nodes[1], pos: [999, 123] }],
    };
    useCalculatorGraphStore.getState().replaceFromStore(fromStore);
    expect(useCalculatorGraphStore.getState().doc?.nodes[1]?.pos).toEqual([999, 123]);
    expect(JSON.parse(window.localStorage.getItem("calculator-graph-doc-v1") || "{}").nodes[1].pos).toEqual([999, 123]);

    // Subsequent hydrates should not overwrite runtime state.
    window.localStorage.setItem("calculator-graph-doc-v1", JSON.stringify(createDoc()));
    useCalculatorGraphStore.getState().hydrateFromStorage();
    expect(useCalculatorGraphStore.getState().doc?.nodes[1]?.pos).toEqual([999, 123]);
  });
});
