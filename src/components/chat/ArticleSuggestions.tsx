"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockArticles } from "@/data/mock-articles"

interface ArticleSuggestionsProps {
  articles?: typeof mockArticles;
  onArticleClick: (articleId: string) => void;
}

export function ArticleSuggestions({ articles, onArticleClick }: ArticleSuggestionsProps) {
  if (!articles || articles.length === 0) return null;
  
  return (
    <div 
      className="absolute bottom-full left-0 w-full mb-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden"
      role="listbox"
      aria-label="Matching articles"
    >
      <ScrollArea className="max-h-[300px]">
        <div className="py-2">
          <h4 className="px-3 pb-2 text-sm font-semibold text-muted-foreground border-b">Suggested Articles</h4>
          <div className="mt-1">
            {articles.map((article, index) => (
              <div
                key={article.id}
                onClick={() => onArticleClick(article.id)}
                className="px-3 py-2.5 hover:bg-accent/50 cursor-pointer transition-all duration-200 hover:translate-y-[-1px] animate-in fade-in-50 duration-300 border-b border-border/40 last:border-b-0"
                style={{ animationDelay: `${index * 50}ms` }}
                role="option"
                aria-selected="false"
              >
                <h3 className="font-medium text-sm mb-1">{article.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {article.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}