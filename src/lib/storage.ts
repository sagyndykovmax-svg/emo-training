/**
 * localStorage-backed progression. No accounts, no server — privacy by default.
 *
 * v2: tracks recent answers (for confusion matrix), tier unlock timestamps,
 * and accumulated training time. Backward-compatible reads from v1 shape.
 */

import type { EmotionId } from '@/data/emotions';
import type { Outcome } from './scoring';

const KEY = 'emo-training:progress:v1';

export interface CategoryStats {
  attempts: number;
  correct: number;
  partialCorrect: number;
  lastSeenAt: number;
  /**
   * Spaced-repetition scheduling fields (added v0.3).
   * `nextReviewAt` is the global attempt count at which this emotion is due
   * to reappear. `streak` counts consecutive correct full-credit answers and
   * drives the spacing growth (longer gaps as the user demonstrates mastery).
   */
  nextReviewAt?: number;
  streak?: number;
}

export interface AnswerRecord {
  cardId: string;
  correctEmotion: EmotionId;
  chosenEmotion: EmotionId;
  outcome: Outcome;
  at: number;
  /** ms taken to answer this card */
  timeMs?: number;
}

export interface Progress {
  byCategory: Partial<Record<EmotionId, CategoryStats>>;
  unlockedTier: 1 | 2 | 3;
  seenCardIds: string[];
  startedAt: number;
  /** When each tier was unlocked. tier 1 = startedAt. */
  tierUnlockedAt: { 1: number; 2?: number; 3?: number };
  /** Last ~200 answers, newest first. Used for confusion matrix and streaks. */
  recentAnswers: AnswerRecord[];
  /** Accumulated active training time in ms. */
  totalTimeMs: number;
}

const RECENT_CAP = 200;

function emptyProgress(): Progress {
  const now = Date.now();
  return {
    byCategory: {},
    unlockedTier: 1,
    seenCardIds: [],
    startedAt: now,
    tierUnlockedAt: { 1: now },
    recentAnswers: [],
    totalTimeMs: 0,
  };
}

