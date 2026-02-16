#!/usr/bin/env tsx

import { writeFileSync, mkdirSync } from "fs"
import { join } from "path"
import { generateOpenAPISpecString } from "../src/lib/openapi/generator"

async function main() {
  try {
    console.log("Generating OpenAPI specification...")

    // Generate the OpenAPI spec
    const specString = generateOpenAPISpecString()

    // Ensure public directory exists
    const publicDir = join(process.cwd(), "public")
    mkdirSync(publicDir, { recursive: true })

    // Write to public/openapi.json
    const outputPath = join(publicDir, "openapi.json")
    writeFileSync(outputPath, specString, "utf8")

    console.log(
      `✅ OpenAPI specification generated successfully at: ${outputPath}`
    )
    console.log(`📖 View documentation at: /api-docs`)
  } catch (error) {
    console.error("❌ Failed to generate OpenAPI specification:", error)
    process.exit(1)
  }
}

main()
