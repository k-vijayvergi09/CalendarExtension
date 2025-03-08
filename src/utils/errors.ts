// Custom error classes
export class GoogleCalendarError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GoogleCalendarError';
    this.status = status;
  }
} 