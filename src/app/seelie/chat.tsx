"use client"
import React, { useEffect, useState } from 'react'
import { useChat } from 'ai/react'
import Image from 'next/image'
import styles from './seelie.module.css'
import SeelieIcon from '@public/imgs/icons/seelie.png'
import { getAiTokensLeft } from './ai'
import Overlay from '@/components/ui/Overlay'

export default function Chat(props: {
    user: any

}) {
    
    const { messages, input, handleInputChange, handleSubmit, setInput, isLoading } = useChat({
        body: {
            userId: props.user?.id
        },
        api: '/api/chat',
        initialMessages: [{id: "1", role: 'assistant', content: 'Ad astra abyssosque traveler! I\'m seelie, your ai guide for genshin impact helping you with your journey. How can I assist you today?'}],
        streamProtocol: 'text'
    })

    const [tokensLeft, setTokensLeft] = useState(-1)

    useEffect(() => {
        const getTokensLeft = async () => {
            const tokens = await getAiTokensLeft(props.user.id)
            setTokensLeft(tokens)
        }
        getTokensLeft()
    }, [props.user?.id])
    

    const handleFormSubmit = (e) => {
        e.preventDefault()
        if(tokensLeft <= 0){
            alert("You've run out of tokens. Please come back later!")
            setInput("")
            return
        }
        setTokensLeft(tokensLeft - 1)
        handleSubmit()
    }

    return (
        <div id="chat">
                <div className={styles.chatHistory} style={{marginBottom: "60px"}}>
                {messages.map((message, index) => (
                    <Message 
                        key={index}
                        messageUser={message.role === 'user' ? 'User' : 'Seelie'} 
                        message={message.content}
                        userImage={props.user?.image} 
                    />
                ))}
            </div>

            <div className={styles.chatTextFieldContainer}>
                <p className="text-sm text-gray-500">Tokens Left: {tokensLeft}</p>
                <form className="flex flex-col gap-2 w-full" onSubmit={handleFormSubmit}>
                    <textarea 
                        placeholder="Ask Seelie" 
                        value={input} 
                        onChange={handleInputChange} 
                        className={styles.chatTextField}
                        autoFocus={true}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey)
                                handleFormSubmit(e)
                        }}
                        rows={2}
                        required
                        autoComplete="off"
                        style={{resize: "none"}}
                    />
                </form>
            </div>
        </div>
    )
}

function Message({messageUser, message, userImage}: {messageUser: string, message: string, userImage?: string}) {
    const isUser = messageUser === "User"
    
    // Filter out content between <think> tags
    let displayMessage = message
    while (displayMessage.includes('<think>')) {
        const thinkStart = displayMessage.indexOf('<think>')
        const thinkEnd = displayMessage.indexOf('</think>')
        if (thinkEnd > thinkStart) {
            displayMessage = displayMessage.slice(0, thinkStart) + displayMessage.slice(thinkEnd + 8)
        } else {
            break // Prevent infinite loop if closing tag is missing
        }
    }

    //filder out text "[TOOL_REQUEST"
    displayMessage = displayMessage.replace(/\[TOOL_REQUEST/g, '')

    return (
        <div
            style={{
                display: "flex",
                flexDirection: isUser ? "row-reverse" : "row",
                gap: "10px",
                padding: "10px",
                alignItems: "flex-start",
            }}
        >
            <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor:  "#000000",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
            }}>
                {messageUser === "Seelie" ? (
                    <Image src={SeelieIcon} alt="Seelie" width={40} height={40} className="rounded-full"/>
                ) : (
                    <Image src={userImage || SeelieIcon} alt="User" width={40} height={40} className="rounded-full" unoptimized/>
                )}
            </div>
            <div style={{
                backgroundColor: isUser ? "#4d4d4d" : "#303030",
                padding: "7px 10px",
                borderRadius: "5px",
                maxWidth: "80%",
                whiteSpace: "pre-wrap",
                color: "#e7e7e7",
            }}>
                {displayMessage}
            </div>
        </div>
    )
}