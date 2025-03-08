import React, { useState, useRef } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { DAYS_OF_WEEK, generateCalendarDays } from '../../utils/calendarUtils';
import { Event } from '../../types/calendar';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { useCalendarGrid } from '../../hooks/useCalendarGrid';
import { MultiDayEventLayer } from './MultiDayEventLayer';
import { CalendarGrid } from './CalendarGrid';

interface CalendarProps {
  events: Event[];
}

export const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarGridRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const calendarDays = generateCalendarDays(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  // Use custom hooks to process events and measure the grid
  const { singleDayEvents, eventsByWeek } = useCalendarEvents(events, calendarDays);
  const { rowHeights, getRowOffset } = useCalendarGrid(calendarGridRef, calendarDays);

  return (
    <div className="w-full space-y-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <CalendarHeader
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          
          <div className="mt-6 grid grid-cols-7 text-center text-sm">
            {DAYS_OF_WEEK.map(day => (
              <div
                key={day}
                className="text-muted-foreground font-medium py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="relative mt-2">
            {/* Multi-day events layer */}
            <MultiDayEventLayer 
              eventsByWeek={eventsByWeek} 
              getRowOffset={getRowOffset}
              rowHeights={rowHeights}
            />

            {/* Calendar grid */}
            <CalendarGrid
              calendarDays={calendarDays}
              singleDayEvents={singleDayEvents}
              today={today}
              gridRef={calendarGridRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 