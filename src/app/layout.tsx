import { ThemeProvider } from "@/components/theme-provider"
import { ChatProvider } from "@/components/chat/ChatContext"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qubit AI",
  description: "Qubit AI – Your Smart Tech Assistant! 🚀 Instantly troubleshoot technical issues with AI-powered solutions. Fast, reliable, and easy to use. Try it now!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        >
          <ChatProvider>
            {children}
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
