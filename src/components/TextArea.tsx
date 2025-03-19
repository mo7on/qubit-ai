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
import { useChatContext } from "@/components/chat/ChatContext"

// Add this import at the top with other imports
import { useTheme } from "next-themes"

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
  // State for UI elements not related to chat functionality
  const [showHistory, setShowHistory] = React.useState(false);
  
  // File upload related state and refs
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [imagePromptOpen, setImagePromptOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Use the chat context for shared state
  const { 
    messages, 
    setMessages,
    isLoading, 
    setIsLoading,
    conversationStarted,
    setConversationStarted,
    pendingImage,
    setPendingImage,
    imagePrompt,
    setImagePrompt,
    matchingArticles,
    setMatchingArticles,
    // handleSendMessage is already destructured from context above, removing duplicate declaration
    handleImageAnalysis
  } = useChatContext();
  
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
   * @param value - Text value from the input element
   */
  const handleTextChange = React.useCallback((value: string) => {
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
  }, [setMatchingArticles]);

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

  // Use the handleSendMessage from context instead of redefining it here
  const { handleSendMessage } = useChatContext();

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
                  handleFileUploadClick={handleFileUploadClick}
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