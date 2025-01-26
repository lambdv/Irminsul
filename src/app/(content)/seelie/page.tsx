import React from 'react'
// import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import Gatekeeper from './gatekeeper';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateResponse } from './ai';
import Chat from './chat';
import { auth } from '@/app/(auth)/auth';

export default async function Page() {
  const cookieStore = await cookies()
  

  let session = cookieStore.get('authjs.session-token') || cookieStore.get('__Secure-authjs.session-token')
  if(!session) 
    return <Gatekeeper />

  const user = await auth().then(res => res?.user)

  return (
    <div>
      <Chat user={user}/>
    </div>
  )
}
