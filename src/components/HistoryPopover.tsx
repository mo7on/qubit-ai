import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { History as HistoryIcon } from "lucide-react"
import { useTicketHistory } from "@/hooks/useTicketHistory"
import { ChatMessage } from "@/components/ChatMessage"
import type { Ticket } from "@/hooks/useTicketHistory"
import { useRouter } from "next/navigation"

export function HistoryPopover() {
  const { tickets, loading, error } = useTicketHistory();
  const router = useRouter();

  const handleTicketClick = (conversationId: string) => {
    router.push(`/conversation/${conversationId}`);
  };

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
          
          {!loading && !error && tickets.length === 0 && (
            <p className="text-sm text-muted-foreground">No conversation history yet.</p>
          )}
          
          {tickets.map((ticket: Ticket) => (
            <div 
              key={ticket.id} 
              className="border-b pb-2 last:border-b-0 cursor-pointer hover:bg-accent/50 rounded-md p-2"
              onClick={() => handleTicketClick(ticket.conversation_id)}
            >
              <div className="text-xs text-muted-foreground mb-1">
                {ticket.timestamp.toLocaleString()}
              </div>
              <div className="font-medium text-sm mb-1">{ticket.summary}</div>
              <ChatMessage content={ticket.content} isAI={true} isHistoryItem={true} />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}