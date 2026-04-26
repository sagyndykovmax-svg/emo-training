'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { AUTHENTICITY_PAIRS, type AuthenticityPair } from '@/data/authenticity_pairs';
import { track } from '@/lib/analytics';

type Phase = 'question' | 'feedback';
type Side = 'genuine' | 'performed';

export default function AuthenticityPage() {
  const [order, setOrder] = useState<AuthenticityPair[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('question');
  const [chosen, setChosen] = useState<Side | null>(null);
  // For each pair, which side (left vs right) holds the genuine image — randomized per card.
  const [genuineOnLeft, setGenuineOnLeft] = useState(true);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [imageError, setImageError] = useState({ left: false, right: false });

  useEffect(() => {
    const shuffled = [...AUTHENTICITY_PAIRS].sort(() => Math.random() - 0.5);
    setOrder(shuffled);
    setGenuineOnLeft(Math.random() < 0.5);
  }, []);

  const pair = order[index];

  function handleAnswer(side: Side) {
    if (phase !== 'question' || !pair) return;
    const isCorrect = side === 'genuine';
    setChosen(side);
    setPhase('feedback');
    setStats((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    track('demo_answered', { correct: isCorrect });
  }

  function next() {
    if (!order.length) return;
    if (index + 1 >= order.length) {
      // Loop back, reshuffle
      const reshuffled = [...AUTHENTICITY_PAIRS].sort(() => Math.random() - 0.5);
      setOrder(reshuffled);
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
    setGenuineOnLeft(Math.random() < 0.5);
    setChosen(null);
    setPhase('question');
    setImageError({ left: false, right: false });
  }

  if (!pair) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="eyebrow text-ink-3">Загружаем</div>
      </main>
    );
  }

  const leftSide: Side = genuineOnLeft ? 'genuine' : 'performed';
  const rightSide: Side = genuineOnLeft ? 'performed' : 'genuine';
  const leftImage = leftSide === 'genuine' ? pair.genuineImagePath : pair.performedImagePath;
  const rightImage = rightSide === 'genuine' ? pair.genuineImagePath : pair.performedImagePath;
  const accuracyPct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <main className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="border-b border-rule sticky top-0 bg-bg/95 backdrop-blur z-20">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-baseline gap-2 sm:gap-3">
            <span className="text-ink-3">←</span>
            <span className="display text-base sm:text-xl">Emotion Training</span>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-xs">
            <span className="eyebrow">Различение фальши</span>
            <span className="text-ink-4">·</span>
            <span className="text-ink-3 tnum">
              № {String(index + 1).padStart(2, '0')} / {order.length}
            </span>
            {stats.total > 0 && (
              <>
                <span className="text-ink-4">·</span>
                <span className="text-accent tnum font-medium">{accuracyPct}% точно</span>
              </>
            )}
          </div>
          <Link href="/train" className="eyebrow hover:text-ink transition">
            Основная тренировка
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-[88rem] w-full mx-auto px-4 sm:px-8 py-8 lg:py-12">
        {/* Question */}
        <div className="grid lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-2 eyebrow">{pair.emotion}</div>
          <h2 className="lg:col-span-10 display text-[clamp(2rem,5vw,4rem)] max-w-3xl">
            {pair.question}
          </h2>
        </div>

        {/* Image pair + feedback */}
        <AnimatePresence mode="wait">
          {phase === 'question' ? (
            <motion.div
              key="q"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto"
            >
              <ChoiceCard
                label="A"
                imagePath={leftImage}
                onClick={() => handleAnswer(leftSide)}
                error={imageError.left}
                onError={() => setImageError((s) => ({ ...s, left: true }))}
              />
              <ChoiceCard
                label="B"
                imagePath={rightImage}
                onClick={() => handleAnswer(rightSide)}
                error={imageError.right}
                onError={() => setImageError((s) => ({ ...s, right: true }))}
              />
            </motion.div>
          ) : (
            <motion.div
              key="f"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto"
            >
              <FeedbackBlock
                pair={pair}
                chosen={chosen!}
                leftImage={leftImage}
                rightImage={rightImage}
                leftSide={leftSide}
                rightSide={rightSide}
                onNext={next}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function ChoiceCard({
  label,
  imagePath,
  onClick,
  error,
  onError,
}: {
  label: string;
  imagePath: string;
  onClick: () => void;
  error: boolean;
  onError: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group block text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4"
    >
      <div className="aspect-[4/5] w-full bg-bg-elev border border-ink relative overflow-hidden transition-all group-hover:border-accent">
        {!error ? (
          <Image
            src={imagePath}
            alt={`Вариант ${label}`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
            onError={onError}
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-3 text-sm">
            Изображение не сгенерировано
          </div>
        )}
        <div className="absolute top-3 left-3 eyebrow bg-bg/90 backdrop-blur px-2 py-1 rounded">
          {label}
        </div>
      </div>
      <div className="mt-3 text-center">
        <span className="display text-2xl text-ink-3 group-hover:text-accent transition-colors">
          Это {label}
        </span>
      </div>
    </button>
  );
}

function FeedbackBlock({
  pair,
  chosen,
  leftImage,
  rightImage,
  leftSide,
  rightSide,
  onNext,
}: {
  pair: AuthenticityPair;
  chosen: Side;
  leftImage: string;
  rightImage: string;
  leftSide: Side;
  rightSide: Side;
  onNext: () => void;
}) {
  const isCorrect = chosen === 'genuine';

  const result = useMemo(() => {
    if (isCorrect) return { tone: 'success', label: 'Верно — это настоящая эмоция' };
    return { tone: 'wrong', label: 'Не та — выбранное лицо подделывает эмоцию' };
  }, [isCorrect]);

  return (
    <div>
      {/* Tagged images side by side */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-10">
        <TaggedCard
          label="A"
          imagePath={leftImage}
          tag={leftSide === 'genuine' ? 'Настоящее' : 'Наигранное'}
          tone={leftSide === 'genuine' ? 'success' : 'error'}
          highlighted={chosen === leftSide}
        />
        <TaggedCard
          label="B"
          imagePath={rightImage}
          tag={rightSide === 'genuine' ? 'Настоящее' : 'Наигранное'}
          tone={rightSide === 'genuine' ? 'success' : 'error'}
          highlighted={chosen === rightSide}
        />
      </div>

      {/* Result + tell + explanation */}
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-5">
          <span
            className={`w-2 h-2 ${result.tone === 'success' ? 'bg-success' : 'bg-error'}`}
          />
          <span className="eyebrow">{result.label}</span>
        </div>

        <h3 className="display text-2xl sm:text-3xl mb-4">{pair.tell}</h3>

        <p className="prose-analysis">{pair.explanation}</p>

        <button onClick={onNext} className="btn btn-primary mt-8">
          Следующая пара <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

function TaggedCard({
  label,
  imagePath,
  tag,
  tone,
  highlighted,
}: {
  label: string;
  imagePath: string;
  tag: string;
  tone: 'success' | 'error';
  highlighted: boolean;
}) {
  return (
    <div>
      <div
        className={`aspect-[4/5] w-full bg-bg-elev border-2 relative overflow-hidden transition-all ${
          highlighted
            ? tone === 'success'
              ? 'border-success'
              : 'border-error'
            : 'border-rule'
        } ${highlighted ? '' : 'opacity-60'}`}
      >
        <Image
          src={imagePath}
          alt={`Вариант ${label}`}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute top-3 left-3 eyebrow bg-bg/90 backdrop-blur px-2 py-1 rounded">
          {label}
        </div>
        <div
          className={`absolute bottom-3 left-3 right-3 px-3 py-1.5 text-sm font-medium ${
            tone === 'success' ? 'bg-success text-bg' : 'bg-error text-bg'
          }`}
        >
          {tag}
        </div>
      </div>
    </div>
  );
}
