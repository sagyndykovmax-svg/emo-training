/**
 * Pull the NotebookLM-generated physiognomy report and parse it into the
 * `analysis` field of each emotion in src/data/emotions.ts.
 *
 * Workflow:
 *   1. The NotebookLM report is generated separately (manual step):
 *        notebooklm use 960d2264-94e2-4f92-aaa2-9fac4504635c
 *        notebooklm artifact list
 *        notebooklm download report ./data/raw_knowledge/report.md
 *   2. This script reads that markdown file, splits it by "### N." section
 *      headers, and writes a per-emotion analysis JSON to data/emotions_analysis.json.
 *   3. The runtime app reads that JSON via dynamic import in emotions.ts (or
 *      the JSON is inlined into emotions.ts as a build step — TBD).
 *
 * Run:
 *   npm run extract:knowledge
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const RAW_PATH = path.join(process.cwd(), 'data', 'raw_knowledge', 'report.md');
const OUT_PATH = path.join(process.cwd(), 'src', 'data', 'emotions_analysis.json');

// Section index → EmotionId. Must match the order in NotebookLM's report.
const SECTION_TO_EMOTION: Record<number, string> = {
  1: 'joy',
  2: 'sadness',
  3: 'anger',
  4: 'fear',
  5: 'surprise',
  6: 'disgust',
  7: 'contempt',
  // 8–12 are pairs — each section maps to TWO emotion ids; handled below.
  13: 'nostalgia',
  14: 'suppressed_anger',
  15: 'anxiety',
};

const PAIR_SPLITS: Record<number, [string, string]> = {
  8: ['duchenne_smile', 'social_smile'],
  9: ['fear_vs_surprise_F', 'fear_vs_surprise_S'],
  10: ['controlled_anger', 'contempt'],
  11: ['sadness_vs_fatigue_S', 'sadness_vs_fatigue_F'],
  12: ['shame', 'guilt'],
};

function main() {
  if (!fs.existsSync(RAW_PATH)) {
    console.error(
      `\nMissing ${RAW_PATH}\n\nGenerate it first via NotebookLM:\n` +
        `  export PATH="$HOME/bin:$PATH" && export PYTHONUTF8=1\n` +
        `  notebooklm use 960d2264-94e2-4f92-aaa2-9fac4504635c\n` +
        `  notebooklm artifact list\n` +
        `  notebooklm download report ${RAW_PATH}\n`,
    );
    process.exit(1);
  }

  const raw = fs.readFileSync(RAW_PATH, 'utf-8');

  // Split on "### N." markers.
  const sectionRegex = /###\s+(\d+)\.\s*([^\n]+)\n([\s\S]*?)(?=\n###\s+\d+\.|\n##\s|$)/g;
  const sections: Record<number, { title: string; body: string }> = {};
  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(raw)) !== null) {
    sections[parseInt(match[1], 10)] = { title: match[2].trim(), body: match[3].trim() };
  }

  const out: Record<string, string> = {};

  for (const [n, emotionId] of Object.entries(SECTION_TO_EMOTION)) {
    const sec = sections[parseInt(n, 10)];
    if (sec) out[emotionId] = sec.body;
  }

  // Pair sections — split body by a heuristic divider ("---", second "**Мимические маркеры**", etc.).
  for (const [n, [idA, idB]] of Object.entries(PAIR_SPLITS)) {
    const sec = sections[parseInt(n, 10)];
    if (!sec) continue;
    const halves = splitPair(sec.body);
    if (halves) {
      out[idA] = halves[0];
      out[idB] = halves[1];
    } else {
      // Couldn't split — put full text in both, manual cleanup needed.
      out[idA] = sec.body;
      out[idB] = sec.body;
    }
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf-8');
  console.log(`Wrote analyses for ${Object.keys(out).length} emotions to ${OUT_PATH}`);
  console.log('Next: import this JSON in src/data/emotions.ts and merge into the EMOTIONS map.');
}

function splitPair(body: string): [string, string] | null {
  // Try several common dividers.
  const dividers = [/\n---\n/, /\n\*\*vs\*\*\n/i, /\n\*\*[Вв]торая (часть|сторона)/];
  for (const d of dividers) {
    const parts = body.split(d);
    if (parts.length === 2) return [parts[0].trim(), parts[1].trim()];
  }
  return null;
}

main();
