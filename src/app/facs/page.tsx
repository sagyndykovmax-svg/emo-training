import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthBadge } from '@/components/AuthBadge';

export const metadata: Metadata = {
  title: 'Глоссарий FACS — Emotion Training',
  description:
    'Action Units (AU) в системе кодирования лицевых движений Пола Экмана. Все маркеры, используемые в тренажёре — с описанием мышцы, визуального проявления и эмоций, в которых работают.',
};

interface AU {
  code: string;
  name: string;
  muscle: string;
  description: string;
  emotions: string[];
}

const AUS: AU[] = [
  {
    code: 'AU1',
    name: 'Поднятие внутренних углов бровей',
    muscle: 'm. frontalis pars medialis',
    description:
      'Внутренние края бровей поднимаются вверх, образуя характерный «домик». Самое трудное для подделки движение — только 10% людей управляют им изолированно.',
    emotions: ['Грусть', 'Страх', 'Тревога', 'Ностальгия'],
  },
  {
    code: 'AU2',
    name: 'Поднятие внешних углов бровей',
    muscle: 'm. frontalis pars lateralis',
    description:
      'Внешние края бровей поднимаются. В сочетании с AU1 даёт ровную «арку» удивления; вместе с AU4 — сведение бровей в страхе.',
    emotions: ['Удивление', 'Страх', 'Тревога'],
  },
  {
    code: 'AU4',
    name: 'Сведение бровей',
    muscle: 'm. corrugator supercilii',
    description:
      'Брови опускаются и сводятся к центру, образуя вертикальные борозды между ними («морщины гордеца» по Лафатеру).',
    emotions: ['Гнев', 'Страх', 'Тревога', 'Грусть'],
  },
  {
    code: 'AU5',
    name: 'Поднятие верхнего века',
    muscle: 'm. levator palpebrae superioris',
    description:
      'Верхние веки максимально подняты, обнажают склеру (белок) над радужкой. «Стальной блеск» гнева или «выпученные глаза» страха.',
    emotions: ['Страх', 'Гнев', 'Удивление'],
  },
  {
    code: 'AU6',
    name: 'Поднятие щёк, сужение глазниц',
    muscle: 'm. orbicularis oculi pars orbitalis',
    description:
      'Щёки приподнимаются, сужают глазную щель, образуют «гусиные лапки» в наружных уголках глаз. Управляется лимбической системой — диагностический признак Дюшенновской улыбки.',
    emotions: ['Радость (искренняя)', 'Дюшенновская улыбка'],
  },
  {
    code: 'AU7',
    name: 'Напряжение нижнего века',
    muscle: 'm. orbicularis oculi pars palpebralis',
    description:
      'Нижние веки слегка приподняты и напряжены. Тонкий маркер искреннего гнева или сдержанной агрессии.',
    emotions: ['Гнев', 'Контролируемый гнев', 'Подавленный гнев'],
  },
  {
    code: 'AU9',
    name: 'Сморщивание носа',
    muscle: 'm. levator labii superioris alaeque nasi',
    description:
      'Нос сморщен вверх, образуются морщины на переносице. Рефлекс защиты слизистой — диагностический признак подлинного отвращения.',
    emotions: ['Отвращение'],
  },
  {
    code: 'AU10',
    name: 'Поднятие верхней губы',
    muscle: 'm. levator labii superioris',
    description:
      'Верхняя губа поднимается, обнажая верхние зубы. Часто сопровождает AU9 в отвращении; без AU9 — чаще моральное осуждение, не висцеральная реакция.',
    emotions: ['Отвращение', 'Гнев'],
  },
  {
    code: 'AU12',
    name: 'Поднятие углов рта',
    muscle: 'm. zygomaticus major',
    description:
      'Уголки рта тянутся вверх и в стороны. Управляется моторной корой — есть и в социальной улыбке, и в Дюшенновской. Диагностический критерий искренности — наличие AU6 одновременно.',
    emotions: ['Радость', 'Социальная улыбка', 'Дюшенновская улыбка', 'Ностальгия'],
  },
  {
    code: 'AU14',
    name: 'Одностороннее напряжение угла рта',
    muscle: 'm. buccinator',
    description:
      'Один уголок рта стянут вверх и назад в характерную «ямочку». Единственная асимметричная диагностическая мимика — единственный признак презрения.',
    emotions: ['Презрение'],
  },
  {
    code: 'AU15',
    name: 'Опускание углов рта',
    muscle: 'm. depressor anguli oris',
    description: 'Уголки рта опускаются вниз. Базовый маркер грусти.',
    emotions: ['Грусть', 'Тревога'],
  },
  {
    code: 'AU17',
    name: 'Поднятие подбородка',
    muscle: 'm. mentalis',
    description:
      'Нижняя губа выталкивается вверх под напряжением подбородочной мышцы — образуется характерный «бугорок». Часто сопровождает грусть и сосредоточенность.',
    emotions: ['Грусть', 'Отвращение'],
  },
  {
    code: 'AU20',
    name: 'Горизонтальное растяжение рта',
    muscle: 'm. risorius',
    description:
      'Уголки рта тянутся в стороны (к ушам), губы становятся узкими и натянутыми, образуя «прямоугольник». Диагностический маркер страха — без AU20 это удивление.',
    emotions: ['Страх'],
  },
  {
    code: 'AU23',
    name: 'Сужение губ',
    muscle: 'm. orbicularis oris',
    description:
      'Губы сжимаются и становятся уже. В сочетании с AU24 — побеление каймы губ (контролируемый гнев). Главный микро-маркер подавления.',
    emotions: ['Гнев', 'Контролируемый гнев', 'Подавленный гнев'],
  },
  {
    code: 'AU24',
    name: 'Сжатие губ',
    muscle: 'm. orbicularis oris',
    description: 'Губы плотно прижимаются друг к другу — тонкая прямая линия рта.',
    emotions: ['Контролируемый гнев', 'Подавленный гнев'],
  },
  {
    code: 'AU26',
    name: 'Опускание нижней челюсти',
    muscle: '(пассивное расслабление)',
    description:
      'Челюсть пассивно опускается, рот размыкается. Расслабленный овал — удивление; напряжённый прямоугольник (с AU20) — страх.',
    emotions: ['Удивление', 'Страх'],
  },
];

