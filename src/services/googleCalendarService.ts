// Google Calendar API types
interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  recurrence?: string[];
}

interface GoogleCalendarResponse {
  items: GoogleCalendarEvent[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
  start: Date;
  end: Date;
}

export class GoogleCalendarError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GoogleCalendarError';
  }
}

// Get auth token from Chrome with retry mechanism and validation
const getAuthToken = async (retries = 3, interactive = true): Promise<string> => {
  for (let i = 0; i < retries; i++) {
    try {
      const token = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ 
          interactive,
          scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
          ]
        }, (token) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome identity error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else if (!token) {
            reject(new GoogleCalendarError('Failed to get auth token'));
          } else {
            resolve(token);
          }
        });
      });

      return token;
    } catch (error) {
      console.error('Token retrieval error:', error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new GoogleCalendarError('Failed to get auth token after retries');
};

// Fetch calendar events with proper error handling and token refresh
export const fetchCalendarEvents = async (
  timeMin: Date = new Date(),
  timeMax: Date = new Date(new Date().setMonth(timeMin.getMonth() + 3)) // Extend to 3 months
): Promise<CalendarEvent[]> => {
  const timeMinISO = timeMin.toISOString();
  const timeMaxISO = timeMax.toISOString();
  
  console.log(`Fetching calendar events from ${timeMinISO} to ${timeMaxISO}`);
  
  // Function to fetch events with a given token
  const fetchWithToken = async (authToken: string) => {
    console.log('Fetching calendar events with token');
    try {
      // Request more details using fields parameter and up to 100 events
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMinISO}&timeMax=${timeMaxISO}&singleEvents=true&orderBy=startTime&maxResults=100`,
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
      console.log('Calendar API response:', data);
      console.log(`Retrieved ${data.items?.length || 0} events`);
      
      if (!data.items || data.items.length === 0) {
        console.log('No events found in the specified time range');
        return [];
      }
      
      const transformedEvents = transformEvents(data.items || []);
      console.log('Transformed events:', transformedEvents);
      return transformedEvents;
    } catch (error) {
      console.error('Error in fetchWithToken:', error);
      throw error;
    }
  };

  // First, try using a non-interactive token
  try {
    console.log('Trying to fetch events with existing token');
    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (chrome.runtime.lastError || !token) {
          reject(new Error('No existing token'));
        } else {
          resolve(token);
        }
      });
    });
    
    return await fetchWithToken(token);
  } catch (initialError) {
    console.log('No existing token or token invalid, trying to get fresh token');
    
    // If that fails, try to get a fresh token
    try {
      // We'll only get here if non-interactive auth failed
      const freshToken = await getFreshAuthToken();
      return await fetchWithToken(freshToken);
    } catch (refreshError) {
      console.error('Failed to get fresh token:', refreshError);
      throw new GoogleCalendarError('Failed to refresh token', 401);
    }
  }
};

// Transform Google Calendar events to app format
const transformEvents = (items: GoogleCalendarEvent[]): CalendarEvent[] => {
  console.log('Starting event transformation for', items.length, 'events');
  
  try {
    const result = items
      .filter(item => {
        // Filter out events without necessary date information
        if (!item.start || (!item.start.dateTime && !item.start.date)) {
          console.log('Skipping event due to missing start date:', item.id);
          return false;
        }
        return true;
      })
      .map((item) => {
        try {
          console.log('Processing event:', item.id, item.summary);
          
          // Handle all-day events vs timed events
          let start: Date;
          let end: Date;
          
          if (item.start.dateTime) {
            // This is a timed event
            start = new Date(item.start.dateTime);
            end = item.end?.dateTime ? new Date(item.end.dateTime) : new Date(start);
          } else {
            // This is an all-day event
            start = new Date(item.start.date!);
            // For all-day events, the end date is exclusive, so subtract one day
            if (item.end?.date) {
              const endDate = new Date(item.end.date);
              endDate.setDate(endDate.getDate() - 1);
              end = endDate;
            } else {
              end = new Date(start);
            }
          }
          
          // Ensure we have both dates
          if (!start) {
            console.error('Could not parse start date for event:', item.id);
            start = new Date(); // Fallback
          }
          
          if (!end) {
            console.error('Could not parse end date for event:', item.id);
            end = new Date(start); // Fallback
          }
          
          const event: CalendarEvent = {
            id: item.id,
            title: item.summary || 'Untitled Event',
            date: start, // Use start date as the main date
            description: item.description || '',
            start,
            end,
          };
          
          console.log('Transformed event:', event.id, event.title, 'Date:', event.date.toISOString());
          return event;
        } catch (error) {
          console.error('Error transforming event', item.id, error);
          // Return a default event as fallback
          const now = new Date();
          return {
            id: item.id || 'unknown-id',
            title: 'Error Processing Event',
            date: now,
            description: 'There was an error processing this event',
            start: now,
            end: now,
          };
        }
      });
    
    console.log('Event transformation complete, returning', result.length, 'events');
    return result;
  } catch (err) {
    console.error('Error in transformEvents:', err);
    return [];
  }
};

// TODO: Implement these methods
export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
  throw new Error('Not implemented');
};

export const updateCalendarEvent = async (eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
  throw new Error('Not implemented');
};

export const deleteCalendarEvent = async (eventId: string): Promise<void> => {
  throw new Error('Not implemented');
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

// Get a fresh auth token (clear existing token first)
export const getFreshAuthToken = async (): Promise<string> => {
  try {
    // First remove any existing token
    await removeCachedToken();
    
    // Now get a new token with full UI prompt
    return await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ 
        interactive: true,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ]
      }, (token) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to get fresh token:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else if (!token) {
          reject(new Error('No token returned'));
        } else {
          console.log('Successfully got fresh token');
          resolve(token);
        }
      });
    });
  } catch (error) {
    console.error('Error getting fresh token:', error);
    throw error;
  }
}; 