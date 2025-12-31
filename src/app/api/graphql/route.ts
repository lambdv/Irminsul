import { createSchema, createYoga } from "graphql-yoga"
import {
  getArtifact,
  getArtifacts,
  getWeapon,
  getWeapons,
  getCharacters,
  getCharacter,
} from "../../../utils/genshinData"
import {
  Character,
  CharacterBaseStat,
  CharacterTalent,
  CharacterTalentAttribute,
  CharacterPassive,
  CharacterConstellation,
  CharacterAscensionCost,
} from "@/types/character"
import { Weapon, WeaponBaseStat } from "@/types/weapon"
import { Artifact } from "@/types/artifact"
import { Page } from "@/types/page"

const MAX_QUERY_DEPTH = 5
const MAX_COMPLEXITY = 100

function normalizeElement(element: string): string {
  return element.toUpperCase().trim()
}

function normalizeWeaponType(weapon: string): string {
  const normalized = weapon.toUpperCase().trim()
  if (normalized.includes("POLEARM")) return "POLEARM"
  if (normalized.includes("CLAYMORE")) return "CLAYMORE"
  if (normalized.includes("SWORD")) return "SWORD"
  if (normalized.includes("BOW")) return "BOW"
  if (normalized.includes("CATALYST")) return "CATALYST"
  return normalized
}

function normalizeWeaponSubStat(subStat: string): string {
  const normalized = subStat.toUpperCase().trim()
  if (normalized.includes("CRIT_RATE") || normalized.includes("CRIT RATE"))
    return "CRIT_RATE"
  if (
    normalized.includes("CRIT_DMG") ||
    normalized.includes("CRIT DMG") ||
    normalized.includes("CRITICAL DAMAGE")
  )
    return "CRIT_DMG"
  if (normalized.includes("ATK") && normalized.includes("%"))
    return "ATK_PERCENT"
  if (normalized.includes("HP") && normalized.includes("%")) return "HP_PERCENT"
  if (normalized.includes("DEF") && normalized.includes("%"))
    return "DEF_PERCENT"
  if (
    normalized.includes("ENERGY") ||
    normalized.includes("RECHARGE") ||
    normalized.includes("ER")
  )
    return "ENERGY_RECHARGE"
  if (normalized.includes("MASTERY") || normalized.includes("EM"))
    return "ELEMENTAL_MASTERY"
  return normalized.replace(/\s+/g, "_")
}

function normalizeTalentType(type: string): string {
  const normalized = type.toUpperCase().trim()
  if (normalized.includes("NORMAL") || normalized.includes("ATTACK"))
    return "NORMAL_ATTACK"
  if (normalized.includes("SKILL")) return "ELEMENTAL_SKILL"
  if (normalized.includes("BURST")) return "ELEMENTAL_BURST"
  return normalized.replace(/\s+/g, "_")
}

function normalizePassiveType(type: string): string {
  const normalized = type.toUpperCase().trim()
  if (normalized.includes("ASCENSION") && normalized.includes("1"))
    return "ASCENSION_1"
  if (normalized.includes("ASCENSION") && normalized.includes("4"))
    return "ASCENSION_4"
  if (normalized.includes("UTILITY")) return "UTILITY"
  return normalized.replace(/\s+/g, "_")
}

function mapCharacterToGraphQL(char: Character): any {
  return {
    name: char.name,
    key: char.key,
    title: char.title || null,
    alternateTitle: char.alternate_title || null,
    description: char.description,
    rarity: char.rarity,
    element: normalizeElement(char.element),
    vision: normalizeElement(char.vision),
    weapon: normalizeWeaponType(char.weapon),
    region: char.region,
    affiliation: char.affiliation || null,
    constellation: char.constellation || null,
    birthday: char.birthday || null,
    specialDish: char.special_dish || null,
    releaseDate: char.release_date,
    releaseDateEpoch: char.release_date_epoch,
    ascensionStat: char.ascension_stat,
    baseStats: char.base_stats.map(mapBaseStat),
    ascensionCosts: char.ascension_costs.map(mapAscensionCost),
    talents: char.talents.map(mapTalent),
    passives: char.passives.map(mapPassive),
    constellations: char.constellations.map(mapConstellation),
  }
}

