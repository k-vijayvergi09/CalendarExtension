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