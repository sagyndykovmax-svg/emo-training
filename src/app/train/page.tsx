'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EMOTIONS, type EmotionId, TIER_TITLES } from '@/data/emotions';
import { pickNextCard, TRAINING_CARDS, type TrainingCard } from '@/data/training_set';
import { buildOptions, scoreAnswer, type Outcome } from '@/lib/scoring';
import {
  currentStreak,
  getProgress,
  progressToNextTier,
  recordAnswer,
  totals,
} from '@/lib/storage';

type Phase = 'question' | 'feedback' | 'tier-unlocked';

export default function TrainPage() {
  const [card, setCard] = useState<TrainingCard | null>(null);
  const [options, setOptions] = useState<EmotionId[]>([]);
  const [chosen, setChosen] = useState<EmotionId | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [phase, setPhase] = useState<Phase>('question');
  const [tier, setTier] = useState<1 | 2 | 3>(1);
  const [imageError, setImageError] = useState(false);
  const [counter, setCounter] = useState(0);
  const [streak, setStreak] = useState(0);
  const [recentErrors, setRecentErrors] = useState(0);
  const [nextTierInfo, setNextTierInfo] = useState<ReturnType<typeof progressToNextTier>>(null);
  const [unlockedTier, setUnlockedTier] = useState<2 | 3 | null>(null);
  const questionShownAt = useRef<number>(Date.now());

  useEffect(() => {
    nextCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard hotkeys: A-F to choose option in question phase, → / Enter to next in feedback.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (unlockedTier) return; // modal open
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      if (phase === 'question') {
        const idx = 'abcdef'.indexOf(e.key.toLowerCase());
        if (idx >= 0 && options[idx]) {
          e.preventDefault();
          handleAnswer(options[idx]);
        } else if (e.key >= '1' && e.key <= '6') {
          const i = parseInt(e.key, 10) - 1;
          if (options[i]) {
            e.preventDefault();
            handleAnswer(options[i]);
          }
        }
      } else if (phase === 'feedback') {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          nextCard();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, options, unlockedTier]);

  function refreshProgressUI() {
    const p = getProgress();
    setTier(p.unlockedTier);
    const t = totals(p);
    setCounter(t.attempts);
    setStreak(currentStreak(p));
    // Count consecutive non-correct answers (streak of misses) from the front.
    let misses = 0;
    for (const r of p.recentAnswers) {
      if (r.outcome === 'correct') break;
      misses++;
    }
    setRecentErrors(misses);
    setNextTierInfo(progressToNextTier(p));
  }

  function nextCard() {
    const p = getProgress();
    setTier(p.unlockedTier);
    const c = pickNextCard({ unlockedTier: p.unlockedTier, seenCardIds: p.seenCardIds });
    if (!c) return;
    setCard(c);
    setOptions(buildOptions(c.emotionId, 6));
    setChosen(null);
    setOutcome(null);
    setPhase('question');
    setImageError(false);
    questionShownAt.current = Date.now();
    refreshProgressUI();
  }

  function handleAnswer(id: EmotionId) {
    if (!card || phase !== 'question') return;
    const result = scoreAnswer(id, card.emotionId);
    const timeMs = Date.now() - questionShownAt.current;
    setChosen(id);
    setOutcome(result);
    const { unlockedTier: justUnlocked } = recordAnswer({
      cardId: card.id,
      correctEmotion: card.emotionId,
      chosenEmotion: id,
      outcome: result,
      timeMs,
    });
    setPhase('feedback');
    refreshProgressUI();
    if (justUnlocked) setUnlockedTier(justUnlocked);
  }

  if (!card) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-ink-3 eyebrow">Загружаем карточку</div>
      </main>
    );
  }

  const correct = EMOTIONS[card.emotionId];
  const cardNumber = String(counter + (phase === 'feedback' ? 0 : 1)).padStart(2, '0');
  const totalAtTier = TRAINING_CARDS.filter((c) => c.difficulty <= tier).length;

  return (
    <main className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="border-b border-rule sticky top-0 bg-bg/95 backdrop-blur z-20">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-baseline gap-2 sm:gap-3 shrink-0">
            <span className="text-ink-3">←</span>
            <span className="display text-base sm:text-xl">Emotion Training</span>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-xs">
            <span className="eyebrow">Уровень {tier === 1 ? 'I' : tier === 2 ? 'II' : 'III'}</span>
            <span className="text-ink-3">{TIER_TITLES[tier]}</span>
            <span className="text-ink-4">·</span>
            <span className="text-ink-3 tnum">№ {cardNumber}</span>
            {streak > 0 && (
              <>
                <span className="text-ink-4">·</span>
                <span className="text-accent tnum font-medium">🔥 {streak}</span>
              </>
            )}
          </div>
          <Link href="/progress" className="eyebrow hover:text-ink transition shrink-0">
            Отчёт
          </Link>
        </div>
        {/* Progress bar — shows tier completion */}
        <div className="h-0.5 bg-rule">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{
              width: nextTierInfo
                ? `${Math.min(100, (Math.min(counter, 6) / 6) * 100)}%`
                : '100%',
            }}
          />
        </div>
        {/* Mobile inline meta */}
        <div className="md:hidden border-t border-rule px-4 py-2 flex items-center justify-between text-xs">
          <span className="eyebrow">Ур. {tier === 1 ? 'I' : tier === 2 ? 'II' : 'III'}</span>
          <span className="text-ink-3 tnum">№ {cardNumber}</span>
          {streak > 0 && <span className="text-accent tnum font-medium">🔥 {streak}</span>}
          {nextTierInfo && nextTierInfo.attemptsNeeded > 0 && (
            <span className="text-ink-3">До ур. {nextTierInfo.nextTier === 2 ? 'II' : 'III'}: {nextTierInfo.attemptsNeeded}</span>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-[88rem] w-full mx-auto px-4 sm:px-8 py-6 lg:py-12">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          {/* LEFT META RAIL — desktop only */}
          <div className="lg:col-span-1 lg:border-r lg:border-rule lg:pr-4 hidden lg:block min-h-[400px]">
            <div className="vcaption">
              Субъект № {cardNumber} · Уровень {tier === 1 ? 'I' : tier === 2 ? 'II' : 'III'} · {TIER_TITLES[tier]}
            </div>
          </div>

          {/* IMAGE */}
          <div className="lg:col-span-6">
            <div className="aspect-[4/5] w-full bg-bg-elev border border-ink relative overflow-hidden">
              {!imageError ? (
                <Image
                  src={card.imagePath}
                  alt="Лицо для анализа"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  onError={() => setImageError(true)}
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-3 text-center px-8">
                  <div className="display text-7xl text-ink-4 mb-4">№ {cardNumber}</div>
                  <div className="eyebrow mb-4">Изображение не сгенерировано</div>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="eyebrow">№ {cardNumber} · {totalAtTier} карточек на уровне</div>
              {phase === 'feedback' && (
                <div className="display-italic text-ink-3 text-sm">{correct.ru}</div>
              )}
            </div>
          </div>

          {/* QUESTION / FEEDBACK */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {phase === 'question' ? (
                <motion.div
                  key="q"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="eyebrow mb-4">Вопрос</div>
                  <h2 className="display text-[clamp(2rem,4vw,3.75rem)] mb-3">
                    Какая эмоция?
                  </h2>
                  <p className="text-sm text-ink-3 mb-6 leading-relaxed max-w-md">
                    Смотрите по зонам: брови, глаза, нос, губы, подбородок. Ищите, что напряжено и
                    что расслаблено.
                  </p>
                  <div className="space-y-2">
                    {options.map((id, i) => (
                      <motion.button
                        key={id}
                        onClick={() => handleAnswer(id)}
                        className="opt"
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}
                      >
                        <span className="eyebrow text-ink-4 mr-3 tnum">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {EMOTIONS[id].ru}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="f"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <FeedbackPanel
                    correctEmotion={correct.id}
                    chosenEmotion={chosen!}
                    outcome={outcome!}
                    recentErrors={recentErrors}
                  />
                  {/* Desktop: inline button. Mobile: sticky bottom (rendered separately below) */}
                  <button onClick={nextCard} className="btn btn-primary mt-8 w-full md:w-auto hidden md:inline-flex">
                    Следующая карточка <span aria-hidden>→</span>
                  </button>
                  <p className="hidden md:block text-xs text-ink-3 mt-3">
                    Можно нажать <kbd className="font-mono px-1 bg-bg-elev border border-rule rounded text-[0.7rem]">Enter</kbd> или <kbd className="font-mono px-1 bg-bg-elev border border-rule rounded text-[0.7rem]">→</kbd>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY NEXT CTA — only during feedback */}
      {phase === 'feedback' && (
        <div className="md:hidden sticky bottom-0 left-0 right-0 z-30 border-t border-rule bg-bg/95 backdrop-blur p-3 safe-bottom">
          <button onClick={nextCard} className="btn btn-primary w-full">
            Следующая карточка <span aria-hidden>→</span>
          </button>
        </div>
      )}

      {/* TIER UNLOCK CELEBRATION */}
      <AnimatePresence>
        {unlockedTier && (
          <TierUnlockedModal tier={unlockedTier} onClose={() => setUnlockedTier(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}

function FeedbackPanel({
  correctEmotion,
  chosenEmotion,
  outcome,
  recentErrors,
}: {
  correctEmotion: EmotionId;
  chosenEmotion: EmotionId;
  outcome: Outcome;
  recentErrors: number;
}) {
  const correct = EMOTIONS[correctEmotion];
  const chosen = EMOTIONS[chosenEmotion];

  const heading = useMemo(() => {
    if (outcome === 'correct') return { tone: 'success', label: 'Верно' };
    if (outcome === 'partial')
      return { tone: 'partial', label: `Близко — вы выбрали «${chosen.ru.toLowerCase()}»` };
    return { tone: 'wrong', label: `Не та эмоция — вы выбрали «${chosen.ru.toLowerCase()}»` };
  }, [outcome, chosen]);

  // Permission-to-fail copy after a streak of misses.
  const encouragement = useMemo(() => {
    if (outcome === 'correct') return null;
    if (recentErrors >= 5) return 'Возьмите паузу — серия ошибок часто означает, что внимание устало. Отдохните 5 минут и вернитесь.';
    if (recentErrors >= 3) return 'Сложные категории требуют 5-10 проб, чтобы войти в глаз. Это нормально — читайте разбор внимательно, а не торопитесь.';
    return null;
  }, [recentErrors, outcome]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span
          className={`w-2 h-2 ${
            heading.tone === 'success'
              ? 'bg-success'
              : heading.tone === 'partial'
              ? 'bg-accent'
              : 'bg-error'
          }`}
        />
        <span className="eyebrow">{heading.label}</span>
      </div>

      <h2 className="display text-[clamp(2rem,4vw,3.75rem)] mb-3">{correct.ru}</h2>
      <p className="display-italic text-ink-3 text-base mb-6">{correct.short}</p>

      {encouragement && (
        <div className="mb-6 p-4 bg-accent-tint border-l-2 border-accent text-sm text-ink-2 leading-relaxed">
          {encouragement}
        </div>
      )}

      <div className="mb-8 border-t border-ink pt-5">
        <div className="eyebrow mb-3">Что стоило заметить</div>
        <ul className="space-y-2">
          {correct.markers.map((m) => (
            <li key={m} className="text-[0.9375rem] text-ink leading-relaxed pl-6 relative">
              <span className="absolute left-0 top-[0.7em] w-3 h-px bg-accent" />
              {highlightAU(m)}
            </li>
          ))}
        </ul>
      </div>

      {correct.analysis ? (
        <div>
          <div className="eyebrow mb-3">Глубокий разбор</div>
          <div className="prose-analysis">
            {correct.analysis.split('\n\n').map((para, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: renderInline(para) }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-ink-3 italic">
          Развёрнутый разбор будет доступен после извлечения базы знаний из NotebookLM.
        </div>
      )}
    </div>
  );
}

function TierUnlockedModal({ tier, onClose }: { tier: 2 | 3; onClose: () => void }) {
  const tierName = TIER_TITLES[tier];
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-bg border border-ink p-8 sm:p-12 max-w-lg w-full text-center"
        initial={{ scale: 0.95, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: -12 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="eyebrow mb-4">Уровень открыт</div>
        <div className="display text-7xl mb-4">{tier === 2 ? 'II' : 'III'}</div>
        <h2 className="display text-3xl mb-3">{tierName}</h2>
        <p className="text-ink-3 leading-relaxed mb-8">
          {tier === 2
            ? 'Теперь начинается основная работа. Различительные пары — где формируется навык наблюдения.'
            : 'Высший класс. Смешанные и подавленные состояния — то, что отличает мастера.'}
        </p>
        <button onClick={onClose} className="btn btn-primary">
          Продолжить тренировку <span aria-hidden>→</span>
        </button>
      </motion.div>
    </motion.div>
  );
}

function highlightAU(text: string) {
  const parts = text.split(/(AU\d+(?:\+AU?\d+)*)/g);
  return parts.map((p, i) =>
    /^AU\d/.test(p) ? (
      <span key={i} className="au">
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\b(AU\d+(?:\+AU?\d+)*)\b/g, '<span class="au">$1</span>');
}
