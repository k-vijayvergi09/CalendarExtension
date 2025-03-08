import React, { useState, useRef } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { DAYS_OF_WEEK, generateCalendarDays } from '../../utils/calendarUtils';
import { Event } from '../../types/calendar';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { useCalendarGrid } from '../../hooks/useCalendarGrid';
import { EventLayer } from './EventLayer';
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
  
  const { singleDayEvents, eventsByWeek } = useCalendarEvents(events, calendarDays);
  const { rowHeights, getRowOffset } = useCalendarGrid(calendarGridRef, calendarDays);

  return (
    <div className="bg-background rounded-lg shadow-md overflow-hidden">
      <div className="flex flex-col h-full">
        <CalendarHeader 
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 text-center">
            {DAYS_OF_WEEK.map((day, index) => (
              <div key={index} className="py-2 text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="relative mt-2">
            {/* Combined event layer for both multi-day and single-day events */}
            <EventLayer 
              eventsByWeek={eventsByWeek} 
              singleDayEvents={singleDayEvents}
              calendarDays={calendarDays}
              getRowOffset={getRowOffset}
              rowHeights={rowHeights}
            />

            {/* Calendar grid */}
            <CalendarGrid
              calendarDays={calendarDays}
              today={today}
              gridRef={calendarGridRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 