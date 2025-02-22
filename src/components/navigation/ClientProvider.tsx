import React from 'react'
import ClientWrapper from './ClientWrapper'
import { getUserFromCookies } from '@/app/(auth)/auth'
import { isUserSupporterById } from '@/app/support/actions'

export default async function ClientProvider(props: any) {

    const user = await getUserFromCookies()

    const isSupporter = await isUserSupporterById(user?.userId)


    return (
        <ClientWrapper 
            user={user}
            isSupporter={isSupporter}
        >
            {props.children}
        </ClientWrapper>
    )
}
