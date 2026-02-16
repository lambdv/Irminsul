import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { WeaponSchema } from "@/schemas/weapon"
import { getWeapon } from "@/utils/genshinData"

// Path parameters schema
const WeaponPathSchema = z.object({
  id: z.string().min(1, "Weapon ID is required"),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate path parameters
    const pathValidation = WeaponPathSchema.safeParse(params)
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

    const weapon = await getWeapon(id)

    if (!weapon) {
      return NextResponse.json({ error: "Weapon not found" }, { status: 404 })
    }

    // Validate response data against schema
    const responseValidation = WeaponSchema.safeParse(weapon)
    if (!responseValidation.success) {
      console.warn(
        `Weapon ${id} has validation issues:`,
        responseValidation.error.issues
      )
      // Still return the weapon but log the issue
    }

    return NextResponse.json({
      data: weapon,
      ...(responseValidation.success
        ? {}
        : {
            warning:
              "Weapon data has validation issues but was returned anyway",
          }),
    })
  } catch (error) {
    console.error("Weapon API error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
