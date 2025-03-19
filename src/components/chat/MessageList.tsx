"use client"

import * as React from "react"
import { User, Bot } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"

interface Message {
  role: string;
  content: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  conversationStarted: boolean;
}

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
                <div className="flex-shrink-0 animate-in fade-in-50 zoom-in-50 duration-300" style={{ animationDelay: `${index * 100 + 50}ms` }}>
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/30 transition-all duration-200 hover:bg-accent/50">
                      <User className="w-5 h-5 text-foreground" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/30 transition-all duration-200 hover:bg-accent/50">
                      <Bot className="w-5 h-5 text-foreground" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div
                  className="flex-1 max-w-[85%] text-foreground p-2 rounded-lg animate-in fade-in-50 slide-in-from-left-3 duration-300"
                  style={{ animationDelay: `${index * 100 + 100}ms` }}
                >
                  <MarkdownRenderer content={message.content} />

                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
                <div className="flex-shrink-0 animate-in fade-in-50 zoom-in-50 duration-300" style={{ animationDelay: '50ms' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/30">
                    <Bot className="w-5 h-5 text-foreground" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex-1 max-w-[85%] text-foreground animate-in fade-in-50 slide-in-from-left-3 duration-300" style={{ animationDelay: '100ms' }}>
                  <div className="space-y-2">
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