export function getProgress(): Progress {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    // Merge with defaults to handle older versions of the schema.
    const base = emptyProgress();
    return {
      ...base,
      ...parsed,
      byCategory: parsed.byCategory ?? {},
      tierUnlockedAt: parsed.tierUnlockedAt ?? { 1: parsed.startedAt ?? base.startedAt },
      recentAnswers: parsed.recentAnswers ?? [],
      totalTimeMs: parsed.totalTimeMs ?? 0,
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: Progress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export interface RecordAnswerInput {
  cardId: string;
  correctEmotion: EmotionId;
  chosenEmotion: EmotionId;
  outcome: Outcome;
  timeMs?: number;
}

/**
 * Records an answer, updates per-category stats, and unlocks the next tier
 * if the threshold is met. Returns the updated Progress and whether a tier
 * was just unlocked (so the caller can show a celebration).
 */
export function recordAnswer(input: RecordAnswerInput): {
  progress: Progress;
  unlockedTier: 2 | 3 | null;
} {
  const p = getProgress();
  const stats = p.byCategory[input.correctEmotion] ?? {
    attempts: 0,
    correct: 0,
    partialCorrect: 0,
    lastSeenAt: 0,
    streak: 0,
  };
  stats.attempts += 1;
  stats.lastSeenAt = Date.now();
  if (input.outcome === 'correct') stats.correct += 1;
  if (input.outcome === 'partial') stats.partialCorrect += 1;

  // ── Spaced-repetition scheduling ──────────────────────────────────────────
  // The "clock" is the global attempt count (totals(p).attempts after this
  // record is added below in updateOverall). We compute it inline to avoid
  // a circular call.
  const clock = totalAttemptsFor(p) + 1; // +1 because we just incremented stats.attempts
  const prevStreak = stats.streak ?? 0;
  if (input.outcome === 'correct') {
    stats.streak = prevStreak + 1;
  } else {
    stats.streak = 0;
  }
  stats.nextReviewAt = clock + spacingFor(input.outcome, stats.streak);

  p.byCategory[input.correctEmotion] = stats;

  if (!p.seenCardIds.includes(input.cardId)) p.seenCardIds.push(input.cardId);

  // Append to recent answers log (newest first, capped).
  p.recentAnswers.unshift({
    cardId: input.cardId,
    correctEmotion: input.correctEmotion,
    chosenEmotion: input.chosenEmotion,
    outcome: input.outcome,
    at: Date.now(),
    timeMs: input.timeMs,
  });
  if (p.recentAnswers.length > RECENT_CAP) p.recentAnswers = p.recentAnswers.slice(0, RECENT_CAP);

  if (input.timeMs && input.timeMs > 0 && input.timeMs < 5 * 60 * 1000) {
    // Cap a single card's contribution at 5 min to prevent inflation from idle tabs.
    p.totalTimeMs += input.timeMs;
  }

  // Tier unlock: ≥6 cards seen at current tier with ≥70% accuracy ⇒ unlock next.
  let unlockedThisTime: 2 | 3 | null = null;
  const tierAccuracy = computeOverallAccuracy(p);
  if (
    p.unlockedTier < 3 &&
    tierAccuracy.attempts >= 6 &&
    tierAccuracy.rate >= 0.7
  ) {
    const next = (p.unlockedTier + 1) as 2 | 3;
    p.unlockedTier = next;
    p.tierUnlockedAt[next] = Date.now();
    unlockedThisTime = next;
  }

  saveProgress(p);
  return { progress: p, unlockedTier: unlockedThisTime };
}

function computeOverallAccuracy(p: Progress) {
  let attempts = 0;
  let correct = 0;
  for (const stats of Object.values(p.byCategory)) {
    if (!stats) continue;
    attempts += stats.attempts;
    correct += stats.correct + 0.5 * stats.partialCorrect;
  }
  return { attempts, rate: attempts ? correct / attempts : 0 };
}

function totalAttemptsFor(p: Progress): number {
  let n = 0;
  for (const s of Object.values(p.byCategory)) if (s) n += s.attempts;
  return n;
}

/**
 * Spacing schedule (in card-attempts, not time):
 *   wrong       → review in 4 cards (immediate reinforcement)
 *   partial     → review in 8 cards (medium gap, you got the cluster but not the precision)
 *   correct,    streak 1 → 12
 *   correct,    streak 2 → 24
 *   correct,    streak 3 → 40
 *   correct,    streak 4+ → 60 (essentially "long-term" — won't reappear unless tier rotates)
 *
 * Modeled after a simplified SM-2: each successful recall ~doubles the gap.
 * Wrong answers reset the streak and bring the card back close.
 */
function spacingFor(outcome: Outcome, streakAfter: number): number {
  if (outcome === 'wrong') return 4;
  if (outcome === 'partial') return 8;
  // correct
  if (streakAfter <= 1) return 12;
  if (streakAfter === 2) return 24;
  if (streakAfter === 3) return 40;
  return 60;
}

/** Returns the EmotionIds that are due for review at the current global clock. */
export function dueForReview(p: Progress): EmotionId[] {
  const clock = totalAttemptsFor(p);
  const due: EmotionId[] = [];
  for (const [id, stats] of Object.entries(p.byCategory)) {
    if (!stats) continue;
    if (stats.nextReviewAt !== undefined && stats.nextReviewAt <= clock) {
      due.push(id as EmotionId);
    }
  }
  return due;
}

/** Returns EmotionIds sorted by how overdue they are (most overdue first). */
export function dueRanked(p: Progress): EmotionId[] {
  const clock = totalAttemptsFor(p);
  const ranked: { id: EmotionId; overdueBy: number }[] = [];
  for (const [id, stats] of Object.entries(p.byCategory)) {
    if (!stats || stats.nextReviewAt === undefined) continue;
    const overdueBy = clock - stats.nextReviewAt;
    if (overdueBy >= 0) ranked.push({ id: id as EmotionId, overdueBy });
  }
  ranked.sort((a, b) => b.overdueBy - a.overdueBy);
  return ranked.map((r) => r.id);
}

export function resetProgress() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

// ── Derived analytics ────────────────────────────────────────────────────────

/** Current run of consecutive correct answers (full credit only). */
export function currentStreak(p: Progress): number {
  let s = 0;
  for (const r of p.recentAnswers) {
    if (r.outcome === 'correct') s += 1;
    else break;
  }
  return s;
}

/** Best ever streak (scans full recentAnswers buffer). */
export function bestStreak(p: Progress): number {
  let best = 0;
  let cur = 0;
  // Iterate oldest → newest.
  for (let i = p.recentAnswers.length - 1; i >= 0; i--) {
    if (p.recentAnswers[i].outcome === 'correct') {
      cur += 1;
      if (cur > best) best = cur;
    } else {
      cur = 0;
    }
  }
  return best;
}

export interface EmotionAccuracy {
  emotionId: EmotionId;
  attempts: number;
  rate: number;
}

/** Sorted lists of strongest and weakest emotions (only those attempted). */
export function strengthsAndWeaknesses(p: Progress, minAttempts = 2) {
  const ranked: EmotionAccuracy[] = [];
  for (const [id, stats] of Object.entries(p.byCategory)) {
    if (!stats || stats.attempts < minAttempts) continue;
    const rate = (stats.correct + 0.5 * stats.partialCorrect) / stats.attempts;
    ranked.push({ emotionId: id as EmotionId, attempts: stats.attempts, rate });
  }
  ranked.sort((a, b) => b.rate - a.rate);
  return {
    strengths: ranked.slice(0, 3),
    weaknesses: [...ranked].reverse().slice(0, 3),
    all: ranked,
  };
}

/** Confusion pairs: when correctEmotion was X, what user picked instead. */
export interface Confusion {
  correctEmotion: EmotionId;
  chosenEmotion: EmotionId;
  count: number;
}

/** Count how many times a specific (correct → chosen) confusion appeared. */
export function confusionCount(
  p: Progress,
  correctId: EmotionId,
  chosenId: EmotionId,
): number {
  let n = 0;
  for (const r of p.recentAnswers) {
    if (r.correctEmotion === correctId && r.chosenEmotion === chosenId) n++;
  }
  return n;
}

export function topConfusions(p: Progress, limit = 5): Confusion[] {
  const counts = new Map<string, Confusion>();
  for (const r of p.recentAnswers) {
    if (r.outcome === 'correct') continue;
    const key = `${r.correctEmotion}::${r.chosenEmotion}`;
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { correctEmotion: r.correctEmotion, chosenEmotion: r.chosenEmotion, count: 1 });
  }
  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Total attempts and correct across all categories. */
export function totals(p: Progress) {
  let attempts = 0;
  let correct = 0;
  let partial = 0;
  for (const s of Object.values(p.byCategory)) {
    if (!s) continue;
    attempts += s.attempts;
    correct += s.correct;
    partial += s.partialCorrect;
  }
  const accuracy = attempts ? (correct + 0.5 * partial) / attempts : 0;
  return { attempts, correct, partial, accuracy };
}

/** How many more correct-equivalent answers are needed to unlock next tier. */
export function progressToNextTier(p: Progress) {
  if (p.unlockedTier >= 3) return null;
  const t = totals(p);
  const correctNeeded = Math.max(0, Math.ceil(0.7 * Math.max(6, t.attempts + 1)) - (t.correct + 0.5 * t.partial));
  const attemptsNeeded = Math.max(0, 6 - t.attempts);
  return {
    nextTier: (p.unlockedTier + 1) as 2 | 3,
    correctNeeded,
    attemptsNeeded,
    currentRate: t.accuracy,
  };
}

export function formatDuration(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)} сек`;
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins} мин`;
  const hrs = Math.floor(mins / 60);
  const remMin = mins % 60;
  return `${hrs} ч ${remMin} мин`;
}
