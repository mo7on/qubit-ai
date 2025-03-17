"use client"

import * as React from "react"
import { ThumbsUp, ThumbsDown, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MessageActionsProps {
  content: string
}

export function MessageActions({ content }: MessageActionsProps) {
  const [copied, setCopied] = React.useState(false)
  const [liked, setLiked] = React.useState(false)
  const [disliked, setDisliked] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const handleLike = () => {
    setLiked(!liked)
    if (disliked) setDisliked(false)
  }

  const handleDislike = () => {
    setDisliked(!disliked)
    if (liked) setLiked(false)
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLike}
        className={liked ? "text-green-500" : ""}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDislike}
        className={disliked ? "text-red-500" : ""}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className={copied ? "text-green-500" : ""}
      >
        {copied ? (
          <Check className="h-4 w-4" />
          ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}