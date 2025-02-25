import { create } from 'zustand'
import { Event } from '../types/calendar'

interface CalendarState {
  events: Event[]
  isLoading: boolean
  addEvent: (event: Event) => void
  setLoading: (loading: boolean) => void
}

export const useStore = create<CalendarState>((set) => ({
  events: [],
  isLoading: false,
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, event] 
  })),
  setLoading: (loading) => set({ isLoading: loading }),
})); 