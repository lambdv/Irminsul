import { auth, isAuthenticated, getUserFromSession } from '@/app/(auth)/auth'
import { generateResponse } from '@/app//seelie/ai'
import db from '@/db/db'
import vector from '@root/src/db/vector'
import { resources as resourcesTable } from '@/db/schema'
import { embeddings as embeddingsTable } from '@/db/schema'

import { redirect } from 'next/navigation'
import React from 'react'
import { createResource } from '@/lib/ai/resources'
import { generateEmbeddings } from '@/lib/ai/embedding'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/app/(auth)/auth'


export default async function Page() {
    if(!await isAdmin())
        redirect("/")
    
    let resources = await vector.select().from(resourcesTable)
    let embeddings = await vector.select().from(embeddingsTable)

    const handleSubmit = async (formData: FormData) => {
        "use server"
        const prompt = formData.get('prompt') as string
        const res = await createResource({content: prompt})
        const embeddings = await generateEmbeddings(prompt)
    }


    return (
        <div>
            <form action={handleSubmit}>
                <textarea name="prompt" 
                    style={{
                        width: "100%",
                        height: "100px",
                        backgroundColor: "#1d1d1d",
                        color: "#dcdcdc",
                        border: "1px solid #303030",
                        borderRadius: "10px",
                        padding: "10px",
                        fontFamily: "monospace",
                        outline: "none",
                        
                    }}
                />
                <button type="submit"
                    style={{
                        backgroundColor: "#1d1d1d",
                        color: "#dcdcdc",
                        border: "1px solid #303030",
                        borderRadius: "10px",
                        padding: "10px",
                        fontFamily: "monospace",
                        outline: "none",
                    }}
                >Submit</button>
            </form>

            <br />

            <table>
                <thead>
                    <tr>
                        <th
                            style={{
                                backgroundColor: "#1d1d1d",
                                color: "#dcdcdc",
                                border: "1px solid #303030",
                                borderRadius: "10px",
                                padding: "10px",
                                fontFamily: "monospace",
                                outline: "none",
                            }}
                        >Resources</th>
                        <th
                            style={{
                                backgroundColor: "#1d1d1d",
                                color: "#dcdcdc",
                                border: "1px solid #303030",
                                borderRadius: "10px",
                                padding: "10px",
                                fontFamily: "monospace",
                                outline: "none",
                                width: "1%",
                            }}
                        >Embeddings</th>
                        <th
                            style={{
                                backgroundColor: "#1d1d1d",
                                color: "#dcdcdc",
                                border: "1px solid #303030",
                                borderRadius: "10px",
                                padding: "10px",
                                fontFamily: "monospace",
                                outline: "none",
                                width: "1%",
                            }}
                        >Options</th>
                    </tr>
                </thead>

                <tbody>
                    {resources.map((resource) => (
                        <tr key={resource.id}>
                            <td style={{
                                backgroundColor: "#1d1d1d",
                                color: "#dcdcdc",
                                border: "1px solid #303030",
                                borderRadius: "10px",
                                padding: "10px",
                                fontFamily: "monospace",
                                outline: "none",
                                maxWidth: "80%",
                            }}>{resource.content}</td>
                            <td
                                style={{
                                    backgroundColor: "#1d1d1d",
                                    color: "#dcdcdc",
                                    border: "1px solid #303030",
                                    borderRadius: "10px",
                                    padding: "10px",
                                    fontFamily: "monospace",
                                    outline: "none",
                                    maxWidth: "10%",
                                    whiteSpace: "wrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
{/*                                 
                            {embeddings.find((embedding) => embedding.resourceId === resource.id)?.embedding.slice(0, 5)}...</td>
                                <td
                                    style={{
                                        backgroundColor: "#1d1d1d",
                                        color: "#dcdcdc",
                                        border: "1px solid #303030",
                                        borderRadius: "10px",
                                        padding: "10px",
                                        fontFamily: "monospace",
                                        outline: "none",
                                        width: "1%",
                                    }}
                            > */}
                                <form action={async (formData) => {
                                    "use server"
                                    const resourceId = formData.get('resourceId') as string
                                    await vector.delete(resourcesTable).where(eq(resourcesTable.id, resourceId))
                                    await vector.delete(embeddingsTable).where(eq(embeddingsTable.resourceId, resourceId))
                                    console.log("Deleted resource and embedding")
                                    revalidatePath('/train')
                                }}>
                                    <button type="submit"
                                        name="resourceId"
                                        value={resource.id}
                                        style={{
                                            backgroundColor: "#1d1d1d",
                                            color: "#dcdcdc",
                                            border: "1px solid #303030",
                                            borderRadius: "10px",
                                            padding: "10px",
                                            fontFamily: "monospace",
                                            outline: "none",
                                        }}
                                    >Delete</button>
                                </form>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
