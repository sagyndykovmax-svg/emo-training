import { EMOTIONS, type EmotionId } from '@/data/emotions';

export type Outcome = 'correct' | 'partial' | 'wrong';

/**
 * Score a user's chosen emotion against the card's correct emotion.
 *
 * `partial` is awarded when the user picked something in the correct emotion's
 * `confusedWith` list — they were on the right track, just missed a finer
 * distinction. This rewards understanding the *cluster* of similar emotions
 * even when the precise label was wrong.
 */
export function scoreAnswer(chosen: EmotionId, correct: EmotionId): Outcome {
  if (chosen === correct) return 'correct';
  const meta = EMOTIONS[correct];
  if (meta.confusedWith.includes(chosen)) return 'partial';
  return 'wrong';
}

export function buildOptions(correct: EmotionId, count = 6): EmotionId[] {
  const correctMeta = EMOTIONS[correct];
  const distractors = new Set<EmotionId>(correctMeta.confusedWith);

  // Fill with same-tier emotions if not enough confusables.
  const sameTier = Object.values(EMOTIONS)
    .filter((e) => e.tier === correctMeta.tier && e.id !== correct)
    .map((e) => e.id);
  for (const id of sameTier) {
    if (distractors.size >= count - 1) break;
    distractors.add(id);
  }
  // Final fill from any tier.
  if (distractors.size < count - 1) {
    const all = Object.keys(EMOTIONS).filter((id) => id !== correct) as EmotionId[];
    for (const id of all) {
      if (distractors.size >= count - 1) break;
      distractors.add(id);
    }
  }

  const options = [correct, ...Array.from(distractors).slice(0, count - 1)];
  // Shuffle.
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}
