"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockArticles } from "@/data/mock-articles"

interface ArticleSuggestionsProps {
  articles: typeof mockArticles;
  onArticleClick: (articleId: string) => void;
}

export function ArticleSuggestions({ articles, onArticleClick }: ArticleSuggestionsProps) {
  if (articles.length === 0) return null;
  
  return (
    <div 
      className="absolute bottom-full left-0 w-full mb-2 bg-background border border-border rounded-lg shadow-lg"
      role="listbox"
      aria-label="Matching articles"
    >
      <ScrollArea className="max-h-[200px]">
        <div className="p-2 space-y-2">
          {articles.map((article, index) => (
            <div
              key={article.id}
              onClick={() => onArticleClick(article.id)}
              className="p-2 hover:bg-accent/50 rounded-md cursor-pointer transition-all duration-200 hover:translate-y-[-2px] animate-in fade-in-50 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
              role="option"
              aria-selected="false"
            >
              <h3 className="font-medium">{article.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {article.description}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}