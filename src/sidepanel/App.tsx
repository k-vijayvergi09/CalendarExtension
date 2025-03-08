import React, { useEffect, useState } from 'react';
import { useStore } from '../stores/useStore';
import { useToast } from '../context/ToastContext';
import { Calendar } from '../components/calendar/Calendar';
import { GoogleSignIn } from '../components/auth/GoogleSignIn';

const App: React.FC = () => {
  const { events, isSignedIn, isLoading, error, checkAuthState, fetchGoogleEvents } = useStore();
  const { showToast } = useToast();
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  // Effect to log events after they're loaded
  useEffect(() => {
    if (events.length > 0) {
      console.log(`Loaded ${events.length} events from Google Calendar`);
      showToast(`Found ${events.length} events in your calendar`, 'success');
    }
  }, [events.length, showToast]);

  const handleRefreshEvents = async () => {
    try {
      await fetchGoogleEvents();
      showToast('Calendar events refreshed', 'success');
    } catch (error) {
      showToast('Failed to refresh events', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <GoogleSignIn />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="flex justify-between items-center mb-4 px-4">
        <h1 className="text-2xl font-bold text-gray-800">Calendar Extension</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleRefreshEvents}
            className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-200 rounded"
          >
            {showDebug ? 'Hide Debug' : 'Debug'}
          </button>
          <button
            onClick={() => useStore.getState().signOut()}
            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-200 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      {error && (
        <div className="px-4 mb-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}
      
      <Calendar events={events} />
      
      {showDebug && (
        <div className="mt-4 px-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-auto max-h-96">
            <h3 className="text-lg font-bold mb-2">Debug Info</h3>
            <p>Event Count: {events.length}</p>
            {events.length === 0 ? (
              <p className="text-yellow-400 my-2">No events found in the calendar.</p>
            ) : (
              <div className="mt-2">
                <h4 className="font-semibold mb-1">Events:</h4>
                <pre className="text-xs">
                  {JSON.stringify(events.slice(0, 10), null, 2)}
                </pre>
                {events.length > 10 && <p className="text-xs mt-2">+ {events.length - 10} more events</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App; 