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
    const { messages, input, handleInputChange, handleSubmit, setInput, isLoading, setMessages, status } = useChat({
        body: {
            userId: props.user?.id
        },
        api: '/api/chat',
        ///initialMessages: [{id: "1", role: 'assistant', content: 'Ad astra abyssosque traveler! \nIm Seelie, your AI assistant for Genshin Impact. \nHow can I assist you today?'}],
        streamProtocol: 'text',
        onError: (error: any) => {
            // console.log(error)
            setDisabledChat(true)
            // seelie sends an error message
            setMessages([...messages, {id: "2", role: 'assistant', content: 'An error occurred. Please try again later.'}] as any)
        }
    })

    const [tokensLeft, setTokensLeft] = useState(null)
    const [showTokenModal, setShowTokenModal] = useState(false)
    const [disabledChat, setDisabledChat] = useState(true)

    useEffect(() => {
        const getTokensLeft = async () => {
            const tokens = await getAiTokensLeft(props.user.id)
            setTokensLeft(tokens)
            setDisabledChat(false)
        }
        getTokensLeft()
    }, [props.user?.id])
    
    const handleFormSubmit = (e) => {
        e.preventDefault()
        setDisabledChat(true)
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

    useEffect(() => {
        if (!isLoading) {
            setDisabledChat(false)
        }
    }, [isLoading])

    if(messages.length === 0){
        return (
            <div className={styles.landingWrapper}>
                {showTokenModal && (
                    <TokenModal user={props.user}/>
                )}
                <h1 style={{
                    fontSize: "1.5rem",
                    fontFamily: "ingame",
                    textAlign: "center",
                    color: "var(--primary-color)",
                }}>
                    What can I help you with?
                </h1>

                <p style={{
                    fontSize: "1rem",
                    textAlign: "center",
                    color: "var(--gray-text-color)",
                }}>
                    your AI assistant for Genshin Impact.
                </p>

                <div className={styles.landingChatWrapper}>
                <p className={styles.tokenCount}>Tokens Left: {
                    tokensLeft === null ? "loading..." : tokensLeft
                }</p>
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
                        style={{
                            opacity: disabledChat ? 0.5 : 1,
                            transition: "opacity 0.3s ease-in-out"
                        }}
                        rows={2}
                        required
                        autoComplete="off"
                        disabled={disabledChat}
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
                    disabled={disabledChat || input.trim().length <= 0}
                />                </div>
            </div>
        )
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
                            <LoadingMessage />
                        </div>
                    </div>
                )}
            </div>



            <div className={styles.chatTextFieldContainer}>
                <p className={styles.tokenCount}>Tokens Left: {
                    tokensLeft === null ? "loading..." : tokensLeft
                }</p>
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
                        style={{
                            opacity: disabledChat ? 0.5 : 1,
                            transition: "opacity 0.3s ease-in-out"
                        }}
                        rows={2}
                        required
                        autoComplete="off"
                        disabled={disabledChat}
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
                    disabled={disabledChat || input.trim().length <= 0}
                />           
            </div>
        </div>
    )

    function LoadingMessage(){
        return (
            <div className={styles.loadingMessage}>
                <p>Thinking...</p>
            </div>
        )
    }



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

