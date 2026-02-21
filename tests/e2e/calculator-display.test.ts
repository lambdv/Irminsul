import { test, expect } from "@playwright/test"

test.describe("Calculator Display Number E2E", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log("Console error:", msg.text())
      }
    })
  })

  test("should load calculator page with graph canvas", async ({ page }) => {
    await page.goto("/calculator")
    await page.waitForLoadState("networkidle")

    const canvas = page.getByTestId("calculator-graph-canvas")
    await expect(canvas).toBeVisible({ timeout: 10000 })
  })

  test("graph executes and produces non-zero damage output", async ({ page }) => {
    await page.goto("/calculator")
    await page.waitForLoadState("networkidle")

    const canvas = page.getByTestId("calculator-graph-canvas")
    await expect(canvas).toBeVisible({ timeout: 10000 })

    await page.evaluate(() => {
      ;(window as { __calcTestResetToStarter?: () => void }).__calcTestResetToStarter?.()
    })

    await page.waitForTimeout(500)

    const result = await page.evaluate(() => {
      const g = (window as { __calcGraph?: any }).__calcGraph
      if (!g || !g._nodes) return { error: "No graph" }

      const rotationNode = g._nodes.find(
        (n: any) => n.type === "calc/rotation" || n.constructor?.title === "Rotation"
      )
      const displayNode = g._nodes.find(
        (n: any) => n.type === "calc/display_number" || n.constructor?.title === "Display Number"
      )

      if (!rotationNode || !displayNode) return { error: "Missing nodes" }

      g.runStep(1)
      const damage = rotationNode.outputs?.[0]?._data ?? displayNode.getOutputData?.(0) ?? null

      return {
        damage,
        hasDamage: Number.isFinite(Number(damage)) && Number(damage) > 0,
      }
    })

    if (result.error) {
      throw new Error(`E2E setup failed: ${result.error}`)
    }

    expect(result.hasDamage).toBe(true)
    expect(Number(result.damage)).toBeGreaterThan(0)
  })

  test("changing action motion value updates display number output", async ({ page }) => {
    await page.goto("/calculator")
    await page.waitForLoadState("networkidle")

    const canvas = page.getByTestId("calculator-graph-canvas")
    await expect(canvas).toBeVisible({ timeout: 10000 })

    await page.evaluate(() => {
      ;(window as { __calcTestResetToStarter?: () => void }).__calcTestResetToStarter?.()
    })

    await page.waitForTimeout(500)

    const result = await page.evaluate(() => {
      const g = (window as { __calcGraph?: any }).__calcGraph
      if (!g || !g._nodes) return { error: "No graph" }

      const actionNode = g._nodes.find(
        (n: any) => n.type === "calc/damage_action" || n.constructor?.title === "Damage Action",
      )
      const displayNode = g._nodes.find(
        (n: any) => n.type === "calc/display_number" || n.constructor?.title === "Display Number",
      )
      if (!actionNode || !displayNode) return { error: "Missing nodes" }

      const readDisplay = () => {
        const raw = displayNode.getOutputData?.(0) ?? displayNode.outputs?.[0]?._data ?? null
        return Number(raw)
      }

      g.runStep(1)
      const before = readDisplay()

      actionNode.properties.motionValue = 5
      if (typeof actionNode.setDirtyCanvas === "function") {
        actionNode.setDirtyCanvas(true, true)
      }
      g.runStep(1)
      const after = readDisplay()

      return {
        before,
        after,
        changed: Number.isFinite(before) && Number.isFinite(after) && Math.abs(after - before) > 1e-9,
      }
    })

    if ((result as { error?: string }).error) {
      throw new Error(`E2E setup failed: ${(result as { error: string }).error}`)
    }

    expect(result.changed).toBe(true)
    expect(Number(result.after)).toBeGreaterThan(Number(result.before))
  })

  test("increasing pyro damage buff table increases displayed damage", async ({ page }) => {
    await page.goto("/calculator")
    await page.waitForLoadState("networkidle")

    const canvas = page.getByTestId("calculator-graph-canvas")
    await expect(canvas).toBeVisible({ timeout: 10000 })

    await page.evaluate(() => {
      ;(window as { __calcTestResetToStarter?: () => void }).__calcTestResetToStarter?.()
    })

    await page.waitForTimeout(500)

    const result = await page.evaluate(() => {
      const g = (window as { __calcGraph?: any }).__calcGraph
      if (!g || !g._nodes) return { error: "No graph" }

      const displayNode = g._nodes.find(
        (n: any) => n.type === "calc/display_number" || n.constructor?.title === "Display Number",
      )
      const statTableNodes = g._nodes.filter(
        (n: any) => n.type === "calc/stat_table" || n.constructor?.title === "Stat Table",
      )
      const buffNode =
        statTableNodes.find(
          (n: any) =>
            Array.isArray(n?.properties?.rows) &&
            n.properties.rows.length === 1 &&
            n.properties.rows[0]?.stat === "PyroDMGBonus",
        ) || statTableNodes[1]

      if (!displayNode || !buffNode) return { error: "Missing nodes" }

      const readDisplay = () =>
        Number(displayNode.getOutputData?.(0) ?? displayNode.outputs?.[0]?._data ?? NaN)

      g.runStep(1)
      const before = readDisplay()

      if (!Array.isArray(buffNode.properties?.rows) || !buffNode.properties.rows[0]) {
        return { error: "Buff rows missing" }
      }

      buffNode.properties.rows[0].stat = "PyroDMGBonus"
      buffNode.properties.rows[0].value = 1.0
      if (typeof buffNode.setDirtyCanvas === "function") {
        buffNode.setDirtyCanvas(true, true)
      }

      g.runStep(1)
      g.runStep(1)
      const after = readDisplay()

      return {
        before,
        after,
        changed: Number.isFinite(before) && Number.isFinite(after) && after > before,
      }
    })

    if ((result as { error?: string }).error) {
      throw new Error(`E2E setup failed: ${(result as { error: string }).error}`)
    }

    expect(result.changed).toBe(true)
    expect(Number(result.after)).toBeGreaterThan(Number(result.before))
  })
})
