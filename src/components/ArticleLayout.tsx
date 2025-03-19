"use client"

import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Article } from "@/types/article"
import { MarkdownRenderer } from "./MarkdownRenderer"

interface ArticleLayoutProps {
  articles: Article[]
  expandedArticle: string | null
  onArticleClick: (articleId: string) => void
  onBackClick: () => void
}

export function ArticleLayout({ articles, expandedArticle, onArticleClick, onBackClick }: ArticleLayoutProps) {
  return (
    <ScrollArea className="flex-1 w-full px-4 md:px-8 py-6">
      {expandedArticle ? (
        <div className="max-w-3xl mx-auto">
          <button
            onClick={onBackClick}
            className="mb-4 p-2 hover:bg-accent rounded-full transition-colors"
            aria-label="Back to articles"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          {articles.map((article) => (
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
                <div className="mt-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6 rounded-lg">
                  <MarkdownRenderer content={article.content} />
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors cursor-pointer"
              onClick={() => onArticleClick(article.id)}
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