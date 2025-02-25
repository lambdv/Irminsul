import React from 'react'
// import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import Gatekeeper from './gatekeeper';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateResponse } from './ai';
import Chat from './chat';
import { auth, isAuthenticated } from '@/app/(auth)/auth';
import { eq } from 'drizzle-orm';
import db from '@/db/db';
import { aitokenTable } from '@/db/schema/aitoken';
import Overlay from '@/components/ui/Overlay';
import RightSidenav from '@/components/navigation/RightSidenav';
import Advertisment from '@/components/ui//Advertisment';
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
