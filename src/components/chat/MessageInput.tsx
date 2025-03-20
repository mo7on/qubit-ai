"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"
import { mockArticles } from "@/data/mock-articles"
import { ArticleSuggestions } from "./ArticleSuggestions"
import { MessageComposer } from "./MessageComposer"
import { AttachmentHandler } from "./AttachmentHandler"
import { CameraModal } from "./CameraModal"
import { ImageUploadModal } from "./ImageUploadModal"

interface Ticket {
  id: string;
  title: string;
}

const mockTickets: Ticket[] = [];  // Define empty tickets array

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  conversationStarted: boolean;
  isArticlesPage: boolean;
}

export function MessageInput({ onSendMessage, isLoading, conversationStarted, isArticlesPage }: MessageInputProps) {
  const [text, setText] = React.useState<string>("");
  const [matchingArticles, setMatchingArticles] = React.useState<typeof mockArticles>([]);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [imagePromptOpen, setImagePromptOpen] = React.useState(false);
  const [pendingImage, setPendingImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleTextChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    
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

  const handleSend = React.useCallback(() => {
    if (!text.trim() || isLoading) return;
    onSendMessage(text);
    setText("");
    setMatchingArticles([]);
  }, [text, isLoading, onSendMessage]);

  const handleFileUploadClick = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString();
        if (base64String) {
          setPendingImage(base64String);
          setImagePromptOpen(true);
        }
      };
      reader.readAsDataURL(file);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
  }, []);

  return (
    <div 
      className={`w-full p-4 md:p-6 rounded-2xl bg-background border border-input flex flex-col ${conversationStarted ? 'sticky bottom-0 mt-auto' : ''}`}
      role="form"
      aria-label="Message input form"
    >
      <div className="flex items-center gap-2 md:gap-4">
        {!isArticlesPage && (
          <>
            <button
              onClick={() => router.push('/articles')}
              className="p-2 hover:bg-accent rounded-full transition-colors"
              aria-label="Go to articles"
            >
              <img
                src="/qubit-ai.svg"
                alt="Qubit AI"
                width={20}
                height={20}
                className="w-5 h-5 cursor-pointer"
              />
            </button>
            
            <AttachmentHandler
              onImageUpload={(image, prompt) => {
                if (prompt) {
                  onSendMessage(prompt);
                }
              }}
              isArticlesPage={isArticlesPage}
            />
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
                handleSend();
              }
            }}
            placeholder="Type your message here..."
            className="w-full px-4 py-2 rounded-full bg-background border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Message input"
            role="textbox"
            aria-expanded={matchingArticles.length > 0}
          />

          <ArticleSuggestions
            articles={matchingArticles}
            onArticleClick={() => {}}
          />

          <button
            onClick={handleSend}
            disabled={!text || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-hidden="true"
      />

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(imageSrc) => {
          setIsCameraOpen(false);
          setPendingImage(imageSrc);
          setImagePromptOpen(true);
        }}
      />

      <ImageUploadModal
        isOpen={imagePromptOpen}
        image={pendingImage}
        onClose={() => {
          setImagePromptOpen(false);
          setPendingImage(null);
        }}
        onSubmit={async (prompt) => {
          if (!pendingImage) return;
          setImagePromptOpen(false);
          onSendMessage(prompt || 'Analyze this image');
          setPendingImage(null);
        }}
      />
    </div>
  );
}