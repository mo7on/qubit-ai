// Database utility for fetching ticket history from the backend
import { Ticket } from '../hooks/useTicketHistory';

/**
 * Fetches ticket history from the backend API
 * 
 * @returns Promise<Ticket[]> Array of ticket history items
 */
export async function getTicketsFromDatabase(): Promise<Ticket[]> {
  try {
    // Fetch tickets from the backend API
    const response = await fetch('/api/history');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tickets: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Convert string timestamps to Date objects
    return data.map((ticket: any) => ({
      ...ticket,
      timestamp: new Date(ticket.timestamp)
    }));
  } catch (error) {
    console.error('Error fetching tickets from database:', error);
    // Return empty array on error to avoid breaking the UI
    return [];
  }
}