import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { WeaponSchema } from "@/schemas/weapon"
import { getWeapons } from "@/utils/genshinData"

// Query parameters schema
const WeaponsQuerySchema = z.object({
  category: z.string().optional(),
  rarity: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  series: z.string().optional(),
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

    const queryValidation = WeaponsQuerySchema.safeParse(queryParams)
    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: queryValidation.error.issues,
        },
        { status: 400 }
      )
    }

    const { category, rarity, series, limit, offset } = queryValidation.data

    // Get all weapons
    let weapons = await getWeapons()

    // Apply filters
    if (category) {
      weapons = weapons.filter(
        (weapon) => weapon.category.toLowerCase() === category.toLowerCase()
      )
    }
    if (rarity) {
      weapons = weapons.filter((weapon) => weapon.rarity === rarity)
    }
    if (series) {
      weapons = weapons.filter(
        (weapon) => weapon.series.toLowerCase() === series.toLowerCase()
      )
    }

    // Apply pagination
    const startIndex = offset || 0
    const endIndex = limit ? startIndex + limit : weapons.length
    const paginatedWeapons = weapons.slice(startIndex, endIndex)

    // Validate response data against schema (be more lenient)
    const validWeapons = []
    let validationErrors = []

    for (const weapon of paginatedWeapons) {
      const validation = WeaponSchema.safeParse(weapon)
      if (validation.success) {
        validWeapons.push(validation.data)
      } else {
        validationErrors.push({
          weapon: weapon.name || weapon.id,
          errors: validation.error.issues,
        })
      }
    }

    // Log validation errors but don't fail the request
    if (validationErrors.length > 0) {
      console.warn(
        `Found ${validationErrors.length} weapons with validation issues:`,
        validationErrors
      )
    }

    return NextResponse.json({
      data: validWeapons,
      total: weapons.length,
      limit: limit || weapons.length,
      offset: startIndex,
      ...(validationErrors.length > 0 && {
        warnings: `${validationErrors.length} weapons had validation issues and were excluded`,
      }),
    })
  } catch (error) {
    console.error("Weapons API error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
