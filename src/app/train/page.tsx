'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { EMOTIONS, type EmotionId, TIER_TITLES } from '@/data/emotions';
import { pickNextCard, type TrainingCard } from '@/data/training_set';
import { buildOptions, scoreAnswer, type Outcome } from '@/lib/scoring';
import { getProgress, recordAnswer } from '@/lib/storage';

type Phase = 'question' | 'feedback';

export default function TrainPage() {
  const [card, setCard] = useState<TrainingCard | null>(null);
  const [options, setOptions] = useState<EmotionId[]>([]);
  const [chosen, setChosen] = useState<EmotionId | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [phase, setPhase] = useState<Phase>('question');
  const [tier, setTier] = useState<1 | 2 | 3>(1);
  const [imageError, setImageError] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    nextCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function nextCard() {
    const p = getProgress();
    setTier(p.unlockedTier);
    setCounter(Object.values(p.byCategory).reduce((s, c) => s + (c?.attempts ?? 0), 0));
    const c = pickNextCard({ unlockedTier: p.unlockedTier, seenCardIds: p.seenCardIds });
    if (!c) return;
    setCard(c);
    setOptions(buildOptions(c.emotionId, 6));
    setChosen(null);
    setOutcome(null);
    setPhase('question');
    setImageError(false);
  }

  function handleAnswer(id: EmotionId) {
    if (!card || phase === 'feedback') return;
    const result = scoreAnswer(id, card.emotionId);
    setChosen(id);
    setOutcome(result);
    setPhase('feedback');
    recordAnswer({ cardId: card.id, emotionId: card.emotionId, outcome: result });
  }

  if (!card) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-ink-3 eyebrow">Загружаем карточку</div>
      </main>
    );
  }

  const correct = EMOTIONS[card.emotionId];
  const cardNumber = String(counter + 1).padStart(2, '0');

  return (
    <main className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="border-b border-rule">
        <div className="max-w-[88rem] mx-auto px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="text-ink-3">←</span>
            <span className="display text-xl">Emotion Training</span>
          </Link>
          <div className="hidden md:flex items-center gap-5 text-xs">
            <span className="eyebrow">Уровень {tier === 1 ? 'I' : tier === 2 ? 'II' : 'III'}</span>
            <span className="text-ink-3">{TIER_TITLES[tier]}</span>
            <span className="text-ink-4">·</span>
            <span className="text-ink-3 tnum">№ {cardNumber}</span>
          </div>
          <Link href="/progress" className="eyebrow hover:text-ink transition">
            Прогресс
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-[88rem] w-full mx-auto px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT META RAIL */}
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
                  <p className="text-sm leading-relaxed max-w-xs">
                    Запустите{' '}
                    <span className="font-mono text-ink-2">npm run generate:images</span>{' '}
                    с{' '}
                    <span className="font-mono text-ink-2">GOOGLE_GENAI_API_KEY</span>.
                  </p>
                </div>
              )}
            </div>
            {/* Image label — museum plate style */}
            <div className="mt-4 flex items-baseline justify-between">
              <div className="eyebrow">№ {cardNumber} · {card.id}</div>
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
                  <div className="eyebrow mb-6">Вопрос</div>
                  <h2 className="display text-[clamp(2.25rem,4vw,3.75rem)] mb-4">
                    Какая эмоция?
                  </h2>
                  <p className="text-sm text-ink-3 mb-10 leading-relaxed max-w-md">
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
                  />
                  <button onClick={nextCard} className="btn btn-primary mt-10 w-full md:w-auto">
                    Следующая карточка <span aria-hidden>→</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeedbackPanel({
  correctEmotion,
  chosenEmotion,
  outcome,
}: {
  correctEmotion: EmotionId;
  chosenEmotion: EmotionId;
  outcome: Outcome;
}) {
  const correct = EMOTIONS[correctEmotion];
  const chosen = EMOTIONS[chosenEmotion];

  const heading = useMemo(() => {
    if (outcome === 'correct') return { tone: 'success', label: 'Верно' };
    if (outcome === 'partial')
      return { tone: 'partial', label: `Близко — вы выбрали «${chosen.ru.toLowerCase()}»` };
    return { tone: 'wrong', label: `Не та эмоция — вы выбрали «${chosen.ru.toLowerCase()}»` };
  }, [outcome, chosen]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
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

      <h2 className="display text-[clamp(2.25rem,4vw,3.75rem)] mb-3">{correct.ru}</h2>
      <p className="display-italic text-ink-3 text-base mb-10">{correct.short}</p>

      <div className="mb-10 border-t border-ink pt-6">
        <div className="eyebrow mb-4">Что стоило заметить</div>
        <ul className="space-y-2.5">
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
          <div className="eyebrow mb-4">Глубокий разбор</div>
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
