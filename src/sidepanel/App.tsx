import React from 'react';
import { useStore } from '../stores/useStore';

const App: React.FC = () => {
  const { events, addEvent, isLoading } = useStore();

  const handleAddEvent = () => {
    const newEvent = {
      id: Date.now().toString(),
      title: 'New Event',
      date: new Date(),
      description: 'This is a test event'
    };
    addEvent(newEvent);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Calendar Extension For Windows</h1>
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <button 
          onClick={handleAddEvent}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          Add Test Event
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Events ({events.length})</h2>
        {isLoading ? (
          <p className="text-gray-600">Loading events...</p>
        ) : (
          <div className="space-y-2">
            {events.map(event => (
              <div key={event.id} className="border p-3 rounded">
                <h3 className="font-medium">{event.title}</h3>
                <p className="text-sm text-gray-600">
                  {event.date.toLocaleDateString()}
                </p>
                {event.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-gray-600">No events yet. Add your first event!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App; 