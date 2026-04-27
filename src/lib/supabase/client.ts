/**
 * Browser-side Supabase client. Used in client components for auth state
 * + cloud-sync read/writes against the public.progress table.
 *
 * Returns null if env vars aren't configured — the rest of the app should
 * degrade gracefully (localStorage-only mode, no auth UI).
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    cachedClient = null;
    return null;
  }

  cachedClient = createBrowserClient(url, anonKey);
  return cachedClient;
}

/** True when both env vars are present — toggles auth UI on/off. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
