
export type EventType = 'class' | 'exam' | 'assignment' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  description?: string;
  location?: string;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  events: CalendarEvent[];
}
