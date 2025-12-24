"use client"
import React, { useEffect, useRef, useState, useMemo, memo } from 'react'
import Image from 'next/image'
import styles from './seelie.module.css'
import { getCDNURL } from '@/utils/getAssetURL'

import { getAiTokensLeft } from './numAiTokensLeft'
import RoundBtn from '@/components/ui/RoundBtn'
import markdownToHTML from '@/utils/markdownToHTML';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { availableModels } from './ai'

const slogans = [
    "Navigate the Truth of Teyvat.",
]

const SEELIE_ICON = getCDNURL("imgs/icons/seelie.png")

// Memoized Message component
const MessageComponent = memo(function MessageComponent({
    messageUser, 
    message, 
    userImage,
    isStreaming = false
}: {
    messageUser: string, 
    message: string, 
    userImage?: string,
    isStreaming?: boolean
}) {
    const isUser = messageUser === "User"
    
    // Memoize markdown conversion to prevent re-computation
    const renderedMessage = useMemo(() => markdownToHTML(message), [message])

    return (
        <div className={`${styles.message} ${isUser ? styles.messageUser : styles.messageAssistant}`}>
            <div className={styles.messageAvatar}>
                {messageUser === "Seelie" 
                    ? <Image src={SEELIE_ICON} alt="Seelie" width={40} height={40} className="rounded-full"/>
                    : <Image src={userImage || SEELIE_ICON} alt="User" width={40} height={40} className="rounded-full" unoptimized={true}/>
                }
            </div>
            <div className={`${styles.messageContent} ${isUser ? styles.messageContentUser : styles.messageContentAssistant}`}>
                {renderedMessage}
                {isStreaming && <span className={styles.streamingCursor}>▊</span>}
            </div>
        </div>
    )
})

/**
 * Helper to extract text from UIMessage parts
 */
function getMessageText(message: { parts?: Array<{ type: string; text?: string }>, content?: string }): string {
    if (message.parts) {
        return message.parts
            .filter(part => part.type === 'text')
            .map(part => part.text || '')
            .join('')
    }
    return message.content || ''
}

/**
 * Chat Client component for AI chatbot page.
 * @param props - The component props
 * @returns The Chat component
 */
