"use client"

import * as React from "react"
import { ModeToggle } from "@/components/ModeToggle"
import { TextArea } from "@/components/TextArea"

/**
 * Articles Page Component
 * 
 * Main page component for displaying article history and related functionality.
 * Integrates the theme toggle and TextArea components in a responsive layout.
 * 
 * Features:
 * - Theme switching capability
 * - Responsive design for various screen sizes
 * - Integration with TextArea component for history display
 * 
 * @component
 */
export default function ArticlesPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <div className="flex-1 flex items-end w-full">
        <TextArea />
      </div>
    </main>
  )
}