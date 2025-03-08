import React from 'react';
import { cn } from '../../utils/cn';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  isToday,
}) => {
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
      
      {/* Events are now rendered in the EventLayer component */}
    </div>
  );
}; 