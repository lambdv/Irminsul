"use client";

import { useEffect, useRef, useState } from "react";
import "litegraph.js/css/litegraph.css";
import styles from "./GraphWorkspace.module.css";
import { registerCalculatorNodes } from "@/feature/calculator/graph/registerCalculatorNodes";
import { buildStarterDoc } from "@/feature/calculator/graph/state/starterDoc";
import { attachLiteGraphToStoreSync } from "@/feature/calculator/graph/state/bridge";
import { cloneGraphDoc } from "@/feature/calculator/graph/state/docUtils";
import { useCalculatorGraphStore } from "@/store/CalculatorGraph";

type LiteGraphModule = {
  default: {
    LGraph: new () => any;
    LGraphCanvas: (new (canvas: HTMLCanvasElement, graph: any) => any) & {
      active_canvas: unknown;
    };
    LiteGraph: {
      registerNodeType: (path: string, nodeType: any) => void;
      createNode: (path: string) => any;
    };
  };
};

let nodesRegistered = false;

export default function GraphWorkspace() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const [size, setSize] = useState({ width: 1024, height: 720 });

  // Prevent scrolling on calculator page
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    // Store original values
    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    
    // Prevent scrolling
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    
    return () => {
      // Restore original values
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({
        width: Math.max(320, Math.floor(width)),
        height: Math.max(320, Math.floor(height)),
      });
    });

    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasElementRef.current) return;

    let mounted = true;
    let detachContextMenu = () => {};
    let detachStoreSync = () => {};

    const setupGraph = async () => {
      const liteGraphModule = (await import("litegraph.js")) as LiteGraphModule;
      if (!mounted || !canvasElementRef.current) return;

      const { default: lg } = liteGraphModule;
      if (!nodesRegistered) {
        registerCalculatorNodes(lg.LiteGraph);
        nodesRegistered = true;
      }

      const graph = new lg.LGraph();
      const graphCanvas = new lg.LGraphCanvas(canvasElementRef.current, graph);

      graphRef.current = graph;
      canvasRef.current = graphCanvas;

      graphCanvas.allow_dragcanvas = true;
      graphCanvas.allow_dragnodes = true;
      graphCanvas.allow_interaction = true;
      graphCanvas.allow_searchbox = true;
      graphCanvas.show_grid = true;
      graphCanvas.grid_size = 20;
      graphCanvas.background_image = null;

      const CALC_NODES = [
        { type: "calc/stat_table", title: "Stat Table" },
        { type: "calc/add_table", title: "Add Tables" },
        { type: "calc/damage_action", title: "Damage Action" },
        { type: "calc/rotation", title: "Rotation" },
      ] as const;

      graphCanvas.getMenuOptions = function () {
        const canvas = graphCanvas;
        return CALC_NODES.map(({ type, title }) => ({
          content: title,
          callback: function (
            _value: unknown,
            opts: { event?: MouseEvent; callback?: unknown },
          ) {
            const ev = opts?.event;
            if (!ev || !canvas?.graph) return;
            canvas.graph.beforeChange();
            const node = lg.LiteGraph.createNode(type);
            if (node) {
              const pos =
                typeof canvas.convertEventToCanvasOffset === "function"
                  ? canvas.convertEventToCanvasOffset(ev)
                  : [100, 100];
              node.pos = pos;
              canvas.graph.add(node);
            }
            canvas.graph.afterChange();
          },
        }));
      };

      const onContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        try {
          lg.LGraphCanvas.active_canvas = graphCanvas;
          if (typeof graphCanvas.adjustMouseEvent === "function") {
            graphCanvas.adjustMouseEvent(event);
          }

          const node =
            graphCanvas?.graph?.getNodeOnPos?.(
              (event as { canvasX?: number }).canvasX ?? 0,
              (event as { canvasY?: number }).canvasY ?? 0,
              graphCanvas.visible_nodes,
              5,
            ) ?? null;

          if (typeof graphCanvas.processContextMenu === "function") {
            graphCanvas.processContextMenu(node, event);
            return;
          }
        } catch {
          // Fall through to search-box fallback.
        }

        if (typeof graphCanvas.showSearchBox === "function") {
          graphCanvas.showSearchBox(event);
        }
      };
      canvasElementRef.current.addEventListener("contextmenu", onContextMenu);
      detachContextMenu = () => {
        canvasElementRef.current?.removeEventListener("contextmenu", onContextMenu);
      };

      const starterDoc = buildStarterDoc(lg);
      useCalculatorGraphStore.getState().hydrateFromStorage();
      useCalculatorGraphStore.getState().initIfEmpty(starterDoc);
      const initialDoc = useCalculatorGraphStore.getState().doc ?? starterDoc;
      graph.configure(cloneGraphDoc(initialDoc));
      graph.setDirtyCanvas?.(true, true);

      detachStoreSync = attachLiteGraphToStoreSync({
        graph,
        graphCanvas,
        store: useCalculatorGraphStore,
      });

      graph.start();
    };

    setupGraph();

    return () => {
      mounted = false;
      detachStoreSync();
      detachContextMenu();

      if (graphRef.current?.stop) {
        graphRef.current.stop();
      }

      if (canvasRef.current) {
        canvasRef.current.graph = null;
        if (canvasRef.current.clear) {
          canvasRef.current.clear();
        }
      }

      graphRef.current = null;
      canvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current?.setDirty) return;
    canvasRef.current.setDirty(true, true);
  }, [size.width, size.height]);

  return (
    <div className={styles.pageRoot}>
      <section className={styles.workspace} aria-label="Calculator graph workspace">
        <div ref={viewportRef} className={styles.viewport}>
          <canvas
            ref={canvasElementRef}
            width={size.width}
            height={size.height}
            className={styles.canvas}
          />
        </div>
      </section>
    </div>
  );
}
