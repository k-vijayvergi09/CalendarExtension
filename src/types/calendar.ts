export interface Event {
  id: string;
  title: string;
  description?: string;
  date?: Date;
  start?: Date;
  end?: Date;
  color?: string; // User-defined color from Google Calendar
  colorId?: string; // Google Calendar color ID
}

// Define the core calendar event type used throughout the application
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
  start: Date;
  end?: Date;
  colorId?: string;
  color?: string;
} 