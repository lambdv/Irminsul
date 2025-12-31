import {
  gdLibWeaponAdaptor,
  gdLibArtifactAdaptor,
  gdGetWeapons,
  gdGetArtifacts,
} from "@/utils/APIAdaptor"
import { Weapon } from "@/types/weapon"
import { Artifact } from "@/types/artifact"

describe("API Adaptors", () => {
  describe("gdLibWeaponAdaptor", () => {
    let adaptedWeapons: Weapon[]

    beforeAll(async () => {
      adaptedWeapons = await gdGetWeapons()
    })

    test("should return an array of weapons", () => {
      expect(Array.isArray(adaptedWeapons)).toBe(true)
    })

    test("should have at least one weapon", () => {
      expect(adaptedWeapons.length).toBeGreaterThan(0)
    })

    test("weapon should have all required fields", () => {
      const weapon = adaptedWeapons[0]
      expect(weapon).toHaveProperty("id")
      expect(weapon).toHaveProperty("name")
      expect(weapon).toHaveProperty("key")
      expect(weapon).toHaveProperty("rarity")
      expect(weapon).toHaveProperty("description")
      expect(weapon).toHaveProperty("category")
      expect(weapon).toHaveProperty("base_stats")
    })

    test("weapon id should be a string", () => {
      const weapon = adaptedWeapons[0]
      expect(typeof weapon.id).toBe("string")
      expect(weapon.id.length).toBeGreaterThan(0)
    })

    test("weapon name should be a string", () => {
      const weapon = adaptedWeapons[0]
      expect(typeof weapon.name).toBe("string")
      expect(weapon.name.length).toBeGreaterThan(0)
    })

    test("weapon key should match id", () => {
      const weapon = adaptedWeapons[0]
      expect(weapon.key).toBe(weapon.id)
    })

    test("weapon rarity should be a number between 1 and 5", () => {
      const weapon = adaptedWeapons[0]
      expect(typeof weapon.rarity).toBe("number")
      expect(weapon.rarity).toBeGreaterThanOrEqual(1)
      expect(weapon.rarity).toBeLessThanOrEqual(5)
    })

    test("weapon base_stats should be an array", () => {
      const weapon = adaptedWeapons[0]
      expect(Array.isArray(weapon.base_stats)).toBe(true)
    })

    test("weapon base_stats should not be empty", () => {
      const weapon = adaptedWeapons[0]
      expect(weapon.base_stats.length).toBeGreaterThan(0)
    })

    test("weapon base_stat should have required fields", () => {
      const weapon = adaptedWeapons[0]
      if (weapon.base_stats.length > 0) {
        const stat = weapon.base_stats[0]
        expect(stat).toHaveProperty("level")
        expect(stat).toHaveProperty("base_atk")
        expect(typeof stat.level).toBe("string")
        expect(typeof stat.base_atk).toBe("string")
      }
    })

    test("all weapons should have valid base_stats", () => {
      for (const weapon of adaptedWeapons) {
        expect(weapon.base_stats.length).toBeGreaterThan(0)
        for (const stat of weapon.base_stats) {
          expect(stat.level).toBeDefined()
          expect(stat.base_atk).toBeDefined()
        }
      }
    })
  })

  describe("gdLibArtifactAdaptor", () => {
    let adaptedArtifacts: Artifact[]

    beforeAll(async () => {
      adaptedArtifacts = await gdGetArtifacts()
    })

    test("should return an array of artifacts", () => {
      expect(Array.isArray(adaptedArtifacts)).toBe(true)
    })

    test("should have at least one artifact", () => {
      expect(adaptedArtifacts.length).toBeGreaterThan(0)
    })

    test("artifact should have all required fields", () => {
      const artifact = adaptedArtifacts[0]
      expect(artifact).toHaveProperty("id")
      expect(artifact).toHaveProperty("name")
      expect(artifact).toHaveProperty("key")
      expect(artifact).toHaveProperty("rarity_max")
      expect(artifact).toHaveProperty("rarity_min")
    })

    test("artifact id should be a string", () => {
      const artifact = adaptedArtifacts[0]
      expect(typeof artifact.id).toBe("string")
      expect(artifact.id.length).toBeGreaterThan(0)
    })

    test("artifact name should be a string", () => {
      const artifact = adaptedArtifacts[0]
      expect(typeof artifact.name).toBe("string")
      expect(artifact.name.length).toBeGreaterThan(0)
    })

    test("artifact key should match id", () => {
      const artifact = adaptedArtifacts[0]
      expect(artifact.key).toBe(artifact.id)
    })

    test("artifact rarity_max should be a number between 1 and 5", () => {
      const artifact = adaptedArtifacts[0]
      expect(typeof artifact.rarity_max).toBe("number")
      expect(artifact.rarity_max).toBeGreaterThanOrEqual(1)
      expect(artifact.rarity_max).toBeLessThanOrEqual(5)
    })

    test("artifact rarity_min should be a number between 1 and 5", () => {
      const artifact = adaptedArtifacts[0]
      expect(typeof artifact.rarity_min).toBe("number")
      expect(artifact.rarity_min).toBeGreaterThanOrEqual(1)
      expect(artifact.rarity_min).toBeLessThanOrEqual(5)
    })

    test("all artifacts should have valid id and name", () => {
      for (const artifact of adaptedArtifacts) {
        expect(typeof artifact.id).toBe("string")
        expect(artifact.id.length).toBeGreaterThan(0)
        expect(typeof artifact.name).toBe("string")
        expect(artifact.name.length).toBeGreaterThan(0)
      }
    })
  })
})
