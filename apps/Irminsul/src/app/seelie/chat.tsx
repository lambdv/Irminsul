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
import { useCompletion } from '@ai-sdk/react'

/**
 * Chat Client component for AI chatbot page.
 * @param props - The component props
 * @returns The Chat component
 */
export default function Chat(props: {user: any}) {
    //AISDK useChat hook
    const { messages, input, handleInputChange, handleSubmit, setInput, setMessages, status } = useChat({
        body: {
            userId: props.user?.id
        },
        api: '/api/chat',
        ///initialMessages: [{id: "1", role: 'assistant', content: 'Ad astra abyssosque traveler! \nIm Seelie, your AI assistant for Genshin Impact. \nHow can I assist you today?'}],
        streamProtocol: 'text',
        onError: (e) => {
            setDisabledChat(true)
            setMessages([...messages, {id: "2", role: 'assistant', content: 'An error occurred. Please try again later.'}] as any)
        }
    })

    //state for chatbot UI
    const [tokensLeft, setTokensLeft] = useState(null)
    const [showTokenModal, setShowTokenModal] = useState(false)
    const [disabledChat, setDisabledChat] = useState(true)

    const [query, setQuery] = useState("")

    //on mount functionality
    useEffect(() => {
        const getTokensLeft = async () => {
            const tokens = await getAiTokensLeft(props.user.id)
            setTokensLeft(tokens)
            setDisabledChat(false)
        }
        getTokensLeft()
    }, [props.user?.id])

    //enable chat after loading
    useEffect(() => {
        switch(status){
            case 'submitted':
                setDisabledChat(true)
                break
            case 'streaming':
                setDisabledChat(true)
                break
            case 'ready':
                setDisabledChat(false)
                break
            case 'error':
                setDisabledChat(true)
                break
        }
    }, [status])

    /**
     * Handler for chatbot query submission.
     * @param e - The event object
     * @returns void
     */
    const handleFormSubmit = (e) => {
        e.preventDefault()
        setDisabledChat(true) //disable chat while processing
        //if user has no tokens left, show pop up
        if(tokensLeft !== null && tokensLeft <= 0){
            setShowTokenModal(true)
            setInput("")
            return
        }
        //if input is empty, return and dno nothing
        if(input.trim().length <= 0){
            return
        }
        setTokensLeft(tokensLeft - 1) //optimistically decrement tokens left
        handleSubmit(e) //useChat hook handles the rest
    }


    if(messages.length === 0){
        return (
            <div className={styles.landingWrapper}>
                {showTokenModal && <TokenModal user={props.user} setShowTokenModal={setShowTokenModal}/>}
                <h1 className="text-2xl font-ingame text-center text-primary" style={{fontFamily: "ingame",color: "var(--primary-color)"}}>What can I help you with?</h1>
                <p className="text-center text-gray-text-color">your AI assistant for Genshin Impact.</p>

                <div className={styles.landingChatWrapper}>
                    <p className={styles.tokenCount}>Tokens Left: {tokensLeft === null ? "loading..." : tokensLeft}</p>
                    <form className={styles.chatForm} onSubmit={handleFormSubmit}>
                        <textarea 
                            placeholder="Ask Seelie" 
                            value={input} 
                            onChange={(e) => {
                                handleInputChange(e)
                                setQuery(e.target.value)
                            }} 
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
    }

    return (
        <div id="chat">
            {showTokenModal && <TokenModal user={props.user} setShowTokenModal={setShowTokenModal}/>}

            
            <div className={styles.chatHistory}>
                {messages.map((message, index) => {
                    return <Message 
                        key={index}
                        messageUser={message.role === 'user' ? 'User' : 'Seelie'} 
                        message={message.content}
                        userImage={props.user?.image}
                        messageOBJ={message}
                    />
                })}
                {(status === 'submitted') && <LoadingMessage />}
            </div>



            <div className={styles.chatTextFieldContainer}>
                <p className={styles.tokenCount}>Tokens Left: {tokensLeft === null ? "loading..." : tokensLeft}</p>
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
}


function Message({messageUser, message, userImage, messageOBJ}: {
    messageUser: string, 
    message: string | JSX.Element, 
    userImage?: string, 
    messageOBJ: any,
}) {
    const isUser = messageUser === "User"
    let displayMessage = message


    return (
        <div className={`${styles.message} ${isUser ? styles.messageUser : styles.messageAssistant}`}>
            <div className={styles.messageAvatar}>
                {messageUser === "Seelie" 
                    ? <Image src={SeelieIcon} alt="Seelie" width={40} height={40} className="rounded-full"/>
                    : <Image src={userImage || SeelieIcon} alt="User" width={40} height={40} className="rounded-full" unoptimized/>
                }
            </div>
            <div className={`${styles.messageContent} ${isUser ? styles.messageContentUser : styles.messageContentAssistant}`}>
                {typeof displayMessage === "string" ? markdownToHTML(displayMessage) : displayMessage}
            </div>
        </div>
    )
}

function LoadingMessage(){
    const messages = [
        "Parotting Zajef takes",
        "Yoinkcrafting kqm guides",
        "Pulling up zyox video",
    ]
    return (
        <Message messageUser="Seelie" message={
            <p className={`${styles.gradientText}`} style={{
                background: 'linear-gradient(90deg, #747474, #6e6e6e, #5b5b5b, #5c5c5c)',
                backgroundSize: '400% 400%',
                animation: 'gradientAnimation 4s linear infinite reverse',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                position: 'relative',
                fontSize: '0.8rem',

            }}>
                <style jsx>{`
                    @keyframes gradientAnimation {
                        0% { background-position: 0% 50% }
                        25% { background-position: 100% 50% }
                        50% { background-position: 200% 50% }
                        75% { background-position: 300% 50% }
                        100% { background-position: 400% 50% }
                    }
                `}</style>
                {messages[Math.floor(Math.random() * messages.length)]}
                ...
            </p>
        } messageOBJ={{}}/>
    )
}

function TokenModal(props: {
    user: any,
    setShowTokenModal: (show: boolean) => void
}){
    return (
        <Overlay onClick={() => props.setShowTokenModal(false)} zIndex={100} style={{
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
                            props.setShowTokenModal(false)
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