"use client"

import * as React from "react"
import { Send, Plus, X, Paperclip, History } from "lucide-react"
import { useTheme } from "next-themes"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockTickets } from "@/lib/mock-tickets"
import { mockArticles } from "@/data/mock-articles"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ArticleSuggestions } from "@/components/chat/ArticleSuggestions"
import { useChatContext } from "./ChatContext"

interface ChatInputProps {
  handleFileUploadClick: () => void;
  handleArticleSuggestionClick: (articleId: string) => void;
  isArticlesPage: boolean;
}

export function ChatInput({
  handleFileUploadClick,
  handleArticleSuggestionClick,
  isArticlesPage
}: ChatInputProps) {
  const { theme } = useTheme();
  const { 
    isLoading, 
    matchingArticles,
    setMatchingArticles,
    handleSendMessage
  } = useChatContext();
  
  const [text, setText] = React.useState<string>("");
  const [isFocused, setIsFocused] = React.useState(false);
  
  const handleTextChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    
    // Update article suggestions based on input text
    if (value.length <= 2) {
      setMatchingArticles([]);
      return;
    }
    
    const matches = mockArticles.filter(article => 
      article.title.toLowerCase().includes(value.toLowerCase()) ||
      article.description.toLowerCase().includes(value.toLowerCase())
    );
    setMatchingArticles(matches);
  }, [setMatchingArticles]);

  return (
    <div 
      className={`w-full p-4 md:p-6 rounded-2xl bg-background border border-input flex flex-col transition-all duration-300 ${isFocused ? 'shadow-md' : ''}`}
      role="form"
      aria-label="Message input form"
    >
      <div className="flex items-center gap-2 md:gap-4">
        {!isArticlesPage && (
          <>
            {/* Qubit AI icon - now with hover effect */}
            <div
              className="p-2 transition-transform duration-200 hover:scale-105"
              aria-label="Qubit AI icon"
            >
              <img
                src={theme === "light" ? "/qubit-ai-dark.svg" : "/qubit-ai.svg"}
                alt="Qubit AI"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="plus-button p-2 hover:bg-accent rounded-full transition-all duration-200 hover:scale-105"
                  aria-label="Toggle options"
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 animate-in fade-in-50 slide-in-from-top-5 duration-300" align="start" side="top" sideOffset={5}>
                <div className="flex flex-col space-y-2">
                  <button
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-lg transition-colors duration-200 w-full cursor-pointer hover:translate-y-[-2px]"
                    onClick={() => {
                      handleFileUploadClick();
                      const trigger = document.querySelector('.plus-button') as HTMLButtonElement;
                      trigger?.click();
                    }}
                  >
                    <Paperclip className="w-5 h-5" />
                    <span>Attachment</span>
                  </button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-lg transition-colors duration-200 w-full cursor-pointer hover:translate-y-[-2px]"
                      >
                        <History className="w-5 h-5" />
                        <span>History</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 animate-in fade-in-50 slide-in-from-right-5 duration-300" align="start" side="right" sideOffset={5}>
                      <ScrollArea className="h-[300px] w-full">
                        <div className="space-y-4" role="list" aria-label="Chat history">
                          {mockTickets.map((ticket, index) => (
                            <div
                              key={ticket.id}
                              className={`p-3 rounded-lg hover:bg-accent cursor-pointer transition-all duration-200 hover:translate-y-[-2px] animate-in fade-in-50 duration-300`}
                              style={{ animationDelay: `${index * 50}ms` }}
                              role="listitem"
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
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}

        <div className="flex-1 relative textbar-container">
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (text.trim()) {
                  handleSendMessage(text);
                  setText("");
                }
              }
            }}
            placeholder="Type your message here..."
            className="w-full px-4 py-2 rounded-full bg-background border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200"
            aria-label="Message input"
            role="textbox"
            aria-expanded={matchingArticles.length > 0}
          />
          
          {/* Article suggestions with improved animation */}
          {matchingArticles.length > 0 && (
            <div className="animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
              <ArticleSuggestions 
                articles={matchingArticles} 
                onArticleClick={handleArticleSuggestionClick} 
              />
            </div>
          )}
          
          <button
            onClick={() => {
              if (text.trim()) {
                handleSendMessage(text);
                setText("");
              }
            }}
            disabled={!text || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-110"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}