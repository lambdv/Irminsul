"use client"
import React, { useState } from 'react'
import { generateResponse } from './ai'
import Image from 'next/image'

function Message({user, message}: {user: string, message: string}) {
    const isUser = user === "User"
    return (
        <div
            style={{
                padding: "10px",
                backgroundColor: "#2e2e2e",
                color: "#e0e0e0",
                borderRadius: "5px",
                marginBottom: "10px",
                width: "fit-content", // Changed to fit-content to adapt to content
                maxWidth: "50%",
                marginLeft: isUser ? "auto" : "0", // Align user messages to right, AI to left
                marginRight: isUser ? "0" : "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start"
            }}
        >
            <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                {user !== "User" && <Image src="/imgs/icons/seelie.png" alt="Seelie" width={50} height={50} style={{
                    alignSelf: "flex-start",
                    padding: "8px",
                    margin: "0",
                    backgroundColor: "#282828",
                    borderRadius: "50%",
                    border: "0.2px solid #c0c0c0",
                }} />}
                <p style={{fontSize: "15px"}}>{message}</p>
            </div>
        </div>
    )
}

export default function Chat() {

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if(input.length === 0) return
        setUserMessages([...userMessages, input])

        const prompt = e.currentTarget.querySelector('input')?.value
        setInput("")
        let response = await generateResponse(prompt)

        //only allow the response to be after thge </think> tag
        const startIndex = response.indexOf("</think>")
        if(startIndex !== -1) {
            response = response.substring(startIndex + 8)
        }
            
        setAiMessages([...aiMessages, response])
    }

    const [userMessages, setUserMessages] = useState<string[]>([])
    const [aiMessages, setAiMessages] = useState<string[]>([])

    const [input, setInput] = useState<string>("")

    return (
    <div>
        <div id="chat" style={{
            width: "60%",
            height: "100%", 
            backgroundColor: "black",
            color: "white",
            top: "0",
            overflowY: "auto",
            margin: "0 auto",
            padding: "0",

        }}>
            {
                aiMessages.map((message, index) => (
                    <div key={index}>
                        <Message user="User" message={userMessages[index]} />
                        <Message user="Seelie" message={message} />
                    </div>
                ))
            }
        </div>

        <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
            <input 
                type="text" 
                placeholder="Ask Seelie" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                style={{
                    width: "35%",
                    padding: "20px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    outline: "none",
                    color: "white",
                    backgroundColor: "black",
                    position: "fixed",
                    bottom: "0",
                    left: "50%",
                    transform: "translateX(-50%)",

                }}    
            />
        </form>
    </div>
    )
}
