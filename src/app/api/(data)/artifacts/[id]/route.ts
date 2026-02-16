import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ArtifactSchema } from "@/schemas/artifact"
import { getArtifact } from "@/utils/genshinData"

// Path parameters schema
const ArtifactPathSchema = z.object({
  id: z.string().min(1, "Artifact ID is required"),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate path parameters
    const pathValidation = ArtifactPathSchema.safeParse(params)
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

    const artifact = await getArtifact(id)

    if (!artifact) {
      return NextResponse.json({ error: "Artifact not found" }, { status: 404 })
    }

    // Validate response data against schema
    const responseValidation = ArtifactSchema.safeParse(artifact)
    if (!responseValidation.success) {
      console.warn(
        `Artifact ${id} has validation issues:`,
        responseValidation.error.issues
      )
      // Still return the artifact but log the issue
    }

    return NextResponse.json({
      data: artifact,
      ...(responseValidation.success
        ? {}
        : {
            warning:
              "Artifact data has validation issues but was returned anyway",
          }),
    })
  } catch (error) {
    console.error("Artifact API error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
