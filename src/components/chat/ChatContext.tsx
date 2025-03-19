"use client"

import * as React from "react"
import { mockArticles } from "@/data/mock-articles"

type Message = {
  role: string
  content: string
  sources?: { url: string; description: string }[]
}

type ChatContextType = {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  conversationStarted: boolean
  setConversationStarted: React.Dispatch<React.SetStateAction<boolean>>
  pendingImage: string | null
  setPendingImage: React.Dispatch<React.SetStateAction<string | null>>
  imagePrompt: string
  setImagePrompt: React.Dispatch<React.SetStateAction<string>>
  matchingArticles: typeof mockArticles
  setMatchingArticles: React.Dispatch<React.SetStateAction<typeof mockArticles>>
  handleSendMessage: (text: string) => Promise<void>
  handleImageAnalysis: (imageData: string, prompt: string) => Promise<void>
}

const ChatContext = React.createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [conversationStarted, setConversationStarted] = React.useState(false)
  const [pendingImage, setPendingImage] = React.useState<string | null>(null)
  const [imagePrompt, setImagePrompt] = React.useState("")
  const [matchingArticles, setMatchingArticles] = React.useState<typeof mockArticles>([])

  // Check for pending AI query from articles page
  React.useEffect(() => {
    const pendingQuery = localStorage.getItem("pendingAIQuery")
    if (pendingQuery) {
      handleSendMessage(pendingQuery)
      localStorage.removeItem("pendingAIQuery")
    }
  }, [])

  const handleSendMessage = React.useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    setIsLoading(true)
    const userMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setMatchingArticles([])

    // Mark conversation as started when first message is sent
    if (!conversationStarted) {
      setConversationStarted(true)
    }

    try {
      // Only make one request to Gemini API
      const response = await fetch('/api/gemini/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from Gemini')
      }

      const assistantMessage = { role: 'assistant', content: data.data }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      // Add a user-friendly error message to the chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again later.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, conversationStarted])

  const handleImageAnalysis = React.useCallback(async (imageData: string, prompt: string) => {
    if (!imageData) return

    try {
      setIsLoading(true)
      
      // Add user message with image placeholder
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: prompt.trim() 
          ? `Image analysis request: ${prompt}` 
          : 'Image analysis request'
      }])
      
      // Extract base64 data if needed
      const base64String = imageData.includes(',') ? imageData.split(',')[1] : imageData
      
      // Send to backend for processing
      const response = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageData: base64String,
          prompt: prompt.trim() || 'Analyze this image' // Provide default prompt if empty
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image')
      }
      
      // Add AI response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.data 
      }])
    } catch (error) {
      console.error('Error processing image:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your image. Please try again later.' 
      }])
    } finally {
      setIsLoading(false)
      setPendingImage(null)
      setImagePrompt("")
    }
  }, [])

  const value = {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    conversationStarted,
    setConversationStarted,
    pendingImage,
    setPendingImage,
    imagePrompt,
    setImagePrompt,
    matchingArticles,
    setMatchingArticles,
    handleSendMessage,
    handleImageAnalysis
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = React.useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}