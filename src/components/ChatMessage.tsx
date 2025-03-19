import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
  content: string;
  isAI: boolean;
  isHistoryItem?: boolean;
  // Add other props as needed
}

export function ChatMessage({ content, isAI, isHistoryItem = false }: ChatMessageProps) {
  return (
    <div className={`chat-message ${isAI ? 'ai-message' : 'user-message'} ${isHistoryItem ? 'history-item' : ''}`}>
      {isAI ? (
        <MarkdownRenderer content={content} />
      ) : (
        <p>{content}</p>
      )}
    </div>
  );
}