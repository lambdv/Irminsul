import React from 'react'
import Chat from './chat';

import { auth } from '@/app/(auth)/auth'
import { isAuthenticated } from '@/app/(auth)/actions'
import RightSidenav from '@/components/navigation/RightSidenav';
import Advertisment from '@/components/ui/Advertisment';
import { redirect } from 'next/navigation';

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
    redirect("/login")
  
  const user = await auth()
    .then(res => res?.user)

  return (
    <>
      {/* <RightSidenav>
        <Advertisment type="card" />
      </RightSidenav> */}
      <Chat
        user={user}
      />
    </>
  )
}
