/**
 * Generate the training set images via Google's Nano Banana
 * (gemini-2.5-flash-image).
 *
 * Run:
 *   GOOGLE_GENAI_API_KEY=... npm run generate:images
 *   GOOGLE_GENAI_API_KEY=... npm run generate:images -- --only joy-1,sadness-2
 *   GOOGLE_GENAI_API_KEY=... npm run generate:images -- --tier 1
 *
 * Outputs to public/training/<cardId>.jpg.
 * If a file already exists, it is skipped (delete to regenerate).
 *
 * Cost: ~$0.04 per image. Full 32-card set ≈ $1.30. Add a few re-rolls = ~$5.
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PROMPTS } from './image-prompts';

const OUT_DIR = path.join(process.cwd(), 'public', 'training');
const MODEL = 'gemini-2.5-flash-image';

async function main() {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GOOGLE_GENAI_API_KEY env var is required.');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const args = parseArgs();
  const targets = filterTargets(args);
  if (targets.length === 0) {
    console.log('No prompts match the filter.');
    return;
  }

  console.log(`Generating ${targets.length} image(s) with ${MODEL}...`);
  const ai = new GoogleGenAI({ apiKey });

  let succeeded = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of targets) {
    const outPath = path.join(OUT_DIR, `${p.cardId}.jpg`);
    if (fs.existsSync(outPath) && !args.force) {
      console.log(`  · ${p.cardId} — exists, skipping (use --force to regenerate)`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`  · ${p.cardId} — generating... `);
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: p.prompt,
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const imagePart = parts.find((part) => part.inlineData?.data);
      if (!imagePart?.inlineData?.data) {
        throw new Error('No image data in response.');
      }

      const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
      fs.writeFileSync(outPath, buffer);
      console.log('saved');
      succeeded++;

      // Light pacing — Nano Banana can rate-limit at high QPS.
      await sleep(800);
    } catch (err) {
      console.log(`FAILED: ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(
    `\nDone. Generated: ${succeeded}, skipped: ${skipped}, failed: ${failed}.`,
  );
  if (succeeded > 0) {
    console.log(`Images saved to: ${OUT_DIR}`);
    console.log('Review them visually before committing — discard or re-roll any unconvincing emotions.');
  }
}

function parseArgs() {
  const argv = process.argv.slice(2);
  let only: string[] | null = null;
  let tier: number | null = null;
  let force = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--only' && argv[i + 1]) {
      only = argv[i + 1].split(',').map((s) => s.trim());
      i++;
    } else if (argv[i] === '--tier' && argv[i + 1]) {
      tier = parseInt(argv[i + 1], 10);
      i++;
    } else if (argv[i] === '--force') {
      force = true;
    }
  }
  return { only, tier, force };
}

function filterTargets(args: ReturnType<typeof parseArgs>) {
  let pool = PROMPTS;
  if (args.only) pool = pool.filter((p) => args.only!.includes(p.cardId));
  if (args.tier !== null) {
    // Tier inferred from cardId prefix matching emotions.ts — simpler: filter by suffix match.
    // For MVP, we just allow --tier with an explicit prefix list; otherwise fall back to all.
    const tierIds = TIER_CARD_IDS[args.tier as 1 | 2 | 3];
    if (tierIds) pool = pool.filter((p) => tierIds.includes(p.cardId));
  }
  return pool;
}

const TIER_CARD_IDS: Record<1 | 2 | 3, string[]> = {
  1: ['joy-1', 'joy-2', 'sadness-1', 'sadness-2', 'anger-1', 'anger-2', 'fear-1', 'fear-2', 'surprise-1', 'surprise-2', 'disgust-1', 'disgust-2', 'contempt-1', 'contempt-2'],
  2: ['duchenne-1', 'duchenne-2', 'social-1', 'social-2', 'fearVs-1', 'surpVs-1', 'controlled-anger-1', 'controlled-anger-2', 'sadness-vs-1', 'fatigue-vs-1', 'shame-1', 'guilt-1'],
  3: ['nostalgia-1', 'nostalgia-2', 'suppressed-anger-1', 'suppressed-anger-2', 'anxiety-1', 'anxiety-2'],
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
