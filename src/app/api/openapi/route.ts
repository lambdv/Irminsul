import { NextResponse } from "next/server"
import { generateOpenAPISpec } from "@/lib/openapi/generator"

export async function GET() {
  try {
    const spec = generateOpenAPISpec()

    return NextResponse.json(spec, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error("OpenAPI generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate OpenAPI specification" },
      { status: 500 }
    )
  }
}
