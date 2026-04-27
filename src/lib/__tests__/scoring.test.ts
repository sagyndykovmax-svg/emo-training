import { describe, it, expect } from 'vitest';
import { scoreAnswer, buildOptions } from '../scoring';
import { EMOTIONS } from '@/data/emotions';

describe('scoreAnswer', () => {
  it('returns "correct" when chosen matches the correct emotion', () => {
    expect(scoreAnswer('joy', 'joy')).toBe('correct');
    expect(scoreAnswer('contempt', 'contempt')).toBe('correct');
    expect(scoreAnswer('suppressed_anger', 'suppressed_anger')).toBe('correct');
  });

  it('returns "partial" when chosen is in the correct emotion\'s confusedWith list', () => {
    // joy.confusedWith includes 'social_smile'
    expect(EMOTIONS.joy.confusedWith).toContain('social_smile');
    expect(scoreAnswer('social_smile', 'joy')).toBe('partial');

    // anger.confusedWith includes 'contempt'
    expect(EMOTIONS.anger.confusedWith).toContain('contempt');
    expect(scoreAnswer('contempt', 'anger')).toBe('partial');
  });

  it('returns "wrong" when chosen is unrelated', () => {
    // anger.confusedWith does NOT include 'joy'
    expect(EMOTIONS.anger.confusedWith).not.toContain('joy');
    expect(scoreAnswer('joy', 'anger')).toBe('wrong');

    expect(scoreAnswer('disgust', 'surprise')).toBe('wrong');
  });
});

describe('buildOptions', () => {
  it('always includes the correct emotion in the options', () => {
    const opts = buildOptions('joy', 6);
    expect(opts).toContain('joy');
  });

  it('returns the requested number of options when pool is large enough', () => {
    const opts = buildOptions('joy', 6);
    expect(opts).toHaveLength(6);
  });

  it('returns at most all available emotions when pool is small', () => {
    // With count = 25 (more than total emotions), should still cap at total.
    const opts = buildOptions('joy', 25);
    expect(opts.length).toBeLessThanOrEqual(Object.keys(EMOTIONS).length);
    expect(opts).toContain('joy');
  });

  it('prioritizes the correct emotion\'s confusedWith list as distractors', () => {
    // contempt.confusedWith should appear in the option pool with high probability.
    const correctMeta = EMOTIONS.contempt;
    const opts = buildOptions('contempt', 6);
    // At least one confusedWith should appear (deterministic since pool is small).
    const hasConfused = correctMeta.confusedWith.some((id) => opts.includes(id));
    expect(hasConfused).toBe(true);
  });

  it('shuffles options (different orderings across calls)', () => {
    // Statistical: across 20 calls we should see at least 2 different positions for the correct answer.
    const positions = new Set<number>();
    for (let i = 0; i < 20; i++) {
      const opts = buildOptions('joy', 6);
      positions.add(opts.indexOf('joy'));
    }
    expect(positions.size).toBeGreaterThan(1);
  });

  it('does not include duplicates', () => {
    const opts = buildOptions('joy', 6);
    expect(new Set(opts).size).toBe(opts.length);
  });
});
