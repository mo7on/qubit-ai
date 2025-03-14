"use client"

import * as React from "react"
import { ProfileMenu } from "@/components/ProfileMenu"
import { TextArea } from "@/components/TextArea"
import { Articles } from "@/components/Articles"

export default function ArticlesPage() {
  const [isArticleExpanded, setIsArticleExpanded] = React.useState(false)

  const handleArticleExpansion = (expanded: boolean) => {
    setIsArticleExpanded(expanded)
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
    </main>
  )
}