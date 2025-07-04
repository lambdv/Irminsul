import React from 'react'
import Chat from './chat';

import { isAuthenticated } from '@/app/(auth)/actions'
import RightSidenav from '@/components/navigation/RightSidenav';
import Advertisment from '@/components/ui/Advertisment';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/server-session'

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
  
  const user = await getServerUser()

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
