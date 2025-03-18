"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Article {
  id: string;
  title: string;
  description: string;
}

interface ArticleSuggestionsProps {
  matchingArticles: Article[];
  onArticleClick: (articleId: string) => void;
}

export function ArticleSuggestions({ matchingArticles, onArticleClick }: ArticleSuggestionsProps) {
  if (matchingArticles.length === 0) return null;

  return (
    <div 
      className="absolute bottom-full left-0 w-full mb-2 bg-background border border-border rounded-lg shadow-lg"
      role="listbox"
      aria-label="Matching articles"
    >
      <ScrollArea className="max-h-[200px]">
        <div className="p-2 space-y-2">
          {matchingArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => onArticleClick(article.id)}
              className="p-2 hover:bg-accent/50 rounded-md cursor-pointer"
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