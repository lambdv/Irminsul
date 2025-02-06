import React from 'react'
import settingsStyle from './settings.module.css'
import { auth } from '@/app/(auth)/auth'
import AccountSettings from './accountSettings'
import Divider from '@/components/ui/Divider'
import db from '@/db/db'
import { usersTable } from '@/db/schema/user'
import { accountsTable } from '@/db/schema/account'
import { eq } from 'drizzle-orm'




export const metadata = {
    title: 'Settings | Irminsul',
    description: '',
}

export default async function Settings() {


    const session = await auth()
    const account = await db.select().from(accountsTable).where(eq(accountsTable.userId, session?.user?.id))


    return (
    <div className={settingsStyle.settingsWrapper}>
        <h1 className={settingsStyle.settingsTitle}>Settings</h1>
        <Divider />

        <div className={settingsStyle.settingsContent}>
           {session?.user?.email && (<AccountSettings session={session} account={account} />)}
        </div>


        <div className={settingsStyle.settingsContent}>

        </div>
    </div>




    )
}
