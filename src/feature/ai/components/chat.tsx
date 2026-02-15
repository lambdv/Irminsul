import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import Image from "next/image"
import Link from "next/link"
import { getCDNURL } from "@/utils/getAssetURL"
import { getAiTokensLeft } from "../utils/numAiTokensLeft"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import {
  ChevronDown,
  Cloud,
  Code,
  History,
  Laptop,
  Paperclip,
  Plus,
  User,
  Globe,
  ArrowUp,
  StopCircle,
  X,
} from "lucide-react"
import { availableModels } from "../utils/models"
import ShinyText from "@/components/cn/ShinyText"
import SplitText from "@/components/cn/SplitText"
import { Textarea } from "@/components/cn/textarea"
import { Button } from "@/components/cn/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/cn/dropdown-menu"
import { AIAgent } from "@root/src/feature/ai/domain/AIAgentFactory"
import LightRays from "@/components/cn/LightRays"
import { getThemeColors } from "@/lib/themeColors"
import Modal from "@/components/ui/Modal"

const slogans = ["Navigate Truth of Teyvat."]
const SEELIE_ICON = getCDNURL("imgs/icons/seelie.png")
const availableAgents = ["agentic", "generalist"]

const suggestedQuestions = [
  "What are Mavuika's best teams?",
  "How do I build Neuvillette?",
  "Who is the strongest DPS?",
  "What's the best artifact set for Raiden?",
  "How do I optimize my spiral abyss teams?",
]

const SuggestedQuestions = React.memo(
  ({
    onQuestionClick,
    disabledChat,
  }: {
    onQuestionClick: (question: string) => void
    disabledChat: boolean
  }) => (
    <div className="flex flex-col gap-0 mt-0 w-full max-w-full px-7">
      {suggestedQuestions.map((question, i) => (
        <button
          key={i}
          className="w-full px-6 py-3 text-left text-sm text-muted-foreground/60 hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer truncate text-left"
          onClick={() => onQuestionClick(question)}
          disabled={disabledChat}
        >
          {question}
        </button>
      ))}
    </div>
  )
)

SuggestedQuestions.displayName = "SuggestedQuestions"

const Message = React.memo<{
  messageUser: string
  content?: string | JSX.Element
  userImage?: string
  isStreaming?: boolean
}>(function Message({ messageUser, content, userImage, isStreaming = false }) {
  const isUser = messageUser === "User"
  const messageText = content && typeof content === "string" ? content : ""

  return (
    <div
      className={`flex gap-3 p-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className={"flex-shrink-0 " + (isUser ? "order-first" : "")}>
        {messageUser === "Seelie" ? (
          <Image
            src={SEELIE_ICON}
            alt="Seelie"
            width={36}
            height={36}
            className="rounded-full"
          />
        ) : (
          <Image
            src={userImage || SEELIE_ICON}
            alt="User"
            width={36}
            height={36}
            className="rounded-full"
            unoptimized
          />
        )}
      </div>
      <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isUser
              ? "bg-primary/20 text-foreground"
              : "bg-muted/50 text-foreground/90"
          }`}
        >
          {messageText.trim() && messageText !== "Thinking..." ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <MarkdownRenderer>{messageText}</MarkdownRenderer>
            </div>
          ) : (
            <ShinyText text="Thinking..." disabled={false} speed={3} />
          )}
        </div>
      </div>
    </div>
  )
})

