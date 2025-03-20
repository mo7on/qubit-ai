"use client"

import * as React from "react"
import { User, Bot } from "lucide-react"

interface MessageAvatarProps {
  role: string;
  className?: string;
}

/**
 * MessageAvatar Component
 * 
 * A reusable component that renders either a user or bot avatar based on the message role.
 * Provides consistent styling and animation for message avatars across the chat interface.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.role - The role of the message sender ('user' or 'assistant')
 * @param {string} [props.className] - Optional additional CSS classes
 */
export function MessageAvatar({ role, className = '' }: MessageAvatarProps) {
  return (
    <div className={`flex-shrink-0 animate-in fade-in-50 zoom-in-50 duration-300 ${className}`}>
      {role === 'user' ? (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/30 transition-all duration-200 hover:bg-accent/50"
          role="img"
          aria-label="User avatar"
        >
          <User className="w-5 h-5 text-foreground" aria-hidden="true" />
        </div>
      ) : (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/30 transition-all duration-200 hover:bg-accent/50"
          role="img"
          aria-label="Bot avatar"
        >
          <Bot className="w-5 h-5 text-foreground" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}