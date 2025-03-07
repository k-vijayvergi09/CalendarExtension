import React, { useState, useRef, useEffect } from 'react';
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
}

// Enhanced date normalization and comparison
const normalizeDate = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  // Set to midnight local time to remove time component
  d.setHours(0, 0, 0, 0);
  return d;
};

const isSameDay = (date1: Date | string | undefined, date2: Date | string | undefined): boolean => {
  if (!date1 || !date2) return false;
  
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Improved function to get the numeric week identifier that aligns with our calendar view
const getWeekIdentifier = (date: Date): string => {
  // Get first day of the month's week
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfView = new Date(firstDayOfMonth);
  firstDayOfView.setDate(firstDayOfView.getDate() - firstDayOfView.getDay());
  
  // Calculate weeks since first day of view
  const daysSinceStart = Math.floor((date.getTime() - firstDayOfView.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.floor(daysSinceStart / 7);
  
  return `${firstDayOfView.getFullYear()}-${firstDayOfView.getMonth()}-${weekNumber}`;
};

export const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rowHeights, setRowHeights] = useState<number[]>([]);
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

  // Calculate row heights after render
  useEffect(() => {
    if (calendarGridRef.current) {
      // Get all direct children (rows)
      const rows = Array.from(calendarGridRef.current.children);
      const numRows = Math.ceil(rows.length / 7); // Calendar has 7 columns
      
      const heights: number[] = [];
      for (let i = 0; i < numRows; i++) {
        const rowStartIndex = i * 7;
        const rowElement = rows[rowStartIndex];
        if (rowElement) {
          heights.push(rowElement.getBoundingClientRect().height);
        }
      }
      
      setRowHeights(heights);
    }
  }, [calendarDays]);

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

  // Map events to the correct calendar weeks and positions
  const eventsByWeek: Record<string, ProcessedEvent[]> = {};
  
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

  // Calculate row offsets for positioning
  const getRowOffset = (rowIndex: number): number => {
    let offset = 0;
    for (let i = 0; i < rowIndex; i++) {
      offset += rowHeights[i] || 96; // Use measured height or fallback to 96px
    }
    return offset;
  };

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
            <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
              {Object.entries(eventsByWeek).map(([weekKey, weekEvents]) => {
                const rowIndex = parseInt(weekKey.split('-')[1]);
                const topOffset = getRowOffset(rowIndex);
                
                return (
                  <div 
                    key={weekKey} 
                    className="absolute w-full grid grid-cols-7" 
                    style={{ 
                      top: `${topOffset}px`,
                      height: `${rowHeights[rowIndex] || 96}px`
                    }}
                  >
                    {weekEvents.map(event => {
                      const span = event.weekEndDay - event.weekStartDay + 1;
                      
                      return (
                        <div
                          key={`${event.id}-${weekKey}`}
                          className={cn(
                            "absolute h-5 mt-7 flex items-center justify-center pointer-events-auto",
                            getEventColor(event.id),
                            {
                              "rounded-l-full": event.isFirstWeek,
                              "rounded-r-full": event.isLastWeek,
                            }
                          )}
                          style={{
                            left: `${(event.weekStartDay / 7) * 100}%`,
                            width: `${(span / 7) * 100}%`,
                            paddingLeft: event.isFirstWeek ? '0.5rem' : '0.25rem',
                            paddingRight: event.isLastWeek ? '0.5rem' : '0.25rem',
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
                );
              })}
            </div>

            {/* Calendar grid */}
            <div ref={calendarGridRef} className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                <CalendarDay
                  key={index}
                  date={day.date!}
                  isCurrentMonth={day.isCurrentMonth}
                  events={singleDayEvents}
                  isToday={day.date?.toDateString() === today.toDateString()}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 