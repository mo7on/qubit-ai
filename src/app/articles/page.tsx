"use client"

import * as React from "react"
import { ModeToggle } from "@/components/ModeToggle"
import { TextArea } from "@/components/TextArea"
import { Articles } from "@/components/Articles"

export default function ArticlesPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <div className="flex-1 flex flex-col">
        <Articles />
        <div className="w-full bg-background">
          <TextArea />
        </div>
      </div>
    </main>
  )
}