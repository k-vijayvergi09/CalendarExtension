import React, { useState } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';
import { DAYS_OF_WEEK, generateCalendarDays } from '../../utils/calendarUtils';
import { Event } from '../../types/calendar';
import { cn } from '../../utils/cn';
import { getEventColor } from '../../utils/eventColors';

interface ProcessedEvent extends Event {
  weekStartDay: number;
  weekEndDay: number;
  isFirstWeek: boolean;
  isLastWeek: boolean;
}

interface CalendarProps {
  events: Event[];
  onSelectDate: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
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

  // Process multi-day events at the calendar level
  const multiDayEvents = events.filter(event => event.start && event.end);
  const singleDayEvents = events.filter(event => !event.start || !event.end);

  // Split events that span multiple weeks into week segments
  const processEventForWeek = (event: Event, weekStart: Date) => {
    const eventStart = event.start!;
    const eventEnd = event.end!;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Calculate the start and end days within this week
    const startDay = eventStart <= weekStart ? 0 : eventStart.getDay();
    const endDay = eventEnd >= weekEnd ? 6 : eventEnd.getDay();

    return {
      ...event,
      weekStartDay: startDay,
      weekEndDay: endDay,
      isFirstWeek: eventStart >= weekStart && eventStart <= weekEnd,
      isLastWeek: eventEnd >= weekStart && eventEnd <= weekEnd,
    };
  };

  // Group events by weeks and process them
  const eventsByWeek = multiDayEvents.reduce<Record<string, ProcessedEvent[]>>((acc, event) => {
    const eventStart = event.start!;
    const eventEnd = event.end!;

    // Find all weeks this event spans
    let currentWeekStart = new Date(eventStart);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Get to Sunday

    while (currentWeekStart <= eventEnd) {
      const weekKey = currentWeekStart.toISOString();
      
      if (!acc[weekKey]) {
        acc[weekKey] = [];
      }

      // Process event for this specific week
      const processedEvent = processEventForWeek(event, currentWeekStart);
      acc[weekKey].push(processedEvent);

      // Move to next week
      currentWeekStart = new Date(currentWeekStart);
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return acc;
  }, {});

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
            <div className="absolute top-0 left-0 right-0 z-10">
              {Object.entries(eventsByWeek).map(([weekKey, weekEvents]) => (
                <div key={weekKey} className="relative h-24 grid grid-cols-7">
                  {weekEvents.map(event => {
                    const span = event.weekEndDay - event.weekStartDay + 1;
                    
                    return (
                      <div
                        key={`${event.id}-${weekKey}`}
                        className={cn(
                          "absolute h-5 mt-7 flex items-center justify-center",
                          getEventColor(event.id),
                          {
                            "rounded-l-full": event.isFirstWeek || event.weekStartDay === 0,
                            "rounded-r-full": event.isLastWeek || event.weekEndDay === 6,
                          }
                        )}
                        style={{
                          left: `${(event.weekStartDay / 7) * 100}%`,
                          width: `${(span / 7) * 100}%`,
                          paddingLeft: (event.isFirstWeek || event.weekStartDay === 0) ? '0.5rem' : '0.25rem',
                          paddingRight: (event.isLastWeek || event.weekEndDay === 6) ? '0.5rem' : '0.25rem',
                        }}
                        title={event.title}
                      >
                        <span className="truncate text-xs font-medium w-full text-center">
                          {event.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                <CalendarDay
                  key={index}
                  date={day.date!}
                  isCurrentMonth={day.isCurrentMonth}
                  events={singleDayEvents}
                  isToday={day.date?.toDateString() === today.toDateString()}
                  onSelectDate={onSelectDate}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 