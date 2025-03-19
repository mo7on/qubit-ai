"use client"

import * as React from "react"
import { Camera, Send, Paperclip, ScrollText, History, User, Bot, X, Plus } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { mockTickets } from "@/lib/mock-tickets"
import { mockArticles, syncArticlesWithBackend } from "@/data/mock-articles"
import { IntroTour } from "@/components/IntroTour"
import { useTheme } from "next-themes"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"

// Import the modular components for the modals only
import { CameraModal } from "@/components/chat/CameraModal"
import { ImagePromptModal } from "@/components/chat/ImagePromptModal"
import { useChatContext } from "@/components/chat/ChatContext"

/** Interface for upload options in the text area component */
// Update the component props to include isMobile
interface UploadOption {
  value: "document" | "photo"
  label: string
}

/** Interface for the ticket history items */
interface TicketHistoryItem {
  id: string
  timestamp: Date
  content: string
}

/**
 * TextArea Component
 * 
 * A responsive chat interface component that provides text input, file upload,
 * and article search functionality. It adapts its layout based on the current page context
 * and provides real-time article suggestions as users type.
 * 
 * Features:
 * - Real-time article search
 * - File upload options
 * - History view (on articles page)
 * - Responsive design
 * - Mobile-optimized positioning
 * 
 * @component
 */
