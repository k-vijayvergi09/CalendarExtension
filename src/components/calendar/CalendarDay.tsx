import React from 'react';
import { Event } from '../../types/calendar';

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
  // Find events for this day - checking both date and start fields
  const dayEvents = events.filter(event => {
    // Try to match against the date field
    if (isSameDay(event.date, date)) {
      return true;
    }
    
    // Also check the start field for events that span multiple days
    if (event.start && isSameDay(event.start, date)) {
      return true;
    }
    
    // Check if the date falls between start and end for multi-day events
    if (event.start && event.end) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      return event.start <= dayEnd && event.end >= dayStart;
    }
    
    return false;
  });

  const dayClasses = `
    relative w-full h-24 p-1 border border-gray-200
    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
    ${isToday ? 'ring-2 ring-blue-500' : ''}
    hover:bg-gray-50 cursor-pointer
  `;

  const dateClasses = `
    text-sm font-medium
    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
  `;

  return (
    <div
      className={dayClasses}
      onClick={() => onSelectDate(date)}
    >
      <span className={dateClasses}>
        {date.getDate()}
      </span>
      {dayEvents.length > 0 && (
        <div className="mt-1">
          {dayEvents.slice(0, 2).map(event => (
            <div
              key={event.id}
              className="text-xs truncate px-1 py-0.5 rounded bg-blue-100 text-blue-700 mb-1"
              title={event.title}
            >
              {event.title}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div className="text-xs text-gray-500">
              +{dayEvents.length - 2} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 