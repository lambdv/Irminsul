import { z } from "zod"
import {
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi"

// Import all schemas
import {
  CharacterSchema,
  CharacterBaseStatSchema,
  CharacterTalentSchema,
  CharacterTalentAttributeSchema,
  CharacterPassiveSchema,
  CharacterConstellationSchema,
  CharacterAscensionCostSchema,
  CharacterAscensionMaterialSchema,
} from "./character"

import { WeaponSchema, WeaponBaseStatSchema } from "./weapon"

import { ArtifactSchema } from "./artifact"

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z)

// Re-export schemas for convenience
export {
  CharacterSchema,
  CharacterBaseStatSchema,
  CharacterTalentSchema,
  CharacterTalentAttributeSchema,
  CharacterPassiveSchema,
  CharacterConstellationSchema,
  CharacterAscensionCostSchema,
  CharacterAscensionMaterialSchema,
  WeaponSchema,
  WeaponBaseStatSchema,
  ArtifactSchema,
}
