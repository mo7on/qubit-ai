"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockArticles } from "@/data/mock-articles"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { useState } from "react"
interface Article {
  id: string;
  title: string;
  description: string;
  content?: string;
}

interface ArticleSuggestionsProps {
  articles?: typeof mockArticles;
  onArticleClick: (articleId: string) => void;
}

export function ArticleSuggestions({ articles, onArticleClick }: ArticleSuggestionsProps) {
  if (!articles || articles.length === 0) return null;
  
  const [votes, setVotes] = useState<Record<string, 'up' | 'down' | null>>({});

  const handleVote = (articleId: string, voteType: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent article click when voting
    
    setVotes((prev: Record<string, 'up' | 'down' | null>) => {
      // If already voted this type, remove vote. Otherwise set to this vote type
      const newVote = prev[articleId] === voteType ? null : voteType;
      return { ...prev, [articleId]: newVote };
    });
  };

  return (
    <div 
      className="absolute bottom-full left-0 w-full mb-2 bg-background border border-border rounded-lg shadow-lg"
      role="listbox"
      aria-label="Matching articles"
    >
      <ScrollArea className="max-h-[200px]">
        <div className="p-2 space-y-2">
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => onArticleClick(article.id)}
              className="p-2 hover:bg-accent/50 rounded-md cursor-pointer"
              role="option"
              aria-selected="false"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium">{article.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {article.description}
                  </p>
                </div>
                
                {article.content && (
                  <div className="flex items-center space-x-1 ml-2">
                    <button 
                      onClick={(e) => handleVote(article.id, 'up', e)}
                      className={`p-1 rounded-full hover:bg-accent/70 transition-colors ${
                        votes[article.id] === 'up' ? 'text-green-500 bg-accent/50' : ''
                      }`}
                      aria-label="Like article"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleVote(article.id, 'down', e)}
                      className={`p-1 rounded-full hover:bg-accent/70 transition-colors ${
                        votes[article.id] === 'down' ? 'text-red-500 bg-accent/50' : ''
                      }`}
                      aria-label="Dislike article"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}