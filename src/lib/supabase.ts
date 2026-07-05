import { createClient } from '@supabase/supabase-js';

// IMPORTANT: This client uses the SERVICE_ROLE_KEY.
// It bypasses Row Level Security (RLS) entirely.
// NEVER expose this client to the frontend or browser.
// NUNCA exponer la service role key al cliente (no usar prefijo NEXT_PUBLIC).
// For the team-logos bucket to work properly on the public site,
// the bucket "team-logos" MUST be created in Supabase as a PUBLIC bucket.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase env vars missing. Supabase client will fail if used.');
}

export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
