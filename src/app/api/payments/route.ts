import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import db from "@/db/db"
import { purchasesTable } from "@/db/schema/purchase"

export async function GET() {
  try {
    const payments = await db
      .select()
      .from(purchasesTable)
      .where(eq(purchasesTable.status, "succeeded"))

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}
