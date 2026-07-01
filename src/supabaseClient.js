import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kziytsrnwfkrgcbfpdlb.supabase.co';
const supabaseAnonKey = 'sb_publishable_lzxVEPCBCQWma7lm2Q7WmA_xJ5kzugv';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Tells the browser to keep the user logged in even if they refresh
    autoRefreshToken: true,
  }
});