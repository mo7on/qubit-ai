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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/** Interface for system information state */
interface SystemInfo {
  manufacturer: string
  model: string
  language: string
}

/** Interface for user information state */
interface UserInfo {
  firstName: string
}

/**
 * ProfileMenu Component
 * 
 * A dropdown menu component that displays user profile options and system information.
 * This component provides user authentication, device information management,
 * theme selection, and other profile-related functionalities.
 * 
 * Features:
 * - User authentication (login/logout)
 * - Name management with character limit
 * - Device information management
 * - Theme selection (light/dark/system)
 * - Responsive design with semantic HTML
 * - Accessibility support with ARIA attributes
 * 
 * @component
 */
export function ProfileMenu() {
  // System and device information state
  const [systemInfo, setSystemInfo] = React.useState<SystemInfo>(mockSystemInfo)
  const [deviceInfo, setDeviceInfo] = React.useState<SystemInfo>(mockSystemInfo)
  
  // User information state
  const [nameInfo, setNameInfo] = React.useState<UserInfo>({ firstName: '' })
  
  // Temporary state for form editing
  const [tempDeviceInfo, setTempDeviceInfo] = React.useState<SystemInfo>(mockSystemInfo)
  const [tempNameInfo, setTempNameInfo] = React.useState<UserInfo>({ firstName: '' })
  
  // UI state
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [isDeviceOpen, setIsDeviceOpen] = React.useState(false)
  const [isNameOpen, setIsNameOpen] = React.useState(false)
  const [isThemeOpen, setIsThemeOpen] = React.useState(false)
  
  // Hooks
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  /**
   * Check authentication status on component mount
   * by verifying the presence of authentication cookie
   */
  React.useEffect(() => {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('isAuthenticated='))
    setIsAuthenticated(!!cookie)
  }, [])

  /**
   * Handle language change in system settings
   * @param value - The selected language value
   */
  const handleLanguageChange = React.useCallback((value: string) => {
    setSystemInfo(prev => ({ ...prev, language: value }))
  }, [])

  // Add this new function to handle dropdown menu state
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  // Modify the return statement
  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          aria-label="Open profile menu"
          aria-haspopup="true"
        >
          <span>{isAuthenticated ? 'Logout' : 'Login'}</span>
          <User className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[240px]"
        role="menu"
        aria-label="Profile options"
        onInteractOutside={(e) => {
          // Prevent closing the menu if a popover is open
          if (isNameOpen || isDeviceOpen) {
            e.preventDefault()
          }
        }}
      >
        {!isAuthenticated ? (
          <div className="text-center px-2 py-3">
            <p className="text-sm mb-2">Create an account or sign in to keep all your tickets</p>
            <Button 
              className="w-full" 
              onClick={() => router.push('/login')}
            >
              Login
            </Button>
          </div>
        ) : (
          <div className="text-center px-2 py-3">
            <Button 
              className="w-full" 
              onClick={() => {
                document.cookie = 'isAuthenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
                setIsAuthenticated(false);
                router.push('/');
              }}
            >
              Logout
            </Button>
          </div>
        )}
        <DropdownMenuSeparator />
        <div className="p-2 space-y-2" role="group" aria-label="User information">
          <div className="flex justify-between items-center hover:bg-accent/50 rounded-md px-2 py-1.5 cursor-pointer transition-colors duration-200" onClick={() => setIsNameOpen(true)}>
            <span className="text-sm">Name</span>
            <Popover open={isNameOpen} onOpenChange={setIsNameOpen}>
              <PopoverTrigger asChild>
                <div className="text-sm font-medium text-right">
                  <div className="truncate max-w-[140px]">
                    {nameInfo.firstName || '-'}
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-4 space-y-3" align="end">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      setIsNameOpen(false);
                      // Reset temp state to match current state
                      setTempNameInfo({ firstName: nameInfo.firstName });
                    }}
                    aria-label="Go back"
                  >
                    ←
                  </Button>
                  <span className="font-medium">Edit Name</span>
                </div>
                <div className="space-y-2">
                  <textarea
                    className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-offset-2"
                    value={tempNameInfo.firstName}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 10);
                      setTempNameInfo({ firstName: value });
                    }}
                    placeholder="Name (max 10 characters)"
                    rows={2}
                    maxLength={10}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTempNameInfo({ firstName: '' })
                      setNameInfo({ firstName: '' })
                      setIsNameOpen(false)
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={() => {
                      if (tempNameInfo.firstName.trim()) {
                        setNameInfo({ firstName: tempNameInfo.firstName })
                        setIsNameOpen(false)
                      }
                    }}
                  >
                    Save
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-between items-center hover:bg-accent/50 rounded-md px-2 py-1.5 cursor-pointer transition-colors duration-200" onClick={() => setIsDeviceOpen(true)}>
            <span className="text-sm">Device</span>
            <Popover open={isDeviceOpen} onOpenChange={setIsDeviceOpen}>
              <PopoverTrigger asChild>
                <div className="text-sm font-medium text-right">
                  <div className="truncate max-w-[140px]">
                    {deviceInfo.manufacturer || deviceInfo.model ? 
                      `${deviceInfo.manufacturer || ''} ${deviceInfo.model || ''}`.trim() : 
                      '-'
                    }
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-4 space-y-3" align="end">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      setIsDeviceOpen(false);
                      // Reset temp state to match current state
                      setTempDeviceInfo(deviceInfo);
                    }}
                    aria-label="Go back"
                  >
                    ←
                  </Button>
                  <span className="font-medium">Edit Device Info</span>
                </div>
                <div className="space-y-2">
                  <textarea
                    className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-offset-2"
                    value={tempDeviceInfo.manufacturer}
                    onChange={(e) => setTempDeviceInfo(prev => ({ ...prev, manufacturer: e.target.value }))}
                    placeholder="Manufacturer"
                    rows={2}
                  />
                  <textarea
                    className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-offset-2"
                    value={tempDeviceInfo.model}
                    onChange={(e) => setTempDeviceInfo(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Model"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTempDeviceInfo({ manufacturer: '', model: '', language: systemInfo.language })
                      setDeviceInfo({ manufacturer: '', model: '', language: systemInfo.language })
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={() => {
                      if (tempDeviceInfo.manufacturer.trim() || tempDeviceInfo.model.trim()) {
                        setDeviceInfo({
                          manufacturer: tempDeviceInfo.manufacturer,
                          model: tempDeviceInfo.model,
                          language: systemInfo.language
                        })
                        setIsDeviceOpen(false)
                      }
                    }}
                  >
                    Save
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-between items-center hover:bg-accent/50 rounded-md px-2 py-1.5 cursor-pointer transition-colors duration-200" onClick={() => setIsThemeOpen(true)}>
            <span className="text-sm">Theme</span>
            <Popover open={isThemeOpen} onOpenChange={setIsThemeOpen}>
              <PopoverTrigger asChild>
                <div className="text-sm font-medium text-right">
                  <div className="truncate max-w-[140px]">
                    {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-2" align="end">
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => {
                      setTheme('light');
                      setIsThemeOpen(false);
                    }}
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => {
                      setTheme('dark');
                      setIsThemeOpen(false);
                    }}
                  >
                    Dark
                  </Button>
                </div>
                <div className="mt-2">
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => {
                      setTheme('system');
                      setIsThemeOpen(false);
                    }}
                  >
                    System
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-between items-center hover:bg-accent/50 rounded-md px-2 py-1.5 cursor-pointer transition-colors duration-200">
            <span className="text-sm">About</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="p-2 flex justify-center gap-3 text-xs">
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/faq" className="hover:underline">FAQ</a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}