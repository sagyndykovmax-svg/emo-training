import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthBadge } from '@/components/AuthBadge';

export const metadata: Metadata = {
  title: 'Физиогномика и наука — Emotion Training',
  description:
    'Где в нашем тренажёре наука (FACS Экмана), а где историческая школа (Лафатер, Ломброзо, Хигир). Честный разбор того, что работает, а что — нет.',
};

export default function PhysScienceePage() {
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
        {/* HERO */}
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-2 eyebrow">Honest take</div>
          <div className="lg:col-span-10 max-w-3xl">
            <h1 className="display text-[clamp(2.5rem,6vw,5rem)] mb-6">
              Где здесь <span className="display-italic">наука</span>, а где — <span className="display-italic text-accent">не наука</span>.
            </h1>
            <p className="text-ink-2 text-lg leading-relaxed">
              Тренажёр объединяет современную научную систему (FACS Экмана) с исторической традицией физиогномики (Лафатер, Велховер, Хигир, Хэннер, Ломброзо). Это сознательное смешение, и пользователь должен понимать различие между ними.
            </p>
          </div>
        </div>

        {/* WHAT'S SCIENCE */}
        <Section eyebrow="Это — наука" title="FACS и базовые эмоции по Экману.">
          <p>
            <strong>Facial Action Coding System (FACS)</strong> — анатомическая система кодирования мимических движений, разработанная Полом Экманом и Уоллесом Фризеном в 1978. Каждое отдельное движение лицевой мышцы получает номер (Action Unit) и описание. Это аналог «таблицы Менделеева» для мимики.
          </p>
          <p>
            <strong>Семь базовых эмоций</strong> (радость, грусть, гнев, страх, удивление, отвращение, презрение) показывают универсальные мимические паттерны кросс-культурно. Экман и его команда подтвердили это в полевых исследованиях с племенами форе в Папуа-Новой Гвинее (1969-1971), которые не имели контакта с западной культурой и при этом корректно распознавали «западные» лица в эмоциях, и наоборот.
          </p>
          <p>
            FACS используется научно: в исследованиях аутизма, болезни Паркинсона, эффективности психотерапии. Это рабочий инструмент, а не маркетинг.
          </p>
          <p>
            <strong>Дюшенновская улыбка</strong> (AU6 + AU12) — научно подтверждённый феномен. Гийом Дюшенн в XIX веке экспериментально показал что мышца orbicularis oculi (AU6) активируется только при подлинном удовольствии и не подчиняется сознательному контролю у большинства людей.
          </p>
        </Section>

        {/* WHAT'S NOT */}
        <Section eyebrow="Это — не наука" title="Физиогномика старых школ.">
          <p>
            <strong>Иоганн Каспар Лафатер</strong> (1741–1801) — швейцарский пастор, основоположник классической физиогномики. Его «Физиогномические фрагменты» утверждали, что форма черепа, носа, лба позволяет читать характер. Современной наукой это <strong>опровергнуто</strong>: предсказательной силы нет, эффект «чтения» объясняется социальными стереотипами.
          </p>
          <p>
            <strong>Чезаре Ломброзо</strong> (1835–1909) — итальянский криминолог, утверждал что «преступный тип» имеет специфические черепные особенности (выдающиеся скулы, низкий лоб, асимметрия). Его теория использовалась для расовой и классовой дискриминации, легла в основу «научного расизма» начала XX века. Современной криминологией Ломброзо <strong>отвергнут полностью</strong>.
          </p>
          <p>
            <strong>Эрнст Кречмер</strong> (1888–1964) — немецкий психиатр, предложил конституциональную типологию (астеник, пикник, атлетик), связывая телосложение с психическими расстройствами. Современной психологией это <strong>не используется</strong>.
          </p>
          <p>
            <strong>Русские физиогномисты XX века</strong> (Эрнст Велховер, Борис Вершинин, Борис Хигир, Артём Павлов) — компилируют исторические школы (Лафатер, Сиго, Кречмер) с восточными традициями (Mian Xiang). Не научны в современном смысле, но дают <em>культурный язык</em> для описания мимики, которого нет в чистом FACS.
          </p>
          <p>
            <strong>Китайская физиогномика (Mian Xiang)</strong> — древняя традиция, часть конфуцианско-даосской системы. Не научна, но имеет 2500 лет культурного авторитета и насмотренности на лица.
          </p>
        </Section>

        {/* WHY MIX */}
        <Section eyebrow="Зачем смешивать" title="Прагматика обучения.">
          <p>
            FACS даёт <strong>анатомически точное описание</strong> мимических движений. Но FACS — это таблица. Чтобы карточка тренажёра «зацепила», нужен <em>смысловой контекст</em>: «эта мимика — что это говорит о человеке?»
          </p>
          <p>
            Физиогномическая традиция даёт этот контекст. Когда Велховер пишет «маркер меланхолического темперамента», это не научный факт — но это <em>удобная мнемоника</em> для запоминания паттерна. Студент-актёр или психолог быстрее запомнит «AU1+AU4 = грусть = меланхолия = Сатурнический тип» чем «AU1+AU4 = m. frontalis pars medialis + m. corrugator supercilii».
          </p>
          <p>
            Поэтому: <strong>FACS — основа</strong>, физиогномика — <strong>культурный декор</strong>. Запоминать стоит первое; второе — для глубины и удовольствия.
          </p>
        </Section>

        {/* RED LINES */}
        <Section eyebrow="Красные линии" title="Что мы НЕ делаем и почему.">
          <p>
            Несмотря на то что цитируем Лафатера и Велховера — <strong>не делаем выводов о характере человека по форме лица</strong>. Это принципиальная позиция, не косметическая:
          </p>
          <ul className="space-y-3 my-6">
            <BulletItem>
              <strong>Не оцениваем «преступные типы».</strong> Идеи Ломброзо использовались для оправдания дискриминации; повторять их в продуктовом контексте — этически неприемлемо.
            </BulletItem>
            <BulletItem>
              <strong>Не предсказываем интеллект, моральные качества или склонности.</strong> Современная нейронаука не находит надёжной связи между чертами лица и личностными чертами. Все «находки» 2010-х (типа «определение сексуальной ориентации по лицу») оказались артефактами выборки.
            </BulletItem>
            <BulletItem>
              <strong>Не позиционируем как HR-инструмент.</strong> Принимать решения о найме на основе мимики — это путь к юридическим проблемам и плохим решениям.
            </BulletItem>
            <BulletItem>
              <strong>Не делаем «детектор лжи».</strong> Микро-выражения связаны со стрессом и противоречием, не напрямую с обманом. Полиграф (более «научный» детектор) тоже не работает надёжно.
            </BulletItem>
          </ul>
          <p>
            Что мы делаем: учим <strong>замечать мимические паттерны</strong> в моменте. Что человек <em>сейчас, в этот момент</em> переживает что-то похожее на эмоцию X. Дальше — контекст, диалог, осторожность.
          </p>
        </Section>

        {/* TLDR */}
        <section className="border-t border-ink pt-10">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-2 eyebrow">Коротко</div>
            <div className="lg:col-span-10 max-w-3xl">
              <h2 className="display text-2xl sm:text-3xl mb-6">TL;DR</h2>
              <ul className="space-y-3 text-ink-2 text-[0.9375rem]">
                <BulletItem>
                  <strong>FACS — наука.</strong> Универсальные мимические паттерны базовых эмоций.
                </BulletItem>
                <BulletItem>
                  <strong>Физиогномика старых школ — не наука.</strong> Цитируем как историко-культурный контекст и мнемоническую помощь, не как руководство.
                </BulletItem>
                <BulletItem>
                  <strong>Расистские интерпретации (Ломброзо) — однозначно не используем.</strong> Упоминаем только в критическом ключе.
                </BulletItem>
                <BulletItem>
                  <strong>Тренажёр учит наблюдательности.</strong> Не диагностике личности, не детекции обмана, не HR-оценке.
                </BulletItem>
              </ul>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/facs" className="btn btn-ghost">
                  Глоссарий FACS →
                </Link>
                <Link href="/about" className="btn btn-ghost">
                  О проекте →
                </Link>
                <Link href="/train" className="btn btn-primary">
                  К тренировке <span aria-hidden>→</span>
                </Link>
              </div>
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
