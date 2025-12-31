import {
  gdGetWeapons,
  gdGetArtifacts,
  gdLibWeaponAdaptor,
  gdLibArtifactAdaptor,
} from "@/utils/APIAdaptor"
import { Weapon } from "@/types/weapon"
import { Artifact } from "@/types/artifact"
import { z } from "zod"

const WeaponSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  key: z.string().min(1),
  rarity: z.number().min(1).max(5),
  description: z.string(),
  category: z.string(),
  series: z.string(),
  release_date: z.string(),
  release_date_epoch: z.number(),
  base_atk_min: z.number(),
  base_atk_max: z.number(),
  sub_stat_type: z.string(),
  sub_stat_value_min: z.string(),
  sub_stat_value_max: z.string(),
  refinement_name: z.string(),
  refinements: z.array(z.string()),
  base_stats: z
    .array(
      z.object({
        level: z.string(),
        base_atk: z.string(),
        sub_stat_type: z.string().optional(),
        sub_stat_value: z.string().optional(),
        ascension_phase: z.number().optional(),
      })
    )
    .min(1),
})

const ArtifactSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  key: z.string().min(1),
  rarity_max: z.number().min(1).max(5),
  rarity_min: z.number().min(1).max(5),
  release_version: z.string(),
  flower_description: z.string().optional(),
  feather_description: z.string().optional(),
  sand_description: z.string().optional(),
  goblet_description: z.string().optional(),
  circlet_description: z.string().optional(),
  flower_name: z.string().optional(),
  feather_name: z.string().optional(),
  sand_name: z.string().optional(),
  goblet_name: z.string().optional(),
  circlet_name: z.string().optional(),
  two_pc_bonus: z.string().optional(),
  four_pc_bonus: z.string().optional(),
})

describe("Adaptors with Zod validation", () => {
  describe("gdLibWeaponAdaptor", () => {
    let adaptedWeapons: Weapon[]
    let validationErrors: string[]

    beforeAll(async () => {
      adaptedWeapons = await gdGetWeapons()
      validationErrors = []
      for (const weapon of adaptedWeapons) {
        const result = WeaponSchema.safeParse(weapon)
        if (!result.success) {
          validationErrors.push(`${weapon.name}: ${result.error.message}`)
        }
      }
    })

    test("should return an array of weapons", () => {
      expect(Array.isArray(adaptedWeapons)).toBe(true)
    })

    test("should have at least one weapon", () => {
      expect(adaptedWeapons.length).toBeGreaterThan(0)
    })

    test("should pass Zod schema validation for all weapons", () => {
      if (validationErrors.length > 0) {
        console.log("Validation errors:", validationErrors)
      }
      expect(validationErrors.length).toBe(0)
    })

    test("all weapons should have non-empty base_stats array", () => {
      const weaponsWithoutStats = adaptedWeapons.filter(
        (w) => !w.base_stats || w.base_stats.length === 0
      )
      if (weaponsWithoutStats.length > 0) {
        console.log(
          "Weapons without stats:",
          weaponsWithoutStats.map((w) => w.name)
        )
      }
      expect(weaponsWithoutStats.length).toBe(0)
    })

    test("all weapons should have matching id and key", () => {
      const mismatched = adaptedWeapons.filter((w) => w.id !== w.key)
      expect(mismatched.length).toBe(0)
    })

    test("first weapon ID should match the format used in page lookups", () => {
      const firstWeapon = adaptedWeapons[0]
      console.log("First weapon ID:", firstWeapon.id)
      console.log("First weapon name:", firstWeapon.name)
      expect(firstWeapon.id).toBeDefined()
      expect(typeof firstWeapon.id).toBe("string")
    })
  })

  describe("gdLibArtifactAdaptor", () => {
    let adaptedArtifacts: Artifact[]
    let validationErrors: string[]

    beforeAll(async () => {
      adaptedArtifacts = await gdGetArtifacts()
      validationErrors = []
      for (const artifact of adaptedArtifacts) {
        const result = ArtifactSchema.safeParse(artifact)
        if (!result.success) {
          validationErrors.push(`${artifact.name}: ${result.error.message}`)
        }
      }
    })

    test("should return an array of artifacts", () => {
      expect(Array.isArray(adaptedArtifacts)).toBe(true)
    })

    test("should have at least one artifact", () => {
      expect(adaptedArtifacts.length).toBeGreaterThan(0)
    })

    test("should pass Zod schema validation for all artifacts", () => {
      if (validationErrors.length > 0) {
        console.log("Validation errors:", validationErrors)
      }
      expect(validationErrors.length).toBe(0)
    })

    test("all artifacts should have matching id and key", () => {
      const mismatched = adaptedArtifacts.filter((a) => a.id !== a.key)
      expect(mismatched.length).toBe(0)
    })

    test("first artifact should have correct structure for page lookups", () => {
      const firstArtifact = adaptedArtifacts[0]
      console.log("First artifact ID:", firstArtifact.id)
      console.log("First artifact name:", firstArtifact.name)
      expect(firstArtifact.id).toBeDefined()
      expect(typeof firstArtifact.id).toBe("string")
      expect(firstArtifact.name).toBeDefined()
    })
  })
})

describe("Weapon/Artifact ID matching", () => {
  test("weapon IDs should be usable in lookups", async () => {
    const weapons = await gdGetWeapons()
    expect(weapons.length).toBeGreaterThan(0)

    const firstWeapon = weapons[0]
    console.log("Testing weapon lookup with ID:", firstWeapon.id)

    // The ID should be a non-empty string
    expect(typeof firstWeapon.id).toBe("string")
    expect(firstWeapon.id.length).toBeGreaterThan(0)
  })

  test("artifact IDs should be usable in lookups", async () => {
    const artifacts = await gdGetArtifacts()
    expect(artifacts.length).toBeGreaterThan(0)

    const firstArtifact = artifacts[0]
    console.log("Testing artifact lookup with ID:", firstArtifact.id)

    // The ID should be a non-empty string
    expect(typeof firstArtifact.id).toBe("string")
    expect(firstArtifact.id.length).toBeGreaterThan(0)
  })
})
