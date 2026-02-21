import { NextResponse } from "next/server";
import { getWeapons } from "@/utils/genshinData";

export async function GET() {
  try {
    const weapons = await getWeapons();
    const data = weapons
      .filter((weapon) => weapon?.id && weapon?.name)
      .map((weapon) => ({
        id: weapon.id,
        name: weapon.name,
      }));

    return NextResponse.json({
      data,
      total: data.length,
    });
  } catch (error) {
    console.error("Calc factory weapons list API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
