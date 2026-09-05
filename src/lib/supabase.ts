import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Null-safe Supabase client.
 *
 * If the env vars are absent, `supabase` is `null` and the data layer falls
 * back to seeded local data (PRD §49). The anon key is public-by-design and
 * guarded by RLS — never place the service_role key in the frontend (PRD §51).
 */
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 5 } },
    })
  : null;