export function TextArea({ isMobile = false }: { isMobile?: boolean }) {
  // State management for user input and UI elements
  const [text, setText] = React.useState<string>("");
  const [showHistory, setShowHistory] = React.useState(false);
  const [matchingArticles, setMatchingArticles] = React.useState<typeof mockArticles>([]);
  
  // Add state for zoomed image
  const [zoomedImage, setZoomedImage] = React.useState<string | null>(null);
  
  // File upload related state and refs
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [imagePromptOpen, setImagePromptOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Use the chat context for shared state
  const { 
    messages, 
    isLoading, 
    conversationStarted,
    pendingImage,
    setPendingImage,
    imagePrompt,
    setImagePrompt,
    handleSendMessage,
    handleImageAnalysis
  } = useChatContext();

  /**
   * Handles image click to zoom
   */
  const handleImageClick = React.useCallback((imageSrc: string) => {
    setZoomedImage(imageSrc);
  }, []);

  /**
   * Handles closing the zoomed image
   */
  const handleCloseZoom = React.useCallback(() => {
    setZoomedImage(null);
  }, []);
  
  // Navigation hooks
  const router = useRouter();
  const pathname = usePathname();

  // Theme detection for logo
  const { theme } = useTheme();
  const logoSrc = theme === 'light' ? "/qubit-ai-dark.svg" : "/qubit-ai.svg";
  
  // Page context determination
  const isArticlesPage = pathname === "/articles";

  // Memoized upload options to prevent unnecessary re-renders
  const uploadOptions = React.useMemo<UploadOption[]>(() => [
    { value: "document", label: "Upload Document" },
    { value: "photo", label: "Upload Photo" }
  ], []);

  /**
   * Handles text input changes and updates article suggestions
   * @param e - Event from the input element
   */
  const handleTextChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    
    // Clear suggestions if text is empty or too short
    if (value.length <= 2) {
      setMatchingArticles([]);
      return;
    }
    
    const matches = mockArticles.filter(article => 
      article.title.toLowerCase().includes(value.toLowerCase()) ||
      article.description.toLowerCase().includes(value.toLowerCase())
    );
    setMatchingArticles(matches);
  }, [setText, setMatchingArticles]);
  
    // Add article suggestion click handler
    const handleArticleSuggestionClick = React.useCallback((articleId: string) => {
    setMatchingArticles([]);
    
    // Navigate to the article page with the article ID
    router.push(`/articles/${articleId}`);
    
    // Dispatch custom event to expand the article
    window.dispatchEvent(
      new CustomEvent('expandArticle', {
        detail: { articleId }
      })
    );
  }, [router, setMatchingArticles]);

  /**
   * Handles sending a message
   */
  const handleSendClick = React.useCallback(() => {
    if (!text.trim()) return;
    
    handleSendMessage(text);
    setText("");
  }, [text, handleSendMessage]);

  /**
   * Handles opening the camera
   */
  const handleCameraClick = React.useCallback(() => {
    setIsCameraOpen(true);
  }, []);

  /**
   * Handles closing the camera
   */
  const handleCloseCamera = React.useCallback(() => {
    setIsCameraOpen(false);
  }, []);

  /**
   * Handles file upload click
   */
  const handleFileUploadClick = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Handles file selection
   */
  const handleFileChange = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString();
        if (base64String) {
          setPendingImage(base64String);
          setImagePromptOpen(true);
        }
      };
      reader.readAsDataURL(file);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
  }, [setPendingImage]);

  /**
   * Handles camera capture
   */
  const handleCameraCapture = React.useCallback((imageSrc: string) => {
    setIsCameraOpen(false);
    setPendingImage(imageSrc);
    setImagePromptOpen(true);
  }, [setPendingImage]);

  /**
   * Handles closing the image prompt modal
   */
  const handleCloseImagePrompt = React.useCallback(() => {
    setImagePromptOpen(false);
    setPendingImage(null);
    setImagePrompt("");
  }, [setPendingImage, setImagePrompt]);

  const handleImagePromptSubmit = React.useCallback(async () => {
    if (!pendingImage) return;
    
    setImagePromptOpen(false);
    // Use the context's handleImageAnalysis function
    await handleImageAnalysis(pendingImage, imagePrompt);
  }, [pendingImage, imagePrompt, handleImageAnalysis]);

  return (
    <>
      {!isArticlesPage ? (
        <div 
          className="relative flex flex-col min-h-screen"
          role="main"
        >
          <IntroTour />
          
          {/* Modals */}
          <ImagePromptModal
            isOpen={imagePromptOpen}
            pendingImage={pendingImage}
            imagePrompt={imagePrompt}
            setImagePrompt={setImagePrompt}
            onSubmit={handleImagePromptSubmit}
            onClose={handleCloseImagePrompt}
          />
          
          <CameraModal
            isOpen={isCameraOpen}
            onCapture={handleCameraCapture}
            onClose={handleCloseCamera}
          />
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            aria-hidden="true"
          />
          
          <div 
            className={`w-full flex flex-col h-screen ${!conversationStarted && !isMobile ? 'justify-center' : 'justify-between'}`}
            role="region"
            aria-label="Chat interface"
          >
            <div className={`flex flex-col items-center w-full max-w-3xl mx-auto p-4 md:p-8 ${conversationStarted || isMobile ? 'h-full justify-between' : ''}`}>
              
              {/* Welcome headers - only shown when conversation hasn't started and not on mobile */}
              {!conversationStarted && !isMobile && (
                <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
                  <h1 className="text-4xl font-bold mb-2">Welcome to Qub-IT</h1>
                  <h2 className="text-xl text-muted-foreground">Your AI-powered IT support assistant</h2>
                </div>
              )}
              
              {/* Welcome headers - mobile version with smaller text */}
              {!conversationStarted && isMobile && (
                <div className="text-center mb-4 mt-12 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
                  <h1 className="text-3xl font-bold mb-1">Welcome to Qub-IT</h1>
                  <h2 className="text-lg text-muted-foreground">Your AI-powered IT support assistant</h2>
                </div>
              )}
              
              {/* Conversation Area - Separate from input form */}
              {(messages.length > 0 || isLoading) && (
                <div 
                  className="w-full flex-1 mb-2.5 md:mb-3 flex flex-col"
                  role="log"
                  aria-label="Conversation history"
                >
                  <ScrollArea className={`${isMobile ? 'h-[calc(100vh-180px)]' : 'h-[calc(100vh-160px)]'} w-full`}>
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
                              {/* Display image if message has image data */}
                              {message.image && (
                                <div className="mb-3">
                                  <div 
                                    className="relative rounded-lg overflow-hidden inline-block cursor-pointer"
                                    onClick={() => handleImageClick(message.image as string)}
                                  >
                                    <Image 
                                      src={message.image}
                                      alt="Uploaded image"
                                      width={150}
                                      height={150}
                                      className="object-cover rounded-lg border border-border transition-transform hover:scale-105"
                                      style={{ maxHeight: '150px', maxWidth: '150px' }}
                                    />
                                  </div>
                                </div>
                              )}
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
                              {/* Skeleton loading with smooth animation */}
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
              )}
              
              {/* Input Form */}
              <div 
                className={`w-full p-4 md:p-6 rounded-2xl bg-background border border-input flex flex-col ${conversationStarted || isMobile ? 'sticky bottom-0 mt-auto' : ''}`}
                role="form"
                aria-label="Message input form"
              >
                <div className="flex items-center gap-2 md:gap-4">
                  {!isArticlesPage && (
                    <>
                      {/* Qubit AI icon - now with theme-based logo */}
                      <div
                        className="p-2"
                        aria-label="Qubit AI icon"
                      >
                        <img
                          src={logoSrc}
                          alt="Qubit AI"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                      </div>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="plus-button p-2 hover:bg-accent rounded-full transition-colors"
                            aria-label="Toggle options"
                          >
                            {showHistory ? (
                              <X className="w-5 h-5" aria-hidden="true" />
                            ) : (
                              <Plus className="w-5 h-5" aria-hidden="true" />
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48" align="start" side="top" sideOffset={5}>
                          <div className="flex flex-col space-y-2">
                            <button
                              className="flex items-center space-x-2 p-2 hover:bg-accent rounded-lg transition-colors w-full cursor-pointer"
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
                                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded-lg transition-colors w-full cursor-pointer"
                                >
                                  <History className="w-5 h-5" />
                                  <span>History</span>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64" align="start" side="right" sideOffset={5}>
                                <ScrollArea className="h-[300px] w-full">
                                  <div className="space-y-4" role="list" aria-label="Chat history">
                                    {mockTickets.map((ticket) => (
                                      <div
                                        key={ticket.id}
                                        className="p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendClick();
                        }
                      }}
                      placeholder="Type your message here..."
                      className="w-full px-4 py-2 rounded-full bg-background border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Message input"
                      role="textbox"
                      aria-expanded={matchingArticles.length > 0}
                    />
                    {matchingArticles.length > 0 && (
                      <div 
                        className="absolute bottom-full left-0 w-full mb-2 bg-background border border-border rounded-lg shadow-lg"
                        role="listbox"
                        aria-label="Matching articles"
                      >
                        <ScrollArea className="max-h-[200px]">
                          <div className="p-2 space-y-2">
                            {matchingArticles.map((article) => (
                              <div
                                key={article.id}
                                onClick={() => handleArticleSuggestionClick(article.id)}
                                className="p-2 hover:bg-accent/50 rounded-md cursor-pointer"
                                role="option"
                                aria-selected="false"
                              >
                                <h3 className="font-medium">{article.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {article.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                    <button
                      onClick={handleSendClick}
                      disabled={!text || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Articles page container
        <div className="articles-page-container animate-in fade-in-50 duration-300">
          <div className="flex flex-col h-screen">
            <div className="flex-1 p-4 md:p-8">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Knowledge Base</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockArticles.map((article) => (
                    <div
                      key={article.id}
                      className="p-4 border border-border rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
                      onClick={() => router.push(`/articles/${article.id}`)}
                    >
                      <h2 className="text-lg font-medium">{article.title}</h2>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {article.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Input form for articles page */}
            <div className="p-4 md:p-6 border-t border-border bg-background">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4">
                  <button
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                    onClick={() => setShowHistory(!showHistory)}
                    aria-label="Toggle history"
                  >
                    {showHistory ? (
                      <X className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <History className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={text}
                      onChange={handleTextChange}
                      placeholder="Search knowledge base..."
                      className="w-full px-4 py-2 rounded-full bg-background border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Search input"
                    />
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-full transition-colors"
                      aria-label="Search"
                    >
                      <ScrollText className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                
                {showHistory && (
                  <div className="mt-4 border border-border rounded-lg p-4 animate-in fade-in-50 slide-in-from-top-5 duration-300">
                    <h3 className="font-medium mb-3">Recent Searches</h3>
                    <div className="space-y-2">
                      {mockTickets.slice(0, 5).map((ticket) => (
                        <div
                          key={ticket.id}
                          className="p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                        >
                          <p className="text-sm">{ticket.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Overlay */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out"
          onClick={handleCloseZoom}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div className="relative max-w-[90vw] max-h-[90vh] animate-in zoom-in-90 duration-300 ease-in-out">
            <Image
              src={zoomedImage as string}
              alt="Enlarged image"
              width={800}
              height={600}
              className="object-contain rounded-lg max-h-[90vh]"
            />
          </div>
        </div>
      )}
  </>
  );
}