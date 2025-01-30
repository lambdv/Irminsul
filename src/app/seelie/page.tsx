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

export default async function Page() {
  if(!await isAuthenticated()) 
    return <Gatekeeper />

  const user = await auth().then(res => res?.user)

  return (
    <div>
      <Chat user={user}/>
    </div>
  )
}
