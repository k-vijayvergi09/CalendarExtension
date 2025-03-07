import React from 'react';
import { Event } from '../../types/calendar';
import { cn } from '../../utils/cn';
import { getEventColor } from '../../utils/eventColors';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  events: Event[];
  isToday: boolean;
  onSelectDate: (date: Date) => void;
}

// Helper function to check if a date falls on the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  events,
  isToday,
  onSelectDate,
}) => {
  const dayEvents = events.filter(event => isSameDay(event.date, date));

  return (
    <div
      onClick={() => onSelectDate(date)}
      className={cn(
        "relative h-24 p-1 hover:bg-accent/50 transition-colors cursor-pointer group",
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
              "group-hover:shadow-md",
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