"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronDown } from "lucide-react"
import Link from "next/link"

export default function FAQPage() {
  // State to track which accordion item is open
  const [openItem, setOpenItem] = React.useState<string | null>(null);
  
  // Toggle function for accordion items
  const toggleItem = (itemId: string) => {
    setOpenItem(openItem === itemId ? null : itemId);
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mb-8">
            Find answers to common questions about using Qub-IT.
          </p>
          
          {/* Custom accordion implementation */}
          <div className="w-full space-y-4">
            {/* FAQ Item 1 */}
            <div className="bg-background/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <button 
                onClick={() => toggleItem('item-1')}
                className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
              >
                <span className="text-lg font-medium">What is Qub-IT?</span>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ease-in-out ${openItem === 'item-1' ? 'transform rotate-180' : ''}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openItem === 'item-1' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 pt-0 text-muted-foreground">
                  <p>
                    Qub-IT is an AI-powered IT support assistant designed to help you troubleshoot and resolve common technical issues. It provides instant answers to your IT questions and can guide you through solving various computer problems.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="bg-background/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <button 
                onClick={() => toggleItem('item-2')}
                className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
              >
                <span className="text-lg font-medium">How do I use the chat feature?</span>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ease-in-out ${openItem === 'item-2' ? 'transform rotate-180' : ''}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openItem === 'item-2' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 pt-0 text-muted-foreground">
                  <p>
                    Simply type your IT-related question or describe your technical issue in the chat box at the bottom of the screen and press enter or click the send button. Qub-IT will analyze your query and provide relevant assistance.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="bg-background/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <button 
                onClick={() => toggleItem('item-3')}
                className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
              >
                <span className="text-lg font-medium">Can I upload images of my problem?</span>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ease-in-out ${openItem === 'item-3' ? 'transform rotate-180' : ''}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openItem === 'item-3' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 pt-0 text-muted-foreground">
                  <p>
                    Yes You can upload screenshots or photos of error messages or issues you are experiencing. Click the camera or upload button next to the chat input, and Qub-IT will analyze the image to provide more accurate assistance.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 4 */}
            <div className="bg-background/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <button 
                onClick={() => toggleItem('item-4')}
                className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
              >
                <span className="text-lg font-medium">How do I access the Knowledge Base?</span>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ease-in-out ${openItem === 'item-4' ? 'transform rotate-180' : ''}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openItem === 'item-4' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 pt-0 text-muted-foreground">
                  <p>
                    You can access our Knowledge Base by clicking on the Articles or Knowledge Base option in the main navigation. The Knowledge Base contains comprehensive guides for common IT issues.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 5 */}
            <div className="bg-background/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <button 
                onClick={() => toggleItem('item-5')}
                className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
              >
                <span className="text-lg font-medium">Is my conversation data private?</span>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ease-in-out ${openItem === 'item-5' ? 'transform rotate-180' : ''}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openItem === 'item-5' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 pt-0 text-muted-foreground">
                  <p>
                    Yes, we take your privacy seriously. Your conversations are processed securely and are not shared with third parties. For more details, please refer to our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 6 */}
            <div className="bg-background/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <button 
                onClick={() => toggleItem('item-6')}
                className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
              >
                <span className="text-lg font-medium">How can I navigate the site more easily?</span>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ease-in-out ${openItem === 'item-6' ? 'transform rotate-180' : ''}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openItem === 'item-6' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 pt-0 text-muted-foreground">
                  <p>
                    Our site is designed to be intuitive and easy to navigate. The main chat interface is accessible from the home page, and you can access other features through the menu in the top-right corner.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Cannot find what you are looking for? Contact us at <a href="mailto:nourhazzouri55@gmail.com" className="text-primary hover:underline">nourhazzouri55@gmail.com</a>.
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}