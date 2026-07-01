import { createClient } from '@supabase/supabase-client';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Tells the browser to keep the user logged in even if they refresh
    autoRefreshToken: true,
  }
});