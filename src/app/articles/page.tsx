"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ProfileMenu } from "@/components/ProfileMenu"
import { TextArea } from "@/components/TextArea"
import { Articles } from "@/components/Articles"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { mockArticles } from "@/data/mock-articles"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ArticlesPage() {
  const router = useRouter()
  const [isArticleExpanded, setIsArticleExpanded] = React.useState(false)
  const [searchText, setSearchText] = React.useState("")
  const [matchingArticles, setMatchingArticles] = React.useState(mockArticles.slice(0, 0))

  const handleArticleExpansion = (expanded: boolean) => {
    setIsArticleExpanded(expanded)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchText(value)

    if (value.length <= 2) {
      setMatchingArticles([])
      return
    }

    const matches = mockArticles.filter(article =>
      article.title.toLowerCase().includes(value.toLowerCase()) ||
      article.description.toLowerCase().includes(value.toLowerCase())
    )
    setMatchingArticles(matches)
  }

  const handleContinueToAI = () => {
    // Store the search text in localStorage
    localStorage.setItem("pendingAIQuery", searchText)
    // Clear the search
    setSearchText("")
    setMatchingArticles([])
    // Navigate to home
    router.push("/")
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ProfileMenu />
      </div>
      <div className="flex-1 flex flex-col">
        <Articles onExpansionChange={handleArticleExpansion} />
        {!isArticleExpanded && (
          <div className="w-full bg-background">
            <TextArea />
          </div>
        )}
      </div>
      {/* Search bar section with shadow and spacing */}
      <div className="sticky bottom-0 pt-6 pb-4 bg-gradient-to-t from-background to-transparent">
        <div className="max-w-2xl mx-auto relative">
          <Input
            type="text"
            value={searchText}
            onChange={handleSearch}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-input"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          
          {/* Search results dropdown */}
          {matchingArticles.length > 0 && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-background border border-border rounded-lg shadow-lg">
              <ScrollArea className="max-h-[200px]">
                <div className="p-2 space-y-2">
                  {matchingArticles.map((article) => (
                    <div
                      key={article.id}
                      className="p-2 hover:bg-accent/50 rounded-md cursor-pointer"
                      onClick={() => {
                        setSearchText("")
                        setMatchingArticles([])
                        // Dispatch custom event to expand the article
                        window.dispatchEvent(
                          new CustomEvent('expandArticle', {
                            detail: { articleId: article.id }
                          })
                        )
                      }}
                    >
                      <h3 className="font-medium">{article.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{article.description}</p>
                    </div>
                  ))}
                  <div
                    className="p-2 hover:bg-accent/50 rounded-md cursor-pointer"
                    onClick={handleContinueToAI}
                  >
                    <h3 className="font-medium">Continue to Qub-IT AI</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">Get AI assistance with your query</p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}