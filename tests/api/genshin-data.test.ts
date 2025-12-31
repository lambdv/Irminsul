import {
  gdGetWeapons,
  gdGetArtifacts,
  gdLibWeaponAdaptor,
  gdLibArtifactAdaptor,
} from "@/utils/APIAdaptor"
import { Weapon } from "@/types/weapon"
import { Artifact } from "@/types/artifact"

describe("Direct adaptor and lookup test", () => {
  describe("Weapon adaptor and lookup", () => {
    let adaptedWeapons: Weapon[]

    beforeAll(async () => {
      adaptedWeapons = await gdGetWeapons()
    })

    test("adaptor returns weapons with data", () => {
      expect(adaptedWeapons.length).toBeGreaterThan(0)
    })

    test("can lookup weapon by id", () => {
      const firstWeapon = adaptedWeapons[0]
      console.log("Looking up:", firstWeapon.id)

      const found = adaptedWeapons.find((w) => w.id === firstWeapon.id)
      console.log("Found:", found?.name || "NOT FOUND")

      expect(found).not.toBeNull()
      expect(found?.id).toBe(firstWeapon.id)
      expect(found?.name).toBe(firstWeapon.name)
    })

    test("weapon has base_stats", () => {
      const firstWeapon = adaptedWeapons[0]
      expect(firstWeapon.base_stats).toBeDefined()
      expect(firstWeapon.base_stats.length).toBeGreaterThan(0)
    })

    test("all weapons have base_stats", () => {
      const withoutStats = adaptedWeapons.filter(
        (w) => !w.base_stats || w.base_stats.length === 0
      )
      console.log("Weapons without stats:", withoutStats.length)
      expect(withoutStats.length).toBe(0)
    })

    test("can lookup multiple weapons by id", () => {
      const testIds = [
        adaptedWeapons[0].id,
        adaptedWeapons[1].id,
        adaptedWeapons[2].id,
      ]

      for (const id of testIds) {
        const found = adaptedWeapons.find((w) => w.id === id)
        expect(found).not.toBeNull()
        expect(found?.base_stats?.length).toBeGreaterThan(0)
      }
    })
  })

  describe("Artifact adaptor and lookup", () => {
    let adaptedArtifacts: Artifact[]

    beforeAll(async () => {
      adaptedArtifacts = await gdGetArtifacts()
    })

    test("adaptor returns artifacts with data", () => {
      expect(adaptedArtifacts.length).toBeGreaterThan(0)
    })

    test("can lookup artifact by id", () => {
      const firstArtifact = adaptedArtifacts[0]
      console.log("Looking up:", firstArtifact.id)

      const found = adaptedArtifacts.find((a) => a.id === firstArtifact.id)
      console.log("Found:", found?.name || "NOT FOUND")

      expect(found).not.toBeNull()
      expect(found?.id).toBe(firstArtifact.id)
      expect(found?.name).toBe(firstArtifact.name)
    })

    test("all artifacts have required fields", () => {
      const withoutData = adaptedArtifacts.filter(
        (a) => !a.id || !a.name || !a.key
      )
      console.log("Artifacts without required data:", withoutData.length)
      expect(withoutData.length).toBe(0)
    })

    test("can lookup multiple artifacts by id", () => {
      const testIds = [
        adaptedArtifacts[0].id,
        adaptedArtifacts[1].id,
        adaptedArtifacts[2].id,
      ]

      for (const id of testIds) {
        const found = adaptedArtifacts.find((a) => a.id === id)
        expect(found).not.toBeNull()
        expect(found?.name).toBeDefined()
      }
    })
  })
})
