"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import Image from 'next/image'
import styles from './seelie.module.css'
import { getCDNURL } from '@/utils/getAssetURL'

import { getAiTokensLeft } from './numAiTokensLeft'
import Overlay from '@/components/ui/Overlay'
import Link from 'next/link'
import RoundBtn from '@/components/ui/RoundBtn'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, ChevronRight, Brain } from 'lucide-react';
import LaserFlow from '@/components/ui/LaserFlow';

import { availableModels } from './models'
import ShinyText from '@/components/cn/ShinyText'

const slogans = [
    "Navigate the Truth of Teyvat.",
    "Your guide through Teyvat.",
    "Ask me anything about Genshin.",
    "Paimon's smarter cousin.",
    "Ad astra abyssosque!",
]

const SEELIE_ICON = getCDNURL("imgs/icons/seelie.png")

/**
 * Chat Client component for AI chatbot page.
 * @param props - The component props
 * @returns The Chat component
 */
export default function Chat(props: {user: any}) {
    //AISDK useChat hook
    const [selectedModel, setSelectedModel] = useState<string>('auto')
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [input, setInput] = useState<string>('')

    const { messages, sendMessage, setMessages, status } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/ai',
            prepareSendMessagesRequest: ({ messages }) => ({
                body: { messages },
            }),
        }),
        ///initialMessages: [{id: "1", role: 'assistant', content: 'Ad astra abyssosque traveler! \nIm Seelie, your AI assistant for Genshin Impact. \nHow can I assist you today?'}],
        onError: (e) => {
            setDisabledChat(true)
            setMessages((prev) => [...prev, {id: "2", role: 'assistant', content: 'An error occurred. Please try again later.'}] as any)
        }
    })

    //state for chatbot UI
    const [tokensLeft, setTokensLeft] = useState(null)
    const [showTokenModal, setShowTokenModal] = useState(false)
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [disabledChat, setDisabledChat] = useState(true)

    // fetch tokens when logged in and on non-auto models; otherwise enable chat without token fetch
    useEffect(() => {
        const load = async () => {
            if(props.user?.id && selectedModel !== 'auto'){
                const tokens = await getAiTokensLeft(props.user.id)
                setTokensLeft(tokens)
                setDisabledChat(false)
            } else {
                setTokensLeft(null)
                setDisabledChat(false)
            }
        }
        load()
    }, [props.user?.id, selectedModel])

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
     * @param e - The event object
     * @returns void
     */
    const handleFormSubmit = (e) => {
        e.preventDefault()
        setDisabledChat(true) //disable chat while processing
        // if using paid models and user has no tokens left, show pop up
        if(selectedModel !== 'auto' && tokensLeft !== null && tokensLeft <= 0){
            setShowTokenModal(true)
            setInput("")
            return
        }
        //if input is empty, return and dno nothing
        if(input.trim().length <= 0){
            return
        }
        //setTokensLeft(tokensLeft - 1) //optimistically decrement tokens left
        sendMessage({ text: input })
        setInput("")
    }


    const suggestedQuestions = [
        "What are Mavuika's best teams?",
        "How do I build Neuvillette?",
        "Who is the strongest DPS?",
        "What's the best artifact set for Raiden?",
        "How do I optimize my spiral abyss teams?"
    ]

    const [slogan, setSlogan] = useState(slogans[Math.floor(Math.random() * slogans.length)])

    const SuggestedQuestions = React.memo(() => {
        return (
            <div className={styles.suggestedQuestionsContainer}>
                {suggestedQuestions.map((question, i) => (
                    <button
                        key={i}
                        className={styles.suggestedQuestionBtn}
                        onClick={() => {
                            setInput(question);
                            setTimeout(() => textareaRef.current?.focus(), 0);
                        }}
                        disabled={disabledChat}
                    >
                        {question}
                    </button>
                ))}
            </div>
        )
    })

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



    /** Extract text content from message parts */
    const getMessageText = (message: any): string => {
        if (typeof message?.content === 'string') return message.content
        const parts = message?.parts
        if (Array.isArray(parts)) {
            return parts
                .filter((p: any) => p?.type === 'text' && typeof p?.text === 'string')
                .map((p: any) => p.text)
                .join('')
        }
        return ''
    }

    /** Parse message to extract thinking blocks - handles multiple formats */
    const parseThinkingBlocks = (text: string): { thinking: string | null, response: string } => {
        let thinking: string | null = null;
        let response = text;
        
        // Patterns to match (in order of priority):
        // 1. :::thinking ... ::: (our custom format)
        // 2. ```thinking ... ```
        // 3. [THINKING]...[/THINKING]
        
        const patterns = [
            { regex: /:::thinking\n?([\s\S]*?):::/gi, extractor: (m: string) => m.replace(/:::thinking\n?/gi, '').replace(/:::$/g, '') },
            { regex: /```thinking\n?([\s\S]*?)```/gi, extractor: (m: string) => m.replace(/```thinking\n?/gi, '').replace(/```$/g, '') },
            { regex: /\[THINKING\]\n?([\s\S]*?)\[\/THINKING\]/gi, extractor: (m: string) => m.replace(/\[THINKING\]\n?/gi, '').replace(/\[\/THINKING\]$/gi, '') },
        ];
        
        for (const { regex, extractor } of patterns) {
            const matches = text.match(regex);
            if (matches && matches.length > 0) {
                // Collect all thinking blocks
                const thinkingParts: string[] = [];
                for (const match of matches) {
                    const content = extractor(match).trim();
                    if (content) {
                        thinkingParts.push(content);
                    }
                }
                
                if (thinkingParts.length > 0) {
                    thinking = thinkingParts.join('\n\n---\n\n');
                    // Remove ALL thinking blocks from response
                    response = text.replace(regex, '').trim();
                    // Clean up extra newlines
                    response = response.replace(/\n{3,}/g, '\n\n');
                }
                break;
            }
        }
        
        // Also handle any stray <think> tags that might have slipped through
        // by escaping them so they don't render as HTML
        response = response
            .replace(/<think>/gi, '`<think>`')
            .replace(/<\/think>/gi, '`</think>`')
            .replace(/<thinking>/gi, '`<thinking>`')
            .replace(/<\/thinking>/gi, '`</thinking>`');
        
        return { thinking, response };
    }

    // Landing state - no messages yet
    if (messages.length === 0) {
        return (
            <div id="chat" className={styles.landingContainer}>
                {/* <LaserFlow
                    horizontalBeamOffset={0.2}
                    verticalBeamOffset={0.2}
                    verticalSizing={2.2}
                    horizontalSizing={2}
                    color="#0076a8"
                    fogIntensity={0.4}
                    wispIntensity={15.0}
                    flowSpeed={0.35}
                    wispSpeed={15.0}
                /> */}
                <div className={styles.landingContent}>
                    {/* Seelie Icon */}
                    <div className={styles.landingIcon}>
                        <Image 
                            src={SEELIE_ICON} 
                            alt="Seelie" 
                            width={80} 
                            height={80} 
                            className={styles.landingIconImage}
                        />
                    </div>
                    
                    {/* Slogan */}
                    <h1 className={styles.landingSloganText}>{slogan}</h1>
                    
                    {/* Text field with LaserFlow effect */}
                    <div className={styles.landingTextFieldWrapper}>
                        <div className={styles.laserFlowWrapper}>
                            
                        </div>
                        <div className={styles.textFieldOverlay}>
                            <ChatTextField />
                        </div>
                    </div>

                    {/* Suggested questions */}
                    <SuggestedQuestions />
                </div>
            </div>
        )
    }

    // Chat state - has messages
    return (
        <div id="chat">
            <div className={styles.chatHistory}>
                {messages.map((message, index) => {
                    const isLastAssistant = message.role === 'assistant' && index === messages.length - 1;
                    const isStreaming = status === 'streaming' && isLastAssistant;
                    return <Message 
                        key={index}
                        messageUser={message.role === 'user' ? 'User' : 'Seelie'} 
                        message={getMessageText(message)}
                        userImage={props.user?.image}
                        messageOBJ={message}
                        isStreaming={isStreaming}
                    />
                })}
                {(status === 'submitted') && (
                    <div className={styles.loadingMessage}>
                        <ShinyText
                            text="Thinking..."
                            disabled={false}
                            speed={3}
                        />
                    </div>
                )}
            </div>
            <div className={styles.chatTextFieldContainer + " mt-2"}>
            <ChatTextField />
            </div>

            {/* Suggested questions */}
            <SuggestedQuestions />
        </div>
    )   

    

    function Message({messageUser, message, userImage, messageOBJ, isStreaming = false}: {
        messageUser: string, 
        message: string | JSX.Element, 
        userImage?: string, 
        messageOBJ: any,
        isStreaming?: boolean,
    }) {
        const isUser = messageUser === "User"
        const [showThinking, setShowThinking] = useState(false);
        
        // Parse thinking blocks for assistant messages
        const messageText = typeof message === 'string' ? message : '';
        let thinking: string | null = null;
        let response = messageText;
        
        if (!isUser && messageText) {
            const parsed = parseThinkingBlocks(messageText);
            thinking = parsed.thinking;
            response = parsed.response;
            
            // During streaming, check if we're still in a thinking block
            if (isStreaming && !thinking) {
                // Check if message starts with :::thinking but hasn't closed yet
                const unclosedThinking = messageText.match(/^:::thinking\n?([\s\S]*)$/i);
                if (unclosedThinking) {
                    thinking = unclosedThinking[1] || "Reasoning...";
                    response = ""; // Don't show anything in response yet
                }
            }
        }

        // Auto-expand thinking while streaming
        const shouldShowThinking = showThinking || (isStreaming && thinking && !response);
        
        return (
            <div className={`${styles.message} ${isUser ? styles.messageUser : styles.messageAssistant}`}>
                <div className={styles.messageAvatar}>
                    {messageUser === "Seelie" 
                        ? <Image src={SEELIE_ICON} alt="Seelie" width={40} height={40} className="rounded-full"/>
                        : <Image src={userImage || SEELIE_ICON} alt="User" width={40} height={40} className="rounded-full" unoptimized={true}/>
                    }
                </div>
                <div className={`${styles.messageContent} ${isUser ? styles.messageContentUser : styles.messageContentAssistant} ${isStreaming && !response ? styles.messageStreaming : ''}`}>
                    {/* Thinking section - collapsible */}
                    {thinking && (
                        <div className={styles.thinkingSection}>
                            <button 
                                className={styles.thinkingToggle}
                                onClick={() => setShowThinking(!showThinking)}
                            >
                                {shouldShowThinking ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                <Brain size={14} />
                                <span>{isStreaming && !response ? 'Reasoning...' : 'Chain of Thought'}</span>
                            </button>
                            {shouldShowThinking && (
                                <div className={`${styles.thinkingContent} ${isStreaming && !response ? styles.messageStreaming : ''}`}>
                                    <MarkdownRenderer>{thinking}</MarkdownRenderer>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Main response - only show if there's content */}
                    {response && (
                        <div className={isStreaming ? styles.messageStreaming : ''}>
                            <MarkdownRenderer>{response}</MarkdownRenderer>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}