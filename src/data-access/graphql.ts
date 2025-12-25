import { createSchema } from 'graphql-yoga'
import { getArtifact, getArtifacts, getWeapon, getWeapons, getCharacters, getCharacter } from '../utils/genshinData'
import { Character, CharacterBaseStat, CharacterTalent, CharacterTalentAttribute, CharacterPassive, CharacterConstellation, CharacterAscensionCost } from '@/types/character'
import { Weapon, WeaponBaseStat } from '@/types/weapon'
import { Artifact } from '@/types/artifact'
import { Page } from '@/types/page'

// Helper functions to normalize enum values
function normalizeElement(element: string): string {
  return element.toUpperCase().trim()
}

function normalizeWeaponType(weapon: string): string {
  const normalized = weapon.toUpperCase().trim()
  // Handle common variations
  if (normalized.includes('POLEARM')) return 'POLEARM'
  if (normalized.includes('CLAYMORE')) return 'CLAYMORE'
  if (normalized.includes('SWORD')) return 'SWORD'
  if (normalized.includes('BOW')) return 'BOW'
  if (normalized.includes('CATALYST')) return 'CATALYST'
  return normalized
}

function normalizeWeaponSubStat(subStat: string): string {
  const normalized = subStat.toUpperCase().trim()
  // Map common variations to enum values
  if (normalized.includes('CRIT_RATE') || normalized.includes('CRIT RATE')) return 'CRIT_RATE'
  if (normalized.includes('CRIT_DMG') || normalized.includes('CRIT DMG') || normalized.includes('CRITICAL DAMAGE')) return 'CRIT_DMG'
  if (normalized.includes('ATK') && normalized.includes('%')) return 'ATK_PERCENT'
  if (normalized.includes('HP') && normalized.includes('%')) return 'HP_PERCENT'
  if (normalized.includes('DEF') && normalized.includes('%')) return 'DEF_PERCENT'
  if (normalized.includes('ENERGY') || normalized.includes('RECHARGE') || normalized.includes('ER')) return 'ENERGY_RECHARGE'
  if (normalized.includes('MASTERY') || normalized.includes('EM')) return 'ELEMENTAL_MASTERY'
  return normalized.replace(/\s+/g, '_')
}

function normalizeTalentType(type: string): string {
  const normalized = type.toUpperCase().trim()
  if (normalized.includes('NORMAL') || normalized.includes('ATTACK')) return 'NORMAL_ATTACK'
  if (normalized.includes('SKILL')) return 'ELEMENTAL_SKILL'
  if (normalized.includes('BURST')) return 'ELEMENTAL_BURST'
  return normalized.replace(/\s+/g, '_')
}

function normalizePassiveType(type: string): string {
  const normalized = type.toUpperCase().trim()
  if (normalized.includes('ASCENSION') && normalized.includes('1')) return 'ASCENSION_1'
  if (normalized.includes('ASCENSION') && normalized.includes('4')) return 'ASCENSION_4'
  if (normalized.includes('UTILITY')) return 'UTILITY'
  return normalized.replace(/\s+/g, '_')
}

// Helper functions to map data to GraphQL schema
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
    materials: cost.materials.map(mat => ({
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
    attributes: (talent.attributes || []).map(attr => ({
      hit: attr.hit,
      values: attr.values.map(v => String(v)),
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
    subStatType: stat.sub_stat_type ? normalizeWeaponSubStat(stat.sub_stat_type) : null,
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
      name: artifact.flower_name || '',
      description: artifact.flower_description || '',
    },
    feather: {
      name: artifact.feather_name || '',
      description: artifact.feather_description || '',
    },
    sand: {
      name: artifact.sand_name || '',
      description: artifact.sand_description || '',
    },
    goblet: {
      name: artifact.goblet_name || '',
      description: artifact.goblet_description || '',
    },
    circlet: {
      name: artifact.circlet_name || '',
      description: artifact.circlet_description || '',
    },
    bonuses: {
      twoPiece: artifact.two_pc_bonus || '',
      fourPiece: artifact.four_pc_bonus || '',
    },
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
        const character = characters.find(c => c.key === key)
        return character ? mapCharacterToGraphQL(character) : null
      },
      getWeapons: async () => {
        const weapons = await getWeapons()
        return weapons.map(mapWeaponToGraphQL)
      },
      getWeapon: async (_, { key }) => {
        const weapons = await getWeapons()
        const weapon = weapons.find(w => w.key === key)
        return weapon ? mapWeaponToGraphQL(weapon) : null
      },
      getArtifactSets: async () => {
        const artifacts = await getArtifacts()
        return artifacts.map(mapArtifactToGraphQL)
      },
      getArtifactSet: async (_, { key }) => {
        const artifacts = await getArtifacts()
        const artifact = artifacts.find(a => a.key === key)
        return artifact ? mapArtifactToGraphQL(artifact) : null
      },
      searchPages: async (): Promise<Page[]> => {
        const [characters, weapons, artifacts] = await Promise.all([
          getCharacters(),
          getWeapons(),
          getArtifacts()
        ])
        return [
          ...characters.map((item) => ({
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            category: "Character"
          })),
          ...weapons.map((item) => ({
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            category: "Weapon"
          })),
          ...artifacts.map((item) => ({
            id: item.id,
            name: item.name,
            rarity: item.rarity_max,
            category: "Artifact"
          }))
        ]
      },
    }
  } 
})