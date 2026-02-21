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
      ContextMenu?: any;
      registered_node_types?: Record<string, { title?: string }>;
    };
  };
};

let nodesRegistered = false;
const COMBO_MENU_SEARCH_PATCH_FLAG = "__irminsulComboMenuSearchPatched";

const isSearchableMenuValues = (values: unknown): values is Array<string | number | boolean> => {
  if (!Array.isArray(values) || values.length === 0) return false;
  return values.every(
    (entry) =>
      entry !== null &&
      entry !== undefined &&
      (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean"),
  );
};

const shouldEnhanceContextMenu = (values: unknown, options: unknown): boolean => {
  if (!isSearchableMenuValues(values)) return false;
  const contextOptions = (options || {}) as { className?: string; parentMenu?: unknown };
  if (contextOptions.className !== "dark") return false;
  if (contextOptions.parentMenu) return false;
  return true;
};

const enhanceContextMenuSearch = (menu: any) => {
  const root = menu?.root as HTMLElement | undefined;
  if (!root || root.querySelector(".litegraph-menu-search")) return;

  const entries = Array.from(root.querySelectorAll<HTMLElement>(".litemenu-entry")).filter(
    (entry) => !entry.classList.contains("separator"),
  );
  if (entries.length < 2) return;

  const searchRow = document.createElement("div");
  searchRow.className = "litegraph-menu-search";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Search...";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Filter options");
  searchRow.appendChild(input);

  const firstChild = root.firstElementChild;
  if (firstChild && firstChild.classList.contains("litemenu-title")) {
    root.insertBefore(searchRow, firstChild.nextSibling);
  } else {
    root.insertBefore(searchRow, firstChild);
  }

  let firstVisible: HTMLElement | null = null;
  const applyFilter = (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    firstVisible = null;
    for (const entry of entries) {
      const normalizedEntry = (entry.textContent || "").trim().toLowerCase();
      const visible = normalizedQuery.length === 0 || normalizedEntry.includes(normalizedQuery);
      entry.style.display = visible ? "" : "none";
      if (visible && !firstVisible) {
        firstVisible = entry;
      }
    }
  };

  applyFilter("");
  input.addEventListener("input", () => {
    applyFilter(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      firstVisible?.click();
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.key === "Escape") {
      if (typeof menu.close === "function") menu.close();
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    event.stopPropagation();
  });
  input.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });
  setTimeout(() => {
    input.focus();
    input.select();
  }, 0);
};

