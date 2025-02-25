import React, { useState } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';
import { DAYS_OF_WEEK, generateCalendarDays } from '../../utils/calendarUtils';
import { Event } from '../../types/calendar';

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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        
        <div className="grid grid-cols-7 gap-px mb-2">
          {DAYS_OF_WEEK.map(day => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {calendarDays.map((day, index) => (
            <CalendarDay
              key={index}
              date={day.date!}
              isCurrentMonth={day.isCurrentMonth}
              events={events}
              isToday={day.date?.toDateString() === today.toDateString()}
              onSelectDate={onSelectDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 