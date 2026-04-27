'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getProgress } from '@/lib/storage';
import { DemoCard } from '@/components/DemoCard';
import { AuthBadge } from '@/components/AuthBadge';
import { track } from '@/lib/analytics';

const HERO_FACES = [
  { src: '/training/joy-1.jpg', label: 'Радость', code: 'AU6 + AU12' },
  { src: '/training/sadness-1.jpg', label: 'Грусть', code: 'AU1 + AU15' },
  { src: '/training/anger-1.jpg', label: 'Гнев', code: 'AU4 + AU5 + AU7' },
  { src: '/training/fear-1.jpg', label: 'Страх', code: 'AU1+2+4 + AU20' },
  { src: '/training/surprise-1.jpg', label: 'Удивление', code: 'AU1+2 + AU26' },
  { src: '/training/contempt-1.jpg', label: 'Презрение', code: 'AU14' },
];

export default function HomePage() {
  const [stats, setStats] = useState({ completed: 0, accuracy: 0, tier: 1 });

  useEffect(() => {
    const p = getProgress();
    const total = Object.values(p.byCategory).reduce((s, c) => s + (c?.attempts ?? 0), 0);
    const correct = Object.values(p.byCategory).reduce(
      (s, c) => s + (c?.correct ?? 0) + 0.5 * (c?.partialCorrect ?? 0),
      0,
    );
    setStats({
      completed: total,
      accuracy: total ? Math.round((correct / total) * 100) : 0,
      tier: p.unlockedTier,
    });
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="border-b border-rule">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="display text-2xl">Emotion Training</span>
            <span className="eyebrow hidden md:inline">№ 01 · 2026</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <AuthBadge />
            <Link href="/progress" className="eyebrow hover:text-ink transition">
              Прогресс
            </Link>
            <Link href="/train" className="text-sm font-medium hover:text-accent transition">
              Начать →
            </Link>
          </div>
        </div>
      </header>

      {/* HERO — editorial poster with portrait */}
      <section className="border-b border-rule">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start"
          >
            {/* Left rail — meta */}
            <div className="lg:col-span-2 flex lg:flex-col gap-6 lg:gap-10 lg:border-r lg:border-rule lg:pr-6">
              <div>
                <div className="eyebrow mb-2">Издание</div>
                <div className="text-sm">Том I</div>
              </div>
              <div>
                <div className="eyebrow mb-2">Источник</div>
                <div className="text-sm">18 трудов</div>
              </div>
              <div>
                <div className="eyebrow mb-2">Объём</div>
                <div className="text-sm tnum">19 эмоций · 3 уровня</div>
              </div>
              <div className="hidden lg:block">
                <div className="eyebrow mb-2">Школы</div>
                <div className="text-sm leading-snug">Экман · Хигир<br/>Велховер · Лафатер</div>
              </div>
            </div>

            {/* Hero text */}
            <div className="lg:col-span-7">
              <h1 className="display text-[clamp(3.25rem,8.5vw,8.5rem)] mb-8 lg:mb-10">
                Читать лица —<br />
                <span className="display-italic text-accent">не угадывать</span> эмоции.
              </h1>
              <p className="text-lg md:text-xl text-ink-2 max-w-2xl leading-snug mb-10">
                Систематическая тренировка распознавания эмоций по мимическим маркерам. После каждого
                ответа — глубокий разбор: что вы увидели верно, что упустили, и что это состояние
                говорит о человеке с точки зрения физиогномической традиции.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-12">
                <Link
                  href="/train"
                  onClick={() => track('cta_clicked', { location: 'hero' })}
                  className="btn btn-primary"
                >
                  {stats.completed > 0 ? 'Продолжить' : 'Начать с базовых'}
                  <span aria-hidden>→</span>
                </Link>
                {stats.completed > 0 && (
                  <Link href="/progress" className="btn btn-ghost">
                    Прогресс
                  </Link>
                )}
              </div>

              {stats.completed > 0 && (
                <div className="flex flex-wrap gap-12 pt-8 border-t border-rule">
                  <Stat label="Карточек пройдено" value={stats.completed.toString()} />
                  <Stat label="Точность" value={`${stats.accuracy}%`} />
                  <Stat label="Уровень" value={`${stats.tier} / 3`} />
                </div>
              )}
            </div>

            {/* Portrait — anchored to hero, museum plate */}
            <div className="lg:col-span-3">
              <div className="aspect-[4/5] w-full bg-bg-elev border border-ink relative overflow-hidden">
                <Image
                  src="/training/joy-1.jpg"
                  alt="Образец карточки тренажёра"
                  fill
                  sizes="(max-width: 1024px) 100vw, 25vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="eyebrow">Образец № 01</div>
                <div className="display-italic text-ink-3 text-sm">Радость</div>
              </div>
              <div className="mt-1 text-xs text-ink-3 font-mono">AU6 · AU12</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PORTRAIT GALLERY — strip of categories */}
      <section className="border-b border-rule bg-bg-elev">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-2 eyebrow">Образцы карточек</div>
            <div className="lg:col-span-10">
              <h2 className="display text-[clamp(2rem,4.5vw,4rem)] max-w-3xl">
                <span className="display-italic">Базовые семь.</span><br />
                Фундамент по Экману.
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {HERO_FACES.map((f, i) => (
              <motion.div
                key={f.src}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <div className="aspect-[4/5] bg-bg border border-rule-strong relative overflow-hidden">
                  <Image
                    src={f.src}
                    alt={f.label}
                    fill
                    sizes="(max-width: 768px) 50vw, 16vw"
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="display-italic text-base">{f.label}</span>
                  <span className="eyebrow tnum">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="text-[0.6875rem] text-ink-3 font-mono">{f.code}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFFERENTIATORS — magazine three-column */}
      <section className="border-b border-rule">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-2 eyebrow">Чем отличается</div>
            <h2 className="lg:col-span-10 display text-[clamp(2rem,5vw,4.5rem)] max-w-4xl">
              Не угадайка. Не геймификация.<br />
              <span className="display-italic">Серьёзный навык.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-x-12 gap-y-16">
            <Differentiator
              num="01"
              title="Глубина разбора"
              body="После ответа — развёрнутый текст. Конкретные мимические маркеры, чем эта эмоция отличается от похожих, какие сигналы неискренности можно было уловить."
            />
            <Differentiator
              num="02"
              title="Школы физиогномики"
              body="Источник — 18 фундаментальных трудов: Экман, Хигир, Велховер, Хэннер, Лафатер, Богданов, Дюрвиль, Тиклл, Павлов. Не «грустный/весёлый», а нюансы микро-выражений."
            />
            <Differentiator
              num="03"
              title="Прогрессия"
              body="Три уровня: базовые 7 эмоций → различительные пары → смешанные и подавленные состояния. Следующий открывается, когда стабильно справляетесь с предыдущим."
            />
          </div>
        </div>
      </section>

      {/* TIERS DETAIL — like a table of contents */}
      <section className="border-b border-rule bg-bg-elev">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-2 eyebrow">Содержание</div>
            <h2 className="lg:col-span-10 display text-[clamp(2rem,5vw,4.5rem)]">
              Структура тренировки
            </h2>
          </div>
          <div className="space-y-12">
            <Tier
              num="I"
              title="Базовые эмоции"
              count={7}
              items="Радость, грусть, гнев, страх, удивление, отвращение, презрение"
              note="Фундамент по Полу Экману. Без него нет смысла в нюансах."
            />
            <hr className="rule" />
            <Tier
              num="II"
              title="Различительные пары"
              count={5}
              items="Дюшенновская vs социальная улыбка · Страх vs удивление · Контролируемый гнев vs презрение · Грусть vs усталость · Стыд vs вина"
              note="Основная работа. Здесь формируется навык наблюдения."
            />
            <hr className="rule" />
            <Tier
              num="III"
              title="Смешанные и подавленные"
              count={3}
              items="Ностальгия (грусть + улыбка) · Подавленный гнев под маской · Тревога (страх + грусть)"
              note="Высший класс. Открывается после стабильного прохождения уровня II."
            />
          </div>
        </div>
      </section>

      {/* DEMO CARD — try the loop right here */}
      <section className="border-b border-rule">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-2 eyebrow">Демо · без регистрации</div>
            <h2 className="lg:col-span-10 display text-[clamp(2rem,5vw,4.5rem)] max-w-4xl">
              Попробуйте <span className="display-italic">прямо сейчас.</span>
            </h2>
          </div>
          <DemoCard />
        </div>
      </section>

      {/* AUTHENTICITY MODE — separate trainer */}
      <section className="border-b border-rule">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-8 items-baseline">
            <div className="lg:col-span-2 eyebrow">Отдельный режим</div>
            <div className="lg:col-span-10">
              <h2 className="display text-[clamp(2rem,5vw,4.5rem)] mb-6 max-w-4xl">
                Различить <span className="display-italic text-accent">настоящее</span> от наигранного.
              </h2>
              <p className="text-base sm:text-lg text-ink-2 max-w-2xl leading-snug mb-8">
                Парные кадры — одна эмоция в двух исполнениях: подлинное и сыгранное. Узнать настоящее — самый ценный навык физиогномики, потому что только это работает в реальной жизни.
              </p>
              <Link
                href="/authenticity"
                onClick={() => track('cta_clicked', { location: 'demo' })}
                className="btn btn-ghost"
              >
                Открыть тренажёр различения <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="border-b border-rule">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-2 eyebrow">Аудитория</div>
            <h2 className="lg:col-span-10 display text-[clamp(2rem,5vw,4.5rem)] max-w-4xl">
              Для тех, кто видит<br />
              <span className="display-italic">в лице больше слов.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl">
            <AudienceItem
              num="A"
              title="Рекрутеры и HR"
              body="Видеть на интервью больше, чем кандидат хочет показать — настоящие реакции, противоречия между словами и микро-выражениями."
            />
            <AudienceItem
              num="B"
              title="Изучающие самопознание"
              body="Лучше понимать собственные реакции и реакции близких. Видеть подавленные состояния — у себя в зеркале и у других."
            />
            <AudienceItem
              num="C"
              title="Те, кто хочет читать людей"
              body="Не как трюк или эстрадный номер, а как сформированный за десятки повторений навык наблюдения, основанный на физиогномической традиции."
            />
          </div>
        </div>
      </section>

      {/* SCOPE & DISCLAIMER */}
      <section className="border-b border-rule">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-2 eyebrow">Корректно понимать</div>
            <h2 className="lg:col-span-10 display text-[clamp(1.75rem,4vw,3.5rem)] max-w-3xl">
              На что это <span className="display-italic">и на что не</span>.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 max-w-5xl">
            <div>
              <div className="eyebrow text-success mb-4">Что вы получаете</div>
              <ul className="space-y-3 text-ink-2 leading-relaxed text-[0.9375rem]">
                <li className="pl-5 relative"><span className="absolute left-0 top-2 w-2 h-px bg-success" />Тренировку наблюдательности — насмотренность к мимическим маркерам</li>
                <li className="pl-5 relative"><span className="absolute left-0 top-2 w-2 h-px bg-success" />Навык различения похожих эмоций — страх vs удивление, грусть vs усталость, искренняя vs социальная улыбка</li>
                <li className="pl-5 relative"><span className="absolute left-0 top-2 w-2 h-px bg-success" />Знакомство с системой FACS Пола Экмана — научно валидированной классификацией мимических движений</li>
                <li className="pl-5 relative"><span className="absolute left-0 top-2 w-2 h-px bg-success" />Контекст из исторической физиогномической традиции (Лафатер, Хигир, Велховер) как культурно-смысловое расширение</li>
              </ul>
            </div>
            <div>
              <div className="eyebrow text-error mb-4">Что не утверждается</div>
              <ul className="space-y-3 text-ink-2 leading-relaxed text-[0.9375rem]">
                <li className="pl-5 relative"><span className="absolute left-0 top-2 w-2 h-px bg-error" />Это не научная диагностика характера. Современная психология не подтверждает, что черты лица предсказывают личность</li>
                <li className="pl-5 relative"><span className="absolute left-0 top-2 w-2 h-px bg-error" />Это не криминологический инструмент. Идеи Ломброзо и физиогномика XIX века использовались для дискриминации — мы цитируем их как исторический контекст, а не как руководство</li>
                <li className="pl-5 relative"><span className="absolute left-0 top-2 w-2 h-px bg-error" />Это не замена профессиональной оценке. Реальное чтение людей требует контекста, динамики, многомодальных сигналов и осторожности с выводами</li>
                <li className="pl-5 relative"><span className="absolute left-0 top-2 w-2 h-px bg-error" />Это не «детектор лжи». Совпадение мимических маркеров с эмоцией ≠ установление истины</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECONDARY CTA */}
      <section className="border-b border-rule bg-ink text-bg">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-16 lg:py-20 text-center">
          <h2 className="display text-[clamp(2rem,5vw,4.5rem)] mb-6 text-bg">
            Готовы <span className="display-italic text-accent">начать</span> тренировку?
          </h2>
          <p className="text-bg/70 max-w-xl mx-auto mb-8 leading-relaxed">
            Ваш прогресс сохраняется в браузере — без регистрации, без аккаунтов. Бросайте в любой момент, возвращайтесь когда удобно.
          </p>
          <Link
            href="/train"
            onClick={() => track('cta_clicked', { location: 'secondary' })}
            className="inline-flex items-center gap-2 px-8 py-4 bg-bg text-ink font-medium hover:bg-accent hover:text-bg transition-colors"
          >
            {stats.completed > 0 ? 'Продолжить' : 'Начать с базовых эмоций'}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <footer>
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-10 flex flex-wrap gap-4 justify-between text-sm text-ink-3">
          <span>Emotion Training · v0.2 · 2026</span>
          <span className="text-right">Часть экосистемы инструментов самопознания</span>
        </div>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="display text-4xl tnum mb-1">{value}</div>
      <div className="eyebrow">{label}</div>
    </div>
  );
}

function Differentiator({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="border-t border-ink pt-6">
      <div className="poster-num mb-6">{num}</div>
      <h3 className="display text-3xl mb-4">{title}</h3>
      <p className="text-ink-2 text-[0.9375rem] leading-relaxed">{body}</p>
    </div>
  );
}

function Tier({
  num,
  title,
  count,
  items,
  note,
}: {
  num: string;
  title: string;
  count: number;
  items: string;
  note: string;
}) {
  return (
    <div className="grid md:grid-cols-[100px_1fr_320px] gap-6 md:gap-12 items-baseline">
      <div className="display text-6xl text-ink leading-none">{num}</div>
      <div>
        <div className="flex items-baseline gap-3 mb-3">
          <h3 className="display text-2xl">{title}</h3>
          <span className="text-sm text-ink-3 tnum">— {count} категорий</span>
        </div>
        <p className="text-ink-2 text-sm leading-relaxed">{items}</p>
      </div>
      <div className="display-italic text-ink-3 text-base">{note}</div>
    </div>
  );
}

function AudienceItem({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="display text-3xl text-accent">{num}</span>
        <h3 className="text-base font-medium">{title}</h3>
      </div>
      <p className="text-ink-2 text-sm leading-relaxed">{body}</p>
    </div>
  );
}
