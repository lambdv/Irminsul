import React from 'react'
import Gatekeeper from './gatekeeper';
import Chat from './chat';
import { auth, isAuthenticated } from '@/app/(auth)/auth';
import RightSidenav from '@/components/navigation/RightSidenav';
import Advertisment from '@/components/ui/Advertisment';

export async function generateMetadata() {
  return {
    title: "Seelie | Irminsul",
    description: "Seelie is your AI guide for Genshin Impact.",
    image: "/imgs/icons/seelie.png",
    url: "/seelie",
  }
}

export default async function Page() {
  const authenticated = await isAuthenticated()
  if(!authenticated)
    return <Gatekeeper />
  
  const user = await auth()
    .then(res => res?.user)

  return (
    <>
      <RightSidenav>
        <Advertisment type="card" />
      </RightSidenav>

      <Chat
        user={user}
      />
    </>
  )
}
