import { currentUser } from "@clerk/nextjs/server"
import {
  isUserUltraTierById,
  getUserTierById,
} from "@/app/(main)/pricing/actions"
import { getAiTokensLeft } from "@/feature/ai/utils/numAiTokensLeft"

export async function GET() {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const isUltra = await isUserUltraTierById(clerkUser.id)
    if (isUltra) {
      return new Response(JSON.stringify({ tokensLeft: -1 }), {
        status: 200,
      })
    }

    const tokensLeft = await getAiTokensLeft(clerkUser.id)
    return new Response(JSON.stringify({ tokensLeft }), {
      status: 200,
    })
  } catch (e: any) {
    console.error("/api/tokens error:", e)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    })
  }
}
