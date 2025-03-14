/**
 * Mock Ticket Data
 * 
 * Simulated ticket history data for development and testing purposes.
 * Each ticket includes a unique ID, timestamp, and content.
 */
export interface Ticket {
  id: string
  timestamp: Date
  content: string
}

export const mockTickets: Ticket[] = [
  {
    id: "1",
    timestamp: new Date("2024-02-20T10:30:00"),
    content: "How do I reset my password?"
  },
  {
    id: "2",
    timestamp: new Date("2024-02-19T15:45:00"),
    content: "Network connectivity issues in meeting room 3"
  },
  {
    id: "3",
    timestamp: new Date("2024-02-18T09:15:00"),
    content: "Request for software installation"
  },
  {
    id: "4",
    timestamp: new Date("2024-02-17T14:20:00"),
    content: "Printer not responding on 2nd floor"
  },
  {
    id: "5",
    timestamp: new Date("2024-02-16T11:00:00"),
    content: "Email sync problems on mobile device"
  }
]