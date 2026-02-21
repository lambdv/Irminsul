"use client";

import { create } from "zustand";
import { cloneGraphDoc, graphDocsEqual, normalizeGraphDoc } from "@/feature/calculator/graph/state/docUtils";
import {
  CalculatorGraphDocument,
  GraphMutationSource,
} from "@/feature/calculator/graph/state/types";

const STORAGE_KEY = "calculator-graph-doc-v1";

type CalculatorGraphState = {
  doc: CalculatorGraphDocument | null;
  starterDoc: CalculatorGraphDocument | null;
  revision: number;
  lastMutationSource: GraphMutationSource;
  storageHydrated: boolean;
  hydrateFromStorage: () => void;
  initIfEmpty: (starterDoc: CalculatorGraphDocument) => void;
  replaceFromLiteGraph: (nextDoc: CalculatorGraphDocument) => void;
  replaceFromStore: (nextDoc: CalculatorGraphDocument) => void;
  resetToStarter: () => void;
};

const createInitialState = (): Omit<
  CalculatorGraphState,
  "initIfEmpty" | "replaceFromLiteGraph" | "replaceFromStore" | "resetToStarter"
> => ({
  doc: null,
  starterDoc: null,
  revision: 0,
  lastMutationSource: "bootstrap",
  storageHydrated: false,
});

const readStoredDoc = (): CalculatorGraphDocument | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeGraphDoc(JSON.parse(raw));
  } catch {
    return null;
  }
};

const writeStoredDoc = (doc: CalculatorGraphDocument | null) => {
  if (typeof window === "undefined") return;
  try {
    if (!doc) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch {
    // Ignore storage quota/security failures.
  }
};

const setDocumentIfChanged = (
  set: (fn: (state: CalculatorGraphState) => Partial<CalculatorGraphState> | CalculatorGraphState) => void,
  source: GraphMutationSource,
  nextDoc: CalculatorGraphDocument,
) => {
  const normalized = normalizeGraphDoc(nextDoc);
  set((state) => {
    if (state.doc && graphDocsEqual(state.doc, normalized)) {
      return state;
    }
    const next = cloneGraphDoc(normalized);
    writeStoredDoc(next);
    return {
      ...state,
      doc: next,
      revision: state.revision + 1,
      lastMutationSource: source,
    };
  });
};

export const useCalculatorGraphStore = create<CalculatorGraphState>((set, get) => ({
  ...createInitialState(),
  hydrateFromStorage: () => {
    set((state) => {
      if (state.storageHydrated) return state;
      const storedDoc = readStoredDoc();
      if (!storedDoc || state.doc) {
        return { ...state, storageHydrated: true };
      }
      return {
        ...state,
        doc: cloneGraphDoc(storedDoc),
        revision: state.revision + 1,
        lastMutationSource: "bootstrap",
        storageHydrated: true,
      };
    });
  },
  initIfEmpty: (starterDoc) => {
    const normalizedStarter = normalizeGraphDoc(starterDoc);
    set((state) => {
      if (state.doc) return state;
      const next = cloneGraphDoc(normalizedStarter);
      writeStoredDoc(next);
      return {
        ...state,
        doc: next,
        starterDoc: cloneGraphDoc(normalizedStarter),
        revision: state.revision + 1,
        lastMutationSource: "bootstrap",
      };
    });
  },
  replaceFromLiteGraph: (nextDoc) => {
    setDocumentIfChanged(set, "litegraph", nextDoc);
  },
  replaceFromStore: (nextDoc) => {
    setDocumentIfChanged(set, "store", nextDoc);
  },
  resetToStarter: () => {
    const starterDoc = get().starterDoc;
    if (!starterDoc) return;
    setDocumentIfChanged(set, "store", starterDoc);
  },
}));

export const resetCalculatorGraphStore = () => {
  writeStoredDoc(null);
  useCalculatorGraphStore.setState(
    {
      ...createInitialState(),
      hydrateFromStorage: useCalculatorGraphStore.getState().hydrateFromStorage,
      initIfEmpty: useCalculatorGraphStore.getState().initIfEmpty,
      replaceFromLiteGraph: useCalculatorGraphStore.getState().replaceFromLiteGraph,
      replaceFromStore: useCalculatorGraphStore.getState().replaceFromStore,
      resetToStarter: useCalculatorGraphStore.getState().resetToStarter,
    },
    true,
  );
};
