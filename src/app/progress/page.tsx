'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EMOTIONS, TIER_TITLES, type EmotionId, type Tier } from '@/data/emotions';
import { getProgress, resetProgress, type Progress } from '@/lib/storage';

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  if (!progress) return null;

  const tierData: Record<Tier, ReturnType<typeof tierStats>> = {
    1: tierStats(progress, 1),
    2: tierStats(progress, 2),
    3: tierStats(progress, 3),
  };

  const totalAttempts = Object.values(progress.byCategory).reduce(
    (s, c) => s + (c?.attempts ?? 0),
    0,
  );
  const totalCorrect = Object.values(progress.byCategory).reduce(
    (s, c) => s + (c?.correct ?? 0) + 0.5 * (c?.partialCorrect ?? 0),
    0,
  );

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-rule">
        <div className="max-w-[88rem] mx-auto px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="text-ink-3">←</span>
            <span className="display text-xl">Emotion Training</span>
          </Link>
          <Link href="/train" className="eyebrow hover:text-ink transition">
            К тренировке
          </Link>
        </div>
      </header>

      <div className="max-w-[72rem] w-full mx-auto px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-2 eyebrow">Статистика</div>
          <div className="lg:col-span-10">
            <h1 className="display text-[clamp(3rem,7vw,6rem)] mb-6">
              Ваш <span className="display-italic">прогресс</span>
            </h1>
            <p className="text-ink-2 max-w-2xl leading-relaxed text-lg">
              {totalAttempts > 0
                ? `Пройдено ${totalAttempts} карточек, общая точность ${Math.round((totalCorrect / totalAttempts) * 100)}%. Слабые категории система предлагает чаще.`
                : 'Вы ещё не начали тренировку. Откройте карточку, чтобы начать.'}
            </p>
          </div>
        </div>

        {totalAttempts > 0 && (
          <div className="grid grid-cols-3 gap-6 max-w-md mb-16">
            <Stat label="Карточек" value={totalAttempts.toString()} />
            <Stat label="Точность" value={`${Math.round((totalCorrect / totalAttempts) * 100)}%`} />
            <Stat
              label="Уровень"
              value={`${progress.unlockedTier} / 3`}
            />
          </div>
        )}

        <div className="space-y-12">
          {([1, 2, 3] as Tier[]).map((t) => (
            <TierBlock
              key={t}
              tier={t}
              unlocked={progress.unlockedTier >= t}
              data={tierData[t]}
            />
          ))}
        </div>

        {totalAttempts > 0 && (
          <div className="mt-20 pt-8 border-t border-rule">
            <button
              onClick={() => {
                if (confirm('Сбросить весь прогресс? Это нельзя отменить.')) {
                  resetProgress();
                  setProgress(getProgress());
                }
              }}
              className="text-sm text-ink-3 hover:text-error transition"
            >
              Сбросить прогресс
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="display text-5xl tnum mb-1">{value}</div>
      <div className="eyebrow">{label}</div>
    </div>
  );
}

function tierStats(p: Progress, tier: Tier) {
  const emotions = Object.values(EMOTIONS).filter((e) => e.tier === tier);
  return emotions.map((e) => {
    const stats = p.byCategory[e.id];
    const attempts = stats?.attempts ?? 0;
    const correct = (stats?.correct ?? 0) + 0.5 * (stats?.partialCorrect ?? 0);
    return {
      id: e.id,
      ru: e.ru,
      attempts,
      accuracy: attempts ? correct / attempts : 0,
    };
  });
}

function TierBlock({
  tier,
  unlocked,
  data,
}: {
  tier: Tier;
  unlocked: boolean;
  data: { id: EmotionId; ru: string; attempts: number; accuracy: number }[];
}) {
  return (
    <section>
      <div className="flex items-baseline gap-5 mb-6 border-t border-ink pt-6">
        <span className="display text-4xl text-ink leading-none">
          {tier === 1 ? 'I' : tier === 2 ? 'II' : 'III'}
        </span>
        <h2 className="display text-3xl">{TIER_TITLES[tier]}</h2>
        {!unlocked && <span className="eyebrow ml-auto">Закрыт</span>}
      </div>
      <div className="space-y-1">
        {data.map((row) => (
          <div
            key={row.id}
            className="flex items-center gap-4 py-3 border-b border-rule last:border-0"
          >
            <div className="flex-1 text-sm">{row.ru}</div>
            <div className="text-xs text-ink-3 w-20 text-right tnum">
              {row.attempts > 0 ? `${row.attempts} попыт.` : '—'}
            </div>
            <div className="w-32 h-1 bg-bg-elev overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${row.accuracy * 100}%` }}
              />
            </div>
            <div className="w-12 text-xs text-ink-2 text-right tnum">
              {row.attempts > 0 ? `${Math.round(row.accuracy * 100)}%` : ''}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
