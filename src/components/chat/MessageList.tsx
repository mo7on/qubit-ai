"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { MessageAvatar } from "./MessageAvatar"

interface Message {
  role: string;
  content: string;
  image?: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  conversationStarted: boolean;
}

/**
 * MessageList Component
 * 
 * Renders a scrollable list of chat messages with support for user and AI messages,
 * loading states, and auto-scrolling to the latest message.
 * 
 * @component
 * @param {Object} props
 * @param {Message[]} props.messages - Array of messages to display
 * @param {boolean} props.isLoading - Loading state for showing skeleton loader
 * @param {boolean} props.conversationStarted - Whether the conversation has started
 */

export function MessageList({ messages, isLoading, conversationStarted }: MessageListProps) {
  // Add ref for auto-scrolling
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  if (!messages.length && !isLoading) return null;

  return (
    <div 
      className="w-full flex-1 mb-2.5 md:mb-3 flex flex-col"
      role="log"
      aria-label="Conversation history"
      ref={scrollAreaRef}
    >
      <ScrollArea className="h-[calc(100vh-160px)] w-full">
        <div className="p-4 md:p-6">
          <div className="space-y-6 w-full max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MessageAvatar 
                  role={message.role} 
                  className={`animate-in fade-in-50 slide-in-from-left-3 duration-300`}
                />
                <div
                  className="flex-1 max-w-[85%] text-foreground p-2 rounded-lg animate-in fade-in-50 slide-in-from-left-3 duration-300"
                  style={{ animationDelay: `${index * 100 + 100}ms` }}
                >
                  {message.image && (
                    <div className="mb-3">
                      <div className="relative rounded-lg overflow-hidden inline-block">
                        <img
                          src={message.image}
                          alt="Message attachment"
                          className="max-w-[150px] max-h-[150px] object-cover rounded-lg border border-border"
                        />
                      </div>
                    </div>
                  )}
                  <MarkdownRenderer content={message.content} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
                <MessageAvatar 
                  role="assistant" 
                  className="animate-in fade-in-50 slide-in-from-left-3 duration-300" 
                />
                <div className="flex-1 max-w-[85%] text-foreground animate-in fade-in-50 slide-in-from-left-3 duration-300" style={{ animationDelay: '100ms' }}>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[clamp(60%,80%,85%)] bg-accent/50 dark:bg-accent/30 transition-opacity duration-300" />
                    <Skeleton className="h-4 w-[clamp(40%,60%,70%)] bg-accent/50 dark:bg-accent/30 transition-opacity duration-300 delay-100" />
                    <Skeleton className="h-4 w-[clamp(50%,70%,80%)] bg-accent/50 dark:bg-accent/30 transition-opacity duration-300 delay-200" />
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