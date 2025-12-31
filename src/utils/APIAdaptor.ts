import { Weapon } from "@/types/weapon"
import { Artifact } from "@/types/artifact"
import { toKey } from "@/utils/standardizers"
import { Page } from "@/types/page"
import { CaseLower } from "lucide-react"
import { cookies } from "next/headers"
import path from "path"
import GenshinData from "genshin-data"
import {
  Character as GDCharacter,
  Ascension,
  Mat1,
  Stat,
  Constellation,
  Cv,
  Element,
  Skill,
  Attribute,
  TalentMaterial,
} from "@/types/gdtypes"
import {
  Character,
  CharacterBaseStat,
  CharacterAscensionCost,
  CharacterTalent,
  CharacterTalentAttribute,
  CharacterPassive,
  CharacterConstellation,
} from "@/types/character"

const gd = new GenshinData()

export function gdLibCharacterAdaptor(
  character: GDCharacter,
  characterIndex?: number
): Character {
  let skillTypes: string[] = [
    "Elemental Burst",
    "Elemental Skill",
    "Normal Attack",
  ]
  let passiveTypes: string[] = [
    "Night Realm's Gift Passive",
    "Utility Passive",
    "4th Ascension Passive",
    "1st Ascension Passive",
  ]
  let ascensionPhase = 0
  return {
    id: toKey(character.name),
    index: characterIndex ? characterIndex : 0,
    name: character.name,
    key: character.id,
    title: character.title || "",
    rarity: character.rarity,
    element: character.element.id,
    vision: character.element.id,
    weapon: character.weapon_type.id,
    release_date: new Date(character.release).toISOString().split("T")[0],
    release_date_epoch: character.release,
    constellation: character.constellation,
    birthday: character.birthday.join("-"),
    affiliation: character.affiliation,
    region: character.region.id,
    special_dish: "",
    alternate_title: "",
    description: character.description,
    ascension_stat: "",
    base_stats: character.ascension
      .flatMap((a: Ascension, index: number): CharacterBaseStat[] => {
        return [
          {
            LVL: a.level.toString(),
            BaseHP: a.stats[1].values[0].toString(),
            BaseATK: a.stats[2].values[0].toString(),
            BaseDEF: a.stats[3].values[0].toString(),
            AscensionStatType: character.substat,
            AscensionStatValue: a.stats[4].values[0].toString(),
            AscensionPhase: ascensionPhase,
          },
          {
            LVL: a.level.toString(),
            BaseHP: a.stats[1].values[1].toString(),
            BaseATK: a.stats[2].values[1].toString(),
            BaseDEF: a.stats[3].values[1].toString(),
            AscensionStatType: character.substat,
            AscensionStatValue: a.stats[4].values[1].toString(),
            AscensionPhase: ascensionPhase++,
          },
        ]
      })
      .filter((_, i) => i !== 0 && i !== character.ascension.length - 1),
    ascension_costs: [],
    talents: character.skills.map(
      (s: Skill): CharacterTalent => ({
        name: s.name,
        type: skillTypes.pop(),
        description: s.description,
        attributes: s.attributes.map(
          (a: Attribute): CharacterTalentAttribute => ({
            hit: a.label,
            values: a.values,
          })
        ),
        properties: [],
      })
    ),
    passives: character.passives.map(
      (p: Constellation): CharacterPassive => ({
        name: p.name,
        type: passiveTypes.pop(),
        description: p.description,
        properties: [],
      })
    ),
    constellations: character.constellations.map(
      (c: Constellation): CharacterConstellation => ({
        level: c.level,
        name: c.name,
        description: c.description,
        properties: [],
      })
    ),
  }
}

export function gdGetCharacters(): Promise<Character[]> {
  return gd
    .characters()
    .then((characters) =>
      characters
        .sort((a, b) => b.release - a.release)
        .map((character, index) => gdLibCharacterAdaptor(character, index))
    )
}

export function gdLibWeaponAdaptor(weapon: any): Weapon {
  const subStatType = weapon.specialProp || ""
  const id = toKey(weapon.name)

  const base_stats = (weapon.stats?.levels || []).map((level: any) => ({
    level: level.level.toString(),
    base_atk: level.primary.toString(),
    sub_stat_type: subStatType,
    sub_stat_value: level.secondary?.toString() || "",
    ascension_phase: level.ascension,
  }))

  const refinements = (weapon.refinements || []).map((ref: any) => ref.desc)

  return {
    id: id,
    name: weapon.name,
    key: id,
    rarity: weapon.rarity,
    description: weapon.description || "",
    category: weapon.type?.id || "sword",
    series: "",
    release_date: new Date(weapon.release || 0).toISOString().split("T")[0],
    release_date_epoch: weapon.release || 0,
    base_atk_min: weapon.stats?.levels?.[0]?.primary || 0,
    base_atk_max:
      weapon.stats?.levels?.[weapon.stats?.levels?.length - 1]?.primary || 0,
    sub_stat_type: subStatType,
    sub_stat_value_min: weapon.stats?.levels?.[0]?.secondary?.toString() || "",
    sub_stat_value_max:
      weapon.stats?.levels?.[
        weapon.stats?.levels?.length - 1
      ]?.secondary?.toString() || "",
    refinement_name: weapon.refinement_raw?.name || "",
    refinements: refinements,
    base_stats: base_stats,
  }
}

export function gdLibArtifactAdaptor(artifact: any): Artifact {
  const id = toKey(artifact.name)
  return {
    id: id,
    name: artifact.name,
    key: id,
    rarity_max: artifact.max_rarity || 5,
    rarity_min: artifact.min_rarity || 1,
    release_version: "1.0",
    flower_description: artifact.flower?.description || "",
    feather_description: artifact.plume?.description || "",
    sand_description: artifact.sands?.description || "",
    goblet_description: artifact.goblet?.description || "",
    circlet_description: artifact.circlet?.description || "",
    flower_name: artifact.flower?.name || "",
    feather_name: artifact.plume?.name || "",
    sand_name: artifact.sands?.name || "",
    goblet_name: artifact.goblet?.name || "",
    circlet_name: artifact.circlet?.name || "",
    two_pc_bonus: artifact.two_pc || "",
    four_pc_bonus: artifact.four_pc || "",
  }
}

export async function gdGetWeapons(): Promise<Weapon[]> {
  return await gd
    .weapons()
    .then((weapons) =>
      weapons
        .sort((a, b) => (b.release || 0) - (a.release || 0))
        .map((weapon) => gdLibWeaponAdaptor(weapon))
    )
}

export async function gdGetArtifacts(): Promise<Artifact[]> {
  return await gd
    .artifacts()
    .then((artifacts) =>
      artifacts.map((artifact) => gdLibArtifactAdaptor(artifact))
    )
}
