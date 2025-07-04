import { auth } from '@/app/(auth)/auth'
import { cache } from 'react'

// Cache the auth function to avoid multiple calls
export const getServerSession = cache(async () => {
  return await auth()
})

// Cache user data to avoid multiple database queries
export const getServerUser = cache(async () => {
  const session = await getServerSession()
  return session?.user || null
})

// Cache supporter status to avoid multiple database queries
export const getServerSupporterStatus = cache(async () => {
  const user = await getServerUser()
  if (!user?.email) return false
  
  // Import here to avoid circular dependencies
  const { isUserSupporterByEmail } = await import('@root/src/app/(main)/support/actions')
  return await isUserSupporterByEmail(user.email)
}) 