"use client"

import { useState } from "react"
import { PromptForm } from "@/components/ui/prompt-form"

export default function ChatGPTStyleInterface() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true)

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: prompt }])

    try {
      // Here you would call your AI API
      // For demo purposes, we'll simulate a response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `I received your prompt: "${prompt}". This is a simulated response.`
        }])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error."
      }])
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === "user"
                ? "bg-blue-100 ml-12"
                : "bg-gray-100 mr-12"
            }`}
          >
            <div className="font-semibold mb-2">
              {message.role === "user" ? "You:" : "Assistant:"}
            </div>
            <div>{message.content}</div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto">
        <PromptForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder="Type your message here..."
        />
      </div>
    </div>
  )
}