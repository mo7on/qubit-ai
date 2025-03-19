import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface Ticket {
  id: string;
  conversation_id: string;
  summary: string;
  content: string;
  timestamp: Date;
  user_id: string;
}

export function useTicketHistory() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Fetch conversation history from backend API
        const response = await fetch('/api/conversation-history', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch conversation history');
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
          // Transform the data to match the Ticket interface
          const formattedTickets: Ticket[] = data.data.history.map((item: any) => ({
            id: item.id,
            conversation_id: item.conversation_id,
            summary: item.summary,
            content: item.summary, // Using summary as content for display
            timestamp: new Date(item.created_at),
            user_id: item.user_id
          }));
          
          setTickets(formattedTickets);
        } else {
          throw new Error(data.message || 'Unknown error occurred');
        }
      } catch (err: any) {
        console.error('Error fetching history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchHistory();
  }, []);
  
  return { tickets, loading, error };
}