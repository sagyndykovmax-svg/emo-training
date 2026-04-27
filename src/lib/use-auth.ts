'use client';

/**
 * useAuth — React hook giving the current Supabase user + sign-out helper.
 *
 * Returns null user when:
 *   - Supabase isn't configured (env vars missing) — no auth UI shown
 *   - User isn't signed in
 *
 * Components that gate behavior on auth should also check `isConfigured`
 * to render either "Sign in" or nothing-at-all.
 */

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from './supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    sb.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // On a fresh sign-in (e.g. via Google OAuth redirect callback), reconcile
      // local and cloud progress. Lazy import to avoid pulling cloud-sync into
      // every page that uses useAuth.
      if (event === 'SIGNED_IN') {
        void import('./cloud-sync').then((m) => m.reconcileOnSignIn()).catch(() => {});
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
    setUser(null);
  }

  return { user, loading, configured, signOut };
}
