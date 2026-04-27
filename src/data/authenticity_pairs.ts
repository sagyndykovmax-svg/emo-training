/**
 * Pairs of (genuine, performed) facial expressions for the authenticity
 * training mode at /authenticity.
 *
 * Each pair has multiple visual `variants` — same diagnostic AU contrast,
 * but different subjects (varied age/gender/ethnicity) so the same pair
 * doesn't show identical photos every time it cycles back via SR. Variant
 * is picked uniformly at random when the pair is shown; SR scheduling is
 * stored per pair-id (not per variant), so user's mastery of "joy" applies
 * across all visual variants.
 *
 * The `tell` and `explanation` are shared across variants — they describe
 * the diagnostic AU pattern, which is the same regardless of subject.
 */

export interface AuthenticityVariant {
  genuineImagePath: string;
  performedImagePath: string;
}

export interface AuthenticityPair {
  id: string;
  emotion: string;
  question: string;
  /** All visual variants of this pair. Random one picked per show. */
  variants: AuthenticityVariant[];
  /** Concise diagnostic tell shown after answering. */
  tell: string;
  /** Longer explanation for users who want depth. */
  explanation: string;
  difficulty: 1 | 2 | 3;
}

/** Picks a random variant for the given pair. Convenience helper. */
export function pickRandomVariant(pair: AuthenticityPair): AuthenticityVariant {
  if (pair.variants.length === 0) {
    throw new Error(`AuthenticityPair ${pair.id} has no variants`);
  }
  return pair.variants[Math.floor(Math.random() * pair.variants.length)];
}

