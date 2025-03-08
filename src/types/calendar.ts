// Define the core calendar event type used throughout the application
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  start: Date;
  end?: Date;
  colorId?: string;
  color?: string;
} 