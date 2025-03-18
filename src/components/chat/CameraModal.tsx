"use client"

import * as React from "react"
import { X } from "lucide-react"
import { CameraCapture } from "@/components/CameraCapture"

interface CameraModalProps {
  isOpen: boolean;
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export function CameraModal({ isOpen, onCapture, onClose }: CameraModalProps) {
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in-50 duration-300">
      <div className={`bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-4 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 ${isAnimating ? 'scale-in' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold animate-in fade-in-50 slide-in-from-left-5 duration-300">Take a Photo</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="animate-in fade-in-50 zoom-in-95 duration-300" style={{ animationDelay: '150ms' }}>
          <CameraCapture
            onCapture={onCapture}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}