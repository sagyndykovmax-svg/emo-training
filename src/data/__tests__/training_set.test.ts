import { describe, it, expect } from 'vitest';
import { pickNextCard, TRAINING_CARDS } from '../training_set';

describe('pickNextCard', () => {
  it('returns null when no cards eligible at the requested tier', () => {
    // Tier 0 doesn't exist — no cards have difficulty <= 0.
    const result = pickNextCard({
      unlockedTier: 0 as 1,
      seenCardIds: [],
    });
    expect(result).toBeNull();
  });

  it('only returns cards at or below unlocked tier', () => {
    // Tier 1: should never get a tier-2 or tier-3 card.
    for (let i = 0; i < 30; i++) {
      const card = pickNextCard({ unlockedTier: 1, seenCardIds: [] });
      expect(card).not.toBeNull();
      expect(card!.difficulty).toBe(1);
    }
  });

  it('prioritizes due cards over unseen ones', () => {
    // joy-1 is "due" — should be returned even though others are unseen.
    const result = pickNextCard({
      unlockedTier: 1,
      seenCardIds: ['joy-1', 'joy-2', 'sadness-1'],
      dueCardIds: ['joy-1'],
    });
    expect(result?.id).toBe('joy-1');
  });

  it('walks through dueCardIds list in order until finding eligible one', () => {
    // surprise-3 is tier 1 (eligible at tier 1), tier-3 cards are not eligible.
    const result = pickNextCard({
      unlockedTier: 1,
      seenCardIds: [],
      dueCardIds: ['anxiety-1', 'surprise-3'], // anxiety-1 is tier 3 — skip; surprise-3 is tier 1 — pick
    });
    expect(result?.id).toBe('surprise-3');
  });

  it('skips due cards in recentCardIds (anti-back-to-back)', () => {
    // joy-1 is due but recently seen — should fall through to unseen pool.
    const result = pickNextCard({
      unlockedTier: 1,
      seenCardIds: ['joy-1'],
      dueCardIds: ['joy-1'],
      recentCardIds: ['joy-1'],
    });
    expect(result?.id).not.toBe('joy-1');
  });

  it('falls through to unseen cards when no due', () => {
    // Mark all sad cards as seen, none due → expect a non-sad unseen card.
    const seen = TRAINING_CARDS.filter((c) => c.emotionId === 'joy').map((c) => c.id);
    const result = pickNextCard({
      unlockedTier: 1,
      seenCardIds: seen,
    });
    expect(result?.emotionId).not.toBe('joy');
  });

  it('falls through to emotion-level due when per-card due is empty', () => {
    // All eligible cards have been seen; emotion-level due flags 'sadness' as overdue.
    // Should pick a sadness card.
    const allSeen = TRAINING_CARDS.filter((c) => c.difficulty === 1).map((c) => c.id);
    const result = pickNextCard({
      unlockedTier: 1,
      seenCardIds: allSeen,
      dueCardIds: [],
      dueRanked: ['sadness'],
    });
    expect(result?.emotionId).toBe('sadness');
  });

  it('avoids back-to-back even in random fallback', () => {
    const allEligible = TRAINING_CARDS.filter((c) => c.difficulty === 1).map((c) => c.id);
    // Take the first card and mark it as recent — it shouldn't come up again immediately.
    const recent = [allEligible[0]];
    for (let i = 0; i < 20; i++) {
      const result = pickNextCard({
        unlockedTier: 1,
        seenCardIds: allEligible,
        recentCardIds: recent,
      });
      expect(result?.id).not.toBe(allEligible[0]);
    }
  });

  it('returns SOMETHING even when all eligible cards are recent (last-resort)', () => {
    // Pathological case — every eligible card is "recent". Function should still return.
    const allEligible = TRAINING_CARDS.filter((c) => c.difficulty === 1).map((c) => c.id);
    const result = pickNextCard({
      unlockedTier: 1,
      seenCardIds: allEligible,
      recentCardIds: allEligible,
    });
    expect(result).not.toBeNull();
  });
});
