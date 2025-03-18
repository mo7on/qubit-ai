"use client"

import * as React from "react"
import { User } from "lucide-react"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/30">
          <User className="w-5 h-5 text-foreground" aria-hidden="true" />
        </div>
      </div>
      <div className="flex-1 max-w-[85%] text-foreground p-2 rounded-lg">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}