"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import { MessageActions } from "@/components/ui/message-actions"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="markdown-content">
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-medium mb-2" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
            p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
            code: ({ inline, ...props }: { inline?: boolean } & React.HTMLProps<HTMLElement>) => (
              <code
                className={inline ? "bg-gray-800 px-1 py-0.5 rounded" : "block bg-gray-800 p-4 rounded-lg overflow-x-auto"}
                {...props}
              />
            ),
            pre: ({ node, ...props }) => <pre className="mb-4" {...props} />,
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-gray-600 pl-4 italic mb-4" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      <MessageActions content={content} />
    </div>
  )
}