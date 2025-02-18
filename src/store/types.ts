export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  description?: string;
}

export interface CalendarState {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
} 