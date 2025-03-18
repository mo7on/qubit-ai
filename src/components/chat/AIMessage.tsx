"use client"

import * as React from "react"
import { Bot } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"

interface AIMessageProps {
  content: string;
  sources?: { url: string; description: string }[];
  isLoading?: boolean;
}

export function AIMessage({ content, sources, isLoading = false }: AIMessageProps) {
  return (
    <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/30">
          <Bot className="w-5 h-5 text-foreground" aria-hidden="true" />
        </div>
      </div>
      <div className="flex-1 max-w-[85%] text-foreground p-2 rounded-lg">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <Skeleton className="h-4 w-[80%] bg-accent/50 dark:bg-accent/30 transition-opacity duration-300" />
            <Skeleton className="h-4 w-[60%] bg-accent/50 dark:bg-accent/30 transition-opacity duration-300 delay-100" />
            <Skeleton className="h-4 w-[70%] bg-accent/50 dark:bg-accent/30 transition-opacity duration-300 delay-200" />
          </div>
        ) : (
          <>
            <MarkdownRenderer content={content} />
            {sources && (
              <div className="mt-4 space-y-2">
                {sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <p className="text-sm font-medium">{source.description}</p>
                    <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}