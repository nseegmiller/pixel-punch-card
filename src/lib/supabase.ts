import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Note: For proper type checking, regenerate types from your Supabase instance:
// npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
