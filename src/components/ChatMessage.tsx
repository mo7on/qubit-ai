import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
  content: string;
  isAI: boolean;
  // Add other props as needed
}

export function ChatMessage({ content, isAI }: ChatMessageProps) {
  return (
    <div className={`chat-message ${isAI ? 'ai-message' : 'user-message'}`}>
      {isAI ? (
        <MarkdownRenderer content={content} />
      ) : (
        <p>{content}</p>
      )}
    </div>
  );
}