export const AUTHENTICITY_PAIRS: AuthenticityPair[] = [
  {
    id: 'auth-joy',
    emotion: 'Радость',
    question: 'Какая улыбка настоящая?',
    variants: [
      { genuineImagePath: '/training/auth-joy-genuine.jpg', performedImagePath: '/training/auth-joy-performed.jpg' },
      { genuineImagePath: '/training/auth-joy-genuine-2.jpg', performedImagePath: '/training/auth-joy-performed-2.jpg' },
      { genuineImagePath: '/training/auth-joy-genuine-3.jpg', performedImagePath: '/training/auth-joy-performed-3.jpg' },
    ],
    tell: 'AU6 — задействована круговая мышца глаза',
    explanation:
      'Настоящая улыбка (Дюшенновская) задействует мышцу AU6: вокруг глаз появляются «гусиные лапки», щёки приподнимаются и сужают глазную щель. По Экману, AU6 управляется лимбической системой и почти не подделывается сознательно. Социальная улыбка использует только AU12 (мышцу губ) — глаза остаются гладкими.',
    difficulty: 1,
  },
  {
    id: 'auth-sadness',
    emotion: 'Грусть',
    question: 'Какое лицо выражает настоящую грусть?',
    variants: [
      { genuineImagePath: '/training/auth-sadness-genuine.jpg', performedImagePath: '/training/auth-sadness-performed.jpg' },
      { genuineImagePath: '/training/auth-sadness-genuine-2.jpg', performedImagePath: '/training/auth-sadness-performed-2.jpg' },
      { genuineImagePath: '/training/auth-sadness-genuine-3.jpg', performedImagePath: '/training/auth-sadness-performed-3.jpg' },
    ],
    tell: 'AU1 — внутренние углы бровей подняты домиком',
    explanation:
      'Главный диагностический признак настоящей грусти — поднятые внутренние края бровей (AU1), формирующие характерную форму «домика». По Экману, это самое трудное для фальсификации движение — только 10% людей управляют им сознательно. Если уголки рта опущены, но лоб гладкий и брови ровные — это имитация (или просто усталость).',
    difficulty: 2,
  },
  {
    id: 'auth-anger',
    emotion: 'Гнев',
    question: 'Где настоящий гнев?',
    variants: [
      { genuineImagePath: '/training/auth-anger-genuine.jpg', performedImagePath: '/training/auth-anger-performed.jpg' },
      { genuineImagePath: '/training/auth-anger-genuine-2.jpg', performedImagePath: '/training/auth-anger-performed-2.jpg' },
      { genuineImagePath: '/training/auth-anger-genuine-3.jpg', performedImagePath: '/training/auth-anger-performed-3.jpg' },
    ],
    tell: 'Глаза работают вместе со ртом (AU5 + AU7)',
    explanation:
      'Подлинный гнев — когерентная эмоция: и нижняя зона (рот), и верхняя (глаза) включены одновременно. Поднятые верхние веки (AU5) и напряжённые нижние (AU7) — обязательные сигналы. «Сердитый рот при мягких глазах» — частая поза без внутренней агрессии. По Велховеру, оральная зона = воля, глаза = намерение; в гневе они должны совпадать.',
    difficulty: 2,
  },
  {
    id: 'auth-surprise',
    emotion: 'Удивление',
    question: 'Какое удивление настоящее?',
    variants: [
      { genuineImagePath: '/training/auth-surprise-genuine.jpg', performedImagePath: '/training/auth-surprise-performed.jpg' },
      { genuineImagePath: '/training/auth-surprise-genuine-2.jpg', performedImagePath: '/training/auth-surprise-performed-2.jpg' },
      { genuineImagePath: '/training/auth-surprise-genuine-3.jpg', performedImagePath: '/training/auth-surprise-performed-3.jpg' },
    ],
    tell: 'Длительность — настоящее удивление меньше секунды',
    explanation:
      'Удивление — самая короткая эмоция. Подлинная вспышка длится менее секунды, после чего сменяется другой эмоцией (радостью, страхом или гневом — в зависимости от того, как расшифровалось неожиданное). Удерживаемое «удивлённое» лицо дольше 2-3 секунд — это намеренная демонстрация, а не реакция. Лафатер называл подлинное удивление «чистым отражением мира».',
    difficulty: 3,
  },
  {
    id: 'auth-fear',
    emotion: 'Страх',
    question: 'Где настоящий страх, а где наигранный?',
    variants: [
      { genuineImagePath: '/training/auth-fear-genuine.jpg', performedImagePath: '/training/auth-fear-performed.jpg' },
      { genuineImagePath: '/training/auth-fear-genuine-2.jpg', performedImagePath: '/training/auth-fear-performed-2.jpg' },
      { genuineImagePath: '/training/auth-fear-genuine-3.jpg', performedImagePath: '/training/auth-fear-performed-3.jpg' },
    ],
    tell: 'AU4 + AU20 — диагностическая комбинация',
    explanation:
      'Подлинный страх требует одновременного срабатывания AU1+2+4 (брови подняты И сведены) и AU20 (горизонтальное растяжение губ). Без AU4 (вертикальные морщины между бровями) и без AU20 (растянутый прямоугольный рот вместо открытого овала) выражение читается ближе к удивлению, чем к страху. По Экману, эта комбинация невозможна без подлинной активации страховой реакции.',
    difficulty: 3,
  },
  {
    id: 'auth-contempt',
    emotion: 'Презрение',
    question: 'Какое презрение настоящее?',
    variants: [
      { genuineImagePath: '/training/auth-contempt-genuine.jpg', performedImagePath: '/training/auth-contempt-performed.jpg' },
      { genuineImagePath: '/training/auth-contempt-genuine-2.jpg', performedImagePath: '/training/auth-contempt-performed-2.jpg' },
      { genuineImagePath: '/training/auth-contempt-genuine-3.jpg', performedImagePath: '/training/auth-contempt-performed-3.jpg' },
    ],
    tell: 'Асимметрия — настоящее презрение всегда односторонне',
    explanation:
      'Презрение — единственная базовая эмоция с диагностической асимметрией (AU14 с одной стороны). Симметричный «снисходительный смешок» теряет диагностическую силу — он превращается в обычную социальную улыбку или вежливую усмешку. По Лафатеру, истинное презрение — «печать гордыни», и эта печать всегда односторонняя.',
    difficulty: 1,
  },
  {
    id: 'auth-disgust',
    emotion: 'Отвращение',
    question: 'Где настоящее отвращение?',
    variants: [
      { genuineImagePath: '/training/auth-disgust-genuine.jpg', performedImagePath: '/training/auth-disgust-performed.jpg' },
      { genuineImagePath: '/training/auth-disgust-genuine-2.jpg', performedImagePath: '/training/auth-disgust-performed-2.jpg' },
      { genuineImagePath: '/training/auth-disgust-genuine-3.jpg', performedImagePath: '/training/auth-disgust-performed-3.jpg' },
    ],
    tell: 'AU9 — сморщивание носа',
    explanation:
      'Истинное отвращение — рефлекс защиты слизистой носа, поэтому ВСЕГДА вовлекает носовую зону (AU9 — сморщивание носа, образование морщин на переносице). «Брезгливая» гримаса только губами (AU10) без AU9 — это часто моральное осуждение или социальная демонстрация, не висцеральная реакция. По Сиго, висцеральное отвращение — маркер пикнического типа, моральное — другой механизм.',
    difficulty: 2,
  },
  {
    id: 'auth-smile',
    emotion: 'Улыбка',
    question: 'Какая улыбка идёт от души?',
    variants: [
      { genuineImagePath: '/training/auth-smile-duchenne.jpg', performedImagePath: '/training/auth-smile-social.jpg' },
      { genuineImagePath: '/training/auth-smile-duchenne-2.jpg', performedImagePath: '/training/auth-smile-social-2.jpg' },
      { genuineImagePath: '/training/auth-smile-duchenne-3.jpg', performedImagePath: '/training/auth-smile-social-3.jpg' },
    ],
    tell: 'AU6 vs AU12 — настоящая улыбка задействует круговую мышцу глаза',
    explanation:
      'Это эталонный пример из учебника физиогномики. Дюшенновская улыбка задействует И большую скуловую мышцу (AU12 — губы), И круговую мышцу глаза (AU6 — щёки и «гусиные лапки»). Социальная улыбка — только AU12. По Экману, AU6 управляется лимбической системой, а AU12 — моторной корой; вот почему «улыбку глазами» нельзя имитировать сознательно. По Велховеру, это «истинное сияние души» против «маски приличия».',
    difficulty: 1,
  },
  {
    id: 'auth-shame',
    emotion: 'Стыд',
    question: 'Какой стыд настоящий?',
    variants: [
      { genuineImagePath: '/training/auth-shame-genuine.jpg', performedImagePath: '/training/auth-shame-performed.jpg' },
      { genuineImagePath: '/training/auth-shame-genuine-2.jpg', performedImagePath: '/training/auth-shame-performed-2.jpg' },
      { genuineImagePath: '/training/auth-shame-genuine-3.jpg', performedImagePath: '/training/auth-shame-performed-3.jpg' },
    ],
    tell: 'Вегетативные сигналы — лёгкое покраснение, отвод взгляда, желание уменьшиться',
    explanation:
      'Подлинный стыд сопровождается вегетативной реакцией (лёгкое покраснение, потоотделение) и непроизвольной попыткой «уменьшиться» — съёженная поза, отвод головы и взгляда, прикрытие лица руками. Перформативный стыд показывает позу, но без вегетативных утечек: лицо ровного цвета, взгляд может бегать, но без характерного «прячущегося» движения, поза скорее заученная чем рефлексивная. Лёгкое покраснение — самый надёжный маркер, его невозможно подделать сознательно (но оно тонкое — не театральная краснота).',
    difficulty: 3,
  },
  {
    id: 'auth-suppressed',
    emotion: 'Подавленный гнев',
    question: 'Где настоящее подавление, а где имитация спокойствия?',
    variants: [
      { genuineImagePath: '/training/auth-suppressed-genuine.jpg', performedImagePath: '/training/auth-suppressed-performed.jpg' },
      { genuineImagePath: '/training/auth-suppressed-genuine-2.jpg', performedImagePath: '/training/auth-suppressed-performed-2.jpg' },
      { genuineImagePath: '/training/auth-suppressed-genuine-3.jpg', performedImagePath: '/training/auth-suppressed-performed-3.jpg' },
    ],
    tell: 'Микро-утечки — игра желваков, побеление губ, фиксация взгляда',
    explanation:
      'Подавленный гнев под маской нейтральности всегда оставляет «утечки» (leakage) в трёх точках: ритмичное сокращение жевательных мышц (видимая «игра желваков»), побеление кожи над верхней губой от микро-напряжения AU23, едва заметное сужение глазной щели и снижение частоты моргания. Просто нейтральное лицо без этих утечек — это спокойствие, не подавление. По Хигиру, длительное подавление со временем формирует характерные борозды между бровями и плотную сжатую линию рта.',
    difficulty: 3,
  },
];
