import { CalendarEvent } from '../types/calendar';
import { getGoogleCalendarColor } from './googleCalendarColors';

// Colors for events that don't have a user-defined color
const EVENT_COLORS = [
  { bg: "#dbeafe", text: "#1e40af" }, // blue
  { bg: "#fee2e2", text: "#b91c1c" }, // red
  { bg: "#dcfce7", text: "#166534" }, // green
  { bg: "#fef9c3", text: "#854d0e" }, // yellow
  { bg: "#f3e8ff", text: "#7e22ce" }, // purple
  { bg: "#fce7f3", text: "#be185d" }, // pink
  { bg: "#e0e7ff", text: "#4338ca" }, // indigo
];

export const getEventColorStyles = (event: CalendarEvent): { backgroundColor: string, textColor: string } => {
  // If the event has a colorId, use Google's color
  if (event.colorId) {
    const { background, foreground } = getGoogleCalendarColor(event.colorId);
    return { backgroundColor: background, textColor: foreground };
  }
  
  // If the event has a direct color property, use that
  if (event.color && event.color !== 'default') {
    const colorValue = event.color.startsWith('#') ? event.color : `#${event.color}`;
    const isLight = isLightColor(colorValue);
    return { backgroundColor: colorValue, textColor: isLight ? '#111827' : '#ffffff' };
  }
  
  // Otherwise use our algorithm to determine color based on event ID
  const colorIndex = Math.abs(hashCode(event.id)) % EVENT_COLORS.length;
  const color = EVENT_COLORS[colorIndex];
  return { backgroundColor: color.bg, textColor: color.text };
};

// Helper to determine if a color is light (for text contrast)
function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  
  if (!/^[0-9A-F]{6}$/i.test(hex)) {
    return false;
  }
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

// Simple hash function for strings
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
} 