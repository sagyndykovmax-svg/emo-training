/**
 * Cloud-sync layer between localStorage Progress and Supabase
 * `public.progress` table.
 *
 * Architecture:
 *   - localStorage is the **primary** store. All reads/writes go there
 *     immediately. Cloud is a debounced backup.
 *   - When signed in, every successful localStorage write triggers a
 *     debounced (5s) upload of the full Progress JSON.
 *   - On sign-in, we fetch the cloud Progress. If cloud is newer than
 *     local OR local is empty, cloud replaces local. Otherwise local
 *     wins and uploads.
 *   - On sign-out, localStorage is preserved (don't wipe).
 *
 * Conflict policy v1: last-write-wins by `updated_at`. No real-time
 * collaboration, no merge UI. If you switch devices while one tab is
 * still open, the second tab's writes will eventually overwrite. Good
 * enough for solo training use.
 */

import { getProgress, saveProgress, type Progress } from './storage';
import { getSupabase } from './supabase/client';

const TABLE = 'progress';
const DEBOUNCE_MS = 5_000;

let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let lastUploadedAt = 0;

interface CloudRow {
  user_id: string;
  data: Progress;
  updated_at: string;
}

/**
 * Fetch progress for the currently signed-in user. Returns null if no
 * row exists yet (first sign-in) or if not signed in / not configured.
 */
export async function fetchCloudProgress(): Promise<{
  progress: Progress;
  updatedAt: number;
} | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data, error } = await sb
    .from(TABLE)
    .select('data, updated_at')
    .eq('user_id', user.id)
    .maybeSingle<{ data: Progress; updated_at: string }>();

  if (error) {
    console.warn('cloud-sync fetch error', error);
    return null;
  }
  if (!data) return null;

  return {
    progress: data.data,
    updatedAt: new Date(data.updated_at).getTime(),
  };
}

/** Upload current localStorage progress to cloud (immediate, no debounce). */
export async function uploadCloudProgress(): Promise<{ ok: true } | { error: string }> {
  const sb = getSupabase();
  if (!sb) return { error: 'not_configured' };
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: 'not_signed_in' };

  const local = getProgress();
  const row: Pick<CloudRow, 'user_id' | 'data'> = {
    user_id: user.id,
    data: local,
  };
  const { error } = await sb.from(TABLE).upsert(row, { onConflict: 'user_id' });
  if (error) {
    console.warn('cloud-sync upload error', error);
    return { error: error.message };
  }
  lastUploadedAt = Date.now();
  return { ok: true };
}

/** Schedule a debounced upload — call from the storage record* functions. */
export function scheduleUpload() {
  if (typeof window === 'undefined') return;
  const sb = getSupabase();
  if (!sb) return;
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    void uploadCloudProgress();
  }, DEBOUNCE_MS);
}

/**
 * Reconcile local and cloud on sign-in.
 *
 * Returns one of:
 *   - 'restored': cloud data replaced empty/older local
 *   - 'uploaded': local was newer/non-empty, uploaded to cloud
 *   - 'no_change': nothing to do
 */
export async function reconcileOnSignIn(): Promise<'restored' | 'uploaded' | 'no_change'> {
  const cloud = await fetchCloudProgress();
  const local = getProgress();
  const localTotal = sumAttempts(local);

  if (!cloud) {
    // First sign-in for this user — just push local up if there's anything.
    if (localTotal > 0) {
      await uploadCloudProgress();
      return 'uploaded';
    }
    return 'no_change';
  }

  const cloudTotal = sumAttempts(cloud.progress);

  // Empty local: trust cloud unconditionally.
  if (localTotal === 0) {
    saveProgress(cloud.progress);
    return 'restored';
  }

  // Cloud is empty or smaller: local wins.
  if (cloudTotal === 0 || localTotal > cloudTotal) {
    await uploadCloudProgress();
    return 'uploaded';
  }

  // Cloud has more — restore (the user did more on another device).
  if (cloudTotal > localTotal) {
    saveProgress(cloud.progress);
    return 'restored';
  }

  return 'no_change';
}

function sumAttempts(p: Progress): number {
  let n = 0;
  for (const s of Object.values(p.byCategory ?? {})) if (s) n += s.attempts;
  for (const s of Object.values(p.authenticity ?? {})) if (s) n += s.attempts;
  return n;
}

/** Helper for UI — was the last upload successful and recent? */
export function lastUploadInfo() {
  return { lastUploadedAt };
}
