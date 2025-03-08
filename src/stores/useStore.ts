import { create } from 'zustand'
import { Event } from '../types/calendar'
import { getFreshAuthToken } from '../services/authService'
import { GoogleCalendarError } from '../utils/errors'
import { 
  fetchCalendarEvents, 
  removeCachedToken 
} from '../services/googleCalendarService'

interface CalendarState {
  events: Event[]
  isLoading: boolean
  error: string | null
  isSignedIn: boolean
  addEvent: (event: Event) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchGoogleEvents: () => Promise<void>
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  checkAuthState: () => Promise<void>
}

export const useStore = create<CalendarState>((set) => ({
  events: [],
  isLoading: false,
  error: null,
  isSignedIn: false,
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, event],
    error: null
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  checkAuthState: async () => {
    try {
      // Try to get a token without showing the popup
      const token = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ 
          interactive: false,
          scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
          ]
        }, (token) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (!token) {
            reject(new Error('No token found'));
          } else {
            resolve(token);
          }
        });
      });

      if (token) {
        // Try to fetch events to validate the token
        try {
          const googleEvents = await fetchCalendarEvents();
          set({ isSignedIn: true, events: googleEvents });
        } catch (error) {
          console.error('Failed to fetch events during auth check:', error);
          // If we failed to fetch events, let's clear the token to force a fresh login next time
          await removeCachedToken();
          set({ isSignedIn: false, events: [] });
        }
      }
    } catch (error) {
      // If we can't get a token, we're not signed in
      set({ isSignedIn: false, events: [] });
    }
  },
  signIn: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get a fresh token, clearing any existing tokens first
      const token = await getFreshAuthToken();
      
      if (token) {
        console.log('Successfully authenticated, fetching events');
        // Try to fetch events to validate the token
        try {
          const googleEvents = await fetchCalendarEvents();
          set({ isSignedIn: true, events: googleEvents });
        } catch (fetchError) {
          console.error('Failed to fetch events after sign in:', fetchError);
          set({ error: 'Failed to fetch calendar events', isSignedIn: false });
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      set({ error: errorMessage, isSignedIn: false });
    } finally {
      set({ isLoading: false });
    }
  },
  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await removeCachedToken();
      set({ isSignedIn: false, events: [] });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchGoogleEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const googleEvents = await fetchCalendarEvents();
      set({ events: googleEvents });
    } catch (error: unknown) {
      const errorMessage = 
        error instanceof GoogleCalendarError ? error.message : 
        error instanceof Error ? error.message : 
        'Failed to fetch calendar events';
      
      set({ error: errorMessage });
      console.error('Error fetching Google Calendar events:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}))

export const useStoreSelector = (state: CalendarState) => ({
  events: state.events,
  isLoading: state.isLoading,
  error: state.error,
  isSignedIn: state.isSignedIn,
  fetchGoogleEvents: state.fetchGoogleEvents,
  signIn: state.signIn,
  signOut: state.signOut,
  checkAuthState: state.checkAuthState,
}) 