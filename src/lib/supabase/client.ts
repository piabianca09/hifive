import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && 
         !!supabaseAnonKey && 
         supabaseUrl.startsWith('http') &&
         supabaseUrl !== 'your_supabase_url_here';
};

export const createClient = () => {
  if (!isSupabaseConfigured()) {
    // Return a mock client that throws helpful errors
    throw new Error(
      'Supabase is not configured. Please update your .env.local file with valid Supabase credentials:\n' +
      '- NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
      '- NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key'
    );
  }
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
};
