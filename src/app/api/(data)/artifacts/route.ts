import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ArtifactSchema } from "@/schemas/artifact"
import { getArtifacts } from "@/utils/genshinData"

// Query parameters schema
const ArtifactsQuerySchema = z.object({
  rarity_min: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  rarity_max: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  offset: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
})

export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(req.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())

    const queryValidation = ArtifactsQuerySchema.safeParse(queryParams)
    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: queryValidation.error.issues,
        },
        { status: 400 }
      )
    }

    const { rarity_min, rarity_max, limit, offset } = queryValidation.data

    // Get all artifacts
    let artifacts = await getArtifacts()

    // Apply filters
    if (rarity_min !== undefined) {
      artifacts = artifacts.filter(
        (artifact) => artifact.rarity_min >= rarity_min
      )
    }
    if (rarity_max !== undefined) {
      artifacts = artifacts.filter(
        (artifact) => artifact.rarity_max <= rarity_max
      )
    }

    // Apply pagination
    const startIndex = offset || 0
    const endIndex = limit ? startIndex + limit : artifacts.length
    const paginatedArtifacts = artifacts.slice(startIndex, endIndex)

    // Validate response data against schema
    // Validate response data against schema (be more lenient)
    const validArtifacts = []
    let validationErrors = []

    for (const artifact of paginatedArtifacts) {
      const validation = ArtifactSchema.safeParse(artifact)
      if (validation.success) {
        validArtifacts.push(validation.data)
      } else {
        validationErrors.push({
          artifact: artifact.name || artifact.id,
          errors: validation.error.issues,
        })
      }
    }

    // Log validation errors but don't fail the request
    if (validationErrors.length > 0) {
      console.warn(
        `Found ${validationErrors.length} artifacts with validation issues:`,
        validationErrors
      )
    }

    return NextResponse.json({
      data: validArtifacts,
      total: artifacts.length,
      limit: limit || artifacts.length,
      offset: startIndex,
      ...(validationErrors.length > 0 && {
        warnings: `${validationErrors.length} artifacts had validation issues and were excluded`,
      }),
    })
  } catch (error) {
    console.error("Artifacts API error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
