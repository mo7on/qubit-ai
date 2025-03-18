"use client"

import * as React from "react"
import { User, Bot } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"

interface Message {
  role: string;
  content: string;
  sources?: { url: string; description: string }[];
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  conversationStarted: boolean;
}

export function MessageList({ messages, isLoading, conversationStarted }: MessageListProps) {
  if (!messages.length && !isLoading) return null;

  return (
    <div 
      className="w-full flex-1 mb-2.5 md:mb-3 flex flex-col"
      role="log"
      aria-label="Conversation history"
    >
      <ScrollArea className="h-[calc(100vh-160px)] w-full">
        <div className="p-4 md:p-6">
          <div className="space-y-6 w-full max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-300"
              >
                <div className="flex-shrink-0">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/30">
                      <User className="w-5 h-5 text-foreground" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/30">
                      <Bot className="w-5 h-5 text-foreground" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div
                  className="flex-1 max-w-[85%] text-foreground p-2 rounded-lg"
                >
                  <MarkdownRenderer content={message.content} />
                  {message.sources && (
                    <div className="mt-4 space-y-2">
                      {message.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <p className="text-sm font-medium">{source.description}</p>
                          <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/30">
                    <Bot className="w-5 h-5 text-foreground" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex-1 max-w-[85%] text-foreground">
                  <div className="space-y-2 animate-pulse">
                    <Skeleton className="h-4 w-[80%] bg-accent/50 dark:bg-accent/30 transition-opacity duration-300" />
                    <Skeleton className="h-4 w-[60%] bg-accent/50 dark:bg-accent/30 transition-opacity duration-300 delay-100" />
                    <Skeleton className="h-4 w-[70%] bg-accent/50 dark:bg-accent/30 transition-opacity duration-300 delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}