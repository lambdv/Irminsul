"use client"
import { useEffect, useRef } from "react"
import CSS from "./calculator.module.css"
import "./litegraph.css"

interface LiteGraphCanvasProps {
  width?: number
  height?: number
  className?: string
}

export default function LiteGraphCanvasComponent({
  width = 1024,
  height = 720,
  className = "",
}: LiteGraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const graphRef = useRef<any>(null)
  const canvasInstanceRef = useRef<any>(null)

  const handleZoomIn = () => {
    if (canvasInstanceRef.current) {
      const canvas = canvasInstanceRef.current
      canvas.setZoom(canvas.scale * 1.2, [
        canvas.canvas.width / 2,
        canvas.canvas.height / 2,
      ])
    }
  }

  const handleZoomOut = () => {
    if (canvasInstanceRef.current) {
      const canvas = canvasInstanceRef.current
      canvas.setZoom(canvas.scale * 0.8, [
        canvas.canvas.width / 2,
        canvas.canvas.height / 2,
      ])
    }
  }

  useEffect(() => {
    if (!canvasRef.current) return

    // Dynamically import LiteGraph
    const loadLiteGraph = async () => {
      try {
        const LiteGraphModule = await import("litegraph.js")
        const LiteGraph = (LiteGraphModule as any).default || LiteGraphModule

        // Register some basic node types
        function MathAddNode(this: any) {
          this.addInput("A", "number")
          this.addInput("B", "number")
          this.addOutput("Result", "number")
          this.properties = { precision: 1 }
        }
        MathAddNode.title = "Add"
        ;(MathAddNode as any).prototype.onExecute = function () {
          const A = this.getInputData(0) || 0
          const B = this.getInputData(1) || 0
          this.setOutputData(0, A + B)
        }

        function MathMultiplyNode(this: any) {
          this.addInput("A", "number")
          this.addInput("B", "number")
          this.addOutput("Result", "number")
        }
        MathMultiplyNode.title = "Multiply"
        ;(MathMultiplyNode as any).prototype.onExecute = function () {
          const A = this.getInputData(0) || 0
          const B = this.getInputData(1) || 0
          this.setOutputData(0, A * B)
        }

        function NumberNode(this: any) {
          this.addOutput("Value", "number")
          this.properties = { value: 1.0 }
          this.widget = this.addWidget("number", "value", 1, "value")
        }
        NumberNode.title = "Number"
        ;(NumberNode as any).prototype.onExecute = function () {
          this.setOutputData(0, this.properties.value)
        }

        // Register nodes using the appropriate method
        if (LiteGraph.registerNodeType) {
          LiteGraph.registerNodeType("math/add", MathAddNode)
          LiteGraph.registerNodeType("math/multiply", MathMultiplyNode)
          LiteGraph.registerNodeType("basic/number", NumberNode)
        }

        // Create graph instance using the appropriate constructor
        const LGraph = LiteGraph.LGraph
        if (!LGraph) {
          throw new Error("LiteGraph LGraph constructor not found")
        }

        const graph = new LGraph()
        graphRef.current = graph

        // Create canvas instance using the appropriate constructor
        const LGraphCanvas = LiteGraph.LGraphCanvas
        if (!LGraphCanvas) {
          throw new Error("LiteGraph LGraphCanvas constructor not found")
        }

        const canvas = new LGraphCanvas(canvasRef.current, graph)
        canvasInstanceRef.current = canvas

        // Set canvas styling
        canvas.background_image = null
        canvas.bgcanvas.style.background = "#1a1a1a"
        canvas.canvas.style.background = "#1a1a1a"

        // Enable grid background
        ;(canvas as any).show_grid = true
        ;(canvas as any).grid_size = 20
        ;(canvas as any).grid_color = "#333333"

        // Enable context menu
        canvas.allow_dragcanvas = true
        canvas.allow_dragnodes = true
        canvas.allow_interaction = true

        // Start the graph
        graph.start()
      } catch (error) {
        console.error("Failed to load LiteGraph:", error)
      }
    }

    loadLiteGraph()

    // Cleanup function
    return () => {
      if (graphRef.current) {
        graphRef.current.stop()
      }
    }
  }, [])

  return (
    <div className={`${CSS.graphContainer} ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={CSS.graphCanvas}
      />
      <div className={CSS.zoomControls}>
        <button
          onClick={handleZoomIn}
          className={CSS.zoomButton}
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className={CSS.zoomButton}
          title="Zoom Out"
        >
          −
        </button>
      </div>
    </div>
  )
}
