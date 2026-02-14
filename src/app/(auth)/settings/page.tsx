import React, { HTMLAttributes, Suspense } from "react"
import settingsStyle from "./settings.module.css"
import AccountSettings from "./accountSettings"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/cn/card"
import db from "@/db/db"
import { usersTable } from "@/db/schema/user"
import { accountsTable } from "@/db/schema/account"
import { eq } from "drizzle-orm"
import PreferencesSettings from "./preferencesSettings"
import DangerZoneSettings from "./dangerZoneSettings"
import GoBack from "./goBack"
import APISettings from "./APISettings"
import {
  getServerSession,
  getServerUser,
  getServerSupporterStatus,
} from "@/lib/server-session"
import { ArrowLeft, User, Palette, Database, Shield } from "lucide-react"

export const metadata = {
  title: "Settings | Irminsul",
  description: "",
}

/**
 * Settings page
 * @returns
 */
export default async function Settings() {
  const session = await getServerSession()
  const user = await getServerUser()
  const account = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.userId, user?.id))
  const isLoggedIn = !!user?.email
  const isSupporter = await getServerSupporterStatus()

  return (
    <div className={settingsStyle.settingsWrapper}>
      <div className="flex items-center gap-2 mb-6">
        <GoBack />
        <h1 className={settingsStyle.settingsTitle}>Settings</h1>
      </div>

      <Suspense fallback={<p>Loading...</p>}>
        {isLoggedIn && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSettings
                session={session}
                account={account}
                isSupporter={isSupporter}
              />
            </CardContent>
          </Card>
        )}
      </Suspense>

      <Suspense fallback={<p>Loading...</p>}>
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your experience with theme and language settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PreferencesSettings />
          </CardContent>
        </Card>
      </Suspense>

      {/* 
       <Suspense fallback={<p>Loading...</p>}>
         <Card className="mb-6">
           <CardHeader className="pb-3">
             <CardTitle className="flex items-center gap-2">
               <Database className="h-5 w-5" />
               Database
               <span className="text-sm text-muted-foreground">
                 (Experimental)
               </span>
             </CardTitle>
             <CardDescription>
               Access experimental database features and settings
             </CardDescription>
           </CardHeader>
           <CardContent>
             <APISettings />
           </CardContent>
         </Card>
       </Suspense>
       */}

      {/* 
      <Suspense fallback={<p>Loading...</p>}>
      {isLoggedIn && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DangerZoneSettings />
            </CardContent>
          </Card>
        )} 
      </Suspense> 
      */}
    </div>
  )
}
