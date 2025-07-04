import { auth } from '@/app/(auth)/auth'
import { isAuthenticated, getUserFromSession} from '@/app/(auth)/actions'
import { generateResponse } from '@root/src/app/(main)/seelie/ai'
import db from '@/db/db'
import { resources as resourcesTable } from '@/db/schema/resources'
import { embeddings as embeddingsTable } from '@/db/schema/embeddings'
import { redirect } from 'next/navigation'
import React from 'react'
import { createResource } from '@/lib/ai/resources'
import { generateEmbeddings } from '@/lib/ai/embedding'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/app/(auth)/actions'
import { Metadata } from 'next'
import Input from './input'
import Resources from './resources'

export const metadata: Metadata = {
    title: 'Train | Irminsul',
    description: 'Train your model',
}

export default async function Page() {
    if(!await isAdmin())
        redirect("/")
    
    let resources = await db.select().from(resourcesTable)
    let embeddings = await db.select().from(embeddingsTable)



    return (
        <div>
            <h1>Train</h1>
           <Input />
           <br />
           <h1>Resources</h1>
           <Resources resources={resources} embeddings={embeddings} />
        </div>
    )
}
