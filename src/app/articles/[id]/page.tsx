"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { X } from "lucide-react"
import { mockArticles } from "@/data/mock-articles"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { ArticleVoting } from "@/components/ArticleVoting";

export default function ArticlePage() {
  const router = useRouter()
  const params = useParams()
  const [article, setArticle] = useState<typeof mockArticles[0] | null>(null)

  useEffect(() => {
    const articleId = params?.id as string
    if (articleId) {
      const foundArticle = mockArticles.find(a => a.id === articleId)
      if (foundArticle) {
        setArticle(foundArticle)
      } else {
        // Article not found, redirect back to home
        router.push('/')
      }
    }
  }, [params, router])

  const handleClose = () => {
    router.push('/')
  }

  if (!article) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">{article.title}</h1>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            aria-label="Close article"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
          <MarkdownRenderer content={article.content || article.description} />
        </div>
        
        {/* Add the voting component at the end */}
        <ArticleVoting 
          articleId={article.id} 
          onVote={(articleId, voteType) => {
            // Here you can implement logic to save the vote to your backend
            console.log(`Article ${articleId} received a ${voteType} vote`);
          }} 
        />
      </div>
    </div>
  )
}

