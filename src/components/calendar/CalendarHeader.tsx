import React from 'react';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth
}) => {
  // Format as MMM YYYY in uppercase
  const month = currentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const year = currentDate.getFullYear();
  const formattedDate = `${month} ${year}`;

  return (
    <div className="flex items-center mb-4">
      <button
        onClick={onPrevMonth}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div className="w-24 text-center mx-2">
        <h2 className="text-xl font-semibold text-gray-800">{formattedDate}</h2>
      </div>
      <button
        onClick={onNextMonth}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}; 