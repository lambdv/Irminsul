import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCharacter } from "@/utils/genshinData";
import { buildCharacterFactoryStatRows } from "@/feature/calculator/graph/factoryStatRows";

const CharacterPathSchema = z.object({
  id: z.string().min(1, "Character ID is required"),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const pathValidation = CharacterPathSchema.safeParse(resolvedParams);
    if (!pathValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid path parameters",
          details: pathValidation.error.issues,
        },
        { status: 400 },
      );
    }

    const { id } = pathValidation.data;
    const character = await getCharacter(id);
    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        id: character.id,
        name: character.name,
        rows: buildCharacterFactoryStatRows(character.base_stats || []),
      },
    });
  } catch (error) {
    console.error("Calc factory character API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
