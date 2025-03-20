"use client"

import * as React from "react"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { MessageAvatar } from "./MessageAvatar"

interface MessageProps {
  message: {
    content: string;
    role: string;
    image?: string;
  };
}

/**
 * Message Component
 * 
 * A component that renders a single chat message with support for markdown content,
 * images, and role-based styling. Uses the MessageAvatar component for consistent
 * avatar display across the chat interface.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.message - The message object containing content and metadata
 * @param {string} props.message.content - The text content of the message
 * @param {string} props.message.role - The role of the message sender ('user' or 'assistant')
 * @param {string} [props.message.image] - Optional image URL to display with the message
 */
export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div 
      className={`flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-300`}
      role="listitem"
      aria-label={`${isUser ? 'User' : 'Assistant'} message`}
    >
      <MessageAvatar role={message.role} />
      <div
        className="flex-1 max-w-[85%] text-foreground p-2 rounded-lg animate-in fade-in-50 slide-in-from-left-3 duration-300"
      >
        {message.image && (
          <div className="mb-3">
            <div className="relative rounded-lg overflow-hidden inline-block">
              <img
                src={message.image}
                alt="Message attachment"
                className="max-w-[150px] max-h-[150px] object-cover rounded-lg border border-border"
              />
            </div>
          </div>
        )}
        <MarkdownRenderer content={message.content} />
      </div>
    </div>
  );
}