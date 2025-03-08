import React from 'react';
import { Event } from '../../types/calendar';
import { cn } from '../../utils/cn';
import { getEventColorStyles } from '../../utils/eventColors';
import { isSameDay } from '../../utils/dateUtils';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  events: Event[];
  isToday: boolean;
}

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
        {dayEvents.slice(0, 2).map(event => {
          const { backgroundColor, textColor } = getEventColorStyles(event);
          return (
            <div
              key={event.id}
              className="rounded-full px-2 py-0.5 text-xs font-medium truncate shadow-sm transition-all hover:shadow-md hover:scale-[1.02]"
              style={{ backgroundColor, color: textColor }}
              title={event.title}
            >
              {event.title}
            </div>
          );
        })}
        
        {dayEvents.length > 2 && (
          <div className="text-xs font-medium text-muted-foreground pl-2 hover:text-foreground transition-colors">
            +{dayEvents.length - 2} more
          </div>
        )}
      </div>
    </div>
  );
}; 