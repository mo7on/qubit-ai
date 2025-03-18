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

interface ImageUploadModalProps {
  isOpen: boolean;
  image: string | null;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
}

export function ImageUploadModal({ isOpen, image, onClose, onSubmit }: ImageUploadModalProps) {
  const [showCloseDialog, setShowCloseDialog] = React.useState(false);
  const [imagePrompt, setImagePrompt] = React.useState("");

  if (!isOpen) return null;

  return (
    <>
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
              onClose();
              setImagePrompt("");
              setShowCloseDialog(false);
            }}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              {image && (
                <img 
                  src={image} 
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
                  onSubmit(imagePrompt);
                }
              }}
              placeholder="Describe what you want to know about this image..."
              className="w-full px-4 py-2 rounded-lg bg-background border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              onClick={() => onSubmit(imagePrompt)}
              disabled={!image}
              className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}