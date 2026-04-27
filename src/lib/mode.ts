/**
 * Training mode preference (MCQ vs free-text).
 *
 * Persisted in localStorage as a single string. Read on /train mount,
 * synced via the toggle in the page header. Outside the main Progress
 * blob because it's a UI preference, not progress data.
 */

const KEY = 'emo-training:mode';

export type TrainMode = 'mcq' | 'free';

export function getMode(): TrainMode {
  if (typeof window === 'undefined') return 'mcq';
  try {
    const v = localStorage.getItem(KEY);
    return v === 'free' ? 'free' : 'mcq';
  } catch {
    return 'mcq';
  }
}

export function setMode(m: TrainMode) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, m);
  } catch {
    // ignore — quota/private mode
  }
}
