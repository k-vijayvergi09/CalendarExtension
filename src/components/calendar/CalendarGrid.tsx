import React from 'react';
import { CalendarDay } from './CalendarDay';

interface CalendarGridProps {
  calendarDays: Array<{ date: Date | null; isCurrentMonth: boolean }>;
  today: Date;
  gridRef: React.RefObject<HTMLDivElement>;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarDays,
  today,
  gridRef
}) => {
  return (
    <div ref={gridRef} className="grid grid-cols-7">
      {calendarDays.map((day, index) => (
        day.date && (
          <CalendarDay
            key={index}
            date={day.date}
            isCurrentMonth={day.isCurrentMonth}
            isToday={day.date.toDateString() === today.toDateString()}
          />
        )
      ))}
    </div>
  );
}; 