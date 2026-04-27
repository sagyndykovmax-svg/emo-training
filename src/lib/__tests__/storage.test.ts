import { describe, it, expect, beforeEach } from 'vitest';
import {
  authenticityPerPair,
  authenticityTotals,
  bestStreak,
  confusionCount,
  confusionMatrix,
  currentStreak,
  dueCardsRanked,
  dueRanked,
  emotionsTouched,
  formatDuration,
  getProgress,
  progressToNextTier,
  recordAnswer,
  recordAuthenticityAnswer,
  resetProgress,
  saveProgress,
  strengthsAndWeaknesses,
  topConfusions,
  totals,
} from '../storage';

beforeEach(() => {
  resetProgress();
});

describe('getProgress / saveProgress (round-trip)', () => {
  it('returns an empty progress object when localStorage is empty', () => {
    const p = getProgress();
    expect(p.byCategory).toEqual({});
    expect(p.unlockedTier).toBe(1);
    expect(p.seenCardIds).toEqual([]);
    expect(p.recentAnswers).toEqual([]);
    expect(p.totalTimeMs).toBe(0);
    expect(p.authenticity).toEqual({});
    expect(p.byCard).toEqual({});
  });

  it('round-trips a saved progress through localStorage', () => {
    const p = getProgress();
    p.totalTimeMs = 12345;
    saveProgress(p);
    const restored = getProgress();
    expect(restored.totalTimeMs).toBe(12345);
  });

  it('hydrates missing keys with defaults from older shapes', () => {
    // Simulate a v0.1 blob with no recentAnswers / authenticity / byCard.
    localStorage.setItem(
      'emo-training:progress:v1',
      JSON.stringify({
        byCategory: {},
        unlockedTier: 1,
        seenCardIds: ['joy-1'],
        startedAt: 12345,
      }),
    );
    const p = getProgress();
    expect(p.recentAnswers).toEqual([]);
    expect(p.authenticity).toEqual({});
    expect(p.byCard).toEqual({});
    expect(p.totalTimeMs).toBe(0);
    expect(p.tierUnlockedAt[1]).toBe(12345);
    expect(p.seenCardIds).toEqual(['joy-1']);
  });
});

describe('recordAnswer — category stats', () => {
  it('increments attempts and correct on a correct answer', () => {
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    const p = getProgress();
    expect(p.byCategory.joy?.attempts).toBe(1);
    expect(p.byCategory.joy?.correct).toBe(1);
    expect(p.byCategory.joy?.partialCorrect).toBe(0);
  });

  it('counts a partial answer separately from full correct', () => {
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'social_smile',
      outcome: 'partial',
    });
    const p = getProgress();
    expect(p.byCategory.joy?.attempts).toBe(1);
    expect(p.byCategory.joy?.correct).toBe(0);
    expect(p.byCategory.joy?.partialCorrect).toBe(1);
  });

  it('appends to recentAnswers (newest first) with mode default of mcq', () => {
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    const p = getProgress();
    expect(p.recentAnswers).toHaveLength(1);
    expect(p.recentAnswers[0].cardId).toBe('joy-1');
    expect(p.recentAnswers[0].mode).toBe('mcq');
  });

  it('records explicit free-text mode', () => {
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
      mode: 'free',
    });
    expect(getProgress().recentAnswers[0].mode).toBe('free');
  });

  it('accumulates totalTimeMs from per-answer timeMs', () => {
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
      timeMs: 4000,
    });
    recordAnswer({
      cardId: 'joy-2',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
      timeMs: 6000,
    });
    expect(getProgress().totalTimeMs).toBe(10000);
  });

  it('caps single-card timeMs contribution to prevent idle-tab inflation', () => {
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
      timeMs: 10 * 60 * 1000, // 10 minutes — over the 5-min cap
    });
    expect(getProgress().totalTimeMs).toBe(0);
  });
});

