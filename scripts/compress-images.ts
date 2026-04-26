/**
 * Recompress all training images via mozjpeg quality 82.
 * Also resizes to max 1024px on the longer side.
 *
 * Brings ~1.5 MB Nano Banana raw outputs down to ~200-300 KB each.
 *
 * Run:
 *   npm run compress:images
 *
 * Idempotent — safe to re-run; skips files already under 400 KB.
 */

import sharp from 'sharp';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DIR = path.join(process.cwd(), 'public', 'training');
const SKIP_UNDER_BYTES = 400 * 1024;

async function main() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.jpg'));
  console.log(`Compressing ${files.length} images...`);

  let savedKB = 0;
  for (const f of files) {
    const fp = path.join(DIR, f);
    const stat = fs.statSync(fp);
    if (stat.size < SKIP_UNDER_BYTES) {
      console.log(`  · ${f} — already ${(stat.size / 1024).toFixed(0)} KB, skipping`);
      continue;
    }
    const before = stat.size;
    const buf = await sharp(fp)
      .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toBuffer();
    fs.writeFileSync(fp, buf);
    const saved = before - buf.length;
    savedKB += saved / 1024;
    console.log(
      `  · ${f} — ${(before / 1024).toFixed(0)} → ${(buf.length / 1024).toFixed(0)} KB (-${(
        saved / 1024
      ).toFixed(0)})`,
    );
  }

  console.log(`\nDone. Total saved: ${(savedKB / 1024).toFixed(1)} MB.`);

  // Generate og-cover.jpg (1200x630) for social sharing.
  await generateOgCover();
}

async function generateOgCover() {
  const sourceFace = path.join(DIR, 'joy-1.jpg');
  const outPath = path.join(process.cwd(), 'public', 'og-cover.jpg');
  if (!fs.existsSync(sourceFace)) {
    console.warn('Skip og-cover: source face missing.');
    return;
  }

  // Compose 1200x630: warm paper background with face on the right and an SVG title block on the left.
  const titleSvg = Buffer.from(`
    <svg width="700" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="700" height="630" fill="#f4f1ea"/>
      <text x="60" y="120" font-family="Georgia, serif" font-size="22" fill="#6e6a62" letter-spacing="3">EMOTION TRAINING</text>
      <text x="60" y="240" font-family="Georgia, serif" font-size="78" fill="#0d0c0a" font-weight="500">Читать лица —</text>
      <text x="60" y="330" font-family="Georgia, serif" font-style="italic" font-size="78" fill="#c43a2e">не угадывать</text>
      <text x="60" y="420" font-family="Georgia, serif" font-size="78" fill="#0d0c0a" font-weight="500">эмоции.</text>
      <text x="60" y="540" font-family="Georgia, serif" font-size="20" fill="#3a3833">Тренажёр распознавания эмоций по лицу</text>
      <text x="60" y="568" font-family="Georgia, serif" font-size="20" fill="#3a3833">на основе физиогномической традиции</text>
    </svg>
  `);

  const facePart = await sharp(sourceFace)
    .resize({ width: 500, height: 630, fit: 'cover' })
    .toBuffer();

  await sharp({
    create: { width: 1200, height: 630, channels: 3, background: '#f4f1ea' },
  })
    .composite([
      { input: titleSvg, left: 0, top: 0 },
      { input: facePart, left: 700, top: 0 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(outPath);

  console.log(`Generated og-cover at ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
