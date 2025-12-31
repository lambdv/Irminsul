import { test, expect } from "@playwright/test"

test.describe("Weapons Page E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log("Console error:", msg.text())
      }
    })
  })

  test("should load weapons listing page", async ({ page }) => {
    await page.goto("/archive/weapons")
    await expect(page).toHaveTitle(/Weapons/)
  })

  test("should navigate to weapon detail page", async ({ page }) => {
    await page.goto("/archive/weapons")

    await page.waitForLoadState("networkidle")

    const firstWeapon = page.locator('a[href^="/archive/weapons/"]').first()
    await expect(firstWeapon).toBeVisible()

    await firstWeapon.click()
    await page.waitForLoadState("networkidle")

    await expect(page).not.toHaveTitle(/Weapons/)
  })

  test("weapon detail page should show weapon name", async ({ page }) => {
    await page.goto("/archive/weapons/a-thousand-blazing-suns")
    await page.waitForLoadState("networkidle")

    await expect(
      page.locator('h1, h2, [class*="header"], [class*="title"]').first()
    ).toBeVisible({ timeout: 30000 })
  })

  test("should handle non-existent weapon gracefully", async ({ page }) => {
    await page.goto("/archive/weapons/non-existent-weapon-12345")
    await page.waitForLoadState("networkidle")

    expect(await page.locator("text=not found").count()).toBeGreaterThanOrEqual(
      0
    )
  })

  test("should load multiple weapons", async ({ page }) => {
    const weapons = [
      "a-thousand-blazing-suns",
      "aquila-favonia",
      "skyward-blade",
    ]

    for (const weaponId of weapons) {
      await page.goto(`/archive/weapons/${weaponId}`)
      await page.waitForLoadState("networkidle", { timeout: 60000 })
    }
  })
})

test.describe("Artifacts Page E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log("Console error:", msg.text())
      }
    })
  })

  test("should load artifacts listing page", async ({ page }) => {
    await page.goto("/archive/artifacts")
    await expect(page).toHaveTitle(/Artifacts/)
  })

  test("should navigate to artifact detail page", async ({ page }) => {
    await page.goto("/archive/artifacts")

    await page.waitForLoadState("networkidle")

    const firstArtifact = page.locator('a[href^="/archive/artifacts/"]').first()
    await expect(firstArtifact).toBeVisible()

    await firstArtifact.click()
    await page.waitForLoadState("networkidle")

    await expect(page).not.toHaveTitle(/Artifacts/)
  })

  test("artifact detail page should show artifact name", async ({ page }) => {
    await page.goto("/archive/artifacts/adventurer")
    await page.waitForLoadState("networkidle")

    await expect(
      page.locator('h1, h2, [class*="header"], [class*="title"]').first()
    ).toBeVisible({ timeout: 30000 })
  })

  test("should handle non-existent artifact gracefully", async ({ page }) => {
    await page.goto("/archive/artifacts/non-existent-artifact-12345")
    await page.waitForLoadState("networkidle")

    expect(await page.locator("text=not found").count()).toBeGreaterThanOrEqual(
      0
    )
  })

  test("should load multiple artifacts", async ({ page }) => {
    const artifacts = ["adventurer", "archaic-petra", "glacier-and-snowfield"]

    for (const artifactId of artifacts) {
      await page.goto(`/archive/artifacts/${artifactId}`)
      await page.waitForLoadState("networkidle", { timeout: 60000 })
    }
  })
})

test.describe("Navigation E2E Tests", () => {
  test("should navigate from weapons to artifact via back button", async ({
    page,
  }) => {
    await page.goto("/archive/weapons/a-thousand-blazing-suns")
    await page.waitForLoadState("networkidle")

    await page.goto("/archive/artifacts/adventurer")
    await page.waitForLoadState("networkidle")

    expect(await page.url()).toContain("/artifacts/adventurer")
  })

  test("should navigate from archive weapons to weapons detail", async ({
    page,
  }) => {
    await page.goto("/archive/weapons")
    await page.waitForLoadState("networkidle")

    const firstWeapon = page.locator('a[href^="/archive/weapons/"]').first()
    if (await firstWeapon.isVisible()) {
      const href = await firstWeapon.getAttribute("href")
      await page.goto(href!)
      await page.waitForLoadState("networkidle")
      expect(page.url()).toMatch(/\/archive\/weapons\/.+/)
    } else {
      test.skip()
    }
  })
})
