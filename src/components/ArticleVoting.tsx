import React, { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ArticleVotingProps {
  articleId: string;
  onVote?: (articleId: string, voteType: 'up' | 'down') => void;
}

export function ArticleVoting({ articleId, onVote }: ArticleVotingProps) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);

  const handleVote = (voteType: 'up' | 'down') => {
    // If already voted this type, remove vote. Otherwise set to this vote type
    const newVote = vote === voteType ? null : voteType;
    setVote(newVote);
    
    if (onVote && newVote) {
      onVote(articleId, newVote);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-4 mt-8 border-t pt-4">
      <p className="text-sm text-muted-foreground mr-2">Was this article helpful?</p>
      
      <button 
        onClick={() => handleVote('up')}
        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors ${
          vote === 'up' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'hover:bg-accent/50'
        }`}
        aria-label="Like article"
      >
        <ThumbsUp className="w-4 h-4 mr-1" />
        <span>Yes</span>
      </button>
      
      <button 
        onClick={() => handleVote('down')}
        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors ${
          vote === 'down' 
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
            : 'hover:bg-accent/50'
        }`}
        aria-label="Dislike article"
      >
        <ThumbsDown className="w-4 h-4 mr-1" />
        <span>No</span>
      </button>
    </div>
  );
}