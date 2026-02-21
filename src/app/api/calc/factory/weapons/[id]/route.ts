import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getWeapon } from "@/utils/genshinData";
import { buildWeaponFactoryStatRows } from "@/feature/calculator/graph/factoryStatRows";

const WeaponPathSchema = z.object({
  id: z.string().min(1, "Weapon ID is required"),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const pathValidation = WeaponPathSchema.safeParse(resolvedParams);
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
    const weapon = await getWeapon(id);
    if (!weapon) {
      return NextResponse.json({ error: "Weapon not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: weapon.id,
        name: weapon.name,
        rows: buildWeaponFactoryStatRows(weapon.base_stats || []),
      },
    });
  } catch (error) {
    console.error("Calc factory weapon API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