export default function Chat(props: {user: any}) {
    const [selectedModel, setSelectedModel] = useState<string>('auto')
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [input, setInput] = useState<string>('')

    // Use AI SDK's useChat hook for message management and streaming
    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/ai',
            body: {
                model: selectedModel,
            },
        }),
    })

    //state for chatbot UI
    const [tokensLeft, setTokensLeft] = useState<number | null>(null)
    const [showTokenModal, setShowTokenModal] = useState(false)
    const [showLoginModal, setShowLoginModal] = useState(false)

    // Derive disabled state from chat status
    const disabledChat = status === 'submitted' || status === 'streaming'

    // fetch tokens when logged in and on non-auto models
    useEffect(() => {
        const load = async () => {
            if(props.user?.id && selectedModel !== 'auto'){
                const tokens = await getAiTokensLeft(props.user.id)
                setTokensLeft(tokens)
            } else {
                setTokensLeft(null)
            }
        }
        load()
    }, [props.user?.id, selectedModel])

    // Hide the decorative background when chat has messages
    useEffect(() => {
        if (typeof document === 'undefined') return
        const container = document.querySelector(`.${styles.seelieBackground}`)
        if (!container) return
        if (messages.length > 0) {
            container.classList.add(styles.hideSeelieBackground)
        } else {
            container.classList.remove(styles.hideSeelieBackground)
        }
        return () => {
            container.classList.remove(styles.hideSeelieBackground)
        }
    }, [messages.length])

    /**
     * Handler for chatbot query submission.
     */
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // if using paid models and user has no tokens left, show pop up
        if(selectedModel !== 'auto' && tokensLeft !== null && tokensLeft <= 0){
            setShowTokenModal(true)
            setInput("")
            return
        }
        // if input is empty, do nothing
        if(input.trim().length <= 0){
            return
        }
        // Send message using AI SDK's useChat
        sendMessage({ text: input })
        setInput("")
    }


    const suggestedQuestions = [
        "Who is the highest dps character?",
        "How do I build Skirk?",
        ""
    ]

    const [slogan, setSlogan] = useState(slogans[Math.floor(Math.random() * slogans.length)])

    useEffect(() => {
        setSlogan(slogans[Math.floor(Math.random() * slogans.length)])
    }, [])

    const textFieldMessage = "Any Genshin Questions?"

    const ChatTextField = React.memo(() => {
        return (
            <div style={{ position: 'relative' }}>
                {/* <p className={styles.tokenCount}>Tokens Left: {tokensLeft === null ? "loading..." : tokensLeft}</p> */}
                <form className={styles.chatForm} onSubmit={handleFormSubmit}>
                    <div>
                        {
                            (selectedModel !== 'free' && selectedModel !== 'auto') && (
                                <p className={styles.tokenCount}>Premium Responses Left: {tokensLeft === null ? "loading..." : tokensLeft}</p>
                            )
                        }
                    </div>
                    <textarea 
                        ref={textareaRef}
                        placeholder={textFieldMessage}
                        value={input} 
                        onChange={(e) => {
                            const current = e.currentTarget
                            const caretPos = current.selectionStart || 0
                            setInput(current.value)
                            requestAnimationFrame(() => {
                                const el = textareaRef.current
                                if (!el) return
                                try {
                                    el.setSelectionRange(caretPos, caretPos)
                                } catch {}
                            })
                        }} 
                        className={styles.chatTextField}
                        autoFocus={true}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey)
                                handleFormSubmit(e)
                        }}
                        style={{
                            opacity: disabledChat ? 0.5 : 1,
                            transition: "opacity 0.3s ease-in-out",
                            paddingBottom: "35px",
                        }}
                        rows={2}
                        required
                        autoComplete="off"
                        disabled={disabledChat}
                    />
                </form>
                <div
                    style={{
                        position: "absolute",
                        left: "10px",
                        bottom: "15px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                    }}
                >
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button
                                className={styles.modelMenuTrigger}
                                style={{ zIndex: 2, color: "#6b7280" }}
                                disabled={disabledChat}
                            >
                                <span className={styles.modelMenuLabel}>{selectedModel}</span>
                                <ChevronDown size={14} />
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content className={styles.modelMenuContent} sideOffset={6} align="start" style={{ zIndex: 1000 }}>
                                {availableModels.map((m) => (
                                    <DropdownMenu.Item
                                        key={m}
                                        className={styles.modelMenuItem}
                                        onSelect={(e) => { 
                                            e.preventDefault(); 
                                            if(m !== 'auto' && !props.user){
                                                setShowLoginModal(true)
                                                return
                                            }
                                            setSelectedModel(m); 
                                        }}
                                    >
                                        <span>{m}</span>
                                        {selectedModel === m && <span className={styles.modelMenuCheck}>✓</span>}
                                    </DropdownMenu.Item>
                                ))}
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
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
        )
    })



    return (
        <div id="chat">
            <div className={styles.chatHistory}>
                {messages.map((message, index) => (
                    <MessageComponent 
                        key={message.id}
                        messageUser={message.role === 'user' ? 'User' : 'Seelie'} 
                        message={getMessageText(message)}
                        userImage={props.user?.image}
                        isStreaming={status === 'streaming' && message.role === 'assistant' && index === messages.length - 1}
                    />
                ))}
                {status === 'submitted' && <p>Analyzing...</p>}
                {error && <p className="text-red-500">Error: {error.message}</p>}
            </div>
            <div className={styles.chatTextFieldContainer + " mt-2"}>
            <ChatTextField />
            </div>
        </div>
    )
}