describe('recordAnswer — per-card SM-2', () => {
  it('initializes byCard and keeps default eFactor=2.5 after a "correct" (q=4) answer', () => {
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    const stats = getProgress().byCard['joy-1'];
    // SM-2 formula: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
    // For q=4: (1)*(0.08 + 0.02) = 0.1, so EF' = EF + 0 = unchanged.
    // EF only grows on q=5 (perfect quick recall — not currently mapped from "correct").
    expect(stats?.eFactor).toBeCloseTo(2.5, 2);
    expect(stats?.interval).toBe(1); // first correct
  });

  it('grows interval through 1 → 6 → 6×EF on consecutive correct', () => {
    // First correct
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    expect(getProgress().byCard['joy-1']?.interval).toBe(1);

    // Second correct
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    expect(getProgress().byCard['joy-1']?.interval).toBe(6);

    // Third correct → 6 × eFactor
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    const stats = getProgress().byCard['joy-1'];
    expect(stats?.interval).toBeGreaterThanOrEqual(6);
    expect(stats?.interval).toBeLessThanOrEqual(20);
  });

  it('resets interval to 1 on wrong answer', () => {
    // Build up some streak
    for (let i = 0; i < 3; i++) {
      recordAnswer({
        cardId: 'joy-1',
        correctEmotion: 'joy',
        chosenEmotion: 'joy',
        outcome: 'correct',
      });
    }
    // Wrong
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'anger',
      outcome: 'wrong',
    });
    expect(getProgress().byCard['joy-1']?.interval).toBe(1);
  });

  it('keeps eFactor floor at 1.3', () => {
    // Wrong answers don't reduce eFactor in our impl, but test that floor is respected
    // by manipulating eFactor directly via saveProgress.
    const p = getProgress();
    p.byCard['joy-1'] = {
      attempts: 0,
      correct: 0,
      partial: 0,
      lastSeenAt: 0,
      eFactor: 1.3,
      interval: 0,
      nextReviewAt: 0,
    };
    saveProgress(p);
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    expect(getProgress().byCard['joy-1']!.eFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('caps interval at 100 attempts', () => {
    // Force a large interval directly.
    const p = getProgress();
    p.byCard['joy-1'] = {
      attempts: 5,
      correct: 5,
      partial: 0,
      lastSeenAt: 0,
      eFactor: 2.5,
      interval: 80,
      nextReviewAt: 80,
    };
    saveProgress(p);
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    expect(getProgress().byCard['joy-1']!.interval).toBeLessThanOrEqual(100);
  });
});

describe('recordAnswer — tier unlock', () => {
  it('does not unlock tier 2 with fewer than 6 attempts', () => {
    for (let i = 0; i < 5; i++) {
      recordAnswer({
        cardId: `joy-${i}`,
        correctEmotion: 'joy',
        chosenEmotion: 'joy',
        outcome: 'correct',
      });
    }
    expect(getProgress().unlockedTier).toBe(1);
  });

  it('unlocks tier 2 at 6 correct answers (>=70%)', () => {
    let lastResult;
    for (let i = 0; i < 6; i++) {
      lastResult = recordAnswer({
        cardId: `joy-${i}`,
        correctEmotion: 'joy',
        chosenEmotion: 'joy',
        outcome: 'correct',
      });
    }
    expect(lastResult?.unlockedTier).toBe(2);
    expect(getProgress().unlockedTier).toBe(2);
  });

  it('does not unlock tier 2 at 6 attempts with low accuracy', () => {
    // 6 attempts, all wrong → 0% accuracy
    for (let i = 0; i < 6; i++) {
      recordAnswer({
        cardId: `joy-${i}`,
        correctEmotion: 'joy',
        chosenEmotion: 'anger',
        outcome: 'wrong',
      });
    }
    expect(getProgress().unlockedTier).toBe(1);
  });
});

describe('streaks', () => {
  it('currentStreak counts consecutive correct from front of recentAnswers', () => {
    recordAnswer({ cardId: 'a', correctEmotion: 'joy', chosenEmotion: 'joy', outcome: 'correct' });
    recordAnswer({ cardId: 'b', correctEmotion: 'joy', chosenEmotion: 'joy', outcome: 'correct' });
    recordAnswer({ cardId: 'c', correctEmotion: 'joy', chosenEmotion: 'joy', outcome: 'wrong' });
    recordAnswer({ cardId: 'd', correctEmotion: 'joy', chosenEmotion: 'joy', outcome: 'correct' });
    expect(currentStreak(getProgress())).toBe(1); // newest first: correct, then wrong breaks
  });

  it('bestStreak finds the longest historical run', () => {
    recordAnswer({ cardId: 'a', correctEmotion: 'joy', chosenEmotion: 'joy', outcome: 'correct' });
    recordAnswer({ cardId: 'b', correctEmotion: 'joy', chosenEmotion: 'joy', outcome: 'correct' });
    recordAnswer({ cardId: 'c', correctEmotion: 'joy', chosenEmotion: 'joy', outcome: 'correct' });
    recordAnswer({ cardId: 'd', correctEmotion: 'joy', chosenEmotion: 'joy', outcome: 'wrong' });
    recordAnswer({ cardId: 'e', correctEmotion: 'joy', chosenEmotion: 'joy', outcome: 'correct' });
    expect(bestStreak(getProgress())).toBe(3);
  });
});

describe('confusionCount', () => {
  it('counts MCQ-mode confusions only', () => {
    recordAnswer({
      cardId: 'a',
      correctEmotion: 'joy',
      chosenEmotion: 'social_smile',
      outcome: 'partial',
    });
    recordAnswer({
      cardId: 'b',
      correctEmotion: 'joy',
      chosenEmotion: 'social_smile',
      outcome: 'partial',
    });
    // Free-mode answer with same shape — should NOT count.
    recordAnswer({
      cardId: 'c',
      correctEmotion: 'joy',
      chosenEmotion: 'social_smile',
      outcome: 'partial',
      mode: 'free',
    });
    expect(confusionCount(getProgress(), 'joy', 'social_smile')).toBe(2);
  });

  it('returns 0 for never-confused pairs', () => {
    recordAnswer({
      cardId: 'a',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    expect(confusionCount(getProgress(), 'joy', 'anger')).toBe(0);
  });
});

describe('topConfusions', () => {
  it('returns confusions sorted by count desc', () => {
    // joy → social_smile (3 times)
    for (let i = 0; i < 3; i++) {
      recordAnswer({
        cardId: `a-${i}`,
        correctEmotion: 'joy',
        chosenEmotion: 'social_smile',
        outcome: 'partial',
      });
    }
    // anger → contempt (1 time)
    recordAnswer({
      cardId: 'b',
      correctEmotion: 'anger',
      chosenEmotion: 'contempt',
      outcome: 'partial',
    });

    const top = topConfusions(getProgress(), 5);
    expect(top[0]).toEqual({ correctEmotion: 'joy', chosenEmotion: 'social_smile', count: 3 });
    expect(top[1]).toEqual({ correctEmotion: 'anger', chosenEmotion: 'contempt', count: 1 });
  });

  it('respects the limit parameter', () => {
    for (let i = 0; i < 10; i++) {
      recordAnswer({
        cardId: `card-${i}`,
        correctEmotion: 'joy',
        chosenEmotion: i % 2 === 0 ? 'social_smile' : 'anger',
        outcome: 'wrong',
      });
    }
    expect(topConfusions(getProgress(), 1)).toHaveLength(1);
  });
});

describe('confusionMatrix + emotionsTouched', () => {
  it('builds nested map of correct→chosen→count, MCQ only', () => {
    recordAnswer({
      cardId: 'a',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    recordAnswer({
      cardId: 'b',
      correctEmotion: 'joy',
      chosenEmotion: 'social_smile',
      outcome: 'partial',
    });
    recordAnswer({
      cardId: 'c',
      correctEmotion: 'joy',
      chosenEmotion: 'social_smile',
      outcome: 'partial',
      mode: 'free', // excluded
    });

    const m = confusionMatrix(getProgress());
    expect(m.get('joy')?.get('joy')).toBe(1);
    expect(m.get('joy')?.get('social_smile')).toBe(1); // free-mode excluded
  });

  it('emotionsTouched returns unique emotions from MCQ history', () => {
    recordAnswer({
      cardId: 'a',
      correctEmotion: 'joy',
      chosenEmotion: 'social_smile',
      outcome: 'partial',
    });
    recordAnswer({
      cardId: 'b',
      correctEmotion: 'anger',
      chosenEmotion: 'anger',
      outcome: 'correct',
    });
    const touched = emotionsTouched(getProgress());
    expect(touched.sort()).toEqual(['anger', 'joy', 'social_smile'].sort());
  });
});

describe('strengthsAndWeaknesses', () => {
  it('ranks emotions by accuracy with min attempts threshold', () => {
    // joy: 5/5 = 100%
    for (let i = 0; i < 5; i++) {
      recordAnswer({
        cardId: `j-${i}`,
        correctEmotion: 'joy',
        chosenEmotion: 'joy',
        outcome: 'correct',
      });
    }
    // anger: 1/5 = 20%
    for (let i = 0; i < 5; i++) {
      recordAnswer({
        cardId: `a-${i}`,
        correctEmotion: 'anger',
        chosenEmotion: i === 0 ? 'anger' : 'contempt',
        outcome: i === 0 ? 'correct' : 'partial',
      });
    }
    // sadness: 1 attempt — below default threshold, excluded
    recordAnswer({
      cardId: 's-0',
      correctEmotion: 'sadness',
      chosenEmotion: 'sadness',
      outcome: 'correct',
    });

    const sw = strengthsAndWeaknesses(getProgress());
    expect(sw.strengths[0].emotionId).toBe('joy');
    expect(sw.weaknesses[0].emotionId).toBe('anger');
    expect(sw.all.find((r) => r.emotionId === 'sadness')).toBeUndefined();
  });
});

describe('progressToNextTier', () => {
  it('returns null when tier 3 already unlocked', () => {
    const p = getProgress();
    p.unlockedTier = 3;
    saveProgress(p);
    expect(progressToNextTier(getProgress())).toBeNull();
  });

  it('returns required attempts and accuracy at tier 1', () => {
    const info = progressToNextTier(getProgress());
    expect(info?.nextTier).toBe(2);
    expect(info?.attemptsNeeded).toBe(6);
  });
});

describe('dueRanked + dueCardsRanked', () => {
  it('dueRanked returns emotions ordered by overdue', () => {
    // First answer schedules joy; not yet overdue.
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    // Several more attempts on other emotions advance the global clock.
    for (let i = 0; i < 15; i++) {
      recordAnswer({
        cardId: `card-${i}`,
        correctEmotion: 'anger',
        chosenEmotion: 'anger',
        outcome: 'correct',
      });
    }
    // Now joy should be due (clocked past its review point).
    const due = dueRanked(getProgress());
    expect(due).toContain('joy');
  });

  it('dueCardsRanked filters by eligibleIds and excludes never-answered cards', () => {
    recordAnswer({
      cardId: 'joy-1',
      correctEmotion: 'joy',
      chosenEmotion: 'anger',
      outcome: 'wrong',
    });
    // wrong → interval=1 → next review at clock+1 = 2; current clock = 1 → not yet overdue
    expect(dueCardsRanked(getProgress(), ['joy-1', 'joy-2'])).not.toContain('joy-1');

    // Advance clock past review point
    recordAnswer({
      cardId: 'joy-2',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    recordAnswer({
      cardId: 'joy-2',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    expect(dueCardsRanked(getProgress(), ['joy-1', 'joy-2'])).toContain('joy-1');
  });
});

describe('authenticity', () => {
  it('recordAuthenticityAnswer increments correct on isCorrect=true', () => {
    recordAuthenticityAnswer({ pairId: 'auth-joy', isCorrect: true });
    const p = getProgress();
    expect(p.authenticity['auth-joy']?.attempts).toBe(1);
    expect(p.authenticity['auth-joy']?.correct).toBe(1);
    expect(p.authenticity['auth-joy']?.streak).toBe(1);
  });

  it('resets streak on wrong answer', () => {
    recordAuthenticityAnswer({ pairId: 'auth-joy', isCorrect: true });
    recordAuthenticityAnswer({ pairId: 'auth-joy', isCorrect: true });
    recordAuthenticityAnswer({ pairId: 'auth-joy', isCorrect: false });
    expect(getProgress().authenticity['auth-joy']?.streak).toBe(0);
  });

  it('authenticityTotals aggregates across pairs', () => {
    recordAuthenticityAnswer({ pairId: 'auth-joy', isCorrect: true });
    recordAuthenticityAnswer({ pairId: 'auth-sadness', isCorrect: false });
    recordAuthenticityAnswer({ pairId: 'auth-anger', isCorrect: true });

    const t = authenticityTotals(getProgress());
    expect(t.attempts).toBe(3);
    expect(t.correct).toBe(2);
    expect(t.accuracy).toBeCloseTo(2 / 3, 4);
  });

  it('authenticityPerPair sorts by attempts desc', () => {
    for (let i = 0; i < 3; i++) recordAuthenticityAnswer({ pairId: 'auth-joy', isCorrect: true });
    for (let i = 0; i < 5; i++) recordAuthenticityAnswer({ pairId: 'auth-anger', isCorrect: i < 2 });

    const breakdown = authenticityPerPair(getProgress());
    expect(breakdown[0].pairId).toBe('auth-anger');
    expect(breakdown[0].attempts).toBe(5);
    expect(breakdown[1].pairId).toBe('auth-joy');
  });

  it('excludes pairs with zero attempts', () => {
    recordAuthenticityAnswer({ pairId: 'auth-joy', isCorrect: true });
    const breakdown = authenticityPerPair(getProgress());
    expect(breakdown).toHaveLength(1);
    expect(breakdown[0].pairId).toBe('auth-joy');
  });
});

describe('formatDuration', () => {
  it('formats sub-minute durations in seconds', () => {
    expect(formatDuration(45_000)).toBe('45 сек');
  });

  it('formats sub-hour durations in minutes', () => {
    expect(formatDuration(180_000)).toBe('3 мин');
  });

  it('formats multi-hour durations as hours + minutes', () => {
    expect(formatDuration(3 * 3600_000 + 25 * 60_000)).toBe('3 ч 25 мин');
  });
});

describe('totals', () => {
  it('returns zeros on empty progress', () => {
    const t = totals(getProgress());
    expect(t.attempts).toBe(0);
    expect(t.accuracy).toBe(0);
  });

  it('weights partial answers as half', () => {
    recordAnswer({
      cardId: 'a',
      correctEmotion: 'joy',
      chosenEmotion: 'joy',
      outcome: 'correct',
    });
    recordAnswer({
      cardId: 'b',
      correctEmotion: 'joy',
      chosenEmotion: 'social_smile',
      outcome: 'partial',
    });
    const t = totals(getProgress());
    expect(t.attempts).toBe(2);
    expect(t.correct).toBe(1);
    expect(t.partial).toBe(1);
    // (1 + 0.5) / 2 = 0.75
    expect(t.accuracy).toBeCloseTo(0.75, 4);
  });
});
