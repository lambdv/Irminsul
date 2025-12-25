"use client"
import React, { useEffect, useState } from "react"
import styles from "./seelie.module.css"

interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

interface ConversationSidebarProps {
  user: any
  currentConversationId: string | null
  onNewChat: () => void
  onLoadConversation: (id: string) => void
  refreshTrigger?: number
  open: boolean
  onClose: () => void
}

export default function ConversationSidebar({
  user,
  currentConversationId,
  onNewChat,
  onLoadConversation,
  refreshTrigger,
  open,
  onClose,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchConversations()
    }
  }, [user?.id, refreshTrigger])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations")
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.sidebarBackdrop}
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 5,
        }}
      />
      <div className={`${styles.conversationSidebar} ${styles.open}`}>
      <button className={styles.newChatButton} onClick={onNewChat}>
        New Chat
      </button>
      <div className={styles.conversationList}>
        {loading ? (
          <div>Loading...</div>
        ) : conversations.length === 0 ? (
          <div>No conversations yet</div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              className={`${styles.conversationItem} ${
                conv.id === currentConversationId
                  ? styles.activeConversation
                  : ""
              }`}
              onClick={() => onLoadConversation(conv.id)}
            >
              <div className={styles.conversationTitle}>{conv.title}</div>
              <div className={styles.conversationDate}>
                {new Date(conv.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
    </>
  )
}
