"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { IntroTour } from "@/components/IntroTour"
// Removed ArticlesTour import
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"

interface Message {
  role: string;
  content: string;
  sources?: { url: string; description: string }[];
}

export function ChatInterface() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [conversationStarted, setConversationStarted] = React.useState(false);

  // Navigation hooks
  const router = useRouter();
  const pathname = usePathname();

  // Page context determination
  const isArticlesPage = pathname === "/articles";

  // Check for pending AI query from articles page
  React.useEffect(() => {
    const pendingQuery = localStorage.getItem("pendingAIQuery");
    if (pendingQuery) {
      handleSendMessage(pendingQuery);
      localStorage.removeItem("pendingAIQuery");
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);

    try {
      const tavilyResponse = await fetch('/api/tavily/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });

      const tavilyData = await tavilyResponse.json();

      if (tavilyResponse.ok && tavilyData.sources?.length > 0) {
        setMessages(prev => [...prev, { 
          role: 'assistant',
          content: 'Here are some relevant sources I found:',
          sources: tavilyData.sources
        }]);
      }

      if (!conversationStarted) {
        setConversationStarted(true);
      }

      const response = await fetch('/api/gemini/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from Gemini');
      }

      const assistantMessage = { role: 'assistant', content: data.data };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in chat process:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isArticlesPage ? (
        <div 
          className="relative flex flex-col min-h-screen"
          role="main"
        >
          <IntroTour />
          
          <div 
            className={`w-full flex flex-col h-screen ${!conversationStarted ? 'justify-center' : 'justify-between'}`}
            role="region"
            aria-label="Chat interface"
          >
            <div className={`flex flex-col items-center w-full max-w-3xl mx-auto p-4 md:p-8 ${conversationStarted ? 'h-full justify-between' : ''}`}>
              {/* Welcome heading removed */}
              
              <MessageList 
                messages={messages} 
                isLoading={isLoading} 
                conversationStarted={conversationStarted}
              />
              
              <MessageInput 
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                conversationStarted={conversationStarted}
                isArticlesPage={isArticlesPage}
              />
            </div>
          </div>
        </div>
      ) : (
        // Removed ArticlesTour component
        <div className="articles-page-container">
          {/* Replace with appropriate content for articles page */}
        </div>
      )}
    </>
  );
}