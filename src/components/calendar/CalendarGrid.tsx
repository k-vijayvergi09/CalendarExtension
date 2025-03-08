import React from 'react';
import { CalendarDay } from './CalendarDay';
import { Event } from '../../types/calendar';

interface CalendarGridProps {
  calendarDays: Array<{ date: Date | null; isCurrentMonth: boolean }>;
  singleDayEvents: Event[];
  today: Date;
  gridRef: React.RefObject<HTMLDivElement>;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarDays,
  singleDayEvents,
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
            events={singleDayEvents}
            isToday={day.date.toDateString() === today.toDateString()}
          />
        )
      ))}
    </div>
  );
}; 