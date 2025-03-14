"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * ThemeProvider Component
 * 
 * A wrapper component that provides theme context to the application using next-themes.
 * Enables seamless theme switching and persistence across the application.
 * 
 * Features:
 * - Automatic theme detection and application
 * - Smooth theme transitions
 * - Theme persistence across page reloads
 * 
 * @param props - Props inherited from NextThemesProvider
 * @param props.children - Child components that will have access to theme context
 * 
 * @component
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
