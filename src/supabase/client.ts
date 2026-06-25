import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    supabase = {} as SupabaseClient;
  }
} catch (error) {
  console.warn('Supabase initialization failed, using fallback mode');
  supabase = {} as SupabaseClient;
}

export { supabase };
export const hasSupabase = !!supabaseUrl && !!supabaseAnonKey;
