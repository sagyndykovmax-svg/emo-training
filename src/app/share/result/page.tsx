/**
 * Landing page when someone clicks a shared result link.
 *
 * URL: /share/result?card=<cardId>&chosen=<emotionId>&correct=<emotionId>
 *
 * Renders a static preview of the result + CTA "попробуйте сами". The
 * critical SEO/social bit is the OG meta — we point og:image at our
 * dynamic /api/og/result endpoint with the same params, so when a user
 * pastes the URL into Telegram/Twitter/Facebook the unfurled preview
 * shows the emotion + outcome image.
 */

import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { EMOTIONS, type EmotionId } from '@/data/emotions';
import { TRAINING_CARDS } from '@/data/training_set';
import { scoreAnswer } from '@/lib/scoring';
import { AuthBadge } from '@/components/AuthBadge';

interface SearchParams {
  card?: string;
  chosen?: string;
  correct?: string;
}

function parseParams(p: SearchParams) {
  const card = TRAINING_CARDS.find((c) => c.id === p.card);
  const correctEmotion = p.correct ? EMOTIONS[p.correct as EmotionId] : null;
  const chosenEmotion = p.chosen ? EMOTIONS[p.chosen as EmotionId] : null;
  if (!card || !correctEmotion || !chosenEmotion) return null;
  const outcome = scoreAnswer(p.chosen as EmotionId, p.correct as EmotionId);
  return { card, correctEmotion, chosenEmotion, outcome };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const parsed = parseParams(sp);
  if (!parsed) {
    return { title: 'Результат не найден — Emotion Training' };
  }
  const ogParams = new URLSearchParams({
    card: sp.card!,
    chosen: sp.chosen!,
    correct: sp.correct!,
  });
  const ogImage = `/api/og/result?${ogParams.toString()}`;
  const outcomeWord =
    parsed.outcome === 'correct' ? 'верно угадал' : parsed.outcome === 'partial' ? 'почти угадал' : 'не угадал';

  return {
    title: `«${parsed.correctEmotion.ru}» — Emotion Training`,
    description: `Я ${outcomeWord} эмоцию «${parsed.correctEmotion.ru.toLowerCase()}» в тренажёре распознавания эмоций по лицу. Попробуйте сами.`,
    openGraph: {
      title: `«${parsed.correctEmotion.ru}» — Emotion Training`,
      description: `Тренажёр распознавания эмоций по лицу на основе FACS и физиогномической традиции.`,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  };
}

export default async function ShareResultPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const parsed = parseParams(sp);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-rule">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2 sm:gap-3">
            <span className="text-ink-3">←</span>
            <span className="display text-base sm:text-xl">Emotion Training</span>
          </Link>
          <div className="flex items-center gap-4">
            <AuthBadge />
            <Link href="/train" className="eyebrow hover:text-ink transition">
              К тренировке
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[80rem] w-full mx-auto px-4 sm:px-8 py-12 sm:py-20">
        {!parsed ? (
          <div>
            <div className="eyebrow mb-4">Результат не найден</div>
            <h1 className="display text-[clamp(2rem,5vw,4rem)] mb-6">
              Эта ссылка <span className="display-italic">сломана</span>.
            </h1>
            <p className="text-ink-2 mb-8 max-w-xl">
              Возможно, параметры в URL были изменены или удалены. Откройте тренажёр и пройдите карточку сами.
            </p>
            <Link href="/train" className="btn btn-primary">
              Открыть тренажёр <span aria-hidden>→</span>
            </Link>
          </div>
        ) : (
          <ResultDisplay parsed={parsed} />
        )}
      </div>
    </main>
  );
}

function ResultDisplay({
  parsed,
}: {
  parsed: NonNullable<ReturnType<typeof parseParams>>;
}) {
  const { card, correctEmotion, chosenEmotion, outcome } = parsed;
  const tone =
    outcome === 'correct' ? 'success' : outcome === 'partial' ? 'partial' : 'wrong';
  const label =
    outcome === 'correct'
      ? 'Угадано верно'
      : outcome === 'partial'
      ? `Близко — выбрано «${chosenEmotion.ru.toLowerCase()}»`
      : `Промах — выбрано «${chosenEmotion.ru.toLowerCase()}»`;

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-2 eyebrow">Чужой результат</div>
      <div className="lg:col-span-6">
        <div className="aspect-[4/5] w-full bg-bg-elev border border-ink relative overflow-hidden">
          <Image
            src={card.imagePath}
            alt={correctEmotion.ru}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
      <div className="lg:col-span-4">
        <div className="flex items-center gap-3 mb-5">
          <span
            className={`w-2 h-2 ${
              tone === 'success' ? 'bg-success' : tone === 'partial' ? 'bg-accent' : 'bg-error'
            }`}
          />
          <span className="eyebrow">{label}</span>
        </div>
        <h1 className="display text-[clamp(2.25rem,5vw,4rem)] mb-3 leading-tight">
          {correctEmotion.ru}
        </h1>
        <p className="display-italic text-ink-3 mb-8">{correctEmotion.short}</p>

        <div className="border-t border-ink pt-5 mb-8">
          <div className="eyebrow mb-3">Маркеры этой эмоции</div>
          <ul className="space-y-2">
            {correctEmotion.markers.slice(0, 4).map((m) => (
              <li key={m} className="text-sm text-ink-2 leading-relaxed pl-5 relative">
                <span className="absolute left-0 top-[0.7em] w-2.5 h-px bg-accent" />
                {m}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-ink text-bg p-5 sm:p-6">
          <p className="text-bg/80 text-sm leading-relaxed mb-4">
            Это результат другого пользователя. В тренажёре{' '}
            <strong className="text-bg">70 карточек</strong>,{' '}
            <strong className="text-bg">10 пар на различение фальши</strong>, и глубокий разбор по FACS и физиогномической традиции.
          </p>
          <Link
            href="/train"
            className="inline-flex items-center gap-2 px-5 py-3 bg-bg text-ink font-medium hover:bg-accent hover:text-bg transition-colors"
          >
            Попробовать самому <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
