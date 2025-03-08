import { Event } from '../types/calendar';
import { isSameDay, normalizeDate } from '../utils/dateUtils';

interface ProcessedEvent extends Event {
  weekStartDay: number;
  weekEndDay: number;
  isFirstWeek: boolean;
  isLastWeek: boolean;
}

export const useCalendarEvents = (
  events: Event[], 
  calendarDays: Array<{ date: Date | null; isCurrentMonth: boolean }>
) => {
  // Process and validate all events
  const validatedEvents = events.filter(event => {
    // Skip events with invalid dates
    if (!event.date && !event.start) return false;
    
    // Convert string dates to Date objects if needed
    if (event.date && typeof event.date === 'string') {
      event.date = new Date(event.date);
    }
    if (event.start && typeof event.start === 'string') {
      event.start = new Date(event.start);
    }
    if (event.end && typeof event.end === 'string') {
      event.end = new Date(event.end);
    }
    
    return true;
  });

  // First, identify multi-day events by their IDs
  const multiDayEventIds = new Set<string>();
  
  const multiDayEvents = validatedEvents.filter(event => {
    // Must have both start and end defined
    if (!event.start || !event.end) return false;
    
    // And they must be different days
    const isMultiDay = !isSameDay(event.start, event.end);
    
    // Add to tracking set for exclusion from single-day events
    if (isMultiDay) {
      multiDayEventIds.add(event.id);
    }
    
    return isMultiDay;
  });
  
  // Then filter single-day events, excluding any that are already shown as multi-day
  const singleDayEvents = validatedEvents.filter(event => {
    // Skip any event that's already handled as a multi-day event
    if (multiDayEventIds.has(event.id)) return false;
    
    // Either has only a date field
    if (event.date) return true;
    
    // Or has start and end on same day
    if (event.start && event.end && isSameDay(event.start, event.end)) {
      return true;
    }
    
    // Or has only start (no end)
    if (event.start && !event.end) {
      return true;
    }
    
    return false;
  });

  // Add all relevant calendar days to a lookup dictionary for easy access
  const calendarDaysLookup: Record<string, { row: number, col: number, date: Date }> = {};
  calendarDays.forEach((day, index) => {
    if (day.date) {
      const dateStr = day.date.toISOString().split('T')[0];
      const row = Math.floor(index / 7);
      const col = index % 7;
      calendarDaysLookup[dateStr] = { row, col, date: day.date };
    }
  });
  
  // Process multi-day events for each week they span
  const eventsByWeek: Record<string, ProcessedEvent[]> = {};
  
  multiDayEvents.forEach(event => {
    if (!event.start || !event.end) return;
    
    const startDate = normalizeDate(event.start);
    const endDate = normalizeDate(event.end);
    
    // Find all days between start and end
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Group dates by week
    const weekGroups: Record<number, Date[]> = {};
    dates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      const calendarInfo = calendarDaysLookup[dateStr];
      
      if (calendarInfo) {
        const { row } = calendarInfo;
        if (!weekGroups[row]) {
          weekGroups[row] = [];
        }
        weekGroups[row].push(date);
      }
    });
    
    // Process each week segment
    Object.entries(weekGroups).forEach(([row, weekDates]) => {
      const weekKey = `week-${row}`;
      if (!eventsByWeek[weekKey]) {
        eventsByWeek[weekKey] = [];
      }
      
      // Get first and last day of this segment
      weekDates.sort((a, b) => a.getTime() - b.getTime());
      const firstDate = weekDates[0];
      const lastDate = weekDates[weekDates.length - 1];
      
      // Get column positions
      const firstDateStr = firstDate.toISOString().split('T')[0];
      const lastDateStr = lastDate.toISOString().split('T')[0];
      
      const startInfo = calendarDaysLookup[firstDateStr];
      const endInfo = calendarDaysLookup[lastDateStr];
      
      if (startInfo && endInfo) {
        eventsByWeek[weekKey].push({
          ...event,
          weekStartDay: startInfo.col,
          weekEndDay: endInfo.col,
          isFirstWeek: isSameDay(firstDate, startDate),
          isLastWeek: isSameDay(lastDate, endDate)
        });
      }
    });
  });

  return {
    singleDayEvents,
    eventsByWeek
  };
}; 