function mapBaseStat(stat: CharacterBaseStat): any {
  return {
    level: stat.LVL,
    baseHP: parseFloat(stat.BaseHP),
    baseATK: parseFloat(stat.BaseATK),
    baseDEF: parseFloat(stat.BaseDEF),
    ascensionStatType: stat.AscensionStatType,
    ascensionStatValue: stat.AscensionStatValue || null,
    ascensionPhase: stat.AscensionPhase,
  }
}

function mapAscensionCost(cost: CharacterAscensionCost): any {
  return {
    ascensionPhase: cost.AscensionPhase,
    materials: cost.materials.map((mat) => ({
      name: mat.name,
      amount: mat.amount,
    })),
  }
}

function mapTalent(talent: CharacterTalent): any {
  return {
    name: talent.name,
    type: normalizeTalentType(talent.type),
    description: talent.description,
    attributes: (talent.attributes || []).map((attr) => ({
      hit: attr.hit,
      values: attr.values.map((v) => String(v)),
    })),
  }
}

function mapPassive(passive: CharacterPassive): any {
  return {
    name: passive.name,
    type: normalizePassiveType(passive.type),
    description: passive.description,
  }
}

function mapConstellation(con: CharacterConstellation): any {
  return {
    level: con.level,
    name: con.name,
    description: con.description,
  }
}

function mapWeaponToGraphQL(weapon: Weapon): any {
  return {
    name: weapon.name,
    key: weapon.key,
    description: weapon.description,
    rarity: weapon.rarity,
    category: normalizeWeaponType(weapon.category),
    series: weapon.series,
    releaseDate: weapon.release_date,
    releaseDateEpoch: weapon.release_date_epoch,
    baseAtkMin: weapon.base_atk_min,
    baseAtkMax: weapon.base_atk_max,
    subStatType: normalizeWeaponSubStat(weapon.sub_stat_type),
    subStatValueMin: weapon.sub_stat_value_min,
    subStatValueMax: weapon.sub_stat_value_max,
    refinementName: weapon.refinement_name,
    refinements: weapon.refinements,
    baseStats: weapon.base_stats.map(mapWeaponBaseStat),
  }
}

function mapWeaponBaseStat(stat: WeaponBaseStat): any {
  return {
    level: stat.level,
    baseATK: parseInt(stat.base_atk),
    subStatType: stat.sub_stat_type
      ? normalizeWeaponSubStat(stat.sub_stat_type)
      : null,
    subStatValue: stat.sub_stat_value || null,
    ascensionPhase: stat.ascension_phase || 0,
  }
}

function mapArtifactToGraphQL(artifact: Artifact): any {
  return {
    name: artifact.name,
    key: artifact.key,
    rarityMin: artifact.rarity_min,
    rarityMax: artifact.rarity_max,
    releaseVersion: parseFloat(artifact.release_version),
    flower: {
      name: artifact.flower_name || "",
      description: artifact.flower_description || "",
    },
    feather: {
      name: artifact.feather_name || "",
      description: artifact.feather_description || "",
    },
    sand: {
      name: artifact.sand_name || "",
      description: artifact.sand_description || "",
    },
    goblet: {
      name: artifact.goblet_name || "",
      description: artifact.goblet_description || "",
    },
    circlet: {
      name: artifact.circlet_name || "",
      description: artifact.circlet_description || "",
    },
    bonuses: {
      twoPiece: artifact.two_pc_bonus || "",
      fourPiece: artifact.four_pc_bonus || "",
    },
  }
}

function getFieldComplexity(fieldName: string): number {
  const complexityMap: Record<string, number> = {
    getCharacters: 1,
    getCharacter: 1,
    getWeapons: 1,
    getWeapon: 1,
    getArtifactSets: 1,
    getArtifactSet: 1,
    searchPages: 1,
    name: 1,
    key: 1,
    title: 1,
    description: 1,
    rarity: 1,
    element: 1,
    vision: 1,
    weapon: 1,
    region: 1,
    affiliation: 1,
    constellation: 1,
    birthday: 1,
    specialDish: 1,
    releaseDate: 1,
    releaseDateEpoch: 1,
    ascensionStat: 1,
    baseStats: 3,
    ascensionCosts: 3,
    talents: 3,
    passives: 2,
    constellations: 3,
    baseAtkMin: 1,
    baseAtkMax: 1,
    subStatType: 1,
    subStatValueMin: 1,
    subStatValueMax: 1,
    refinementName: 1,
    refinements: 2,
    weaponBaseStats: 2,
    category: 1,
    series: 1,
    flower: 1,
    feather: 1,
    sand: 1,
    goblet: 1,
    circlet: 1,
    bonuses: 1,
    twoPiece: 1,
    fourPiece: 1,
    materials: 2,
    attributes: 2,
    values: 1,
    hit: 1,
    level: 1,
    baseHP: 1,
    baseATK: 1,
    baseDEF: 1,
    ascensionStatType: 1,
    ascensionStatValue: 1,
    ascensionPhase: 1,
    amount: 1,
    type: 1,
    id: 1,
  }
  return complexityMap[fieldName] || 1
}

