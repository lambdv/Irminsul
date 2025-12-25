"use client"
import React, { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import Image from "next/image"
import styles from "./seelie.module.css"
import { getCDNURL } from "@/utils/getAssetURL"

import { getAiTokensLeft } from "./numAiTokensLeft"
import Overlay from "@/components/ui/Overlay"
import Link from "next/link"
import RoundBtn from "@/components/ui/RoundBtn"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import { ChevronDown, ChevronRight, Brain, Menu, Zap, Circle, CircleDot, Cloud, Code, Laptop, History, Paperclip, Plus, Loader2, Bot, Send, User, Wand2, Globe, ArrowUp } from "lucide-react"
import LaserFlow from "@/components/ui/LaserFlow"

import { availableModels } from "./models"
import ShinyText from "@/components/cn/ShinyText"
import ConversationSidebar from "./ConversationSidebar"

import { Textarea } from "@/components/cn/textarea"
import { Button } from "@/components/cn/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/cn/dropdown-menu"
import { cn } from "@/lib/shadcn/utils"

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
export default function Chat(props: { user: any }) {
  //AISDK useChat hook
  const [selectedModel, setSelectedModel] = useState<string>("auto")
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [input, setInput] = useState<string>("")

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages, agentType: "agentic" },
      }),
    }),
    onError: (e) => {
      setDisabledChat(true)
      setMessages(
        (prev) =>
          [
            ...prev,
            {
              id: "2",
              role: "assistant",
              content: "An error occurred. Please try again later.",
            },
          ] as any
      )
    },
  })

  const [showTokenModal, setShowTokenModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [disabledChat, setDisabledChat] = useState(true)

  // fetch tokens when logged in and on non-auto models; otherwise enable chat without token fetch
  useEffect(() => {
    const load = async () => {
      // if (props.user?.id && selectedModel !== "auto") {
      //   const tokens = await getAiTokensLeft(props.user.id)
      //   setTokensLeft(tokens)
      //   setDisabledChat(false)
      // } else {
      //   setTokensLeft(null)
      //   setDisabledChat(false)
      // }
    }
    load()
  }, [props.user?.id, selectedModel])

  //enable chat after loading
  useEffect(() => {
    switch (status) {
      case "submitted":
        setDisabledChat(true)
        break
      case "streaming":
        setDisabledChat(true)
        break
      case "ready":
        setDisabledChat(false)
        break
      case "error":
        setDisabledChat(true)
        break
    }
  }, [status])

  // // Hide the decorative background when chat has messages
  // useEffect(() => {
  //   if (typeof document === "undefined") return
  //   const container = document.querySelector(`.${styles.seelieBackground}`)
  //   if (!container) return
  //   if (messages.length > 0) {
  //     container.classList.add(styles.hideSeelieBackground)
  //   } else {
  //     container.classList.remove(styles.hideSeelieBackground)
  //   }
  //   return () => {
  //     container.classList.remove(styles.hideSeelieBackground)
  //   }
  // }, [messages.length])

  /**
   * Handler for chatbot query submission.
   * @param e - The event object
   * @returns void
   */
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setDisabledChat(true) //disable chat while processing
    // if using paid models and user has no tokens left, show pop up
    // if (selectedModel !== "auto" && tokensLeft !== null && tokensLeft <= 0) {
    //   setShowTokenModal(true)
    //   setInput("")
    //   return
    // }
    //if input is empty, return and dno nothing
    if (input.trim().length <= 0) {
      return
    }

    // Note: conversationId should already be set by createNewConversation or loadConversation

    //setTokensLeft(tokensLeft - 1) //optimistically decrement tokens left
    sendMessage({ text: input })
    setInput("")
  }

  const suggestedQuestions = [
    "What are Mavuika's best teams?",
    "How do I build Neuvillette?",
    "Who is the strongest DPS?",
    "What's the best artifact set for Raiden?",
    "How do I optimize my spiral abyss teams?",
  ]

  const [slogan, setSlogan] = useState(
    slogans[Math.floor(Math.random() * slogans.length)]
  )

  const SuggestedQuestions = React.memo(() => {
    return (
      <div className={styles.suggestedQuestionsContainer}>
        {suggestedQuestions.map((question, i) => (
          <button
            key={i}
            className={styles.suggestedQuestionBtn}
            onClick={() => {
              setInput(question)
              setTimeout(() => textareaRef.current?.focus(), 0)
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

  const [selectedAgent, setSelectedAgent] = useState("Agent")
  const [selectedPerformance, setSelectedPerformance] = useState("High")
  const [autoMode, setAutoMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const textFieldMessage = "Ask anything"

  const ChatTextField = React.memo(() => {
    return (
      <div className="w-full">
        <div className="bg-background border border-border rounded-2xl overflow-hidden">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => {}}
          />

          <div className="px-3 pt-3 pb-2 grow">
            <form onSubmit={handleFormSubmit}>
              <Textarea
                ref={textareaRef}
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
                placeholder={textFieldMessage}
                className="w-full bg-transparent p-2 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder-muted-foreground resize-none border-none outline-none text-sm min-h-10 max-h-[25vh]"
                rows={1}
                autoFocus={true}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) handleFormSubmit(e)
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "auto"
                  target.style.height = target.scrollHeight + "px"
                }}
                disabled={disabledChat}
                style={{
                  opacity: disabledChat ? 0.5 : 1,
                  transition: "opacity 0.3s ease-in-out",
                }}
                required
                autoComplete="off"
              />
            </form>
          </div>

          <div className="mb-2 px-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full border border-border hover:bg-accent"
                    disabled={disabledChat}
                  >
                    <Plus className="size-3" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="max-w-xs rounded-2xl p-1.5"
                >
                  <DropdownMenuGroup className="space-y-1">
                    <DropdownMenuItem
                      className="rounded-[calc(1rem-6px)] text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip size={16} className="opacity-60" />
                      Attach Files
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-[calc(1rem-6px)] text-xs"
                      onClick={() => {}}
                    >
                      <Code size={16} className="opacity-60" />
                      Code Interpreter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-[calc(1rem-6px)] text-xs"
                      onClick={() => {}}
                    >
                      <Globe size={16} className="opacity-60" />
                      Web Search
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-[calc(1rem-6px)] text-xs"
                      onClick={() => {}}
                    >
                      <History size={16} className="opacity-60" />
                      Chat History
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoMode(!autoMode)}
                className={cn(
                  "h-7 px-2 rounded-full border border-border hover:bg-accent",
                  {
                    "bg-primary/10 text-primary border-primary/30": autoMode,
                    "text-muted-foreground": !autoMode,
                  }
                )}
                disabled={disabledChat}
              >
                <Wand2 className="size-3" />
                <span className="text-xs">Auto</span>
              </Button>
            </div>

            <div>
              <Button
                type="submit"
                disabled={!input.trim() || disabledChat}
                className="size-7 p-0 rounded-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleFormSubmit}
              >
                <ArrowUp className="size-3 text-background" />
                {/* <i className="material-symbols-outlined " style={{ color: "var(--background-color)" }} >arrow_upward</i> */}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0 pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 rounded-full border border-transparent hover:bg-accent text-muted-foreground text-xs"
                disabled={disabledChat}
              >
                <Laptop className="size-3" />
                <span>{selectedModel}</span>
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-w-xs rounded-2xl p-1.5 bg-popover border-border"
            >
              <DropdownMenuGroup className="space-y-1">
                {availableModels.map((m) => (
                  <DropdownMenuItem
                    key={m}
                    className="rounded-[calc(1rem-6px)] text-xs"
                    onClick={() => {
                      if (m !== "auto" && !props.user) {
                        setShowLoginModal(true)
                        return
                      }
                      setSelectedModel(m)
                    }}
                  >
                    {m === "auto" ? (
                      <Laptop size={16} className="opacity-60" />
                    ) : (
                      <Cloud size={16} className="opacity-60" />
                    )}
                    {m}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 rounded-full border border-transparent hover:bg-accent text-muted-foreground text-xs"
                disabled={disabledChat}
              >
                <User className="size-3" />
                <span>{selectedAgent}</span>
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-w-xs rounded-2xl p-1.5 bg-popover border-border"
            >
              <DropdownMenuGroup className="space-y-1">
                <DropdownMenuItem
                  className="rounded-[calc(1rem-6px)] text-xs"
                  onClick={() => setSelectedAgent("Agent")}
                >
                  <User size={16} className="opacity-60" />
                  Agent
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-[calc(1rem-6px)] text-xs"
                  onClick={() => setSelectedAgent("Assistant")}
                >
                  <Bot size={16} className="opacity-60" />
                  Assistant
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex-1" />
        </div>
      </div>
    )
  })

  /** Extract text content from message parts */
  const getMessageText = (message: any): string => {
    if (typeof message?.content === "string") return message.content
    const parts = message?.parts
    if (Array.isArray(parts)) {
      return parts
        .filter((p: any) => p?.type === "text" && typeof p?.text === "string")
        .map((p: any) => p.text)
        .join("")
    }
    return ""
  }

  /** Parse message to extract thinking blocks - handles multiple formats */
  const parseThinkingBlocks = (
    text: string
  ): { thinking: string | null; response: string } => {
    let thinking: string | null = null
    let response = text

    // Patterns to match (in order of priority):
    // 1. :::thinking ... ::: (our custom format)
    // 2. ```thinking ... ```
    // 3. [THINKING]...[/THINKING]

    const patterns = [
      {
        regex: /:::thinking\n?([\s\S]*?):::/gi,
        extractor: (m: string) =>
          m.replace(/:::thinking\n?/gi, "").replace(/:::$/g, ""),
      },
      {
        regex: /```thinking\n?([\s\S]*?)```/gi,
        extractor: (m: string) =>
          m.replace(/```thinking\n?/gi, "").replace(/```$/g, ""),
      },
      {
        regex: /\[THINKING\]\n?([\s\S]*?)\[\/THINKING\]/gi,
        extractor: (m: string) =>
          m.replace(/\[THINKING\]\n?/gi, "").replace(/\[\/THINKING\]$/gi, ""),
      },
    ]

    for (const { regex, extractor } of patterns) {
      const matches = text.match(regex)
      if (matches && matches.length > 0) {
        // Collect all thinking blocks
        const thinkingParts: string[] = []
        for (const match of matches) {
          const content = extractor(match).trim()
          if (content) {
            thinkingParts.push(content)
          }
        }

        if (thinkingParts.length > 0) {
          thinking = thinkingParts.join("\n\n---\n\n")
          // Remove ALL thinking blocks from response
          response = text.replace(regex, "").trim()
          // Clean up extra newlines
          response = response.replace(/\n{3,}/g, "\n\n")
        }
        break
      }
    }

    // Also handle any stray <think> tags that might have slipped through
    // by escaping them so they don't render as HTML
    response = response
      .replace(/<think>/gi, "`<think>`")
      .replace(/<\/think>/gi, "`</think>`")
      .replace(/<thinking>/gi, "`<thinking>`")
      .replace(/<\/thinking>/gi, "`</thinking>`")

    return { thinking, response }
  }

  function Message({
    messageUser,
    message,
    userImage,
    messageOBJ,
    isStreaming = false,
  }: {
    messageUser: string
    message: string | JSX.Element
    userImage?: string
    messageOBJ: any
    isStreaming?: boolean
  }) {
    const isUser = messageUser === "User"
    const [showThinking, setShowThinking] = useState(false)

    // Parse thinking blocks for assistant messages
    const messageText = typeof message === "string" ? message : ""
    let thinking: string | null = null
    let response = messageText

    if (!isUser && messageText) {
      const parsed = parseThinkingBlocks(messageText)
      thinking = parsed.thinking
      response = parsed.response

      // During streaming, check if we're still in a thinking block
      if (isStreaming && !thinking) {
        // Check if message starts with :::thinking but hasn't closed yet
        const unclosedThinking = messageText.match(/^:::thinking\n?([\s\S]*)$/i)
        if (unclosedThinking) {
          thinking = unclosedThinking[1] || "Reasoning..."
          response = "" // Don't show anything in response yet
        }
      }
    }

    // Auto-expand thinking while streaming
    const shouldShowThinking =
      showThinking || (isStreaming && thinking && !response)

    return (
      <div
        className={`${styles.message} ${isUser ? styles.messageUser : styles.messageAssistant}`}
      >
        <div className={styles.messageAvatar}>
          {messageUser === "Seelie" ? (
            <Image
              src={SEELIE_ICON}
              alt="Seelie"
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <Image
              src={userImage || SEELIE_ICON}
              alt="User"
              width={40}
              height={40}
              className="rounded-full"
              unoptimized={true}
            />
          )}
        </div>
        <div
          className={`${styles.messageContent} ${isUser ? styles.messageContentUser : styles.messageContentAssistant} ${isStreaming && !response ? styles.messageStreaming : ""}`}
        >
          {/* Thinking section - collapsible */}
          {thinking && (
            <div className={styles.thinkingSection}>
              <button
                className={styles.thinkingToggle}
                onClick={() => setShowThinking(!showThinking)}
              >
                {shouldShowThinking ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
                <Brain size={14} />
                <span>
                  {isStreaming && !response
                    ? "Reasoning..."
                    : "Chain of Thought"}
                </span>
              </button>
              {shouldShowThinking && (
                <div
                  className={`${styles.thinkingContent} ${isStreaming && !response ? styles.messageStreaming : ""}`}
                >
                  <MarkdownRenderer>{thinking}</MarkdownRenderer>
                </div>
              )}
            </div>
          )}

          {/* Main response - only show if there's content */}
          {response && (
            <div className={isStreaming ? styles.messageStreaming : ""}>
              <MarkdownRenderer>{response}</MarkdownRenderer>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.chatLayout}>
      <div className={styles.chatHistory}>
        {messages.map((message, index) => {
          const isLastAssistant =
            message.role === "assistant" && index === messages.length - 1
          const isStreaming = status === "streaming" && isLastAssistant
          return (
            <Message
              key={index}
              messageUser={message.role === "user" ? "User" : "Seelie"}
              message={getMessageText(message)}
              userImage={props.user?.image}
              messageOBJ={message}
              isStreaming={isStreaming}
            />
          )
        })}
        {status === "submitted" && (
          <div className={styles.loadingMessage}>
            <ShinyText text="Thinking..." disabled={false} speed={3} />
          </div>
        )}
      </div>
      <div className={styles.chatTextFieldContainer}>
        <ChatTextField />
      </div>
    </div>
  )
}
