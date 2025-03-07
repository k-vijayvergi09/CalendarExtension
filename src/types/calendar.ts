export interface Event {
  id: string;
  title: string;
  date: Date;
  description?: string;
  start?: Date;
  end?: Date;
} 