const enableComboDropdownSearch = (liteGraph: LiteGraphModule["default"]["LiteGraph"]) => {
  const OriginalContextMenu = liteGraph.ContextMenu;
  if (!OriginalContextMenu || (OriginalContextMenu as any)[COMBO_MENU_SEARCH_PATCH_FLAG]) return;

  const PatchedContextMenu = function (this: any, values: unknown, options?: unknown) {
    OriginalContextMenu.call(this, values, options);
    if (!shouldEnhanceContextMenu(values, options)) return;
    enhanceContextMenuSearch(this);
  };

  PatchedContextMenu.prototype = OriginalContextMenu.prototype;
  PatchedContextMenu.prototype.constructor = PatchedContextMenu;
  Object.setPrototypeOf(PatchedContextMenu, OriginalContextMenu);
  (PatchedContextMenu as any)[COMBO_MENU_SEARCH_PATCH_FLAG] = true;

  liteGraph.ContextMenu = PatchedContextMenu;
};

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
    let detachDoubleClick = () => {};
    let detachStoreSync = () => {};

    const setupGraph = async () => {
      const liteGraphModule = (await import("litegraph.js")) as LiteGraphModule;
      if (!mounted || !canvasElementRef.current) return;

      const { default: lg } = liteGraphModule;
      enableComboDropdownSearch(lg.LiteGraph);
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
      
      // Set background color to match app theme
      const getBackgroundColor = () => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue("--background-color")
          .trim();
      };
      
      const setBackgroundColor = () => {
        if (!canvasElementRef.current) return;
        const bgColor = getBackgroundColor();
        
        // Set on canvas element
        canvasElementRef.current.style.backgroundColor = bgColor;
        
        // Find and set on all parent containers up to viewport
        let element: HTMLElement | null = canvasElementRef.current;
        while (element && element !== viewportRef.current) {
          element.style.backgroundColor = bgColor;
          element = element.parentElement;
        }
        
        // Set background_color property if LiteGraph supports it
        // Convert hex/rgb to format LiteGraph expects
        if ("background_color" in graphCanvas) {
          (graphCanvas as any).background_color = bgColor;
        }
        
        // Try common LiteGraph background properties
        const canvasAny = graphCanvas as any;
        if ("bgcolor" in canvasAny) {
          canvasAny.bgcolor = bgColor;
        }
        if ("clearcolor" in canvasAny) {
          canvasAny.clearcolor = bgColor;
        }
        
        // Also try to find any LiteGraph wrapper divs by class
        if (viewportRef.current) {
          const liteGraphElements = viewportRef.current.querySelectorAll(
            '[class*="lgraph"], [class*="litegraph"]'
          );
          liteGraphElements.forEach((el) => {
            (el as HTMLElement).style.backgroundColor = bgColor;
          });
        }
      };
      
      setBackgroundColor();
      
      // Override LiteGraph's drawBackground if it exists
      const originalDrawBackground = (graphCanvas as any).drawBackground;
      if (typeof originalDrawBackground === "function") {
        (graphCanvas as any).drawBackground = function(...args: any[]) {
          const ctx = args[0];
          if (ctx && ctx.canvas) {
            const bgColor = getBackgroundColor();
            ctx.save();
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
          }
          return originalDrawBackground.apply(this, args);
        };
      }
      
      // Re-apply after delays to catch dynamically created elements
      setTimeout(setBackgroundColor, 100);
      setTimeout(setBackgroundColor, 500);
      setTimeout(setBackgroundColor, 1000);

      const CALC_NODES = [
        { type: "calc/number", title: "Number" },
        { type: "calc/stat_table", title: "Stat Table" },
        { type: "calc/add_table", title: "Add Tables" },
        { type: "calc/display_table", title: "Display Table" },
        { type: "calc/display_number", title: "Display Number" },
        { type: "calc/character_factory", title: "Character Factory" },
        { type: "calc/weapon_factory", title: "Weapon Factory" },
        { type: "calc/damage_action", title: "Damage Action" },
        { type: "calc/rotation", title: "Rotation" },
        { type: "calc/kqmc_optimizer", title: "KQMC Optimizer" },
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

      graphCanvas.onSearchBox = function (_helper: unknown, query: unknown) {
        const registeredTypes = lg.LiteGraph.registered_node_types || {};
        const search = typeof query === "string" ? query.trim().toLowerCase() : "";
        return Object.keys(registeredTypes).filter((type) => {
          if (!type.startsWith("calc/")) return false;
          if (!search) return true;
          const title = registeredTypes[type]?.title || "";
          return (
            type.toLowerCase().includes(search) ||
            title.toLowerCase().includes(search)
          );
        });
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

      const onDoubleClick = (event: MouseEvent) => {
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

          if (!node && typeof graphCanvas.showSearchBox === "function") {
            graphCanvas.showSearchBox(event);
          }
        } catch {
          // Fall through to search-box fallback.
        }
      };
      canvasElementRef.current.addEventListener("dblclick", onDoubleClick);
      detachDoubleClick = () => {
        canvasElementRef.current?.removeEventListener("dblclick", onDoubleClick);
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

      graph.onAfterStep = () => {
        graph.setDirtyCanvas?.(true, true);
      };

      if (typeof window !== "undefined") {
        const win = window as { __calcGraph?: typeof graph; __calcTestResetToStarter?: () => void };
        win.__calcGraph = graph;
        win.__calcTestResetToStarter = () => {
          graph.configure(cloneGraphDoc(starterDoc));
          graph.setDirtyCanvas?.(true, true);
        };
      }

      graph.start();
    };

    setupGraph();

    return () => {
      mounted = false;
      detachStoreSync();
      detachContextMenu();
      detachDoubleClick();

      if (typeof window !== "undefined") {
        const win = window as { __calcGraph?: unknown; __calcTestResetToStarter?: unknown };
        delete win.__calcGraph;
        delete win.__calcTestResetToStarter;
      }

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

  // Update background color when theme changes or on zoom
  useEffect(() => {
    const updateBackground = () => {
      if (!canvasElementRef.current || !viewportRef.current) return;
      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--background-color")
        .trim();
      
      // Set on canvas
      canvasElementRef.current.style.backgroundColor = bgColor;
      
      // Update all parent containers up to viewport
      let element: HTMLElement | null = canvasElementRef.current;
      while (element && element !== viewportRef.current) {
        element.style.backgroundColor = bgColor;
        element = element.parentElement;
      }
      
      // Update LiteGraph's background_color if it exists
      if (canvasRef.current && "background_color" in canvasRef.current) {
        (canvasRef.current as any).background_color = bgColor;
      }
      
      // Find and update any LiteGraph wrapper elements
      const liteGraphElements = viewportRef.current.querySelectorAll(
        '[class*="lgraph"], [class*="litegraph"]'
      );
      liteGraphElements.forEach((el) => {
        (el as HTMLElement).style.backgroundColor = bgColor;
      });
    };

    updateBackground();
    
    // Watch for theme changes
    const themeObserver = new MutationObserver(updateBackground);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    
    // Watch for DOM changes in viewport (LiteGraph might add elements)
    const domObserver = new MutationObserver(() => {
      setTimeout(updateBackground, 0);
    });
    
    if (viewportRef.current) {
      domObserver.observe(viewportRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    return () => {
      themeObserver.disconnect();
      domObserver.disconnect();
    };
  }, []);

  // Ensure canvas has background color set via inline style
  useEffect(() => {
    if (!canvasElementRef.current) return;
    
    const updateCanvasStyle = () => {
      if (!canvasElementRef.current) return;
      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--background-color")
        .trim();
      canvasElementRef.current.style.setProperty(
        "background-color",
        bgColor,
        "important"
      );
    };
    
    updateCanvasStyle();
    
    const observer = new MutationObserver(updateCanvasStyle);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.pageRoot}>
      <section className={styles.workspace} aria-label="Calculator graph workspace">
        <div ref={viewportRef} className={styles.viewport}>
          <canvas
            ref={canvasElementRef}
            data-testid="calculator-graph-canvas"
            width={size.width}
            height={size.height}
            className={styles.canvas}
          />
        </div>
      </section>
    </div>
  );
}
