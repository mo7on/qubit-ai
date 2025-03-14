"use client"

import * as React from "react"
import { Camera, Send, FileText, ScrollText } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

interface UploadOption {
  value: "document" | "photo"
  label: string
}

/**
 * TextArea Component
 * 
 * A primary user interaction component that provides a chat-like interface with multiple functionalities.
 * 
 * Features:
 * - Text input for messaging with dynamic send/camera button
 * - File/photo upload options via Select dropdown
 * - Quick access to articles section
 * 
 * Accessibility:
 * - All interactive elements have proper ARIA labels
 * - Semantic HTML structure
 * - Keyboard navigation support
 * 
 * @component
 */
export function TextArea() {
  // State management for user input text
  const [text, setText] = React.useState<string>("")
  const router = useRouter()

  // Memoized upload options to prevent unnecessary re-renders
  const uploadOptions = React.useMemo<UploadOption[]>(() => [
    { value: "document", label: "Upload Document" },
    { value: "photo", label: "Upload Photo" }
  ], [])

  // Handler for text input changes
  const handleTextChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }, [])

  // Handler for articles navigation
  const handleArticlesClick = React.useCallback(() => {
    router.push("/articles")
  }, [router])

  return (
    <div className="flex flex-col min-h-screen md:h-screen">
      <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto w-full md:flex md:flex-1 md:items-center">
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto space-y-4 p-4 md:p-8">
          {/* Main heading section - visible on all screen sizes */}
          <h1 className="text-2xl md:text-4xl font-bold text-primary fixed top-14 left-0 right-0 text-center md:static">Welcome to Qub-IT!</h1>
          <h2 className="text-lg md:text-xl text-muted-foreground mb-4 md:mb-8 fixed top-24 left-0 right-0 text-center md:static">The first ever IT Assistant AI chatbot.</h2>
          
          {/* Interactive chat interface container */}
          <div className="w-full p-4 md:p-6 rounded-2xl bg-muted/20 border border-border">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Articles navigation button */}
              <button
                onClick={handleArticlesClick}
                className="p-2 hover:bg-accent rounded-full transition-colors"
                aria-label="Go to articles"
              >
                <ScrollText className="w-5 h-5" />
              </button>

              {/* File upload select dropdown */}
              <Select>
                <SelectTrigger 
                  className="w-10 h-10 p-2 rounded-full border-none hover:bg-accent"
                  aria-label="Upload options"
                >
                  <FileText className="w-5 h-5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {uploadOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Main input field with dynamic send/camera button */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Message Copilot"
                  className="w-full px-4 py-2 rounded-full bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Message input"
                />
                <button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-full transition-colors"
                  aria-label={text ? "Send message" : "Take photo"}
                >
                  {text ? <Send className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}