"use client"
import React, { useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react';
import Image from 'next/image'
import styles from './seelie.module.css'
import SeelieIcon from '@public/imgs/icons/seelie.png'
import { getAiTokensLeft } from './numAiTokensLeft'
import Overlay from '@/components/ui/Overlay'
import Link from 'next/link'
import ResinIcon from '@public/imgs/icons/resinIcon.png'
import RoundBtn from '@/components/ui/RoundBtn'
import markdownToHTML from '@/utils/markdownToHTML';

export default function Chat(props: {
    user: any
}) {
    const { messages, input, handleInputChange, handleSubmit, setInput, isLoading, setMessages } = useChat({
        body: {
            userId: props.user?.id
        },
        api: '/api/chat',
        initialMessages: [{id: "1", role: 'assistant', content: 'Ad astra abyssosque traveler! \nIm Seelie, your AI assistant for Genshin Impact. \nHow can I assist you today?'}],
        streamProtocol: 'text',
        onError: (error: any) => {
            console.log(error)
            alert("An error occurred. Please try again later.")
        }
    })

    const [tokensLeft, setTokensLeft] = useState(-1)
    const [showTokenModal, setShowTokenModal] = useState(false)



    useEffect(() => {
        const getTokensLeft = async () => {
            const tokens = await getAiTokensLeft(props.user.id)
            setTokensLeft(tokens)
        }
        getTokensLeft()
    }, [props.user?.id])
    
    const handleFormSubmit = (e) => {
        e.preventDefault()
        //if user has no tokens left, show pop up
        if(tokensLeft <= 0){
            setShowTokenModal(true)
            setInput("")
            return
        }

        //if input is empty, return and dno nothing
        if(input.trim().length <= 0){
            return
        }

        setTokensLeft(tokensLeft - 1)

        //optimistically add a message from seelie to the messages array
        //setMessages([...messages, {id: "2", role: 'assistant', content: 'Thinking...'}] as any)

        handleSubmit(e)
    }

    return (
        <div id="chat">
            {showTokenModal && (
                <TokenModal user={props.user}/>
            )}
            
            <div className={styles.chatHistory}>
                {messages.map((message, index) => (
                    <Message 
                        key={index}
                        messageUser={message.role === 'user' ? 'User' : 'Seelie'} 
                        message={message.content}
                        userImage={props.user?.image} 
                    />
                ))}
                {isLoading && (
                    <div className={`${styles.message} ${styles.messageAssistant}`}>
                        <div className={styles.messageAvatar}>
                            <Image src={SeelieIcon} alt="Seelie" width={40} height={40} className="rounded-full"/>
                        </div>
                        <div className={`${styles.messageContent} ${styles.messageContentAssistant}`}>
                            <p>Thinking...</p>
                        </div>
                    </div>
                )}
            </div>



            <div className={styles.chatTextFieldContainer}>
                <p className={styles.tokenCount}>Tokens Left: {tokensLeft}</p>
                <form className={styles.chatForm} onSubmit={handleFormSubmit}>
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
                    />
                </form>
                <RoundBtn 
                    icon="send"
                    onClick={handleFormSubmit}
                    style={{
                        position: "absolute",
                        right: "10px",
                        bottom: "10px",
                    }}
                    disabled={input.trim().length <= 0}
                />
            </div>
        </div>
    )

    function TokenModal(props: {
        user: any
    }){
        return (
            <Overlay onClick={() => setShowTokenModal(false)} zIndex={100} style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <div className={styles.tokenModal}>
                    <div className={styles.modalHeader}>
                        <h1 className={styles.tokenModalHeader}>Out of Tokens</h1>
                        <RoundBtn 
                            icon="close"
                            onClick={() => {
                                setShowTokenModal(false)
                            }}
                            style={{top: "-5px"}}
                        />
                    </div>
                    <Image src={SeelieIcon} alt="Seelie" width={40} height={40} className="rounded-full"/>
                    <p className={styles.tokenModalText}>It seems you&apos;ve run out of tokens.</p>
                    <p className={styles.tokenModalText}>Unfortunately, Large language models cost quite a bit of money to run.</p>
                    <p className={styles.tokenModalText}>Wait until the next reset or consider supporting Irminsul for more tokens!</p>
                    <br />
                    <Link href={"https://buy.stripe.com/5kAaG57cIdzGgF2cMO?prefilled_email=" + props.user?.email} className={styles.tokenModalButton}>
                        <Image src={ResinIcon} alt="Seelie" width={20} height={20} className={`rounded-full ${styles.tokenModalButtonImage}`}/>
                        Replenish SeelieAI Tokens
                    </Link>
                </div>
            </Overlay>
        )
    }
    
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
        <div className={`${styles.message} ${isUser ? styles.messageUser : styles.messageAssistant}`}>
            <div className={styles.messageAvatar}>
                {messageUser === "Seelie" ? (
                    <Image src={SeelieIcon} alt="Seelie" width={40} height={40} className="rounded-full"/>
                ) : (
                    <Image src={userImage || SeelieIcon} alt="User" width={40} height={40} className="rounded-full" unoptimized/>
                )}
            </div>
            <div className={`${styles.messageContent} ${isUser ? styles.messageContentUser : styles.messageContentAssistant}`}>
                {markdownToHTML(displayMessage)}
            </div>
        </div>
    )
}

