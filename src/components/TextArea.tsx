"use client"

import * as React from "react"
import { Camera, Send, Paperclip, ScrollText, History, User, Bot, X, Plus } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { mockTickets } from "@/lib/mock-tickets"
import { mockArticles } from "@/data/mock-articles"
import { IntroTour } from "@/components/IntroTour"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

import { CameraCapture } from "@/components/CameraCapture"
import { Skeleton } from "@/components/ui/skeleton"

// Remove the temporary interface since we now have the actual component
// Delete these lines:
// interface CameraCapture {
//   onCapture: (imageSrc: string) => void;
//   onCancel: () => void;
// }

/** Interface for upload options in the text area component */
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
 * 
 * @component
 */
export function TextArea() {
  // State management for user input and UI elements
  const [text, setText] = React.useState<string>("");
  const [showHistory, setShowHistory] = React.useState(false);
  const [matchingArticles, setMatchingArticles] = React.useState<typeof mockArticles>([]);
  const [messages, setMessages] = React.useState<{role: string; content: string; sources?: { url: string; description: string }[]}[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [conversationStarted, setConversationStarted] = React.useState(false);

  // Check for pending AI query from articles page
  React.useEffect(() => {
    const pendingQuery = localStorage.getItem("pendingAIQuery");
    if (pendingQuery) {
      setText(pendingQuery);
      localStorage.removeItem("pendingAIQuery");
      // Automatically send the message
      handleSendMessage();
    }
  }, []);
  
  // Add new state for camera and file upload
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [imagePromptOpen, setImagePromptOpen] = React.useState(false);
  const [pendingImage, setPendingImage] = React.useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = React.useState("");
  const [showCloseDialog, setShowCloseDialog] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Navigation hooks
  const router = useRouter();
  const pathname = usePathname();

  // Page context determination
  const isArticlesPage = pathname === "/articles";

  // Memoized upload options to prevent unnecessary re-renders
  const uploadOptions = React.useMemo<UploadOption[]>(() => [
    { value: "document", label: "Upload Document" },
    { value: "photo", label: "Upload Photo" }
  ], []);

  /**
   * Handles text input changes and updates article suggestions
   * @param e - Change event from the input element
   */
  const handleTextChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
  }, []);

  // Add article suggestion click handler
  const handleArticleSuggestionClick = React.useCallback((articleId: string) => {
    setText("");
    setMatchingArticles([]);
    
    // Navigate to the article page with the article ID
    router.push(`/articles/${articleId}`);
    
    // Dispatch custom event to expand the article
    window.dispatchEvent(
      new CustomEvent('expandArticle', {
        detail: { articleId }
      })
    );
  }, [router]);

  const handleSendMessage = React.useCallback(async () => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setText("");
    setMatchingArticles([]); // Clear suggestions after sending message

    // First, get Tavily search results
    try {
      const tavilyResponse = await fetch('/api/tavily/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    
    // Mark conversation as started when first message is sent
    if (!conversationStarted) {
      setConversationStarted(true);
    }

    try {
      const response = await fetch('/api/gemini/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from Gemini');
      }

      const assistantMessage = { role: 'assistant', content: data.data };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add a user-friendly error message to the chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
    } catch (error) {
      console.error('Error in Tavily search:', error);
      // Add a user-friendly error message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error searching for relevant information. Proceeding with direct response.' 
      }]);
    }

    // Mark conversation as started when first message is sent
    if (!conversationStarted) {
      setConversationStarted(true);
    }

    try {
      const response = await fetch('/api/gemini/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from Gemini');
      }

      const assistantMessage = { role: 'assistant', content: data.data };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add a user-friendly error message to the chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [text, isLoading, conversationStarted]);

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
  }, []);

  /**
   * Handles camera capture
   */
  const handleCameraCapture = React.useCallback((imageSrc: string) => {
    setIsCameraOpen(false);
    setPendingImage(imageSrc);
    setImagePromptOpen(true);
  }, []);

  const handleImagePromptSubmit = React.useCallback(async () => {
    if (!pendingImage) return; // Remove imagePrompt.trim() check

    try {
      setIsLoading(true);
      setImagePromptOpen(false);
      
      // Add user message with image placeholder
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: imagePrompt.trim() 
          ? `Image analysis request: ${imagePrompt}` 
          : 'Image analysis request'
      }]);
      
      // Extract base64 data
      const base64String = pendingImage.split(',')[1];
      
      // Send to backend for processing
      const response = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageData: base64String,
          prompt: imagePrompt.trim() || 'Analyze this image' // Provide default prompt if empty
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }
      
      // Add AI response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.data 
      }]);
    } catch (error) {
      console.error('Error processing image:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your image. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
      setPendingImage(null);
      setImagePrompt("");
    }
  }, [pendingImage, imagePrompt]);

  return (
    <>
      {!isArticlesPage ? (
        <div 
          className="relative flex flex-col min-h-screen"
          role="main"
        >
          <IntroTour />
          
          {/* Image Prompt Modal */}
          <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Close Window</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to close this window? Any unsaved changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                  setImagePromptOpen(false);
                  setPendingImage(null);
                  setImagePrompt("");
                  setShowCloseDialog(false);
                }}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {imagePromptOpen && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCloseDialog(true);
              }
            }}>
              <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Add Image Description</h2>
                  <button 
                    onClick={() => setShowCloseDialog(true)}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                    aria-label="Close prompt"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                    {pendingImage && (
                      <img 
                        src={pendingImage} 
                        alt="Preview" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleImagePromptSubmit();
                      }
                    }}
                    placeholder="Describe what you want to know about this image..."
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button
                    onClick={handleImagePromptSubmit}
                    disabled={!pendingImage} // Remove imagePrompt.trim() condition
                    className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Camera Modal */}
          {isCameraOpen && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Take a Photo</h2>
                  <button 
                    onClick={handleCloseCamera}
                    className="p-2 hover:bg-accent rounded-full transition-colors cursor-pointer"
                    aria-label="Close camera"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <CameraCapture
                  onCapture={handleCameraCapture}
                  onCancel={handleCloseCamera}
                />
              </div>
            </div>
          )}
          
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
            className={`w-full flex flex-col h-screen ${!conversationStarted ? 'justify-center' : 'justify-between'}`}
            role="region"
            aria-label="Chat interface"
          >
            <div className={`flex flex-col items-center w-full max-w-3xl mx-auto p-4 md:p-8 ${conversationStarted ? 'h-full justify-between' : ''}`}>
              {/* Welcome headings removed */}
              
              {/* Conversation Area - Separate from input form */}
              {(messages.length > 0 || isLoading) && (
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
                className={`w-full p-4 md:p-6 rounded-2xl bg-background border border-input flex flex-col ${conversationStarted ? 'sticky bottom-0 mt-auto' : ''}`}
                role="form"
                aria-label="Message input form"
              >
                <div className="flex items-center gap-2 md:gap-4">
                  {!isArticlesPage && (
                    <>
                      {/* Qubit AI icon - now unclickable */}
                      <div
                        className="p-2"
                        aria-label="Qubit AI icon"
                      >
                        <img
                          src="/qubit-ai.svg"
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTextChange(e as unknown as React.ChangeEvent<HTMLTextAreaElement>)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
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
                      onClick={handleSendMessage}
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
        // Removed ArticlesTour component
        <div className="articles-page-container">
          {/* Replace with appropriate content for articles page */}
        </div>
      )}
    </>
  );
}