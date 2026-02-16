import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { CharacterSchema } from "@/schemas/character"
import { getCharacter } from "@/utils/genshinData"

// Path parameters schema
const CharacterPathSchema = z.object({
  id: z.string().min(1, "Character ID is required"),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate path parameters
    const pathValidation = CharacterPathSchema.safeParse(params)
    if (!pathValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid path parameters",
          details: pathValidation.error.issues,
        },
        { status: 400 }
      )
    }

    const { id } = pathValidation.data

    const character = await getCharacter(id)

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      )
    }

    // Validate response data against schema
    const responseValidation = CharacterSchema.safeParse(character)
    if (!responseValidation.success) {
      console.warn(
        `Character ${id} has validation issues:`,
        responseValidation.error.issues
      )
      // Still return the character but log the issue
    }

    return NextResponse.json({
      data: character,
      ...(responseValidation.success
        ? {}
        : {
            warning:
              "Character data has validation issues but was returned anyway",
          }),
    })
  } catch (error) {
    console.error("Character API error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
