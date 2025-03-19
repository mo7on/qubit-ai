import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { HistoryIcon } from 'lucide-react';
import { useTicketHistory, Ticket } from '../hooks/useTicketHistory';
import { ChatMessage } from './ChatMessage';

export function HistoryPopover() {
  const { tickets, loading, error } = useTicketHistory();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <HistoryIcon className="h-4 w-4" />
          <span className="sr-only">History</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Conversation History</h3>
          
          {loading && <p className="text-sm text-muted-foreground">Loading history...</p>}
          
          {error && (
            <div className="p-2 bg-destructive/10 text-destructive rounded-md text-sm">
              Error: {error}
            </div>
          )}
          
          {!loading && tickets.length === 0 && (
            <p className="text-sm text-muted-foreground">No history found.</p>
          )}
          
          {tickets.map((ticket: Ticket) => (
            <div key={ticket.id} className="border-b pb-2 last:border-b-0">
              <div className="text-xs text-muted-foreground mb-1">
                {ticket.timestamp.toLocaleString()}
              </div>
              <ChatMessage content={ticket.content} isAI={true} isHistoryItem={true} />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}