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
      const LiteGraph = await import("litegraph.js")

      // Register some basic node types
      function MathAddNode() {
        this.addInput("A", "number")
        this.addInput("B", "number")
        this.addOutput("Result", "number")
        this.properties = { precision: 1 }
      }
      MathAddNode.title = "Add"
      MathAddNode.prototype.onExecute = function () {
        const A = this.getInputData(0) || 0
        const B = this.getInputData(1) || 0
        this.setOutputData(0, A + B)
      }
      ;(LiteGraph as any).LiteGraph.registerNodeType("math/add", MathAddNode)

      function MathMultiplyNode() {
        this.addInput("A", "number")
        this.addInput("B", "number")
        this.addOutput("Result", "number")
      }
      MathMultiplyNode.title = "Multiply"
      MathMultiplyNode.prototype.onExecute = function () {
        const A = this.getInputData(0) || 0
        const B = this.getInputData(1) || 0
        this.setOutputData(0, A * B)
      }
      ;(LiteGraph as any).LiteGraph.registerNodeType(
        "math/multiply",
        MathMultiplyNode
      )

      function NumberNode() {
        this.addOutput("Value", "number")
        this.properties = { value: 1.0 }
        this.widget = this.addWidget("number", "value", 1, "value")
      }
      NumberNode.title = "Number"
      NumberNode.prototype.onExecute = function () {
        this.setOutputData(0, this.properties.value)
      }
      ;(LiteGraph as any).LiteGraph.registerNodeType("basic/number", NumberNode)

      // Create graph instance
      const graph = new (LiteGraph as any).default.LGraph()
      graphRef.current = graph

      // Create canvas instance
      const canvas = new (LiteGraph as any).default.LGraphCanvas(
        canvasRef.current,
        graph
      )
      canvasInstanceRef.current = canvas

      // Set canvas styling
      canvas.background_image = null
      const style = getComputedStyle(document.documentElement)
      const bgColor =
        style.getPropertyValue("--background-color").trim() || "#070707"
      const gridColor =
        style.getPropertyValue("--outline-color").trim() || "#262626"

      canvas.bgcanvas.style.background = bgColor
      canvas.canvas.style.background = bgColor

      // Enable grid background
      ;(canvas as any).show_grid = true
      ;(canvas as any).grid_size = 20
      ;(canvas as any).grid_color = gridColor

      // Enable context menu
      canvas.allow_dragcanvas = true
      canvas.allow_dragnodes = true
      canvas.allow_interaction = true

      // Start the graph
      graph.start()
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
