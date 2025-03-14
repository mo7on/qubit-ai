/**
 * HomePage Component
 * 
 * The main layout component that structures the application's primary interface.
 * Features:
 * - Responsive layout with full viewport height
 * - Fixed position ModeToggle in top-right corner
 * - Mobile-optimized TextArea placement
 */
import { ModeToggle } from "@/components/ModeToggle"
import { TextArea } from "@/components/TextArea"

export function HomePage() {
  return (
    <div className="min-h-screen w-full relative">
      {/* Theme toggle button positioned in top-right corner */}
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      {/* Main content area with padding for ModeToggle */}
      <div className="flex flex-col min-h-screen">
        <TextArea />
      </div>
    </div>
  )
}