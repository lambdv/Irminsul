import { z } from "zod"

export const WeaponBaseStatSchema = z.object({
  level: z.string(),
  base_atk: z.string(),
  sub_stat_type: z.string().optional(),
  sub_stat_value: z.string().optional(),
  ascension_phase: z.number().optional(),
})

export const WeaponSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  rarity: z.number(),
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
  base_stats: z.array(WeaponBaseStatSchema),
})

// Export the inferred types for backward compatibility
export type Weapon = z.infer<typeof WeaponSchema>
export type WeaponBaseStat = z.infer<typeof WeaponBaseStatSchema>
