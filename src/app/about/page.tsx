import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthBadge } from '@/components/AuthBadge';

export const metadata: Metadata = {
  title: 'О проекте — Emotion Training',
  description:
    'Что такое Emotion Training, зачем нужен, на чём построен. Открытый исходный код, без отслеживания, прогресс хранится в браузере.',
};

export default function AboutPage() {
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
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-2 eyebrow">О проекте</div>
          <div className="lg:col-span-10 max-w-3xl">
            <h1 className="display text-[clamp(2.5rem,6vw,5rem)] mb-6">
              Тренажёр <span className="display-italic">наблюдательности</span>, не диагностики.
            </h1>
            <p className="text-ink-2 text-lg leading-relaxed">
              Emotion Training — это инструмент для тренировки навыка распознавания эмоций по выражению лица. Не научный диагностический тест, не «детектор лжи», не способ «читать характер». Просто структурированная практика наблюдательности на основе системы FACS Пола Экмана и физиогномической традиции.
            </p>
          </div>
        </div>

        {/* WHY */}
        <Section eyebrow="Зачем" title="В чём смысл тренировки.">
          <p>
            В обычной жизни мы пропускаем 80% мимических сигналов собеседника — внимание уходит на слова, тон, контекст. Микро-выражения длятся доли секунды. Различительные пары (искренняя vs социальная улыбка, страх vs удивление, контролируемый гнев vs презрение) требуют тренированного глаза.
          </p>
          <p>
            Систематическая практика с обратной связью даёт то, чего нет в обычной жизни: мгновенная коррекция, разбор каждого ответа, постепенное усложнение. После 100-200 карточек вы начнёте замечать в реальных людях то, что раньше пролетало мимо.
          </p>
          <p>
            <strong>Главное ограничение:</strong> мы тренируем распознавание <em>паттернов</em>, не диагностику личности. Если человек показал AU14 — это значит «сейчас, в этот момент, он испытывает что-то похожее на презрение». Это НЕ значит «он презрительный человек».
          </p>
        </Section>

        {/* SOURCES */}
        <Section eyebrow="На чём построен" title="Источники глубины разбора.">
          <p>
            18 фундаментальных трудов по физиогномике и мимике, агрегированных через NotebookLM. Среди них:
          </p>
          <ul className="space-y-2 my-6">
            <BulletItem>
              <strong>Пол Экман</strong> — «Психология эмоций», «Узнай лжеца по выражению лица». Современная научная база, FACS.
            </BulletItem>
            <BulletItem>
              <strong>Иоганн Каспар Лафатер</strong> (XVIII век) — основоположник классической физиогномики, исторический контекст.
            </BulletItem>
            <BulletItem>
              <strong>Эрнст Велховер, Борис Вершинин</strong> — «Тайные знаки лица» (2002). Русская современная школа.
            </BulletItem>
            <BulletItem>
              <strong>Генри Хэннер</strong> — «Китайское искусство физиогномики» (Mian Xiang).
            </BulletItem>
            <BulletItem>
              <strong>Борис Хигир, Артём Павлов, Анатолий Богданов, Дюрвиль</strong> — русская и французская традиция.
            </BulletItem>
          </ul>
          <p>
            Важная оговорка: не все эти источники научно валидированы. FACS — да; физиогномика старых школ — нет. Подробнее в{' '}
            <Link href="/physiognomy-vs-science" className="text-accent hover:underline">
              «Физиогномика vs наука»
            </Link>
            .
          </p>
        </Section>

        {/* ECOSYSTEM */}
        <Section eyebrow="Часть экосистемы" title="Инструменты самопознания.">
          <p>
            Emotion Training — один из нескольких инструментов в семействе:
          </p>
          <ul className="space-y-3 my-6">
            <BulletItem>
              <strong>
                <a
                  href="https://face-topaz.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  FaceReader
                </a>
              </strong>{' '}
              — анализ лица по 4 школам физиогномики (Mian Xiang, Firasa, Lavater, Ekman). Загружаешь фото, получаешь портрет личности.
            </BulletItem>
          </ul>
          <p>
            Все инструменты следуют одному принципу: <strong>учим наблюдать, не диагностируем личность</strong>. Это тренажёры внимания, а не персонологические тесты.
          </p>
        </Section>

        {/* DISCLAIMER */}
        <section className="border-t border-ink pt-10">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-2 eyebrow">Дисклеймер</div>
            <div className="lg:col-span-10 max-w-3xl">
              <h2 className="display text-2xl sm:text-3xl mb-6">
                Что НЕ нужно делать с этим тренажёром.
              </h2>
              <ul className="space-y-3 text-ink-2 text-[0.9375rem]">
                <BulletItem>
                  <strong>Не использовать как «детектор лжи».</strong> Совпадение мимических маркеров с эмоцией ≠ установление истины. Реальная детекция обмана требует сравнения базовой линии поведения, контекста и многомодальных сигналов.
                </BulletItem>
                <BulletItem>
                  <strong>Не диагностировать чужую личность.</strong> Физиогномика XIX века (Лафатер, Ломброзо) использовалась для расистской криминологии. Цитируем как исторический контекст, не как руководство.
                </BulletItem>
                <BulletItem>
                  <strong>Не делать выводов на основе одной встречи.</strong> Мимика — снимок состояния, не черта характера. Один AU14 не делает человека презрительным.
                </BulletItem>
                <BulletItem>
                  <strong>Не игнорировать культурный контекст.</strong> Display rules сильно различаются. Чтение лица в чужой культуре требует специальной подготовки.
                </BulletItem>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-2 eyebrow">{eyebrow}</div>
        <div className="lg:col-span-10 max-w-3xl">
          <h2 className="display text-2xl sm:text-3xl mb-6">{title}</h2>
          <div className="prose-analysis space-y-4 text-ink-2">{children}</div>
        </div>
      </div>
    </section>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="text-[0.9375rem] text-ink-2 leading-relaxed pl-5 relative">
      <span className="absolute left-0 top-[0.7em] w-2.5 h-px bg-accent" />
      {children}
    </li>
  );
}
