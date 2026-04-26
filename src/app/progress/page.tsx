'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EMOTIONS, TIER_TITLES, type EmotionId, type Tier } from '@/data/emotions';
import {
  authenticityTotals,
  bestStreak,
  currentStreak,
  dueRanked,
  formatDuration,
  getProgress,
  progressToNextTier,
  resetProgress,
  strengthsAndWeaknesses,
  topConfusions,
  totals,
  type Progress,
} from '@/lib/storage';
import { track } from '@/lib/analytics';

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  if (!progress) return null;

  const t = totals(progress);
  const sw = strengthsAndWeaknesses(progress);
  const confusions = topConfusions(progress);
  const streak = currentStreak(progress);
  const best = bestStreak(progress);
  const nextTier = progressToNextTier(progress);
  const due = dueRanked(progress);
  const authTotals = authenticityTotals(progress);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-rule sticky top-0 bg-bg/95 backdrop-blur z-10">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2 sm:gap-3">
            <span className="text-ink-3">←</span>
            <span className="display text-base sm:text-xl">Emotion Training</span>
          </Link>
          <Link href="/train" className="eyebrow hover:text-ink transition">
            К тренировке
          </Link>
        </div>
      </header>

      <div className="max-w-[80rem] w-full mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {/* HERO */}
        <div className="grid lg:grid-cols-12 gap-8 mb-12 sm:mb-16">
          <div className="lg:col-span-2 eyebrow">Отчёт</div>
          <div className="lg:col-span-10">
            <h1 className="display text-[clamp(2.5rem,7vw,5.5rem)] mb-6">
              Ваш <span className="display-italic">прогресс</span>
            </h1>
            <p className="text-ink-2 max-w-2xl leading-relaxed text-base sm:text-lg">
              {t.attempts > 0
                ? buildLeadCopy(t.accuracy, t.attempts, progress.unlockedTier)
                : 'Вы ещё не начали тренировку. Откройте первую карточку, чтобы начать.'}
            </p>
          </div>
        </div>

        {t.attempts === 0 ? (
          <Link href="/train" className="btn btn-primary">
            Начать тренировку <span aria-hidden>→</span>
          </Link>
        ) : (
          <>
            {/* TOP STATS */}
            <section className="border-t border-ink pt-8 mb-16">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
                <Stat label="Карточек" value={t.attempts.toString()} />
                <Stat label="Точность" value={`${Math.round(t.accuracy * 100)}%`} />
                <Stat label="Уровень" value={`${progress.unlockedTier} / 3`} />
                <Stat label="Текущий streak" value={streak.toString()} accent={streak >= 5} />
                <Stat label="Время" value={formatDuration(progress.totalTimeMs)} />
              </div>
            </section>

            {/* NEXT TIER PROGRESS */}
            {nextTier && (
              <section className="mb-16 bg-bg-elev border border-rule p-6 sm:p-8">
                <div className="eyebrow mb-2">Следующий уровень</div>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="display text-3xl">
                    {nextTier.nextTier === 2 ? 'II' : 'III'}
                  </span>
                  <span className="display text-2xl">{TIER_TITLES[nextTier.nextTier]}</span>
                </div>
                {nextTier.attemptsNeeded > 0 ? (
                  <p className="text-sm text-ink-2 mb-4">
                    До открытия — ещё <strong>{nextTier.attemptsNeeded}</strong>{' '}
                    {nextTier.attemptsNeeded === 1 ? 'карточка' : 'карточки'} с точностью ≥ 70%.
                  </p>
                ) : nextTier.currentRate < 0.7 ? (
                  <p className="text-sm text-ink-2 mb-4">
                    Минимум карточек пройден, но точность пока{' '}
                    <strong>{Math.round(nextTier.currentRate * 100)}%</strong>. Нужно ≥ 70%.
                  </p>
                ) : (
                  <p className="text-sm text-success mb-4">
                    Условия выполнены — следующая правильная карточка откроет уровень.
                  </p>
                )}
                <div className="h-1 bg-rule overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${Math.min(100, nextTier.currentRate * 100)}%` }}
                  />
                </div>
              </section>
            )}

            {/* STRENGTHS / WEAKNESSES */}
            {sw.all.length > 0 && (
              <section className="mb-16 grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                  <div className="eyebrow mb-4">Сильные стороны</div>
                  <div className="space-y-2">
                    {sw.strengths.length === 0 ? (
                      <p className="text-sm text-ink-3 italic">
                        Пройдите больше карточек, чтобы определить сильные стороны.
                      </p>
                    ) : (
                      sw.strengths.map((s) => (
                        <EmotionRow
                          key={s.emotionId}
                          emotionId={s.emotionId}
                          rate={s.rate}
                          attempts={s.attempts}
                          tone="success"
                        />
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <div className="eyebrow mb-4">Над чем поработать</div>
                  <div className="space-y-2">
                    {sw.weaknesses.length === 0 ? (
                      <p className="text-sm text-ink-3 italic">
                        Слабых мест пока нет — продолжайте тренировку.
                      </p>
                    ) : (
                      sw.weaknesses.map((s) => (
                        <EmotionRow
                          key={s.emotionId}
                          emotionId={s.emotionId}
                          rate={s.rate}
                          attempts={s.attempts}
                          tone="error"
                        />
                      ))
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* AUTHENTICITY — deception detection accuracy */}
            {authTotals.attempts > 0 && (
              <section className="mb-16 border-l-2 border-accent pl-5 sm:pl-8 py-2">
                <div className="eyebrow mb-3">Различение настоящего от фальши</div>
                <div className="flex flex-wrap items-baseline gap-4 sm:gap-8 mb-3">
                  <div>
                    <div className="display text-4xl sm:text-5xl tnum">
                      {Math.round(authTotals.accuracy * 100)}%
                    </div>
                    <div className="eyebrow mt-1">Точность детекции</div>
                  </div>
                  <div>
                    <div className="display text-2xl tnum text-ink-2">
                      {authTotals.attempts}
                    </div>
                    <div className="eyebrow mt-1">Пар пройдено</div>
                  </div>
                </div>
                <p className="text-sm text-ink-3 leading-relaxed mt-4 max-w-2xl">
                  Это самый прикладной навык физиогномики. Точность ниже общей по тренажёру —
                  естественно: подделать мимику легче, чем заметить подделку.{' '}
                  <Link href="/authenticity" className="text-accent hover:underline">
                    Продолжить тренировку различения →
                  </Link>
                </p>
              </section>
            )}

            {/* SPACED REPETITION — due for review */}
            {due.length > 0 && (
              <section className="mb-16">
                <div className="eyebrow mb-4">Запланировано на повтор</div>
                <p className="text-sm text-ink-3 mb-6 max-w-2xl leading-relaxed">
                  Алгоритм интервальных повторений возвращает эти эмоции чаще — потому что вы
                  на них ошибались, либо потому что давно не видели. Чем больше повторений с
                  правильным ответом — тем реже эмоция будет появляться.
                </p>
                <div className="flex flex-wrap gap-2">
                  {due.slice(0, 8).map((id, i) => (
                    <span
                      key={id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm border ${
                        i === 0 ? 'border-accent bg-accent-tint text-accent-2' : 'border-rule text-ink-2'
                      }`}
                    >
                      {EMOTIONS[id].ru}
                      {i === 0 && <span className="eyebrow text-accent">приоритет</span>}
                    </span>
                  ))}
                  {due.length > 8 && (
                    <span className="text-sm text-ink-3 self-center">+{due.length - 8} ещё</span>
                  )}
                </div>
              </section>
            )}

            {/* CONFUSIONS */}
            {confusions.length > 0 && (
              <section className="mb-16">
                <div className="eyebrow mb-4">Что с чем путаете</div>
                <p className="text-sm text-ink-3 mb-6 max-w-2xl leading-relaxed">
                  Самые частые ошибки. Если в одной паре эмоции путаются регулярно — это сигнал
                  пересмотреть их различительные мимические маркеры.
                </p>
                <div className="space-y-2">
                  {confusions.map((c) => (
                    <ConfusionRow
                      key={`${c.correctEmotion}-${c.chosenEmotion}`}
                      correctId={c.correctEmotion}
                      chosenId={c.chosenEmotion}
                      count={c.count}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* PER-TIER BREAKDOWN */}
            <section className="space-y-12 mb-16">
              <div className="eyebrow">По уровням</div>
              {([1, 2, 3] as Tier[]).map((tier) => (
                <TierBlock
                  key={tier}
                  tier={tier}
                  unlocked={progress.unlockedTier >= tier}
                  data={tierStats(progress, tier)}
                />
              ))}
            </section>

            {/* META */}
            <section className="mb-16 grid sm:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="eyebrow mb-2">Лучший streak</div>
                <div className="display text-2xl tnum">{best}</div>
              </div>
              <div>
                <div className="eyebrow mb-2">Начато</div>
                <div className="text-ink-2">
                  {new Date(progress.startedAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-2">Среднее время на карточку</div>
                <div className="text-ink-2">
                  {t.attempts > 0 && progress.totalTimeMs > 0
                    ? formatDuration(Math.round(progress.totalTimeMs / t.attempts))
                    : '—'}
                </div>
              </div>
            </section>

            {/* RESET */}
            <div className="pt-8 border-t border-rule">
              <button
                onClick={() => {
                  if (confirm('Сбросить весь прогресс? Это нельзя отменить.')) {
                    track('progress_reset', { totalCardsBeforeReset: t.attempts });
                    resetProgress();
                    setProgress(getProgress());
                  }
                }}
                className="text-sm text-ink-3 hover:text-error transition"
              >
                Сбросить прогресс
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function buildLeadCopy(accuracy: number, attempts: number, tier: 1 | 2 | 3): string {
  const acc = Math.round(accuracy * 100);
  const tierName = tier === 1 ? 'первом' : tier === 2 ? 'втором' : 'третьем';
  if (attempts < 10) {
    return `Вы только начинаете — ${attempts} карточек пройдено, точность ${acc}%. Продолжайте: после первых 6-10 карточек система начнёт лучше определять ваши слабые места.`;
  }
  if (acc >= 80) {
    return `${attempts} карточек, точность ${acc}% — это уверенный уровень распознавания на ${tierName} уровне.`;
  }
  if (acc >= 60) {
    return `${attempts} карточек пройдено, точность ${acc}%. Хороший рабочий темп — обратите внимание на категории ниже, где ошибаетесь чаще.`;
  }
  return `${attempts} карточек, точность ${acc}%. Стоит замедлиться и читать разбор после каждой ошибки — мимические маркеры сложнее стандартных «грустный/весёлый» категорий.`;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className={`display text-3xl sm:text-4xl tnum mb-1 ${accent ? 'text-accent' : ''}`}>
        {value}
      </div>
      <div className="eyebrow">{label}</div>
    </div>
  );
}

function EmotionRow({
  emotionId,
  rate,
  attempts,
  tone,
}: {
  emotionId: EmotionId;
  rate: number;
  attempts: number;
  tone: 'success' | 'error';
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-rule">
      <span
        className={`w-1.5 h-1.5 shrink-0 ${tone === 'success' ? 'bg-success' : 'bg-error'}`}
      />
      <span className="flex-1 text-sm">{EMOTIONS[emotionId].ru}</span>
      <span className="text-xs text-ink-3 tnum w-16 text-right">
        {attempts} {attempts === 1 ? 'попыт.' : 'попыт.'}
      </span>
      <span className="text-sm tnum font-medium w-12 text-right">
        {Math.round(rate * 100)}%
      </span>
    </div>
  );
}

function ConfusionRow({
  correctId,
  chosenId,
  count,
}: {
  correctId: EmotionId;
  chosenId: EmotionId;
  count: number;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-rule text-sm">
      <span className="flex-1 truncate">
        <span className="text-ink">{EMOTIONS[correctId].ru}</span>
        <span className="text-ink-4 mx-2">→</span>
        <span className="text-ink-3">путаете с «{EMOTIONS[chosenId].ru.toLowerCase()}»</span>
      </span>
      <span className="text-sm tnum text-ink-2 w-16 text-right">
        {count} {count === 1 ? 'раз' : count < 5 ? 'раза' : 'раз'}
      </span>
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
      <div className="flex items-baseline gap-4 sm:gap-5 mb-5 border-t border-ink pt-5">
        <span className="display text-3xl sm:text-4xl text-ink leading-none">
          {tier === 1 ? 'I' : tier === 2 ? 'II' : 'III'}
        </span>
        <h2 className="display text-2xl sm:text-3xl">{TIER_TITLES[tier]}</h2>
        {!unlocked && <span className="eyebrow ml-auto">Закрыт</span>}
      </div>
      <div className="space-y-1">
        {data.map((row) => (
          <div
            key={row.id}
            className="flex items-center gap-3 sm:gap-4 py-2.5 border-b border-rule last:border-0 text-sm"
          >
            <div className="flex-1 truncate">{row.ru}</div>
            <div className="text-xs text-ink-3 w-16 sm:w-20 text-right tnum shrink-0">
              {row.attempts > 0 ? `${row.attempts} попыт.` : '—'}
            </div>
            <div className="hidden sm:block w-32 h-1 bg-bg-elev overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${row.accuracy * 100}%` }}
              />
            </div>
            <div className="w-12 text-xs text-ink-2 text-right tnum shrink-0">
              {row.attempts > 0 ? `${Math.round(row.accuracy * 100)}%` : ''}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
