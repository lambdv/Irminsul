import { gdGetWeapons } from "@/utils/APIAdaptor"
import { gdGetArtifacts } from "@/utils/APIAdaptor"

describe("Test page data flow", () => {
  test("weapon page should find weapon by URL id", async () => {
    const weapons = await gdGetWeapons()

    // Simulate what the weapon page does
    const urlId = "a-thousand-blazing-suns"

    // Find weapon by ID (this is what getWeapon does)
    const weapon = weapons.find((w) => w.id === urlId)

    console.log("URL ID:", urlId)
    console.log("Weapon found:", !!weapon)
    console.log("Weapon name:", weapon?.name)
    console.log("base_stats count:", weapon?.base_stats?.length)

    // Simulate the WeaponBaseStats transformation
    if (weapon) {
      const transformed = weapon.base_stats.map((stat) => ({
        LVL: stat.level,
        BaseATK: stat.base_atk,
        AscensionStatValue: stat.sub_stat_value,
        AscensionStatType: stat.sub_stat_type,
        AscensionPhase: stat.ascension_phase,
      }))

      console.log("Transformed count:", transformed.length)
      console.log("First transformed:", JSON.stringify(transformed[0], null, 2))

      // Check if BaseStatTable would render this
      if (transformed.length > 0) {
        console.log("AscensionStatType:", transformed[0].AscensionStatType)
        console.log(
          "Headers would be:",
          Object.keys(transformed[0]).filter((k) => k !== "AscensionStatType")
        )
      }
    }

    expect(weapon).toBeDefined()
    expect(weapon?.base_stats?.length).toBeGreaterThan(0)
  })

  test("artifact page should find artifact by URL id", async () => {
    const artifacts = await gdGetArtifacts()

    const urlId = "adventurer"
    const artifact = artifacts.find((a) => a.id === urlId)

    console.log("URL ID:", urlId)
    console.log("Artifact found:", !!artifact)
    console.log("Artifact name:", artifact?.name)

    expect(artifact).toBeDefined()
    expect(artifact?.name).toBe("Adventurer")
  })

  test("all weapons should have base_stats", async () => {
    const weapons = await gdGetWeapons()

    const withoutStats = weapons.filter(
      (w) => !w.base_stats || w.base_stats.length === 0
    )

    console.log("Total weapons:", weapons.length)
    console.log("Without base_stats:", withoutStats.length)

    if (withoutStats.length > 0) {
      console.log("Weapons without stats:")
      withoutStats.forEach((w) => console.log(`  - ${w.name}: ${w.id}`))
    }

    expect(withoutStats.length).toBe(0)
  })

  test("all artifacts should have id and name", async () => {
    const artifacts = await gdGetArtifacts()

    const withoutData = artifacts.filter((a) => !a.id || !a.name)

    console.log("Total artifacts:", artifacts.length)
    console.log("Without data:", withoutData.length)

    expect(withoutData.length).toBe(0)
  })
})
