"use client"

import * as React from "react"
import { Camera, Send, Paperclip, ScrollText, History, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockTickets } from "@/lib/mock-tickets"
import { mockArticles } from "@/data/mock-articles"
import { IntroTour } from "@/components/IntroTour"
import { ArticlesTour } from "@/components/ArticlesTour"
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

// TODO: Create and implement CameraCapture component
// For now, using a temporary interface to avoid type errors
interface CameraCapture {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

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
  const [messages, setMessages] = React.useState<{role: string; content: string}[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Add new state for camera and file upload
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
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
  const handleTextChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    
    // Update matching articles when input length is greater than 2
    if (value.length > 2) {
      const matches = mockArticles.filter(article => 
        article.title.toLowerCase().includes(value.toLowerCase()) ||
        article.description.toLowerCase().includes(value.toLowerCase())
      );
      setMatchingArticles(matches);
    } else {
      setMatchingArticles([]);
    }
  }, []);

  /**
   * Handles navigation to the articles page
   */
  const handleArticlesClick = React.useCallback(() => {
    if (!isArticlesPage) {
      router.push("/articles");
    }
  }, [isArticlesPage, router]);

  /**
   * Handles sending messages to Gemini API
   */
  const handleSendMessage = React.useCallback(async () => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setText("");

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
  }, [text, isLoading]);

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
      reader.onloadend = async () => {
        const base64String = reader.result?.toString().split(',')[1];
        
        if (base64String) {
          setIsLoading(true);
          
          // Add user message with image placeholder
          setMessages(prev => [...prev, { 
            role: 'user', 
            content: 'Uploaded image for analysis' 
          }]);
          
          try {
            // Send to backend for processing
            const response = await fetch('/api/gemini/image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                imageData: base64String,
                prompt: "Analyze this image and provide IT support assistance if needed."
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
          }
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
  const handleCameraCapture = React.useCallback(async (imageSrc: string) => {
    try {
      setIsCameraOpen(false);
      setIsLoading(true);
      
      // Add user message with image placeholder
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: 'Captured image for analysis' 
      }]);
      
      // Extract base64 data
      const base64String = imageSrc.split(',')[1];
      
      // Send to backend for processing
      const response = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageData: base64String,
          prompt: "Analyze this image and provide IT support assistance if needed."
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
      console.error('Error processing camera image:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your image. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div 
      className={`relative flex flex-col min-h-screen ${isArticlesPage ? '' : 'md:items-center md:justify-center'}`}
      role="main"
    >
      {isArticlesPage ? <ArticlesTour /> : <IntroTour />}
      
      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Take a Photo</h2>
              <button 
                onClick={handleCloseCamera}
                className="p-2 hover:bg-accent rounded-full transition-colors"
                aria-label="Close camera"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Placeholder for CameraCapture component implementation */}
            <div>Camera capture functionality not yet implemented</div>
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
        className={`w-full ${isArticlesPage ? 'fixed bottom-0 left-0 right-0' : 'fixed md:static bottom-0 left-0 right-0'}`}
        role="region"
        aria-label="Chat interface"
      >
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto space-y-4 p-4 md:p-8">
          {!isArticlesPage && (
            <div className="w-full text-center md:static fixed top-8 left-0 right-0 px-4">
              <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2">Welcome to Qub-IT!</h1>
              <h2 className="text-lg md:text-xl text-muted-foreground mb-8">The first ever IT Assistant AI chatbot.</h2>
            </div>
          )}
          
          <div 
            className={`w-full p-4 md:p-6 rounded-2xl ${isArticlesPage ? 'bg-background' : 'bg-muted/20'} border border-border`}
            role="form"
            aria-label="Message input form"
          >
            <div className="mb-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {isArticlesPage && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="history-button p-2 hover:bg-accent rounded-full transition-colors"
                      aria-label="Toggle history"
                      aria-expanded={showHistory}
                    >
                      <History className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
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
              )}
              {!isArticlesPage && (
                <button
                  onClick={handleArticlesClick}
                  className="articles-button p-2 hover:bg-accent rounded-full transition-colors"
                  aria-label="Go to articles"
                >
                  <ScrollText className="w-5 h-5" aria-hidden="true" />
                </button>
              )}

              <button
                className="photo-upload-button p-2 hover:bg-accent rounded-full transition-colors"
                aria-label="Upload image"
                onClick={handleFileUploadClick}
              >
                <Paperclip className="w-5 h-5" aria-hidden="true" />
              </button>

              <div className="flex-1 relative textbar-container">
                <input
                  type="text"
                  value={text}
                  onChange={handleTextChange}
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
                            onClick={() => {}}
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
                  onClick={text ? handleSendMessage : handleCameraClick}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={text ? "Send message" : "Take photo"}
                >
                  {text ? (
                    <Send className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Camera className="w-4 h-4" aria-hidden="true" />
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