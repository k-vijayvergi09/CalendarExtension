import React from 'react';
import { Event } from '../../types/calendar';
import { cn } from '../../utils/cn';
import { getEventColor } from '../../utils/eventColors';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  events: Event[];
  isToday: boolean;
}

// Enhanced date normalization and comparison
const normalizeDate = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  // Set to midnight local time to remove time component
  d.setHours(0, 0, 0, 0);
  return d;
};

const isSameDay = (date1: Date | string | undefined, date2: Date): boolean => {
  if (!date1) return false;
  
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  events,
  isToday,
}) => {
  // Filter events for this day using normalized date comparison
  const dayEvents = events.filter(event => {
    // Check the primary date field
    if (event.date && isSameDay(event.date, date)) {
      return true;
    }
    
    // Check the start date for events without an end date
    if (event.start && !event.end && isSameDay(event.start, date)) {
      return true;
    }
    
    // Check both start and end for single-day events
    if (event.start && event.end && isSameDay(event.start, date) && isSameDay(event.end, date)) {
      return true;
    }
    
    return false;
  });

  return (
    <div
      className={cn(
        "relative h-24 p-1 hover:bg-accent/50 transition-colors",
        {
          "bg-background": isCurrentMonth,
          "bg-muted/50": !isCurrentMonth,
          "ring-2 ring-primary ring-inset": isToday,
        }
      )}
    >
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium",
          {
            "text-foreground": isCurrentMonth,
            "text-muted-foreground": !isCurrentMonth,
            "bg-primary text-primary-foreground": isToday,
          }
        )}
      >
        {date.getDate()}
      </span>
      
      <div className="mt-1 space-y-1">
        {dayEvents.slice(0, 2).map(event => (
          <div
            key={event.id}
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium truncate shadow-sm transition-all",
              "hover:shadow-md hover:scale-[1.02]",
              getEventColor(event.id)
            )}
            title={event.title}
          >
            {event.title}
          </div>
        ))}
        
        {dayEvents.length > 2 && (
          <div className="text-xs font-medium text-muted-foreground pl-2 hover:text-foreground transition-colors">
            +{dayEvents.length - 2} more
          </div>
        )}
      </div>
    </div>
  );
}; 