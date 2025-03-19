"use client"

import * as React from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"

interface AIMessageProps {
  content: string;
  isLoading?: boolean;
  image?: string;
}

export function AIMessage({ content, isLoading = false, image }: AIMessageProps) {
  // Process content to replace placeholder with actual description
  const processedContent = React.useMemo(() => {
    // Check if content contains the placeholder pattern
    if (content.includes("[image description]")) {
      // Replace placeholder with a more meaningful message
      return content.replace(
        "[image description]", 
        "the image you've uploaded"
      );
    }
    return content;
  }, [content]);

  return (
    <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/30">
          <Image
            src="/qubit-ai.svg"
            alt="Qub-IT Logo"
            width={24}
            height={24}
            priority
            style={{ filter: 'brightness(1)' }}
            aria-hidden="true"
          />
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
            {/* Display image if provided */}
            {image && (
              <div className="mb-3">
                <div className="relative rounded-lg overflow-hidden inline-block">
                  <Image 
                    src={image}
                    alt="Uploaded image"
                    width={150}
                    height={150}
                    className="object-cover rounded-lg border border-border"
                    style={{ maxHeight: '150px', maxWidth: '150px' }}
                  />
                </div>
              </div>
            )}
            <MarkdownRenderer content={processedContent} />
          </>
        )}
      </div>
    </div>
  );
}