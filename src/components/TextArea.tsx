"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { mockTickets } from "@/lib/mock-tickets"
import { mockArticles } from "@/data/mock-articles"
import { IntroTour } from "@/components/IntroTour"

// Import our new modular components
import { MessageList } from "@/components/chat/MessageList"
import { ChatInput } from "@/components/chat/ChatInput"
import { CameraModal } from "@/components/chat/CameraModal"
import { ImagePromptModal } from "@/components/chat/ImagePromptModal"

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
  const handleTextChange = React.useCallback((value: string) => {
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

    // Mark conversation as started when first message is sent
    if (!conversationStarted) {
      setConversationStarted(true);
    }

    try {
      // Only make one request to Gemini API
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

  /**
   * Handles closing the image prompt modal
   */
  const handleCloseImagePrompt = React.useCallback(() => {
    setImagePromptOpen(false);
    setPendingImage(null);
    setImagePrompt("");
  }, []);

  const handleImagePromptSubmit = React.useCallback(async () => {
    if (!pendingImage) return;

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
            className={`w-full flex flex-col h-screen transition-all duration-500 ease-in-out ${!conversationStarted ? 'justify-center' : 'justify-between'}`}
            role="region"
            aria-label="Chat interface"
          >
            <div className={`flex flex-col items-center w-full max-w-3xl mx-auto p-4 md:p-8 transition-all duration-500 ease-in-out ${conversationStarted ? 'h-full justify-between' : ''}`}>
              {/* Message List Component with transition */}
              <div className={`w-full transition-all duration-500 ease-in-out ${conversationStarted ? 'opacity-100' : 'opacity-0'}`}>
                <MessageList 
                  messages={messages}
                  isLoading={isLoading}
                  conversationStarted={conversationStarted}
                />
              </div>
              
              {/* Chat Input Component with transition */}
              <div className={`w-full transition-all duration-300 ease-in-out ${!conversationStarted ? 'transform-gpu translate-y-0' : 'transform-gpu translate-y-0'}`}>
                <ChatInput
                  text={text}
                  setText={handleTextChange}
                  handleSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  handleFileUploadClick={handleFileUploadClick}
                  matchingArticles={matchingArticles}
                  handleArticleSuggestionClick={handleArticleSuggestionClick}
                  isArticlesPage={isArticlesPage}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Articles page container
        <div className="articles-page-container animate-in fade-in-50 duration-300">
          {/* Replace with appropriate content for articles page */}
        </div>
      )}
    </>
  );
}