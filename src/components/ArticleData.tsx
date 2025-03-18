"use client"

import * as React from "react"
import { mockArticles } from "@/data/mock-articles"
import { ArticleLayout } from "./ArticleLayout"

interface ArticleDataProps {
  onExpansionChange?: (expanded: boolean) => void
}

export function ArticleData({ onExpansionChange }: ArticleDataProps) {
  const [expandedArticle, setExpandedArticle] = React.useState<string | null>(null)

  React.useEffect(() => {
    const handleExpandArticle = (event: CustomEvent<{ articleId: string }>) => {
      setExpandedArticle(event.detail.articleId)
      onExpansionChange?.(true)
    }

    window.addEventListener('expandArticle', handleExpandArticle as EventListener)
    return () => {
      window.removeEventListener('expandArticle', handleExpandArticle as EventListener)
    }
  }, [onExpansionChange])

  const handleArticleClick = React.useCallback((articleId: string) => {
    setExpandedArticle(articleId)
    onExpansionChange?.(true)
  }, [onExpansionChange])

  const handleBackClick = React.useCallback(() => {
    setExpandedArticle(null)
    onExpansionChange?.(false)
  }, [onExpansionChange])

  return (
    <ArticleLayout
      articles={mockArticles}
      expandedArticle={expandedArticle}
      onArticleClick={handleArticleClick}
      onBackClick={handleBackClick}
    />
  )
}