const ChatTextField = React.memo<{
  inputValue: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  disabled: boolean
  isEmpty: boolean
  attachedFiles: File[]
  onRemoveFile: (index: number) => void
  selectedAgent: AIAgent
  selectedModel: string
  onAgentChange: (agent: AIAgent) => void
  onModelChange: (model: string) => void
  onShowLogin: () => void
  user: any
  onStop: () => void
  isStreaming: boolean
}>(function ChatTextField({
  inputValue,
  onInputChange,
  onSubmit,
  disabled,
  isEmpty,
  attachedFiles,
  onRemoveFile,
  selectedAgent,
  selectedModel,
  onAgentChange,
  onModelChange,
  onShowLogin,
  user,
  onStop,
  isStreaming,
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        onSubmit(e as any)
      }
    },
    [onSubmit]
  )

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const current = e.currentTarget
      const caretPos = current.selectionStart || 0
      onInputChange(current.value)
      requestAnimationFrame(() => {
        const el = textareaRef.current
        if (!el) return
        try {
          el.setSelectionRange(caretPos, caretPos)
        } catch {}
      })
    },
    [onInputChange]
  )

  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    target.style.height = "auto"
    target.style.height = target.scrollHeight + "px"
  }, [])

  return (
    <div className="w-full">
      <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            e.target.value = ""
          }}
        />

        <div className="px-4 pt-3 pb-2">
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex-shrink-0 relative group">
                  <div className="bg-muted/50 rounded-lg p-2 min-w-24 max-w-32 flex flex-col items-center">
                    {file.type.startsWith("image/") ? (
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded mb-1"
                        width={64}
                        height={64}
                        unoptimized
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
                    onClick={() => onRemoveFile(index)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={onSubmit}>
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaChange}
              onInput={handleInput}
              placeholder="Ask Seelie anything..."
              className="w-full bg-transparent p-2 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder-muted-foreground resize-none border-none outline-none text-base min-h-12 max-h-[25vh]"
              rows={1}
              autoFocus={!isEmpty}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              style={{
                opacity: disabled ? 0.5 : 1,
                transition: "opacity 0.3s ease-in-out",
              }}
              required
              autoComplete="off"
            />
          </form>
        </div>

        <div className="mb-3 px-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full border border-border/50 hover:bg-accent"
                  disabled={disabled}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 rounded-xl p-2"
              >
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem
                    className="rounded-lg text-sm px-3 py-2 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-4 h-4 mr-2 opacity-60" />
                    Attach Files
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-lg text-sm px-3 py-2 cursor-pointer"
                    onClick={() => {}}
                  >
                    <Code className="w-4 h-4 mr-2 opacity-60" />
                    Code Interpreter
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-lg text-sm px-3 py-2 cursor-pointer"
                    onClick={() => {}}
                  >
                    <Globe className="w-4 h-4 mr-2 opacity-60" />
                    Web Search
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-lg text-sm px-3 py-2 cursor-pointer"
                    onClick={() => {}}
                  >
                    <History className="w-4 h-4 mr-2 opacity-60" />
                    Chat History
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu> */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 rounded-full border border-transparent hover:bg-accent text-muted-foreground text-sm"
                  disabled={disabled}
                >
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  <span className="capitalize">{selectedAgent}</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-40 rounded-xl p-2 bg-popover/95 backdrop-blur"
              >
                <DropdownMenuGroup className="space-y-1">
                  {availableAgents.map((agent) => (
                    <DropdownMenuItem
                      key={agent}
                      className="rounded-lg text-sm px-3 py-2 cursor-pointer capitalize"
                      onClick={() => onAgentChange(agent as AIAgent)}
                    >
                      {agent}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 rounded-full border border-transparent hover:bg-accent text-muted-foreground text-sm"
                  disabled={disabled}
                >
                  <Laptop className="w-3.5 h-3.5 mr-1.5" />
                  <span>{selectedModel}</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-40 rounded-xl p-2 bg-popover/95 backdrop-blur"
              >
                <DropdownMenuGroup className="space-y-1">
                  {availableModels.map((m) => (
                    <DropdownMenuItem
                      key={m}
                      className="rounded-lg text-sm px-3 py-2 cursor-pointer"
                      onClick={() => {
                        if (m !== "auto" && !user) {
                          onShowLogin()
                          return
                        }
                        onModelChange(m)
                      }}
                    >
                      {m === "auto" ? (
                        <Laptop className="w-4 h-4 mr-2 opacity-60" />
                      ) : (
                        <Cloud className="w-4 h-4 mr-2 opacity-60" />
                      )}
                      {m}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>

          <div>
            {isStreaming ? (
              <Button
                onClick={onStop}
                className="h-9 w-9 p-0 rounded-full bg-destructive hover:bg-destructive/90 transition-colors"
              >
                <StopCircle className="w-4 h-4 text-destructive-foreground" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!inputValue.trim() || disabled}
                className="h-9 w-9 p-0 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={onSubmit}
              >
                <ArrowUp className="w-4 h-4 text-primary-foreground" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

const LandingView = React.memo<{
  slogan: string
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  disabled: boolean
  attachedFiles: File[]
  onRemoveFile: (index: number) => void
  selectedAgent: AIAgent
  selectedModel: string
  onAgentChange: (agent: AIAgent) => void
  onModelChange: (model: string) => void
  onShowLogin: () => void
  user: any
  onStop: () => void
  isStreaming: boolean
}>(function LandingView({
  slogan,
  input,
  onInputChange,
  onSubmit,
  disabled,
  attachedFiles,
  onRemoveFile,
  selectedAgent,
  selectedModel,
  onAgentChange,
  onModelChange,
  onShowLogin,
  user,
  onStop,
  isStreaming,
}) {
  const handleQuestionClick = useCallback(
    (question: string) => {
      onInputChange(question)
    },
    [onInputChange]
  )

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden fixed inset-0">
      <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col items-center animate-fade-in overflow-hidden px-4 sm:px-6">
        {/* NEVER ADD THE IMAGE OF SEELIE HERE IT LOOKS BAD */}
        <div className="">
          <SplitText
            text={slogan}
            tag="h1"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight"
            delay={40}
            duration={0.2}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 50 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-50px"
            textAlign="center"
          />
          <p className="text-sm text-muted-foreground mt-2" style={{}}>
            The 1rst AI agent for Genshin Meta & Theorycrafting.
          </p>
        </div>
        <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl flex-shrink-0 scale-75 sm:scale-85 md:scale-90">
          <ChatTextField
            inputValue={input}
            onInputChange={onInputChange}
            onSubmit={onSubmit}
            disabled={disabled}
            isEmpty={true}
            attachedFiles={attachedFiles}
            onRemoveFile={onRemoveFile}
            selectedAgent={selectedAgent}
            selectedModel={selectedModel}
            onAgentChange={onAgentChange}
            onModelChange={onModelChange}
            onShowLogin={onShowLogin}
            user={user}
            onStop={onStop}
            isStreaming={isStreaming}
          />
        </div>
        <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl flex-shrink-0 overflow-hidden max-h-40 sm:max-h-48 md:max-h-56 mt-4">
          <SuggestedQuestions
            onQuestionClick={handleQuestionClick}
            disabledChat={disabled}
          />
        </div>
      </div>
    </div>
  )
})

const ChatView = React.memo<{
  messages: any[]
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  disabled: boolean
  attachedFiles: File[]
  onRemoveFile: (index: number) => void
  selectedAgent: AIAgent
  selectedModel: string
  onAgentChange: (agent: AIAgent) => void
  onModelChange: (model: string) => void
  onShowLogin: () => void
  user: any
  onStop: () => void
  isStreaming: boolean
  getMessageText: (message: any) => string
  status: any
}>(function ChatView({
  messages,
  input,
  onInputChange,
  onSubmit,
  disabled,
  attachedFiles,
  onRemoveFile,
  selectedAgent,
  selectedModel,
  onAgentChange,
  onModelChange,
  onShowLogin,
  user,
  onStop,
  isStreaming,
  getMessageText,
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto py-4 px-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <SuggestedQuestions
                onQuestionClick={() => {}}
                disabledChat={disabled}
              />
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <Message
                  key={m.id}
                  messageUser={m.role === "user" ? "User" : "Seelie"}
                  content={getMessageText(m)}
                  userImage={user?.image}
                  isStreaming={
                    m.role === "assistant" && getMessageText(m) === ""
                  }
                />
              ))}
              {status === "submitted" && (
                <Message
                  key="thinking"
                  messageUser="Seelie"
                  content="Thinking..."
                  userImage={user?.image}
                  isStreaming={true}
                />
              )}
            </>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 pt-4 pb-4 px-4 border-border/50">
        <div className="max-w-4xl mx-auto">
          <ChatTextField
            inputValue={input}
            onInputChange={onInputChange}
            onSubmit={onSubmit}
            disabled={disabled}
            isEmpty={false}
            attachedFiles={attachedFiles}
            onRemoveFile={onRemoveFile}
            selectedAgent={selectedAgent}
            selectedModel={selectedModel}
            onAgentChange={onAgentChange}
            onModelChange={onModelChange}
            onShowLogin={onShowLogin}
            user={user}
            onStop={onStop}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  )
})

const ChatComponent = React.memo(function Chat(props: { user: any }) {
  const [selectedModel, setSelectedModel] = useState<string>("auto")
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>("generalist")
  const [input, setInput] = useState<string>("")
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [slogan] = useState(slogans[0])
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [tokensLeft, setTokensLeft] = useState<number | null>(null)
  const [raysColor, setRaysColor] = useState(getThemeColors("dark").raysColor)
  const [currentTheme, setCurrentTheme] = useState<string>("dark")

  useEffect(() => {
    const updateThemeState = () => {
      const theme =
        document.documentElement.getAttribute("data-theme") || "dark"
      setCurrentTheme(theme)
      setRaysColor(getThemeColors(theme).raysColor)
    }

    updateThemeState()

    const observer = new MutationObserver(updateThemeState)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })

    return () => observer.disconnect()
  }, [])

  const { messages, sendMessage, setMessages, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages, agentType: selectedAgent },
      }),
    }),
    onError: () => {
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
    onFinish: () => {
      // Remove any thinking messages when streaming finishes
      setMessages((prev) =>
        prev.filter((msg) => getMessageText(msg) !== "Thinking...")
      )
    },
  })

  useEffect(() => {
    const load = async () => {
      if (props.user?.id && selectedModel !== "auto") {
        const tokens = await getAiTokensLeft(props.user.id)
        setTokensLeft(tokens)
      } else {
        setTokensLeft(null)
      }
      setIsModelLoading(false)
    }
    load()
  }, [props.user?.id, selectedModel])

  const isStreaming = status === "submitted" || status === "streaming"
  const disabledChat = isModelLoading || isStreaming || status === "error"
  const isLightTheme = currentTheme === "light" || currentTheme === "purple"

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (input.trim().length <= 0) {
        return
      }
      if (!props.user) {
        setShowLoginModal(true)
        return
      }
      sendMessage({ text: input })
      setInput("")
    },
    [input, sendMessage, props.user]
  )

  const handleInputChange = useCallback((value: string) => {
    setInput(value)
  }, [])

  const handleFileRemove = useCallback((index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleAgentChange = useCallback((agent: AIAgent) => {
    setSelectedAgent(agent)
  }, [])

  const handleModelChange = useCallback(
    (model: string) => {
      if (model !== "auto" && !props.user) {
        setShowLoginModal(true)
        return
      }
      setSelectedModel(model)
    },
    [props.user]
  )

  const getMessageText = useCallback((message: any): string => {
    if (typeof message?.content === "string") return message.content
    const parts = message?.parts
    if (Array.isArray(parts)) {
      return parts
        .filter((p: any) => p?.type === "text" && typeof p?.text === "string")
        .map((p: any) => p.text)
        .join("")
    }
    return ""
  }, [])

  const isEmpty = useMemo(() => messages.length === 0, [messages.length])

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {isEmpty && !isLightTheme && (
        <div
          style={{
            position: "absolute",
            top: "-60px",
            left: "-20%",
            width: "calc(100% + 40%)",
            height: "calc(100vh + 60px)",
            zIndex: -1,
            pointerEvents: "none",
          }}
        >
          <LightRays
            raysOrigin="top-center"
            raysColor={raysColor}
            raysSpeed={isLightTheme ? 1 : 1.5}
            lightSpread={isLightTheme ? 0.1 : 0.4}
            rayLength={2.2}
            fadeDistance={isLightTheme ? 0.4 : 0.8}
            saturation={isLightTheme ? 1 : 1}
            followMouse={true}
            mouseInfluence={isLightTheme ? 0.1 : 0.15}
            noiseAmount={isLightTheme ? 0 : 0.05}
            distortion={isLightTheme ? 0 : 0.1}
            pulsating={isLightTheme ? false : true}
            isLightMode={isLightTheme}
          />
        </div>
      )}
      <div
        className="h-screen w-full overflow-hidden"
        style={{
          backgroundColor: "transparent",
          position: "relative",
          zIndex: 1,
        }}
      >
        {isEmpty ? (
          <LandingView
            slogan={slogan}
            input={input}
            onInputChange={handleInputChange}
            onSubmit={handleFormSubmit}
            disabled={disabledChat}
            attachedFiles={attachedFiles}
            onRemoveFile={handleFileRemove}
            selectedAgent={selectedAgent}
            selectedModel={selectedModel}
            onAgentChange={handleAgentChange}
            onModelChange={handleModelChange}
            onShowLogin={() => setShowLoginModal(true)}
            user={props.user}
            onStop={stop}
            isStreaming={isStreaming}
          />
        ) : (
          <ChatView
            messages={messages}
            input={input}
            onInputChange={handleInputChange}
            onSubmit={handleFormSubmit}
            disabled={disabledChat}
            attachedFiles={attachedFiles}
            onRemoveFile={handleFileRemove}
            selectedAgent={selectedAgent}
            selectedModel={selectedModel}
            onAgentChange={handleAgentChange}
            onModelChange={handleModelChange}
            onShowLogin={() => setShowLoginModal(true)}
            user={props.user}
            onStop={stop}
            isStreaming={isStreaming}
            getMessageText={getMessageText}
            status={status}
          />
        )}
      </div>
      {showLoginModal && (
        <Modal title="Login Required" toggle={() => setShowLoginModal(false)}>
          <p>You need to be logged in to send messages to Seelie.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowLoginModal(false)}>
              Cancel
            </Button>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </Modal>
      )}
    </div>
  )
})

export default ChatComponent
