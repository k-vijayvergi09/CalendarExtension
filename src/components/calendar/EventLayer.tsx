import React from 'react';
import { Event } from '../../types/calendar';
import { cn } from '../../utils/cn';
import { getEventColorStyles } from '../../utils/eventColors';

interface ProcessedEvent extends Event {
  weekStartDay: number;
  weekEndDay: number;
  isFirstWeek: boolean;
  isLastWeek: boolean;
}

interface EventLayerProps {
  eventsByWeek: Record<string, ProcessedEvent[]>;
  singleDayEvents: Event[];
  calendarDays: Array<{ date: Date | null; isCurrentMonth: boolean }>;
  getRowOffset: (rowIndex: number) => number;
  rowHeights: number[];
}

// Helper function to get a consistent date key that respects local timezone
const getLocalDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Shared event rendering component
interface EventItemProps {
  event: Event | ProcessedEvent;
  style: React.CSSProperties;
  className?: string;
}

const EventItem: React.FC<EventItemProps> = ({ event, style, className }) => {
  const { backgroundColor, textColor } = getEventColorStyles(event);
  
  return (
    <div
      className={cn("absolute flex items-center justify-center pointer-events-auto", className)}
      style={{
        ...style,
        backgroundColor,
        color: textColor,
        height: '20px',
      }}
      title={event.title}
    >
      <span className="truncate text-xs font-medium w-full text-center">
        {event.title}
      </span>
    </div>
  );
};

export const EventLayer: React.FC<EventLayerProps> = ({ 
  eventsByWeek, 
  singleDayEvents,
  calendarDays,
  getRowOffset,
  rowHeights
}) => {
  // Create a lookup for day positions using local date keys
  const dayPositions: Record<string, { row: number, col: number }> = {};
  calendarDays.forEach((day, index) => {
    if (day.date) {
      const dateKey = getLocalDateKey(day.date);
      const row = Math.floor(index / 7);
      const col = index % 7;
      dayPositions[dateKey] = { row, col };
    }
  });

  // Group single-day events by date for easier processing
  const eventsByDay: Record<string, Event[]> = {};
  singleDayEvents.forEach(event => {
    const eventDate = event.date || event.start;
    if (!eventDate) return;
    
    const dateKey = getLocalDateKey(eventDate);
    if (!eventsByDay[dateKey]) {
      eventsByDay[dateKey] = [];
    }
    eventsByDay[dateKey].push(event);
  });

  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      {/* Multi-day events */}
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
                <EventItem
                  key={`${event.id}-${weekKey}`}
                  event={event}
                  className={cn(
                    "mt-7",
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
                />
              );
            })}
          </div>
        );
      })}

      {/* Single-day events */}
      {Object.entries(eventsByDay).map(([dateKey, events]) => {
        const position = dayPositions[dateKey];
        if (!position) return null;
        
        const { row, col } = position;
        const topOffset = getRowOffset(row);
        const cellWidth = 100 / 7; // percentage width of one cell
        
        return events.slice(0, 3).map((event, index) => (
          <EventItem
            key={`single-${event.id}`}
            event={event}
            className="rounded-full"
            style={{
              top: `${topOffset + 28 + (index * 20)}px`,
              left: `${col * cellWidth + 2}%`,
              width: `${cellWidth - 4}%`,
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem'
            }}
          />
        ));
      })}
      
      {/* "More" indicators for days with many events */}
      {Object.entries(eventsByDay).map(([dateKey, events]) => {
        if (events.length <= 3) return null;
        
        const position = dayPositions[dateKey];
        if (!position) return null;
        
        const { row, col } = position;
        const topOffset = getRowOffset(row);
        const cellWidth = 100 / 7;
        
        return (
          <div
            key={`more-${dateKey}`}
            className="absolute text-xs font-medium text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
            style={{
              top: `${topOffset + 84}px`, // Position at bottom of cell
              left: `${col * cellWidth + 4}%`,
            }}
          >
            +{events.length - 3} more
          </div>
        );
      })}
    </div>
  );
}; 