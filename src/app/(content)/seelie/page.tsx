import React from 'react'
// import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import Gatekeeper from './gatekeeper';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateResponse } from './ai';
import Chat from './chat';

export default async function Page() {
  const cookieStore = await cookies()
  if(!cookieStore.get('authjs.session-token')) 
    return <Gatekeeper />
  return (
    <div>
      <Chat />
    </div>
  )
}
