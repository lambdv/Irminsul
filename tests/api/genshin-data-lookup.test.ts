import { getWeapon, getArtifact } from "@/utils/genshinData"
import { gdGetWeapons, gdGetArtifacts } from "@/utils/APIAdaptor"

describe("genshinData lookup functions", () => {
  describe("getWeapon", () => {
    let weapons: any[]

    beforeAll(async () => {
      weapons = await gdGetWeapons()
    })

    test("should return a weapon by id", async () => {
      if (weapons.length > 0) {
        const weapon = weapons[0]
        const result = await getWeapon(weapon.id)
        expect(result).not.toBeNull()
        expect(result?.id).toBe(weapon.id)
      }
    })

    test("should return null for non-existent id", async () => {
      const result = await getWeapon("non_existent_weapon_id_12345")
      expect(result).toBeNull()
    })

    test("should find a known weapon by id", async () => {
      if (weapons.length > 0) {
        const firstWeapon = weapons[0]
        const found = await getWeapon(firstWeapon.id)
        expect(found).not.toBeNull()
        expect(found?.name).toBe(firstWeapon.name)
      }
    })
  })

  describe("getArtifact", () => {
    let artifacts: any[]

    beforeAll(async () => {
      artifacts = await gdGetArtifacts()
    })

    test("should return an artifact by id", async () => {
      if (artifacts.length > 0) {
        const artifact = artifacts[0]
        const result = await getArtifact(artifact.id)
        expect(result).not.toBeNull()
        expect(result?.id).toBe(artifact.id)
      }
    })

    test("should return null for non-existent id", async () => {
      const result = await getArtifact("non_existent_artifact_id_12345")
      expect(result).toBeNull()
    })

    test("should find a known artifact by id", async () => {
      if (artifacts.length > 0) {
        const firstArtifact = artifacts[0]
        const found = await getArtifact(firstArtifact.id)
        expect(found).not.toBeNull()
        expect(found?.name).toBe(firstArtifact.name)
      }
    })
  })
})
