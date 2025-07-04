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

export default function Input() {

    /**
     * Add resource and embedding to database from form data
     * @param formData 
     */
        const handleSubmit = async (formData: FormData) => {
            "use server"
            const prompt = formData.get('prompt') as string
            let source = formData.get('source') as string
            let type = formData.get('type') as string
            let date = formData.get('date') as string
            let weight = formData.get('weight') as string
            let tags = formData.get('tags') as string
    
            if (!source) 
                source = "unknown"
    
            if (!type)
                type = "article"
            
            const res = await createResource({
                content: prompt,
                source: source,
                type: type,
                date: date,
                weight: parseFloat(weight),
                tags: tags.split(',').map(tag => tag.trim())
            })
    
            //reload page
            redirect('/admin/train')
        }
    
        const inputStyle = {
            width: "100%",
            height: "100px",
            backgroundColor: "#1d1d1d",
            color: "#dcdcdc",
            border: "1px solid #303030",
            borderRadius: "10px",
            padding: "10px",
            fontFamily: "monospace",
            outline: "none",
        }


    return (
            <form action={handleSubmit}>
                <textarea name="prompt" 
                    cols={100}
                    rows={10}
                    placeholder="Information"
                    style={inputStyle}
                />

                <br />

                <input type="text" name="source" placeholder="Source" 
                    style={{
                        width: "auto",
                        height: "auto",
                        backgroundColor: "#1d1d1d",
                        color: "#dcdcdc",
                        border: "1px solid #303030",
                        borderRadius: "10px",
                        padding: "10px",
                        fontFamily: "monospace",
                        outline: "none",
                    }}
                    defaultValue="unknown"
                />

                <br />
                <select name="type" 
                    style={{
                        width: "auto",
                        height: "auto",
                        backgroundColor: "#1d1d1d",
                        color: "#dcdcdc",
                        border: "1px solid #303030",
                        borderRadius: "10px",
                        padding: "10px",
                        fontFamily: "monospace",
                        outline: "none",
                    }}
                    defaultValue="article"
                >
                    <option value="article">article</option>
                    <option value="thread">thread</option>
                    <option value="prompt">prompt</option>
                    <option value="transcript">transcript</option>
                    <option value="qna">qna</option>

                </select>

                <br />

                <input type="text" name="date" placeholder="Date" 
                    style={{
                        width: "auto",
                        height: "auto",
                        backgroundColor: "#1d1d1d",
                        color: "#dcdcdc",
                        border: "1px solid #303030",
                        borderRadius: "10px",
                        padding: "10px",
                        fontFamily: "monospace",
                        outline: "none",
                    }}
                    defaultValue={new Date().toISOString().split('T')[0]}
                />

                <br />

                <input name="weight" placeholder="Weight" type="number" step="0.01"
                    style={{
                        width: "auto",
                        height: "auto",
                        backgroundColor: "#1d1d1d",
                        color: "#dcdcdc",
                        border: "1px solid #303030",
                        borderRadius: "10px",
                        padding: "10px",
                        fontFamily: "monospace",
                        outline: "none",
                    }}
                    defaultValue={1.0}
                />

                <br />

                <input type="text" name="tags" placeholder="Tags (eg: t1, t2, t3)" 
                    style={{
                        width: "auto",
                        height: "auto",
                        backgroundColor: "#1d1d1d",
                        color: "#dcdcdc",
                        border: "1px solid #303030",
                        borderRadius: "10px",
                        padding: "10px",
                        fontFamily: "monospace",
                        outline: "none",
                    }}
                />

                <br />
                <button type="submit"
                    style={{
                        backgroundColor: "#1d1d1d",
                        color: "#dcdcdc",
                        border: "1px solid #303030",
                        borderRadius: "10px",
                        padding: "10px",
                        fontFamily: "monospace",
                        outline: "none",
                        marginRight: "10px",
                        textAlign: "right",
                    }}
                >Submit</button>
            </form>
    )
}
