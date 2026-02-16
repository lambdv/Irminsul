import { z } from "zod"

export const ArtifactSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  rarity_max: z.number(),
  rarity_min: z.number(),
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

// Export the inferred types for backward compatibility
export type Artifact = z.infer<typeof ArtifactSchema>
