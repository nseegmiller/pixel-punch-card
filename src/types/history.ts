import { Database } from './database';

export type History = Database['public']['Tables']['history']['Row'];
export type HistoryInsert = Database['public']['Tables']['history']['Insert'];
export type EventType = 'punch' | 'habit_create' | 'habit_edit' | 'habit_delete';

export interface PunchEvent {
  card_id: string;
  timezone: string;
}

export interface HabitCreateEvent {
  habit_id: string;
  name: string;
}

export interface HabitEditEvent {
  habit_id: string;
  old_name: string;
  new_name: string;
}

export interface HabitDeleteEvent {
  habit: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
  cards: Array<{
    id: string;
    is_current: boolean;
    completed_at: string | null;
    created_at: string;
  }>;
  punches: Array<{
    id: string;
    card_id: string;
    timezone: string;
    created_at: string;
  }>;
}
