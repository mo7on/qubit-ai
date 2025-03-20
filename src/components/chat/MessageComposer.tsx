"use client"

import * as React from "react"
import { Send } from "lucide-react"

interface MessageComposerProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

/**
 * MessageComposer Component
 * 
 * A focused component that handles text input and message sending functionality.
 * It provides a clean interface for users to type and send messages.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onSendMessage - Callback function to handle message sending
 * @param {boolean} props.isLoading - Loading state to disable input during processing
 * @param {string} [props.placeholder] - Optional placeholder text for the input field
 */
export function MessageComposer({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Type your message here..."
}: MessageComposerProps) {
  // State for managing input text
  const [text, setText] = React.useState<string>("");

  // Memoized handler for text changes
  const handleTextChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  // Memoized handler for sending messages
  const handleSend = React.useCallback(() => {
    if (!text.trim() || isLoading) return;
    onSendMessage(text);
    setText("");
  }, [text, isLoading, onSendMessage]);

  // Handler for keyboard events (Enter to send)
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="flex-1 relative textbar-container">
      <input
        type="text"
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-full bg-background border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Message input"
        role="textbox"
        disabled={isLoading}
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
  );
}