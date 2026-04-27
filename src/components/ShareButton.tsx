'use client';

/**
 * Share button for the FeedbackPanel in /train.
 *
 * Behaviour:
 *   - On mobile (navigator.share available): triggers native share sheet
 *     with the result URL — user picks Telegram / WhatsApp / etc.
 *   - On desktop (no native share): copies the link to clipboard and
 *     shows a "Скопировано" toast for 2 sec.
 *
 * URL format:
 *   /share/result?card=<cardId>&chosen=<emotionId>&correct=<emotionId>
 *
 * Server-rendered OG meta on /share/result picks up the params and
 * generates a dynamic image via /api/og/result, so the link unfurls
 * nicely in social media.
 */

import { useState } from 'react';
import { track } from '@/lib/analytics';
import type { EmotionId } from '@/data/emotions';

export function ShareButton({
  cardId,
  chosenEmotion,
  correctEmotion,
}: {
  cardId: string;
  chosenEmotion: EmotionId;
  correctEmotion: EmotionId;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams({
      card: cardId,
      chosen: chosenEmotion,
      correct: correctEmotion,
    });
    const url = `${window.location.origin}/share/result?${params.toString()}`;

    track('cta_clicked', { location: 'demo' }); // Reuse existing analytics event slot.

    // Try native share API first (mobile / modern browsers)
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({
          title: 'Emotion Training',
          text: 'Я только что прошёл карточку в тренажёре чтения эмоций',
          url,
        });
        return;
      } catch {
        // User dismissed share sheet — fall through to clipboard fallback.
      }
    }

    // Clipboard fallback (desktop)
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last-resort: prompt the user to copy manually.
      window.prompt('Скопируйте ссылку:', url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 text-sm text-ink-3 hover:text-ink transition px-3 py-2 border border-rule hover:border-ink rounded-sm"
      aria-label="Поделиться результатом"
    >
      {copied ? (
        <>
          <span className="w-1.5 h-1.5 bg-success rounded-full" />
          <span>Скопировано</span>
        </>
      ) : (
        <>
          <ShareIcon className="w-3.5 h-3.5" />
          <span>Поделиться</span>
        </>
      )}
    </button>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
