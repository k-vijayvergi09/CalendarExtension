import React from 'react';
import { useStore } from '../../stores/useStore';
import { removeCachedToken } from '../../services/googleCalendarService';

export const GoogleSignIn: React.FC = () => {
  const { signIn, isSignedIn, error, isLoading } = useStore();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleRetry = async () => {
    // Clear token and try again
    try {
      await removeCachedToken();
      await signIn();
    } catch (error) {
      console.error('Retry sign in failed:', error);
    }
  };

  if (isSignedIn) {
    return null; // Don't show sign in button if already signed in
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Calendar Extension</h1>
        <p className="text-gray-600 mb-6 text-center">
          Sign in with your Google account to access and manage your calendar events.
        </p>
        
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>
        
        {error && (
          <div className="mt-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear cache and try again
            </button>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-6 text-center">
          This extension requires access to your Google Calendar.
          No data is shared with third parties.
        </p>
      </div>
    </div>
  );
}; 