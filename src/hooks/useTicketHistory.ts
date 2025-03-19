import { useState, useEffect } from 'react';

// Define the Ticket interface directly in this file to avoid dependency on mock data
export interface Ticket {
  id: string;
  timestamp: Date;
  content: string;
}

export function useTicketHistory() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true);
        const response = await fetch('/api/tickets');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tickets: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Convert string timestamps to Date objects if needed
        const formattedTickets = data.map((ticket: any) => ({
          ...ticket,
          timestamp: new Date(ticket.timestamp)
        }));
        
        setTickets(formattedTickets);
      } catch (err) {
        console.error('Error fetching ticket history:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  return { tickets, loading, error };
}