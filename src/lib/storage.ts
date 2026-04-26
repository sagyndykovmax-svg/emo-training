/**
 * localStorage-backed progression. No accounts, no server — privacy by default.
 */

import type { EmotionId } from '@/data/emotions';

const KEY = 'emo-training:progress:v1';

export interface CategoryStats {
  attempts: number;
  correct: number;
  partialCorrect: number;
  lastSeenAt: number;
}

export interface Progress {
  byCategory: Partial<Record<EmotionId, CategoryStats>>;
  unlockedTier: 1 | 2 | 3;
  seenCardIds: string[];
  startedAt: number;
}

const empty: Progress = {
  byCategory: {},
  unlockedTier: 1,
  seenCardIds: [],
  startedAt: Date.now(),
};

export function getProgress(): Progress {
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return { ...empty, ...parsed, byCategory: parsed.byCategory ?? {} };
  } catch {
    return empty;
  }
}

export function saveProgress(p: Progress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function recordAnswer(opts: {
  cardId: string;
  emotionId: EmotionId;
  outcome: 'correct' | 'partial' | 'wrong';
}) {
  const p = getProgress();
  const stats = p.byCategory[opts.emotionId] ?? {
    attempts: 0,
    correct: 0,
    partialCorrect: 0,
    lastSeenAt: 0,
  };
  stats.attempts += 1;
  stats.lastSeenAt = Date.now();
  if (opts.outcome === 'correct') stats.correct += 1;
  if (opts.outcome === 'partial') stats.partialCorrect += 1;
  p.byCategory[opts.emotionId] = stats;
  if (!p.seenCardIds.includes(opts.cardId)) p.seenCardIds.push(opts.cardId);

  // Tier unlock: ≥6 cards seen at current tier with ≥70% accuracy ⇒ unlock next.
  const tierAccuracy = computeTierAccuracy(p, p.unlockedTier);
  if (tierAccuracy.attempts >= 6 && tierAccuracy.rate >= 0.7 && p.unlockedTier < 3) {
    p.unlockedTier = (p.unlockedTier + 1) as 1 | 2 | 3;
  }
  saveProgress(p);
  return p;
}

function computeTierAccuracy(p: Progress, _tier: 1 | 2 | 3) {
  // Simple aggregate of all categories — refined when emotions.ts is loaded.
  let attempts = 0;
  let correct = 0;
  for (const stats of Object.values(p.byCategory)) {
    if (!stats) continue;
    attempts += stats.attempts;
    correct += stats.correct + 0.5 * stats.partialCorrect;
  }
  return { attempts, rate: attempts ? correct / attempts : 0 };
}

export function resetProgress() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
