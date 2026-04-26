'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

/**
 * Self-contained mini-trainer for the landing page. Hardcoded single card so
 * a visitor can experience the core loop (look → choose → read breakdown)
 * without committing to opening /train.
 *
 * Does NOT persist to localStorage — this is a tasting menu, not part of the
 * user's progress.
 */

type Phase = 'question' | 'feedback';

const CORRECT = 'anger';

const OPTIONS: { id: string; ru: string; isCorrect: boolean }[] = [
  { id: 'irritation', ru: 'Раздражение', isCorrect: false },
  { id: 'anger', ru: 'Гнев', isCorrect: true },
  { id: 'disgust', ru: 'Отвращение', isCorrect: false },
  { id: 'contempt', ru: 'Презрение', isCorrect: false },
];

const MARKERS = [
  'AU4 — брови сведены вниз, вертикальная борозда между ними',
  'AU5 — поднятые верхние веки, виден край склеры над радужкой',
  'AU7 — напряжённые нижние веки',
  'AU24 — плотно сжатые губы, тонкая прямоугольная линия рта',
];

const ANALYSIS =
  'Это сильный, контролируемый гнев. По Велховеру, акцент смещён в нижнюю (оральную) зону — зону воли. Сжатые жевательные мышцы и прямой неподвижный взгляд указывают на готовность к волевому акту, но не к его экспрессивному выражению. Отличается от презрения симметрией и напряжением в зоне глаз.';

export function DemoCard() {
  const [phase, setPhase] = useState<Phase>('question');
  const [chosenId, setChosenId] = useState<string | null>(null);

  function handleAnswer(id: string) {
    if (phase !== 'question') return;
    setChosenId(id);
    setPhase('feedback');
  }

  const chosen = OPTIONS.find((o) => o.id === chosenId);
  const isCorrect = chosen?.isCorrect ?? false;

  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 lg:gap-12 items-start">
      {/* Image */}
      <div>
        <div className="aspect-[4/5] w-full max-w-md bg-bg-elev border border-ink relative overflow-hidden">
          <Image
            src="/training/anger-1.jpg"
            alt="Образец карточки тренажёра"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
        </div>
        <div className="mt-3 flex items-baseline justify-between max-w-md">
          <span className="eyebrow">Образец №01 · Уровень I</span>
          {phase === 'feedback' && (
            <span className="display-italic text-ink-3 text-sm">Гнев</span>
          )}
        </div>
      </div>

      {/* Q/A */}
      <div className="lg:pt-2">
        <AnimatePresence mode="wait">
          {phase === 'question' ? (
            <motion.div
              key="q"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="eyebrow mb-4">Попробуйте сейчас</div>
              <h3 className="display text-3xl sm:text-4xl mb-4">Какая эмоция?</h3>
              <p className="text-sm text-ink-3 mb-6 leading-relaxed max-w-md">
                Посмотрите по зонам: брови, глаза, губы. Что напряжено, что расслаблено? Выберите ответ — и сразу увидите разбор.
              </p>
              <div className="space-y-2">
                {OPTIONS.map((o, i) => (
                  <motion.button
                    key={o.id}
                    onClick={() => handleAnswer(o.id)}
                    className="opt"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                  >
                    <span className="eyebrow text-ink-4 mr-3 tnum">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {o.ru}
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
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-2 h-2 ${isCorrect ? 'bg-success' : 'bg-error'}`} />
                <span className="eyebrow">
                  {isCorrect ? 'Верно' : `Не та эмоция — вы выбрали «${chosen?.ru.toLowerCase()}»`}
                </span>
              </div>
              <h3 className="display text-3xl sm:text-4xl mb-3">Гнев</h3>
              <p className="display-italic text-ink-3 text-sm mb-6">
                Сильный, контролируемый. Прямой взгляд, сжатые губы.
              </p>

              <div className="border-t border-ink pt-4 mb-6">
                <div className="eyebrow mb-3">Что стоило заметить</div>
                <ul className="space-y-2">
                  {MARKERS.map((m) => (
                    <li
                      key={m}
                      className="text-sm text-ink leading-relaxed pl-5 relative"
                    >
                      <span className="absolute left-0 top-[0.7em] w-2.5 h-px bg-accent" />
                      {highlightAU(m)}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-sm text-ink-2 leading-relaxed mb-6">{ANALYSIS}</p>

              <div className="bg-ink text-bg p-5 sm:p-6">
                <p className="text-bg/80 text-sm leading-relaxed mb-4">
                  Это была одна карточка. В тренажёре — <strong className="text-bg">70 таких</strong>, охватывающих <strong className="text-bg">19 эмоций</strong> по трём уровням сложности. Каждая с развёрнутым разбором по FACS и физиогномической традиции.
                </p>
                <Link
                  href="/train"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-bg text-ink font-medium hover:bg-accent hover:text-bg transition-colors"
                >
                  Открыть полную тренировку <span aria-hidden>→</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
