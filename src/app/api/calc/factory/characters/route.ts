import { NextResponse } from "next/server";
import { getCharacters } from "@/utils/genshinData";

export async function GET() {
  try {
    const characters = await getCharacters();
    const data = characters
      .filter((character) => character?.id && character?.name)
      .map((character) => ({
        id: character.id,
        name: character.name,
      }));

    return NextResponse.json({
      data,
      total: data.length,
    });
  } catch (error) {
    console.error("Calc factory characters list API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
