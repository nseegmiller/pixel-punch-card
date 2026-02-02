import { Database } from './database';

export type Card = Database['public']['Tables']['cards']['Row'];
export type CardInsert = Database['public']['Tables']['cards']['Insert'];
export type CardUpdate = Database['public']['Tables']['cards']['Update'];
