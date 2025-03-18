"use client"

import * as React from "react"
import { Paperclip, History, Plus, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TicketHistoryItem {
  id: string;
  timestamp: Date;
  content: string;
}

interface UploadOptionsProps {
  onFileUpload: () => void;
  tickets: TicketHistoryItem[];
}

export function UploadOptions({ onFileUpload, tickets }: UploadOptionsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="plus-button p-2 hover:bg-accent rounded-full transition-colors"
          aria-label="Toggle options"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="start" side="top" sideOffset={5}>
        <div className="flex flex-col space-y-2">
          <button
            className="flex items-center space-x-2 p-2 hover:bg-accent rounded-lg transition-colors w-full cursor-pointer"
            onClick={() => {
              onFileUpload();
              const trigger = document.querySelector('.plus-button') as HTMLButtonElement;
              trigger?.click();
            }}
          >
            <Paperclip className="w-5 h-5" />
            <span>Attachment</span>
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex items-center space-x-2 p-2 hover:bg-accent rounded-lg transition-colors w-full cursor-pointer"
              >
                <History className="w-5 h-5" />
                <span>History</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start" side="right" sideOffset={5}>
              <ScrollArea className="h-[300px] w-full">
                <div className="space-y-4" role="list" aria-label="Chat history">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      role="listitem"
                    >
                      <p className="text-sm text-muted-foreground">
                        {ticket.timestamp.toLocaleString()}
                      </p>
                      <p className="mt-1">{ticket.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </PopoverContent>
    </Popover>
  );
}