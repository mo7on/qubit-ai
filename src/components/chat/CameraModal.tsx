"use client"

import * as React from "react"
import { X } from "lucide-react"
import { CameraCapture } from "@/components/CameraCapture"

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Take a Photo</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors cursor-pointer"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <CameraCapture
          onCapture={onCapture}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}