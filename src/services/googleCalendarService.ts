import { CalendarEvent } from '../types/calendar';
import { GoogleCalendarResponse } from '../types/googleCalendar';
import { transformEvents } from '../utils/googleCalendarTransformer';
import { GoogleCalendarError } from '../utils/errors';
import { getAuthToken, getFreshAuthToken } from './authService';

// Core API service for Google Calendar
export const fetchCalendarEvents = async (
  timeMin: Date = new Date(),
  timeMax: Date = new Date(new Date().setMonth(timeMin.getMonth() + 3))
): Promise<CalendarEvent[]> => {
  const timeMinISO = timeMin.toISOString();
  const timeMaxISO = timeMax.toISOString();
  
  console.log(`Fetching calendar events from ${timeMinISO} to ${timeMaxISO}`);
  
  try {
    const authToken = await getAuthToken();
    return await fetchWithToken(authToken);
  } catch (error) {
    console.error('Error in fetchCalendarEvents:', error);
    
    if (error instanceof GoogleCalendarError && error.status === 401) {
      console.log('Token expired, getting fresh token');
      try {
        const freshToken = await getFreshAuthToken();
        return await fetchWithToken(freshToken);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        throw refreshError;
      }
    }
    
    throw error;
  }
  
  // Function to fetch events with a given token
  async function fetchWithToken(authToken: string) {
    console.log('Fetching calendar events with token');
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMinISO}&timeMax=${timeMaxISO}&singleEvents=true&orderBy=startTime&maxResults=100&colorRgbFormat=true`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Calendar API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new GoogleCalendarError(`API error: ${response.status} - ${errorText}`, response.status);
      }

      const data = await response.json() as GoogleCalendarResponse;
      console.log(`Retrieved ${data.items?.length || 0} events`);
      
      if (!data.items || data.items.length === 0) {
        console.log('No events found in the specified time range');
        return [];
      }
      
      return transformEvents(data.items || []);
    } catch (error) {
      console.error('Error in fetchWithToken:', error);
      throw error;
    }
  }
};

// Remove cached token
export const removeCachedToken = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        console.log('No token found to revoke');
        resolve();
        return;
      }
      
      if (!token) {
        console.log('Token is empty, nothing to revoke');
        resolve();
        return;
      }

      console.log('Revoking and removing token');
      
      // First, revoke the token
      fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
        .then(() => {
          // Then remove it from Chrome's cache
          chrome.identity.removeCachedAuthToken({ token }, () => {
            console.log('Token removed from cache');
            resolve();
          });
        })
        .catch(error => {
          console.error('Error revoking token:', error);
          // Still try to remove it from cache
          chrome.identity.removeCachedAuthToken({ token }, () => {
            resolve();
          });
        });
    });
  });
};