export default function FacsPage() {
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
          <div className="lg:col-span-2 eyebrow">Глоссарий</div>
          <div className="lg:col-span-10 max-w-3xl">
            <h1 className="display text-[clamp(2.5rem,6vw,5rem)] mb-6">
              Action Units по <span className="display-italic">Полу Экману</span>
            </h1>
            <p className="text-ink-2 text-lg leading-relaxed mb-4">
              FACS (Facial Action Coding System) — научная система кодирования мимических движений, разработанная Полом Экманом и Уоллесом Фризеном в 1978 году. Каждое самостоятельное движение лицевой мышцы получает номер — «Action Unit» (AU).
            </p>
            <p className="text-ink-2 text-base leading-relaxed">
              Здесь — 16 AU, которые встречаются в нашем тренажёре. Это не полный список (в FACS их около 50, плюс модификаторы интенсивности и временные характеристики), но это рабочий минимум для распознавания базовых эмоций по Экману.
            </p>
          </div>
        </div>

        <div className="space-y-6 mb-20">
          {AUS.map((au) => (
            <article key={au.code} className="border-t border-ink pt-5">
              <div className="grid lg:grid-cols-12 gap-4 lg:gap-8">
                <div className="lg:col-span-2">
                  <div className="display text-3xl sm:text-4xl text-accent">{au.code}</div>
                  <div className="text-xs text-ink-3 italic mt-2">{au.muscle}</div>
                </div>
                <div className="lg:col-span-7">
                  <h2 className="display text-xl sm:text-2xl mb-3">{au.name}</h2>
                  <p className="text-ink-2 text-[0.9375rem] leading-relaxed">{au.description}</p>
                </div>
                <div className="lg:col-span-3">
                  <div className="eyebrow mb-2">Встречается в</div>
                  <ul className="space-y-1">
                    {au.emotions.map((e) => (
                      <li key={e} className="text-sm text-ink-2">
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CULTURAL CAVEATS */}
        <section className="border-t border-ink pt-10 mb-16">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-2 eyebrow">Важная оговорка</div>
            <div className="lg:col-span-10 max-w-3xl">
              <h2 className="display text-3xl sm:text-4xl mb-6">
                Кросс-культурные ограничения.
              </h2>
              <div className="prose-analysis space-y-4 text-ink-2">
                <p>
                  По данным Экмана, <strong>сами по себе паттерны AU для базовых семи эмоций универсальны</strong> — испытуемые из разных культур (включая племена, не контактировавшие с западной цивилизацией) корректно распознают одни и те же мимические комбинации.
                </p>
                <p>
                  Но универсальны <em>паттерны</em>, а не <em>правила отображения</em>. Японская культура культивирует подавление негативных эмоций при свидетелях; некоторые культуры Ближнего Востока — наоборот, расширенную экспрессию. Это значит: AU6 как маркер искренней радости работает везде, но <strong>частота наблюдения этого AU</strong> в реальном поведении сильно зависит от культурных норм.
                </p>
                <p>
                  Дополнительно: индивидуальные различия (нейроразнообразие, аутистический спектр, болезнь Паркинсона, последствия инсульта) могут полностью менять способность лица производить определённые AU. Если человек редко улыбается «глазами», это не обязательно социальная маска — это может быть просто мышечная особенность.
                </p>
                <p>
                  Что это значит для тренажёра: мы тренируем распознавание <em>паттернов</em>, а не диагностику характера. Если ваш собеседник не показывает AU1 при печальных новостях — не делайте автоматического вывода, что он «не сочувствует». Это сигнал, требующий контекста.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SOURCES */}
        <section className="border-t border-rule pt-8">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-2 eyebrow">Источники</div>
            <div className="lg:col-span-10 max-w-3xl text-sm text-ink-3 leading-relaxed space-y-2">
              <p>Ekman, P., &amp; Friesen, W. V. (1978). <em>Facial Action Coding System: A Technique for the Measurement of Facial Movement.</em> Consulting Psychologists Press.</p>
              <p>Ekman, P. (2003). <em>Emotions Revealed: Recognizing Faces and Feelings to Improve Communication and Emotional Life.</em></p>
              <p>Ekman, P. (1992). An argument for basic emotions. <em>Cognition &amp; Emotion, 6</em>(3-4), 169-200.</p>
              <p>
                <Link href="/physiognomy-vs-science" className="text-accent hover:underline">
                  Подробнее о научном статусе физиогномики и FACS →
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
