"use client"

import * as React from "react"
import { Camera, Send, FileText, ScrollText, History } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockTickets } from "@/lib/mock-tickets"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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

export function TextArea() {
  const [text, setText] = React.useState<string>("")
  const [showHistory, setShowHistory] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isArticlesPage = pathname === "/articles"

  const uploadOptions = React.useMemo<UploadOption[]>(() => [
    { value: "document", label: "Upload Document" },
    { value: "photo", label: "Upload Photo" }
  ], [])

  const handleTextChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }, [])

  const handleArticlesClick = React.useCallback(() => {
    if (!isArticlesPage) {
      router.push("/articles")
    }
  }, [isArticlesPage, router])

  return (
    <div className={`relative flex flex-col min-h-screen ${isArticlesPage ? '' : 'md:items-center md:justify-center'}`}>
      <div className={`w-full ${isArticlesPage ? 'fixed bottom-0 left-0 right-0' : 'fixed md:static bottom-0 left-0 right-0'}`}>
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto space-y-4 p-4 md:p-8">
          {!isArticlesPage && (
            <div className="w-full text-center md:static fixed top-8 left-0 right-0 px-4">
              <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2">Welcome to Qub-IT!</h1>
              <h2 className="text-lg md:text-xl text-muted-foreground mb-8">The first ever IT Assistant AI chatbot.</h2>
            </div>
          )}
          
          <div className="w-full p-4 md:p-6 rounded-2xl bg-muted/20 border border-border">
            <div className="flex items-center gap-2 md:gap-4">
              {isArticlesPage && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="p-2 hover:bg-accent rounded-full transition-colors"
                      aria-label="Toggle history"
                    >
                      <History className="w-5 h-5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <ScrollArea className="h-[300px] w-full">
                      <div className="space-y-4">
                        {mockTickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          >
                            <p className="text-sm text-muted-foreground">
                              {ticket.timestamp.toLocaleString()}
                            </p>
                            <p className="mt-1">{ticket.content}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              )}
              {!isArticlesPage && (
                <button
                  onClick={handleArticlesClick}
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                  aria-label="Go to articles"
                >
                  <ScrollText className="w-5 h-5" />
                </button>
              )}

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

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-2 rounded-full bg-background border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Message input"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-full transition-colors"
                  aria-label={text ? "Send message" : "Take photo"}
                >
                  {text ? (
                    <Send className="w-4 h-4" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}