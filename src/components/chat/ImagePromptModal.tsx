"use client"

import * as React from "react"
import { X } from "lucide-react"
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

interface ImagePromptModalProps {
  isOpen: boolean;
  pendingImage: string | null;
  imagePrompt: string;
  setImagePrompt: (prompt: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function ImagePromptModal({
  isOpen,
  pendingImage,
  imagePrompt,
  setImagePrompt,
  onSubmit,
  onClose
}: ImagePromptModalProps) {
  const [showCloseDialog, setShowCloseDialog] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  // Handle animation on open
  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Reset animation state after animation completes
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent className="animate-in fade-in-50 zoom-in-90 duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle>Close Window</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this window? Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="transition-all duration-200 hover:scale-105">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onClose} className="transition-all duration-200 hover:scale-105">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in-50 duration-300" 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowCloseDialog(true);
          }
        }}
      >
        <div className={`bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-4 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 ${isAnimating ? 'scale-in' : ''}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold animate-in fade-in-50 slide-in-from-left-5 duration-300" style={{ animationDelay: '100ms' }}>Add Image Description</h2>
            <button 
              onClick={() => setShowCloseDialog(true)}
              className="p-2 hover:bg-accent rounded-full transition-all duration-200 hover:scale-110"
              aria-label="Close prompt"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-muted max-h-[400px] flex items-center justify-center animate-in fade-in-50 zoom-in-95 duration-300" style={{ animationDelay: '150ms' }}>
              {pendingImage && (
                <img 
                  src={pendingImage} 
                  alt="Preview" 
                  className="max-w-full max-h-[400px] object-contain transition-opacity duration-300"
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
                  onSubmit();
                }
              }}
              placeholder="Describe what you want to know about this image..."
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 animate-in fade-in-50 slide-in-from-bottom-3 duration-300"
              style={{ animationDelay: '200ms' }}
              autoFocus
            />
            <button
              onClick={onSubmit}
              disabled={!pendingImage}
              className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:translate-y-[-2px] animate-in fade-in-50 slide-in-from-bottom-3 duration-300"
              style={{ animationDelay: '250ms' }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}