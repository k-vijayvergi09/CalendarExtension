import React from 'react';
import { useStore } from '../stores/useStore';
import { useToast } from '../context/ToastContext';
import { Calendar } from '../components/calendar/Calendar';
import { formatDate } from '../utils/calendarUtils';

const App: React.FC = () => {
  const { events, addEvent } = useStore();
  const { showToast } = useToast();

  const handleDateSelect = (date: Date) => {
    const newEvent = {
      id: Date.now().toString(),
      title: 'New Event',
      date: date,
      description: 'Click to edit'
    };
    addEvent(newEvent);
    showToast(`Event added for ${formatDate(date)}`, 'success');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Calendar Extension</h1>
      <Calendar 
        events={events}
        onSelectDate={handleDateSelect}
      />
    </div>
  );
};

export default App; 