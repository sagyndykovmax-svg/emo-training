/**
 * Dynamic OG image generator for shared results from /train.
 *
 * URL: /api/og/result?card=<cardId>&chosen=<emotionId>&correct=<emotionId>
 *
 * Renders a 1200×630 PNG showing:
 *   - Left: the cropped portrait from public/training/<cardId>.jpg
 *   - Right: outcome badge (Верно / Близко / Не та) + correct emotion name +
 *     a hint at what the user chose, plus emo-training.vercel.app branding
 *
 * Uses Next.js ImageResponse (Satori under the hood) — Edge runtime, fast.
 * No external font fetched — relies on bundled JSX style props that Satori
 * resolves via system fonts. We deliberately avoid Cyrillic in the rendered
 * strings since Satori's default font set is Latin-only; emotion names
 * are emitted in English-equivalents from a small map.
 */

import { ImageResponse } from 'next/og';
import { EMOTIONS, type EmotionId } from '@/data/emotions';
import { TRAINING_CARDS } from '@/data/training_set';
import { scoreAnswer } from '@/lib/scoring';

export const runtime = 'edge';

// Latin-only labels for OG rendering (Satori bundled fonts are Latin).
const EMOTION_EN: Partial<Record<EmotionId, string>> = {
  joy: 'Joy',
  sadness: 'Sadness',
  anger: 'Anger',
  fear: 'Fear',
  surprise: 'Surprise',
  disgust: 'Disgust',
  contempt: 'Contempt',
  duchenne_smile: 'Duchenne smile',
  social_smile: 'Social smile',
  fear_vs_surprise_F: 'Fear (not surprise)',
  fear_vs_surprise_S: 'Surprise (not fear)',
  controlled_anger: 'Controlled anger',
  sadness_vs_fatigue_S: 'Sadness (not fatigue)',
  sadness_vs_fatigue_F: 'Fatigue (not sadness)',
  shame: 'Shame',
  guilt: 'Guilt',
  nostalgia: 'Nostalgia',
  suppressed_anger: 'Suppressed anger',
  anxiety: 'Anxiety',
};

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const cardId = searchParams.get('card');
  const chosenId = searchParams.get('chosen') as EmotionId | null;
  const correctId = searchParams.get('correct') as EmotionId | null;

  // Validate
  const card = TRAINING_CARDS.find((c) => c.id === cardId);
  const correctEmotion = correctId ? EMOTIONS[correctId] : null;
  const chosenEmotion = chosenId ? EMOTIONS[chosenId] : null;
  if (!card || !correctEmotion || !chosenEmotion) {
    return new Response('Invalid params', { status: 400 });
  }

  const outcome = scoreAnswer(chosenId!, correctId!);
  const outcomeLabel =
    outcome === 'correct' ? 'CORRECT' : outcome === 'partial' ? 'CLOSE' : 'MISSED';
  const outcomeColor =
    outcome === 'correct' ? '#1f5a3a' : outcome === 'partial' ? '#c43a2e' : '#8a2424';

  const correctLabel = EMOTION_EN[correctId!] ?? correctEmotion.id;
  const chosenLabel = EMOTION_EN[chosenId!] ?? chosenEmotion.id;
  const portraitUrl = `${origin}${card.imagePath}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#f4f1ea',
          fontFamily: 'serif',
        }}
      >
        {/* Left half — portrait */}
        <div
          style={{
            width: '46%',
            height: '100%',
            display: 'flex',
            backgroundColor: '#ece8dd',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portraitUrl}
            width={552}
            height={630}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>

        {/* Right half — text */}
        <div
          style={{
            width: '54%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '50px 60px',
          }}
        >
          {/* Top: branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 18,
              color: '#6e6a62',
              letterSpacing: 4,
              textTransform: 'uppercase',
              fontFamily: 'monospace',
            }}
          >
            <div style={{ width: 8, height: 8, background: '#c43a2e' }} />
            <span>Emotion Training</span>
          </div>

          {/* Middle: outcome + emotion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 18,
                color: outcomeColor,
                letterSpacing: 6,
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            >
              <div style={{ width: 12, height: 12, background: outcomeColor }} />
              <span>{outcomeLabel}</span>
            </div>
            <div
              style={{
                fontSize: 84,
                lineHeight: 1.0,
                color: '#0d0c0a',
                fontWeight: 500,
                letterSpacing: -1,
                display: 'flex',
              }}
            >
              {correctLabel}
            </div>
            {outcome !== 'correct' && (
              <div style={{ fontSize: 24, color: '#3a3833', display: 'flex', marginTop: 8 }}>
                I guessed: <span style={{ fontStyle: 'italic', marginLeft: 8 }}>{chosenLabel}</span>
              </div>
            )}
          </div>

          {/* Bottom: CTA url */}
          <div
            style={{
              fontSize: 22,
              color: '#3a3833',
              borderTop: '1px solid #d6d1c2',
              paddingTop: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span>Train your emotion-reading eye</span>
            <span style={{ color: '#c43a2e', fontFamily: 'monospace' }}>
              emo-training.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
