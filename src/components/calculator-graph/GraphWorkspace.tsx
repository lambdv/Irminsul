"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./GraphWorkspace.module.css";

type LiteGraphModule = {
  default: {
    LGraph: new () => any;
    LGraphCanvas: new (canvas: HTMLCanvasElement, graph: any) => any;
    LiteGraph: {
      registerNodeType: (path: string, nodeType: any) => void;
      createNode: (path: string) => any;
    };
  };
};

let nodesRegistered = false;

function registerDemoNodes(liteGraph: LiteGraphModule["default"]["LiteGraph"]) {
  if (nodesRegistered) return;

  function NumberNode(this: any) {
    this.addOutput("Value", "number");
    this.properties = { value: 12 };
    this.addWidget("number", "value", this.properties.value, "value");
  }
  NumberNode.title = "Number";
  NumberNode.prototype.onExecute = function onExecute(this: any) {
    this.setOutputData(0, this.properties.value);
  };

  function MathAddNode(this: any) {
    this.addInput("A", "number");
    this.addInput("B", "number");
    this.addOutput("Result", "number");
  }
  MathAddNode.title = "Add";
  MathAddNode.prototype.onExecute = function onExecute(this: any) {
    const a = this.getInputData(0) || 0;
    const b = this.getInputData(1) || 0;
    this.setOutputData(0, a + b);
  };

  liteGraph.registerNodeType("basic/number", NumberNode);
  liteGraph.registerNodeType("math/add", MathAddNode);
  nodesRegistered = true;
}

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

  const zoomIn = () => {
    const graphCanvas = canvasRef.current;
    if (!graphCanvas?.setZoom) return;
    graphCanvas.setZoom(graphCanvas.scale * 1.2, [
      graphCanvas.canvas.width / 2,
      graphCanvas.canvas.height / 2,
    ]);
  };

  const zoomOut = () => {
    const graphCanvas = canvasRef.current;
    if (!graphCanvas?.setZoom) return;
    graphCanvas.setZoom(graphCanvas.scale * 0.8, [
      graphCanvas.canvas.width / 2,
      graphCanvas.canvas.height / 2,
    ]);
  };

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

    const setupGraph = async () => {
      const liteGraphModule = (await import("litegraph.js")) as LiteGraphModule;
      if (!mounted || !canvasElementRef.current) return;

      const { default: lg } = liteGraphModule;
      registerDemoNodes(lg.LiteGraph);

      const graph = new lg.LGraph();
      const graphCanvas = new lg.LGraphCanvas(canvasElementRef.current, graph);

      graphRef.current = graph;
      canvasRef.current = graphCanvas;

      graphCanvas.allow_dragcanvas = true;
      graphCanvas.allow_dragnodes = true;
      graphCanvas.allow_interaction = true;
      graphCanvas.show_grid = true;
      graphCanvas.grid_size = 20;
      graphCanvas.background_image = null;

      const numberNode = lg.LiteGraph.createNode("basic/number");
      const addNode = lg.LiteGraph.createNode("math/add");

      if (numberNode && addNode) {
        numberNode.pos = [100, 140];
        addNode.pos = [380, 140];
        graph.add(numberNode);
        graph.add(addNode);
        numberNode.connect(0, addNode, 0);
      }

      graph.start();
    };

    setupGraph();

    return () => {
      mounted = false;

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
