// Define a type for the colors object with specific keys
type GoogleCalendarColorMap = {
  [key in '1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'11']: { 
    background: string; 
    foreground: string; 
  }
};

// Google Calendar color palette with proper typing
export const GOOGLE_CALENDAR_COLORS: GoogleCalendarColorMap = {
  '1': { background: '#7986cb', foreground: '#ffffff' },
  '2': { background: '#33b679', foreground: '#ffffff' },
  '3': { background: '#8e24aa', foreground: '#ffffff' },
  '4': { background: '#e67c73', foreground: '#ffffff' },
  '5': { background: '#f6c026', foreground: '#000000' },
  '6': { background: '#f5511d', foreground: '#ffffff' },
  '7': { background: '#039be5', foreground: '#ffffff' },
  '8': { background: '#616161', foreground: '#ffffff' },
  '9': { background: '#3f51b5', foreground: '#ffffff' },
  '10': { background: '#0b8043', foreground: '#ffffff' },
  '11': { background: '#d60000', foreground: '#ffffff' }
};

// Function to get color from colorId
export const getGoogleCalendarColor = (colorId?: string): { background: string, foreground: string } => {
  if (colorId && Object.keys(GOOGLE_CALENDAR_COLORS).includes(colorId)) {
    return GOOGLE_CALENDAR_COLORS[colorId as keyof GoogleCalendarColorMap];
  }
  
  // Default color if no colorId is provided
  return { background: '#039be5', foreground: '#ffffff' };
}; 