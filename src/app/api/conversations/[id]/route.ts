import { getUserFromCookies } from "@/app/(auth)/actions"
import db from "@/db/db"
import { conversationTable } from "@/db/schema/conversation"
import { aimessageTable } from "@/db/schema/aimessage"
import { eq } from "drizzle-orm"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookies()
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const { id } = await params

    const [conversation] = await db
      .select()
      .from(conversationTable)
      .where(eq(conversationTable.id, id))

    if (!conversation || conversation.userId !== user.id) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
      })
    }

    const messages = await db
      .select()
      .from(aimessageTable)
      .where(eq(aimessageTable.conversationId, id))
      .orderBy(aimessageTable.createdAt)

    return new Response(
      JSON.stringify({
        conversation,
        messages: messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
        })),
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    })
  }
}
