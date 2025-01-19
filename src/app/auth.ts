import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import DiscordProvider from "next-auth/providers/discord"
import CredentialsProvider from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import db from "@/db/db"
import { usersTablePG, accountsTablePG, sessionsTablePG, verificationTokensTablePG } from "@/db/schema"
import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import crypto from "crypto"
 

const adapter = DrizzleAdapter(db, {
  usersTable: usersTablePG,
  accountsTable: accountsTablePG,
  sessionsTable: sessionsTablePG,
  verificationTokensTable: verificationTokensTablePG,
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: adapter,
  providers: [
    // GithubProvider({
    //   clientId: process.env.AUTH_GITHUB_ID!,
    //   clientSecret: process.env.AUTH_GITHUB_SECRET!,
    // }),
    DiscordProvider,
    // CredentialsProvider({
    //   name: "Credentials",
    //   credentials: {
    //     username: { label: "Username", type: "text", placeholder: "jsmith" },
    //     email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   authorize: async (credentials) => {
    //     const {username, email, password} = credentials as { username: string, email: string, password: string }
    //     if (!username || !email || !password) {
    //       throw new Error("Missing credentials")
    //     }

    //     // Check if user exists
    //     const existingUsers = await db.select().from(usersTablePG).where(eq(usersTablePG.email, email))
        
    //     if(existingUsers.length > 0) {
    //       // User exists - this should be a login attempt
    //       const user = existingUsers[0]
    //       if (!user.password) {
    //         throw new Error("Please login with OAuth provider")
    //       }
          
    //       const passwordMatch = await bcrypt.compare(password, user.password)
    //       if (!passwordMatch) {
    //         throw new Error("Invalid password")
    //       }
          
    //       return user
    //     }

    //     // Create new user
    //     const salt = await bcrypt.genSalt(10)
    //     const pwHash = await bcrypt.hash(password, salt)

    //     const newUser = {
    //       id: crypto.randomUUID(),
    //       name: username,
    //       email: email,
    //       emailVerified: new Date(),
    //       image: "",
    //       password: pwHash,
    //     }
            
    //     await db.insert(usersTablePG).values(newUser)
    //     return newUser
    //   }
    // })

  ],
})