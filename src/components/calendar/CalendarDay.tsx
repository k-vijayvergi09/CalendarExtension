import React from 'react';
import { Event } from '../../types/calendar';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  events: Event[];
  isToday: boolean;
  onSelectDate: (date: Date) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  events,
  isToday,
  onSelectDate,
}) => {
  const dayEvents = events.filter(event => 
    event.date.toDateString() === date.toDateString()
  );

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
      <div className="mt-1">
        {dayEvents.slice(0, 2).map(event => (
          <div
            key={event.id}
            className="text-xs truncate px-1 py-0.5 rounded bg-blue-100 text-blue-700 mb-1"
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
    </div>
  );
}; 