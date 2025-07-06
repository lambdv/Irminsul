import React, { HTMLAttributes, Suspense } from 'react'
import settingsStyle from './settings.module.css'
import AccountSettings from './accountSettings'
import Divider from '@/components/ui/Divider'
import db from '@/db/db'
import { usersTable } from '@/db/schema/user'
import { accountsTable } from '@/db/schema/account'
import { eq } from 'drizzle-orm'
import PreferencesSettings from './preferencesSettings'
import DangerZoneSettings from './dangerZoneSettings'
import RoundBtn from '@/components/ui/RoundBtn'
import GoBack from './goBack'
import APISettings from './APISettings'
import { createTheme } from '@mui/material/styles'
import { getServerSession, getServerUser, getServerSupporterStatus } from '@/lib/server-session'

export const metadata = {
    title: 'Settings | Irminsul',
    description: '',
}

/**
 * Settings page
 * @returns 
 */
export default async function Settings() {
    const session = await getServerSession()
    const user = await getServerUser()
    const account = await db.select().from(accountsTable).where(eq(accountsTable.userId, user?.id))
    const isLoggedIn = !!user?.email
    const isSupporter = await getServerSupporterStatus()

    return (
        <div className={settingsStyle.settingsWrapper}>
            <div className='flex items-center gap-2'>
                <GoBack />
                <h1 className={settingsStyle.settingsTitle}>Settings</h1>
            </div>
            <Divider />

            <Suspense fallback={<p>Loading...</p>}>
                {isLoggedIn && (
                    <section className={settingsStyle.settingsContent}>
                        <AccountSettings session={session} account={account} isSupporter={isSupporter} />
                    </section>
                )}
            </Suspense>

        <Suspense fallback={<p>Loading...</p>}>
            <section className={settingsStyle.settingsContent}>
                    <h1 className="mb-0 flex items-center gap-2">Prefernces</h1>
                    <PreferencesSettings />
                </section>
        </Suspense>

        <Suspense fallback={<p>Loading...</p>}>

            <section className={settingsStyle.settingsContent}>
                <h1 className="mb-0 flex items-center gap-2">Database <p className="text-sm text-gray-500">(Experimental)</p></h1>
                <APISettings />
            </section>

            </Suspense>
            {/* 
            <Suspense fallback={<p>Loading...</p>}>
            {isLoggedIn && (
                <section className={settingsStyle.settingsContent}>
                    <h1 className="mb-0 flex items-center gap-2">Danger Zone</h1>
                    <DangerZoneSettings />
                    </section>
                )} 
            </Suspense> 
            */}

        </div>

    )
}
