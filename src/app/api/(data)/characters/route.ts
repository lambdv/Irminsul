import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { CharacterSchema } from "@/schemas/character"
import { getCharacters } from "@/utils/genshinData"

// Query parameters schema
const CharactersQuerySchema = z.object({
  element: z.string().optional(),
  rarity: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  region: z.string().optional(),
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

    const queryValidation = CharactersQuerySchema.safeParse(queryParams)
    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: queryValidation.error.issues,
        },
        { status: 400 }
      )
    }

    const { element, rarity, region, limit, offset } = queryValidation.data

    // Get all characters
    let characters = await getCharacters()

    // Apply filters
    if (element) {
      characters = characters.filter(
        (char) => char.element.toLowerCase() === element.toLowerCase()
      )
    }
    if (rarity) {
      characters = characters.filter((char) => char.rarity === rarity)
    }
    if (region) {
      characters = characters.filter(
        (char) => char.region.toLowerCase() === region.toLowerCase()
      )
    }

    // Apply pagination
    const startIndex = offset || 0
    const endIndex = limit ? startIndex + limit : characters.length
    const paginatedCharacters = characters.slice(startIndex, endIndex)

    // Validate response data against schema (be more lenient)
    const validCharacters = []
    let validationErrors = []

    for (const character of paginatedCharacters) {
      const validation = CharacterSchema.safeParse(character)
      if (validation.success) {
        validCharacters.push(validation.data)
      } else {
        validationErrors.push({
          character: character.name || character.id,
          errors: validation.error.issues,
        })
      }
    }

    // Log validation errors but don't fail the request
    if (validationErrors.length > 0) {
      console.warn(
        `Found ${validationErrors.length} characters with validation issues:`,
        validationErrors
      )
    }

    return NextResponse.json({
      data: validCharacters,
      total: characters.length,
      limit: limit || characters.length,
      offset: startIndex,
      ...(validationErrors.length > 0 && {
        warnings: `${validationErrors.length} characters had validation issues and were excluded`,
      }),
    })
  } catch (error) {
    console.error("Characters API error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
