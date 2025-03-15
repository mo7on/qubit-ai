"use client"

import * as React from "react"
import { User } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockSystemInfo, languageOptions } from "@/data/mock-system"
import { ModeToggle } from "./ModeToggle"

/** Interface for system information state */
interface SystemInfo {
  manufacturer: string
  model: string
  language: string
}

/**
 * ProfileMenu Component
 * 
 * A dropdown menu component that displays user profile options and system information.
 * Features:
 * - User authentication options
 * - System information display
 * - Language selection
 * - Theme toggle
 * 
 * @component
 */
export function ProfileMenu() {
  const [systemInfo, setSystemInfo] = React.useState<SystemInfo>(mockSystemInfo)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('isAuthenticated='))
    setIsAuthenticated(!!cookie)
  }, [])

  /**
   * Handles language selection change
   * @param value - The selected language value
   */
  const handleLanguageChange = React.useCallback((value: string) => {
    setSystemInfo(prev => ({ ...prev, language: value }))
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {!isAuthenticated ? (
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            aria-label="Open profile menu"
            aria-haspopup="true"
          >
            <span>Login</span>
            <User className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            aria-label="Open profile menu"
            aria-haspopup="true"
          >
            <span>Profile</span>
            <User className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[240px]"
        role="menu"
        aria-label="Profile options"
      >
        {!isAuthenticated ? (
          <DropdownMenuItem 
            className="cursor-pointer" 
            role="menuitem"
            onClick={() => router.push('/login')}
          >
            Login
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem 
            className="cursor-pointer" 
            role="menuitem"
            onClick={() => {
              document.cookie = 'isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
              setIsAuthenticated(false);
              router.push('/');
            }}
          >
            Logout
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>System Information</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="p-2 space-y-2" role="group" aria-label="System information">
          <div className="flex justify-between items-center">
            <span className="text-sm">Manufacturer</span>
            <span className="text-sm font-medium">{systemInfo.manufacturer}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Model</span>
            <span className="text-sm font-medium">{systemInfo.model}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Language</span>
            <Select 
              value={systemInfo.language} 
              onValueChange={handleLanguageChange}
              aria-label="Select language"
            >
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(option => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    role="option"
                    aria-selected={systemInfo.language === option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Theme</span>
            <ModeToggle />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}