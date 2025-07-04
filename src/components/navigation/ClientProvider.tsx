import React from 'react'
import ClientWrapper from './ClientWrapper'
import SessionProviderWrapper from './SessionProviderWrapper'

/**Wrapper around the whole app to include client side logic before server side rendering */
export default async function ClientProvider(props: any) {
    return (
        <SessionProviderWrapper>
            <ClientWrapper>
                {props.children}
            </ClientWrapper>
        </SessionProviderWrapper>
    )
}
