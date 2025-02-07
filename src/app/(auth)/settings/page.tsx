import React from 'react'
import settingsStyle from './settings.module.css'
import { auth } from '@/app/(auth)/auth'
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

export const metadata = {
    title: 'Settings | Irminsul',
    description: '',
}

export default async function Settings() {
    const session = await auth()
    const account = await db.select().from(accountsTable).where(eq(accountsTable.userId, session?.user?.id))
    const isLoggedIn = session?.user?.email ? true : false
    return (
    <div className={settingsStyle.settingsWrapper}>
        <div className='flex items-center gap-2'>
            <GoBack />
            <h1 className={settingsStyle.settingsTitle}>Settings</h1>
        </div>
        <Divider />

        {isLoggedIn && (
            <section className={settingsStyle.settingsContent}>
                <AccountSettings session={session} account={account} />
            </section>
        )}


        <br />

        <section className={settingsStyle.settingsContent}>
            <h1 className="mb-2">Prefernces</h1>
            <PreferencesSettings />
        </section>

        <br />

        <section className={settingsStyle.settingsContent}>
            <h1 className="mb-2">API</h1>
            <APISettings />
        </section>


        <br />

        {isLoggedIn && (
            <section className={settingsStyle.settingsContent}>
                <h1 className="mb-2">Danger Zone</h1>
                <DangerZoneSettings />
            </section>
        )}

    </div>

    )
}
