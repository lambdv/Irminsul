import {
  getWeapon,
  getArtifact,
  getWeapons,
  getArtifacts,
} from "@/utils/genshinData"

describe("genshinData functions", () => {
  describe("getWeapons", () => {
    test("should return an array of weapons", async () => {
      const weapons = await getWeapons()
      expect(Array.isArray(weapons)).toBe(true)
    })

    test("should have at least one weapon", async () => {
      const weapons = await getWeapons()
      expect(weapons.length).toBeGreaterThan(0)
    })

    test("weapon should have id and name", async () => {
      const weapons = await getWeapons()
      const weapon = weapons[0]
      expect(weapon.id).toBeDefined()
      expect(weapon.name).toBeDefined()
      expect(typeof weapon.id).toBe("string")
      expect(typeof weapon.name).toBe("string")
    })
  })

  describe("getWeapon", () => {
    let weapons: any[]

    beforeAll(async () => {
      weapons = await getWeapons()
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
  })

  describe("getArtifacts", () => {
    test("should return an array of artifacts", async () => {
      const artifacts = await getArtifacts()
      expect(Array.isArray(artifacts)).toBe(true)
    })

    test("should have at least one artifact", async () => {
      const artifacts = await getArtifacts()
      expect(artifacts.length).toBeGreaterThan(0)
    })

    test("artifact should have id and name", async () => {
      const artifacts = await getArtifacts()
      const artifact = artifacts[0]
      expect(artifact.id).toBeDefined()
      expect(artifact.name).toBeDefined()
      expect(typeof artifact.id).toBe("string")
      expect(typeof artifact.name).toBe("string")
    })
  })

  describe("getArtifact", () => {
    let artifacts: any[]

    beforeAll(async () => {
      artifacts = await getArtifacts()
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
  })
})
