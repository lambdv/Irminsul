"use client"
import React from 'react'
import { useChat } from 'ai/react'
import Image from 'next/image'
import styles from './seelie.module.css'
import SeelieIcon from '@public/imgs/icons/seelie.png'

export default function Chat(props: {
    user: any
}) {
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: '/api/chat',
        initialMessages: [],
        streamProtocol: 'text'
    })

    return (
        <div id="chat">
            <div className={styles.chatHistory}>
                <Message 
                    messageUser="Seelie" 
                    message="Ad astra abyssosque traveler! I'm seelie, your ai guide for genshin impact helping you with your journey. How can I assist you today?"
                    userImage={props.user?.image} 
                />
                {messages.map((message, index) => (
                    <div key={index}>
                        <Message 
                            messageUser={message.role === 'user' ? 'User' : 'Seelie'} 
                            message={message.content}
                            userImage={props.user?.image} 
                        />
                    </div>
                ))}
                <br />
            </div>
            <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
                <textarea 
                    placeholder="Ask Seelie" 
                    value={input} 
                    onChange={handleInputChange} 
                    className={styles.chatTextField}
                    autoFocus={true}
                    //when user presses enter, submit the form
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    rows={2}
                />
            </form>
        </div>
    )
}

function Message({messageUser, message, userImage}: {messageUser: string, message: string, userImage?: string}) {
    const isUser = messageUser === "User"
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
                backgroundColor:  "#1d1d1d",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
                border: "1px solid #303030",
            }}>
                {messageUser === "Seelie" ? (
                    <Image src={SeelieIcon} alt="Seelie" width={40} height={40} className="rounded-full"/>
                ) : (
                    <Image src={userImage || SeelieIcon} alt="User" width={40} height={40} className="rounded-full"/>
                )}
            </div>
            <div style={{
                backgroundColor: isUser ? "#4d4d4d" : "#303030",
                padding: "10px",
                borderRadius: "10px",
                maxWidth: "80%",
                whiteSpace: "pre-wrap",
            }}>
                {message}
            </div>
        </div>
    )
}