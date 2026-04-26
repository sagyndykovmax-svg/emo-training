/**
 * Pairs of (genuine, performed) facial expressions for the authenticity
 * training mode at /authenticity.
 *
 * For each emotion below, two images of similar-aged subjects are generated
 * by Nano Banana — one with the diagnostic "hard-to-fake" AU intact, and
 * one with that AU absent or wrong. The user must spot which is genuine.
 *
 * The `tell` field is the explanation revealed after the user answers — it
 * names the specific AU or compositional feature that distinguishes them.
 */

export interface AuthenticityPair {
  id: string;
  emotion: string;
  question: string;
  genuineImagePath: string;
  performedImagePath: string;
  /** Concise diagnostic tell shown after answering. */
  tell: string;
  /** Longer explanation for users who want depth. */
  explanation: string;
  difficulty: 1 | 2 | 3;
}

export const AUTHENTICITY_PAIRS: AuthenticityPair[] = [
  {
    id: 'auth-joy',
    emotion: 'Радость',
    question: 'Какая улыбка настоящая?',
    genuineImagePath: '/training/auth-joy-genuine.jpg',
    performedImagePath: '/training/auth-joy-performed.jpg',
    tell: 'AU6 — задействована круговая мышца глаза',
    explanation:
      'Настоящая улыбка (Дюшенновская) задействует мышцу AU6: вокруг глаз появляются «гусиные лапки», щёки приподнимаются и сужают глазную щель. По Экману, AU6 управляется лимбической системой и почти не подделывается сознательно. Социальная улыбка использует только AU12 (мышцу губ) — глаза остаются гладкими.',
    difficulty: 1,
  },
  {
    id: 'auth-sadness',
    emotion: 'Грусть',
    question: 'Какое лицо выражает настоящую грусть?',
    genuineImagePath: '/training/auth-sadness-genuine.jpg',
    performedImagePath: '/training/auth-sadness-performed.jpg',
    tell: 'AU1 — внутренние углы бровей подняты домиком',
    explanation:
      'Главный диагностический признак настоящей грусти — поднятые внутренние края бровей (AU1), формирующие характерную форму «домика». По Экману, это самое трудное для фальсификации движение — только 10% людей управляют им сознательно. Если уголки рта опущены, но лоб гладкий и брови ровные — это имитация (или просто усталость).',
    difficulty: 2,
  },
  {
    id: 'auth-anger',
    emotion: 'Гнев',
    question: 'Где настоящий гнев?',
    genuineImagePath: '/training/auth-anger-genuine.jpg',
    performedImagePath: '/training/auth-anger-performed.jpg',
    tell: 'Глаза работают вместе со ртом (AU5 + AU7)',
    explanation:
      'Подлинный гнев — когерентная эмоция: и нижняя зона (рот), и верхняя (глаза) включены одновременно. Поднятые верхние веки (AU5) и напряжённые нижние (AU7) — обязательные сигналы. «Сердитый рот при мягких глазах» — частая поза без внутренней агрессии. По Велховеру, оральная зона = воля, глаза = намерение; в гневе они должны совпадать.',
    difficulty: 2,
  },
  {
    id: 'auth-surprise',
    emotion: 'Удивление',
    question: 'Какое удивление настоящее?',
    genuineImagePath: '/training/auth-surprise-genuine.jpg',
    performedImagePath: '/training/auth-surprise-performed.jpg',
    tell: 'Длительность — настоящее удивление меньше секунды',
    explanation:
      'Удивление — самая короткая эмоция. Подлинная вспышка длится менее секунды, после чего сменяется другой эмоцией (радостью, страхом или гневом — в зависимости от того, как расшифровалось неожиданное). Удерживаемое «удивлённое» лицо дольше 2-3 секунд — это намеренная демонстрация, а не реакция. Лафатер называл подлинное удивление «чистым отражением мира».',
    difficulty: 3,
  },
  {
    id: 'auth-fear',
    emotion: 'Страх',
    question: 'Где настоящий страх, а где наигранный?',
    genuineImagePath: '/training/auth-fear-genuine.jpg',
    performedImagePath: '/training/auth-fear-performed.jpg',
    tell: 'AU4 + AU20 — диагностическая комбинация',
    explanation:
      'Подлинный страх требует одновременного срабатывания AU1+2+4 (брови подняты И сведены) и AU20 (горизонтальное растяжение губ). Без AU4 (вертикальные морщины между бровями) и без AU20 (растянутый прямоугольный рот вместо открытого овала) выражение читается ближе к удивлению, чем к страху. По Экману, эта комбинация невозможна без подлинной активации страховой реакции.',
    difficulty: 3,
  },
  {
    id: 'auth-contempt',
    emotion: 'Презрение',
    question: 'Какое презрение настоящее?',
    genuineImagePath: '/training/auth-contempt-genuine.jpg',
    performedImagePath: '/training/auth-contempt-performed.jpg',
    tell: 'Асимметрия — настоящее презрение всегда односторонне',
    explanation:
      'Презрение — единственная базовая эмоция с диагностической асимметрией (AU14 с одной стороны). Симметричный «снисходительный смешок» теряет диагностическую силу — он превращается в обычную социальную улыбку или вежливую усмешку. По Лафатеру, истинное презрение — «печать гордыни», и эта печать всегда односторонняя.',
    difficulty: 1,
  },
];
