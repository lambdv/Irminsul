import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import DiscordProvider from "next-auth/providers/discord"
import CredentialsProvider from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import db from "@/db/db"
import { usersTablePG, accountsTablePG, sessionsTablePG, verificationTokensTablePG } from "@/db/schema"
import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
 

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
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const {username, email, password} = credentials
        let user = null

        const salt = await bcrypt.genSalt(10)
        const pwHash = await bcrypt.hash(password, salt)

        user = await db.select().from(usersTablePG).where(eq(usersTablePG.email, email as string))

        if(user.length === 0)
          throw new Error("User not found")
        
        if(user[0].password !== pwHash)
          throw new Error("Invalid password")
        
        return user
      }
    })

  ],
  secret: process.env.AUTH_SECRET,
})