import { getUserFromCookies } from "@/app/(auth)/actions"
import db from "@/db/db"
import { conversationTable } from "@/db/schema/conversation"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookies()
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const conversations = await db
      .select()
      .from(conversationTable)
      .where(eq(conversationTable.userId, user.id))
      .orderBy(conversationTable.updatedAt)

    return new Response(JSON.stringify({ conversations }), { status: 200 })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies()
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const { title } = await req.json()

    const [conversation] = await db
      .insert(conversationTable)
      .values({
        id: nanoid(),
        userId: user.id,
        title: title || "New Chat",
      })
      .returning()

    return new Response(JSON.stringify({ conversation }), { status: 201 })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    })
  }
}
