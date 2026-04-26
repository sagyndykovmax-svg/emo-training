/**
 * Training cards. Each card pairs an image with an emotion id.
 *
 * Image generation strategy:
 * Pre-generated using Google's gemini-2.5-flash-image (Nano Banana) via
 * scripts/generate-images.ts, then hand-curated for authenticity. Generated
 * once at build/dev time, NOT on demand at runtime — the production app serves
 * static images from public/training/ and never calls any AI API.
 *
 * Why AI-generated and not real datasets:
 *  1. Most validated academic emotion datasets (KDEF, FACES, AffectNet) require
 *     institutional licensing and cannot be redistributed in a public web app.
 *  2. AI generation gives precise control over which FACS Action Units appear,
 *     which is essential for distinguishing-pair training (Duchenne vs social
 *     smile, fear vs surprise, etc.).
 *  3. Free stock photo emotions are predominantly posed/exaggerated and don't
 *     teach realistic micro-expression recognition.
 *
 * Quality bar: each generated image is reviewed against the source PDF
 * descriptions in NotebookLM's Face notebook. Images that don't convincingly
 * convey the target emotion are regenerated or discarded.
 */

import type { EmotionId } from './emotions';

export interface TrainingCard {
  id: string;
  imagePath: string;
  emotionId: EmotionId;
  /** Optional caption shown alongside image (e.g. brief context). */
  context?: string;
  difficulty: 1 | 2 | 3;
}

export const TRAINING_CARDS: TrainingCard[] = [
  // ─── Tier 1: basic 7 (2 examples each = 14) ──────────────────────────────
  { id: 'joy-1', imagePath: '/training/joy-1.jpg', emotionId: 'joy', difficulty: 1 },
  { id: 'joy-2', imagePath: '/training/joy-2.jpg', emotionId: 'joy', difficulty: 1 },
  { id: 'sadness-1', imagePath: '/training/sadness-1.jpg', emotionId: 'sadness', difficulty: 1 },
  { id: 'sadness-2', imagePath: '/training/sadness-2.jpg', emotionId: 'sadness', difficulty: 1 },
  { id: 'anger-1', imagePath: '/training/anger-1.jpg', emotionId: 'anger', difficulty: 1 },
  { id: 'anger-2', imagePath: '/training/anger-2.jpg', emotionId: 'anger', difficulty: 1 },
  { id: 'fear-1', imagePath: '/training/fear-1.jpg', emotionId: 'fear', difficulty: 1 },
  { id: 'fear-2', imagePath: '/training/fear-2.jpg', emotionId: 'fear', difficulty: 1 },
  { id: 'surprise-1', imagePath: '/training/surprise-1.jpg', emotionId: 'surprise', difficulty: 1 },
  { id: 'surprise-2', imagePath: '/training/surprise-2.jpg', emotionId: 'surprise', difficulty: 1 },
  { id: 'disgust-1', imagePath: '/training/disgust-1.jpg', emotionId: 'disgust', difficulty: 1 },
  { id: 'disgust-2', imagePath: '/training/disgust-2.jpg', emotionId: 'disgust', difficulty: 1 },
  { id: 'contempt-1', imagePath: '/training/contempt-1.jpg', emotionId: 'contempt', difficulty: 1 },
  { id: 'contempt-2', imagePath: '/training/contempt-2.jpg', emotionId: 'contempt', difficulty: 1 },

  // ─── Tier 2: distinguishing pairs (2 of each side = 20) ──────────────────
  { id: 'duchenne-1', imagePath: '/training/duchenne-1.jpg', emotionId: 'duchenne_smile', difficulty: 2 },
  { id: 'duchenne-2', imagePath: '/training/duchenne-2.jpg', emotionId: 'duchenne_smile', difficulty: 2 },
  { id: 'social-1', imagePath: '/training/social-1.jpg', emotionId: 'social_smile', difficulty: 2 },
  { id: 'social-2', imagePath: '/training/social-2.jpg', emotionId: 'social_smile', difficulty: 2 },
  { id: 'fearVs-1', imagePath: '/training/fearVs-1.jpg', emotionId: 'fear_vs_surprise_F', difficulty: 2 },
  { id: 'surpVs-1', imagePath: '/training/surpVs-1.jpg', emotionId: 'fear_vs_surprise_S', difficulty: 2 },
  { id: 'controlled-anger-1', imagePath: '/training/controlled-anger-1.jpg', emotionId: 'controlled_anger', difficulty: 2 },
  { id: 'controlled-anger-2', imagePath: '/training/controlled-anger-2.jpg', emotionId: 'controlled_anger', difficulty: 2 },
  { id: 'sadness-vs-1', imagePath: '/training/sadness-vs-1.jpg', emotionId: 'sadness_vs_fatigue_S', difficulty: 2 },
  { id: 'fatigue-vs-1', imagePath: '/training/fatigue-vs-1.jpg', emotionId: 'sadness_vs_fatigue_F', difficulty: 2 },
  { id: 'shame-1', imagePath: '/training/shame-1.jpg', emotionId: 'shame', difficulty: 2 },
  { id: 'guilt-1', imagePath: '/training/guilt-1.jpg', emotionId: 'guilt', difficulty: 2 },

  // ─── Tier 3: mixed / suppressed (6) ──────────────────────────────────────
  { id: 'nostalgia-1', imagePath: '/training/nostalgia-1.jpg', emotionId: 'nostalgia', difficulty: 3 },
  { id: 'nostalgia-2', imagePath: '/training/nostalgia-2.jpg', emotionId: 'nostalgia', difficulty: 3 },
  { id: 'suppressed-anger-1', imagePath: '/training/suppressed-anger-1.jpg', emotionId: 'suppressed_anger', difficulty: 3 },
  { id: 'suppressed-anger-2', imagePath: '/training/suppressed-anger-2.jpg', emotionId: 'suppressed_anger', difficulty: 3 },
  { id: 'anxiety-1', imagePath: '/training/anxiety-1.jpg', emotionId: 'anxiety', difficulty: 3 },
  { id: 'anxiety-2', imagePath: '/training/anxiety-2.jpg', emotionId: 'anxiety', difficulty: 3 },
];

export function pickNextCard(opts: {
  unlockedTier: 1 | 2 | 3;
  seenCardIds: string[];
  weakEmotions?: EmotionId[];
}): TrainingCard | null {
  const eligible = TRAINING_CARDS.filter((c) => c.difficulty <= opts.unlockedTier);
  if (eligible.length === 0) return null;

  // Prefer unseen cards.
  const unseen = eligible.filter((c) => !opts.seenCardIds.includes(c.id));
  let pool = unseen.length > 0 ? unseen : eligible;

  // If user has weak categories, bias selection toward those.
  if (opts.weakEmotions && opts.weakEmotions.length > 0) {
    const weakPool = pool.filter((c) => opts.weakEmotions!.includes(c.emotionId));
    if (weakPool.length > 0 && Math.random() < 0.6) pool = weakPool;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
