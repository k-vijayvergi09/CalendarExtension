import { CalendarEvent } from '../types/calendar';
import { GoogleCalendarEvent } from '../types/googleCalendar';

// Transform Google Calendar events to our app format
export const transformEvents = (items: GoogleCalendarEvent[]): CalendarEvent[] => {
  console.log(`Transforming ${items.length} events`);
  
  return items
    .filter(item => item.status !== 'cancelled')
    .map((item) => {
      try {
        console.log('Processing event:', item.id, item.summary);
        
        // Parse start and end dates
        let start: Date | undefined;
        if (item.start?.dateTime) {
          start = new Date(item.start.dateTime);
        } else if (item.start?.date) {
          start = new Date(item.start.date);
        }
        
        let end: Date | undefined;
        if (item.end?.dateTime) {
          end = new Date(item.end.dateTime);
        } else if (item.end?.date) {
          // For all-day events, the end date is exclusive
          // Subtract one day to get the actual end date
          const endDate = new Date(item.end.date);
          endDate.setDate(endDate.getDate() - 1);
          end = endDate;
        }
        
        if (!start) {
          console.warn('Event has no start date:', item.id);
          start = new Date(); // Fallback
        }
        
        const event: CalendarEvent = {
          id: item.id,
          title: item.summary || 'Untitled Event',
          date: start, // Use start date as the main date
          description: item.description || '',
          start,
          end,
          colorId: item.colorId,
          color: typeof item.colorRgbFormat === 'string' ? item.colorRgbFormat : (item.backgroundColor || 'default'),
        };
        
        console.log('Transformed event:', event.id, event.title, 'Date:', event.date.toISOString());
        return event;
      } catch (error) {
        console.error('Error transforming event', item.id, error);
        // Return a default event as fallback
        const now = new Date();
        return {
          id: item.id || 'unknown-id',
          title: 'Error Processing Event',
          date: now,
          description: 'There was an error processing this event',
          start: now,
          end: now,
          colorId: 'default',
          color: 'default',
        };
      }
    });
}; 