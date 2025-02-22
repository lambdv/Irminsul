import React from 'react'
import ClientWrapper from './ClientWrapper'
import { getUserFromCookies } from '@/app/(auth)/auth'
import { isUserSupporterByEmail } from '@/app/support/actions'

export default async function ClientProvider(props: any) {

    const user = await getUserFromCookies()

    let isSupporter = false

    if(user?.email){
        isSupporter = await isUserSupporterByEmail(user.email)
    }


    return (
        <ClientWrapper 
            user={user}
            isSupporter={isSupporter}
        >   
            {props.children}
        </ClientWrapper>
    )
}
