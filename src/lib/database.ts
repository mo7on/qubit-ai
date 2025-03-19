import { Article } from "@/types/article"
import { Ticket } from "@/hooks/useTicketHistory"

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

export async function getArticlesFromDatabase(): Promise<Article[]> {
  try {
    // Fetch articles from the backend API
    const response = await fetch('/api/articles');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Convert string timestamps to Date objects
    return data.map((article: any) => ({
      ...article,
      timestamp: new Date(article.timestamp)
    }));
  } catch (error) {
    console.error('Error fetching articles from database:', error);
    // Return empty array on error to avoid breaking the UI
    return [];
  }
}