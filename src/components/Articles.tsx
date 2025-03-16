"use client"

import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Article } from "@/types/article"
import { mockArticles } from "@/data/mock-articles"

/** Props interface for the Articles component */
interface ArticlesProps {
  /** Callback function triggered when article expansion state changes */
  onExpansionChange?: (expanded: boolean) => void
}

/**
 * Articles Component
 * 
 * A responsive article list and viewer component that displays a list of articles
 * and allows users to expand individual articles for detailed reading.
 * 
 * Features:
 * - Responsive grid layout
 * - Article preview cards with images
 * - Expandable article view
 * - Semantic HTML structure
 * - Keyboard accessibility
 * - Custom event handling
 * 
 * @component
 * @param {ArticlesProps} props - Component props
 */
export function Articles({ onExpansionChange }: ArticlesProps) {
  /** State to track the currently expanded article ID */
  const [expandedArticle, setExpandedArticle] = React.useState<string | null>(null)

  /**
   * Effect to handle custom expandArticle events
   * Listens for external triggers to expand articles
   */
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

  /** Handle article card click to expand the article */
  const handleArticleClick = React.useCallback((articleId: string) => {
    setExpandedArticle(articleId)
    onExpansionChange?.(true)
  }, [onExpansionChange])

  /** Handle back button click to collapse the expanded article */
  const handleBackClick = React.useCallback(() => {
    setExpandedArticle(null)
    onExpansionChange?.(false)
  }, [onExpansionChange])

  return (
    <ScrollArea className="flex-1 w-full px-4 md:px-8 py-6">
      {expandedArticle ? (
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleBackClick}
            className="mb-4 p-2 hover:bg-accent rounded-full transition-colors"
            aria-label="Back to articles"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          {mockArticles.map((article) => (
            article.id === expandedArticle && (
              <div key={article.id} className="space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h2 className="text-2xl font-bold">{article.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {article.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">{article.description}</p>
                <div className="mt-6 space-y-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{article.content}</p>
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          {mockArticles.map((article) => (
            <div
              key={article.id}
              className="p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors cursor-pointer"
              onClick={() => handleArticleClick(article.id)}
            >
              <div className="flex items-start gap-4">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h2 className="font-bold hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {article.timestamp.toLocaleString()}
                  </p>
                  <p className="mt-2 text-muted-foreground line-clamp-2">
                    {article.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  )
}