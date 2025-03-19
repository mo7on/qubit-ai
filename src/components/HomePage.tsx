/**
 * HomePage Component
 * 
 * The main layout component that structures the application's primary interface.
 * Features:
 * - Responsive layout with full viewport height
 * - Fixed position ModeToggle in top-right corner
 * - Mobile-optimized TextArea placement
 */
import { ProfileMenu } from "@/components/ProfileMenu"
import { TextArea } from "@/components/TextArea"
import { useEffect, useState } from "react"

export function HomePage() {
  const [isMobile, setIsMobile] = useState(false);

  // Detect if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on initial load
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className="min-h-screen w-full relative">
      {/* Profile menu button positioned in top-right corner */}
      <div className="absolute top-4 right-4 z-50">
        <ProfileMenu />
      </div>
      {/* Main content area */}
      <div className={`flex flex-col min-h-screen ${isMobile ? 'justify-between' : ''}`}>
        <TextArea isMobile={isMobile} />
      </div>
    </div>
  )
}