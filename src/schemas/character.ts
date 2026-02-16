import { z } from "zod"

export const CharacterBaseStatSchema = z.object({
  LVL: z.string(),
  BaseHP: z.string(),
  BaseATK: z.string(),
  BaseDEF: z.string(),
  AscensionStatType: z.string(),
  AscensionStatValue: z.string(),
  AscensionPhase: z.number(),
})

export const CharacterTalentAttributeSchema = z.object({
  hit: z.string(),
  values: z.array(z.union([z.number(), z.string()])),
})

export const CharacterTalentSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  description: z.string(),
  attributes: z.array(CharacterTalentAttributeSchema).optional(),
  properties: z.array(z.any()),
})

export const CharacterPassiveSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
  properties: z.array(z.any()).optional(),
})

export const CharacterConstellationSchema = z.object({
  level: z.number(),
  name: z.string(),
  description: z.string(),
  properties: z.array(z.any()),
})

export const CharacterAscensionMaterialSchema = z.object({
  name: z.string(),
  amount: z.string(),
})

export const CharacterAscensionCostSchema = z.object({
  AscensionPhase: z.number(),
  materials: z.array(CharacterAscensionMaterialSchema),
})

export const CharacterSchema = z.object({
  id: z.string(),
  index: z.number().optional(),
  name: z.string(),
  key: z.string(),
  title: z.string(),
  rarity: z.number(),
  element: z.string(),
  vision: z.string(),
  weapon: z.string(),
  release_date: z.string(),
  release_date_epoch: z.number(),
  constellation: z.string(),
  birthday: z.string(),
  affiliation: z.string(),
  region: z.string(),
  special_dish: z.string(),
  alternate_title: z.string().optional(),
  description: z.string(),
  ascension_stat: z.string(),
  base_stats: z.array(CharacterBaseStatSchema),
  ascension_costs: z.array(CharacterAscensionCostSchema),
  talents: z.array(CharacterTalentSchema),
  passives: z.array(CharacterPassiveSchema),
  constellations: z.array(CharacterConstellationSchema),
})

// Export the inferred types for backward compatibility
export type Character = z.infer<typeof CharacterSchema>
export type CharacterBaseStat = z.infer<typeof CharacterBaseStatSchema>
export type CharacterTalent = z.infer<typeof CharacterTalentSchema>
export type CharacterTalentAttribute = z.infer<
  typeof CharacterTalentAttributeSchema
>
export type CharacterPassive = z.infer<typeof CharacterPassiveSchema>
export type CharacterConstellation = z.infer<
  typeof CharacterConstellationSchema
>
export type CharacterAscensionCost = z.infer<
  typeof CharacterAscensionCostSchema
>
export type CharacterAscensionMaterial = z.infer<
  typeof CharacterAscensionMaterialSchema
>
