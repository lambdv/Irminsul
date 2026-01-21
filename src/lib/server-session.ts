import { auth, currentUser } from "@clerk/nextjs/server"
import { cache } from "react"

// Cache the auth function to avoid multiple calls
export const getServerSession = cache(async () => {
  const { userId } = await auth()
  return userId ? { userId } : null
})

// Cache user data to avoid multiple database queries
export const getServerUser = cache(async () => {
  const clerkUser = await currentUser()
  if (!clerkUser) return null
  
  // Return user object compatible with existing code
  return {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || null,
    name: clerkUser.fullName || clerkUser.firstName || null,
    image: clerkUser.imageUrl || null,
  }
})

// Cache supporter status to avoid multiple database queries
export const getServerSupporterStatus = cache(async () => {
  const user = await getServerUser()
  if (!user?.email) return false

  // Import here to avoid circular dependencies
  const { isUserSupporterByEmail } = await import(
    "@/app/(main)/support/actions"
  )
  return await isUserSupporterByEmail(user.email)
})
