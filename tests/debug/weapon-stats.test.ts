import { gdGetWeapons } from "@/utils/APIAdaptor"

describe("Debug weapon stats", () => {
  test("weapon should have base_stats with data", async () => {
    const weapons = await gdGetWeapons()

    const weapon = weapons.find((w) => w.name === "A Thousand Blazing Suns")

    console.log("Weapon found:", !!weapon)
    console.log("Weapon name:", weapon?.name)
    console.log("Has base_stats:", !!weapon?.base_stats)
    console.log("base_stats length:", weapon?.base_stats?.length)

    if (weapon?.base_stats && weapon.base_stats.length > 0) {
      console.log(
        "First base_stat:",
        JSON.stringify(weapon.base_stats[0], null, 2)
      )
      console.log("All keys in first stat:", Object.keys(weapon.base_stats[0]))
    }

    // Check all weapons
    const withoutStats = weapons.filter(
      (w) => !w.base_stats || w.base_stats.length === 0
    )
    console.log("Weapons without stats:", withoutStats.length)

    expect(weapon).toBeDefined()
    expect(weapon?.base_stats).toBeDefined()
    expect(weapon?.base_stats?.length).toBeGreaterThan(0)
  })
})
