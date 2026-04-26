/**
 * Typed wrapper around Vercel Analytics' `track()`.
 *
 * Why a wrapper:
 *   1. Single source of truth for event names and prop schemas — refactor
 *      surface stays in one place.
 *   2. No-ops gracefully on the server and in dev without VERCEL set, so
 *      production code calls remain pure and don't depend on a runtime check.
 *   3. Documents the event taxonomy in code, not in someone's notes.
 *
 * Privacy stance:
 *   - No personally identifiable info is sent. No emotion-level user data
 *     beyond aggregate per-event props.
 *   - Vercel Analytics doesn't set cookies; honors Do Not Track by default.
 */

import { track as vercelTrack } from '@vercel/analytics';

type EventMap = {
  /** User completed the demo card on the landing page. */
  demo_answered: { correct: boolean };
  /** User clicked any "start trainer" CTA. */
  cta_clicked: { location: 'hero' | 'secondary' | 'demo' };
  /** A real training card was answered (writes to localStorage). */
  card_answered: {
    outcome: 'correct' | 'partial' | 'wrong';
    tier: 1 | 2 | 3;
    /** Total cards user has answered, post-this-one. Bucket-friendly. */
    total: number;
  };
  /** Tier 2 or 3 just unlocked. */
  tier_unlocked: { tier: 2 | 3 };
  /** The "you've done 15 cards in a row, take a break" modal appeared. */
  pause_shown: { sessionCount: number };
  /** User clicked "посмотреть прогресс" in the pause modal (gentle off-ramp). */
  pause_offramp: Record<string, never>;
  /** User reset their progress on /progress page. */
  progress_reset: { totalCardsBeforeReset: number };
};

export function track<K extends keyof EventMap>(event: K, props?: EventMap[K]) {
  if (typeof window === 'undefined') return;
  try {
    vercelTrack(event, props as Record<string, string | number | boolean | null>);
  } catch {
    // Analytics failures are never user-facing — swallow.
  }
}