function calculateQueryComplexity(
  document: any,
  variables?: Record<string, any>
): number {
  let complexity = 0
  let depth = 0
  let maxDepth = 0

  function traverse(selectionSet: any, currentDepth: number) {
    if (!selectionSet) return

    for (const selection of selectionSet.selections || []) {
      if (selection.kind === "Field") {
        const fieldComplexity = getFieldComplexity(selection.name.value)
        complexity += fieldComplexity

        if (selection.selectionSet) {
          traverse(selection.selectionSet, currentDepth + 1)
        }

        if (selection.arguments) {
          for (const arg of selection.arguments) {
            if (arg.value.kind === "Variable" && variables) {
              const varValue = variables[arg.value.name.value]
              if (Array.isArray(varValue)) {
                complexity += fieldComplexity * Math.min(varValue.length, 10)
              }
            }
          }
        }
      }
    }
  }

  if (document.definitions) {
    for (const def of document.definitions) {
      if (def.kind === "OperationDefinition") {
        traverse(def.selectionSet, 0)
      }
    }
  }

  return complexity
}

function parseGraphQLQuery(query: string): any {
  try {
    const { parse } = require("graphql")
    return parse(query)
  } catch {
    return null
  }
}

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    enum Element {
      PYRO
      HYDRO
      ANEMO
      ELECTRO
      DENDRO
      CRYO
      GEO
    }

    enum WeaponType {
      SWORD
      CLAYMORE
      POLEARM
      BOW
      CATALYST
    }

    enum TalentType {
      NORMAL_ATTACK
      ELEMENTAL_SKILL
      ELEMENTAL_BURST
    }

    enum PassiveType {
      ASCENSION_1
      ASCENSION_4
      UTILITY
    }

    enum WeaponSubStat {
      CRIT_RATE
      CRIT_DMG
      ATK_PERCENT
      HP_PERCENT
      DEF_PERCENT
      ENERGY_RECHARGE
      ELEMENTAL_MASTERY
    }

    type ArtifactSet {
      name: String!
      key: String!
      rarityMin: Int!
      rarityMax: Int!
      releaseVersion: Float!

      flower: ArtifactPiece!
      feather: ArtifactPiece!
      sand: ArtifactPiece!
      goblet: ArtifactPiece!
      circlet: ArtifactPiece!

      bonuses: ArtifactBonus!
    }

    type ArtifactPiece {
      name: String!
      description: String!
    }

    type ArtifactBonus {
      twoPiece: String!
      fourPiece: String!
    }

    type Character {
      name: String!
      key: String!
      title: String
      alternateTitle: String
      description: String!

      rarity: Int!
      element: Element!
      vision: Element!
      weapon: WeaponType!
      region: String!
      affiliation: String
      constellation: String
      birthday: String
      specialDish: String

      releaseDate: String!
      releaseDateEpoch: Int!

      ascensionStat: String!
      baseStats: [CharacterBaseStat!]!
      ascensionCosts: [AscensionCost!]!

      talents: [Talent!]!
      passives: [Passive!]!
      constellations: [Constellation!]!
    }

    type CharacterBaseStat {
      level: String!
      baseHP: Float!
      baseATK: Float!
      baseDEF: Float!
      ascensionStatType: String!
      ascensionStatValue: String
      ascensionPhase: Int!
    }

    type AscensionCost {
      ascensionPhase: Int!
      materials: [MaterialCost!]!
    }

    type MaterialCost {
      name: String!
      amount: String!
    }

    type Talent {
      name: String!
      type: TalentType!
      description: String!
      attributes: [TalentAttribute!]!
    }

    type TalentAttribute {
      hit: String!
      values: [String!]!
    }

    type Passive {
      name: String!
      type: PassiveType!
      description: String!
    }

    type Constellation {
      level: Int!
      name: String!
      description: String!
    }

    type Weapon {
      name: String!
      key: String!
      description: String!

      rarity: Int!
      category: WeaponType!
      series: String!

      releaseDate: String!
      releaseDateEpoch: Float!

      baseAtkMin: Int!
      baseAtkMax: Int!

      subStatType: WeaponSubStat!
      subStatValueMin: String!
      subStatValueMax: String!

      refinementName: String!
      refinements: [String!]!

      baseStats: [WeaponBaseStat!]!
    }

    type WeaponBaseStat {
      level: String!
      baseATK: Int!
      subStatType: WeaponSubStat
      subStatValue: String
      ascensionPhase: Int!
    }

    type SearchPage {
      id: ID
      name: String
      category: String
      rarity: Int
    }

    type Query {
      getCharacters: [Character!]!
      getCharacter(key: String!): Character
      getWeapons: [Weapon!]!
      getWeapon(key: String!): Weapon
      getArtifactSets: [ArtifactSet!]!
      getArtifactSet(key: String!): ArtifactSet
      searchPages: [SearchPage!]!
    }
  `,
  resolvers: {
    Query: {
      getCharacters: async () => {
        const characters = await getCharacters()
        return characters.map(mapCharacterToGraphQL)
      },
      getCharacter: async (_, { key }) => {
        const characters = await getCharacters()
        const character = characters.find((c) => c.key === key)
        return character ? mapCharacterToGraphQL(character) : null
      },
      getWeapons: async () => {
        const weapons = await getWeapons()
        return weapons.map(mapWeaponToGraphQL)
      },
      getWeapon: async (_, { key }) => {
        const weapons = await getWeapons()
        const weapon = weapons.find((w) => w.key === key)
        return weapon ? mapWeaponToGraphQL(weapon) : null
      },
      getArtifactSets: async () => {
        const artifacts = await getArtifacts()
        return artifacts.map(mapArtifactToGraphQL)
      },
      getArtifactSet: async (_, { key }) => {
        const artifacts = await getArtifacts()
        const artifact = artifacts.find((a) => a.key === key)
        return artifact ? mapArtifactToGraphQL(artifact) : null
      },
      searchPages: async (): Promise<Page[]> => {
        const [characters, weapons, artifacts] = await Promise.all([
          getCharacters(),
          getWeapons(),
          getArtifacts(),
        ])
        return [
          ...characters.map((item) => ({
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            category: "Character",
          })),
          ...weapons.map((item) => ({
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            category: "Weapon",
          })),
          ...artifacts.map((item) => ({
            id: item.id,
            name: item.name,
            rarity: item.rarity_max,
            category: "Artifact",
          })),
        ]
      },
    },
  },
})

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  landingPage: false,
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const query = url.searchParams.get("query")
  const parsedQuery = query ? parseGraphQLQuery(query) : null

  if (parsedQuery) {
    const complexity = calculateQueryComplexity(parsedQuery)
    if (complexity > MAX_COMPLEXITY) {
      return new Response(
        JSON.stringify({
          errors: [
            {
              message: `Query complexity ${complexity} exceeds maximum allowed ${MAX_COMPLEXITY}`,
              extensions: {
                code: "COMPLEXITY_LIMIT_EXCEEDED",
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    }
  }

  return yoga.handle({ request: req })
}

export async function POST(req: Request) {
  try {
    const clonedReq = req.clone()
    const body = await clonedReq.json()
    const { query, variables } = body

    if (query) {
      const parsedQuery = parseGraphQLQuery(query)
      if (parsedQuery) {
        const complexity = calculateQueryComplexity(parsedQuery, variables)
        if (complexity > MAX_COMPLEXITY) {
          return new Response(
            JSON.stringify({
              errors: [
                {
                  message: `Query complexity ${complexity} exceeds maximum allowed ${MAX_COMPLEXITY}`,
                  extensions: {
                    code: "COMPLEXITY_LIMIT_EXCEEDED",
                  },
                },
              ],
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
        }
      }
    }

    return yoga.handle({ request: req })
  } catch {
    return yoga.handle({ request: req })
  }
}
