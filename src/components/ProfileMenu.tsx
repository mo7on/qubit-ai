"use client"

import * as React from "react"
import { User } from "lucide-react"
import { useTheme } from "next-themes"

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

export function ProfileMenu() {
  const [systemInfo, setSystemInfo] = React.useState(mockSystemInfo)

  const handleLanguageChange = (value: string) => {
    setSystemInfo(prev => ({ ...prev, language: value }))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2" aria-label="Open profile menu">
          <span>Login</span>
          <User className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuItem className="cursor-pointer">
          Login
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>System Information</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="p-2 space-y-2">
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
            <Select value={systemInfo.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
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