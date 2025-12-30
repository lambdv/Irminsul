"use client"
import React, { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import Image from "next/image"
import styles from "./seelie.module.css"
import { getCDNURL } from "@/utils/getAssetURL"

import { getAiTokensLeft } from "../utils/numAiTokensLeft"
import Overlay from "@/components/ui/Overlay"
import Link from "next/link"
import RoundBtn from "@/components/ui/RoundBtn"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import {
  ChevronDown,
  ChevronRight,
  Brain,
  Menu,
  Zap,
  Circle,
  CircleDot,
  Cloud,
  Code,
  Laptop,
  History,
  Paperclip,
  Plus,
  Loader2,
  Bot,
  Send,
  User,
  Wand2,
  Globe,
  ArrowUp,
  StopCircle,
  X,
} from "lucide-react"
import LaserFlow from "@/components/ui/LaserFlow"

import { availableModels } from "../utils/models"
import ShinyText from "@/components/cn/ShinyText"

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
import { AIAgent } from "@/feature/ai/domain/AIAgentFactory"

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

  const { messages, sendMessage, setMessages, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages, agentType: selectedAgent },
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
  });

  return (
      <div className="w-full">
        <div className="bg-background border border-border rounded-2xl overflow-hidden">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              setAttachedFiles((prev) => [...prev, ...files])
              // Clear the input
              e.target.value = ""
            }}
          />

          <div className="px-3 pt-3 pb-2 grow">
            {attachedFiles.length > 0 && (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex-shrink-0 relative group">
                    <div className="bg-muted rounded-lg p-2 min-w-24 max-w-32 flex flex-col items-center">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-16 h-16 object-cover rounded mb-1"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-primary/10 rounded flex items-center justify-center mb-1">
                          <Paperclip className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <span
                        className="text-xs text-center truncate w-full"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {file.type || "Unknown"}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setAttachedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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

                <div className="flex items-center gap-0">
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
                        {availableAgents.map((agent) => (
                          <DropdownMenuItem
                            key={agent}
                            className="rounded-[calc(1rem-6px)] text-xs"
                            onClick={() => setSelectedAgent(agent as AIAgent)}
                          >
                            {agent}
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
                  <div className="flex-1" />
                </div>
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

              {/* <Button
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
              </Button> */}
            </div>

            <div>
              {isStreaming ? (
                <Button
                  onClick={stop}
                  className="size-7 p-0 rounded-full bg-red-500 hover:bg-red-600"
                >
                  <StopCircle className="size-3 text-white" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!input.trim() || disabledChat}
                  className="size-7 p-0 rounded-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleFormSubmit}
                >
                  <ArrowUp className="size-3 text-background" />
                  {/* <i className="material-symbols-outlined " style={{ color: "var(--background-color)" }} >arrow_upward</i> */}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  })

  ChatTextField.displayName = "ChatTextField"

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



  const Message = React.memo(({
    messageUser,
    content,
    userImage,
    isStreaming = false,
    messageJSX = null,
  }: {
    messageUser: string
    content?: string | JSX.Element
    userImage?: string
    isStreaming?: boolean
    messageJSX?: JSX.Element | null
  }) => {
    const isUser = messageUser === "User"

    // Get message text
    const messageText = content && typeof content === "string" ? content : ""

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
          className={`${styles.messageContent} ${isUser ? styles.messageContentUser : styles.messageContentAssistant} ${isStreaming ? styles.messageStreaming : ""}`}
        >
          {messageText.trim() ? <MarkdownRenderer>{messageText}</MarkdownRenderer> : <ShinyText text="Thinking..." disabled={false} speed={3} />}
        </div>
      </div>
    )
  })
