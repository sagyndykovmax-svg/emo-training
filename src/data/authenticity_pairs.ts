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
  {
    id: 'auth-disgust',
    emotion: 'Отвращение',
    question: 'Где настоящее отвращение?',
    genuineImagePath: '/training/auth-disgust-genuine.jpg',
    performedImagePath: '/training/auth-disgust-performed.jpg',
    tell: 'AU9 — сморщивание носа',
    explanation:
      'Истинное отвращение — рефлекс защиты слизистой носа, поэтому ВСЕГДА вовлекает носовую зону (AU9 — сморщивание носа, образование морщин на переносице). «Брезгливая» гримаса только губами (AU10) без AU9 — это часто моральное осуждение или социальная демонстрация, не висцеральная реакция. По Сиго, висцеральное отвращение — маркер пикнического типа, моральное — другой механизм.',
    difficulty: 2,
  },
  {
    id: 'auth-smile',
    emotion: 'Улыбка',
    question: 'Какая улыбка идёт от души?',
    genuineImagePath: '/training/auth-smile-duchenne.jpg',
    performedImagePath: '/training/auth-smile-social.jpg',
    tell: 'AU6 vs AU12 — настоящая улыбка задействует круговую мышцу глаза',
    explanation:
      'Это эталонный пример из учебника физиогномики. Дюшенновская улыбка задействует И большую скуловую мышцу (AU12 — губы), И круговую мышцу глаза (AU6 — щёки и «гусиные лапки»). Социальная улыбка — только AU12. По Экману, AU6 управляется лимбической системой, а AU12 — моторной корой; вот почему «улыбку глазами» нельзя имитировать сознательно. По Велховеру, это «истинное сияние души» против «маски приличия».',
    difficulty: 1,
  },
  {
    id: 'auth-shame',
    emotion: 'Стыд',
    question: 'Какой стыд настоящий?',
    genuineImagePath: '/training/auth-shame-genuine.jpg',
    performedImagePath: '/training/auth-shame-performed.jpg',
    tell: 'Вегетативные сигналы — покраснение, отвод взгляда, желание уменьшиться',
    explanation:
      'Подлинный стыд сопровождается вегетативной реакцией (покраснение, потоотделение) и непроизвольной попыткой «уменьшиться» — съёженная поза, отвод головы и взгляда, прикрытие лица руками. Перформативный стыд показывает позу, но без вегетативных утечек: лицо ровного цвета, взгляд может бегать, но без характерного «прячущегося» движения, поза скорее заученная чем рефлексивная. Покраснение — самый надёжный маркер, его невозможно подделать сознательно.',
    difficulty: 3,
  },
  {
    id: 'auth-suppressed',
    emotion: 'Подавленный гнев',
    question: 'Где настоящее подавление, а где имитация спокойствия?',
    genuineImagePath: '/training/auth-suppressed-genuine.jpg',
    performedImagePath: '/training/auth-suppressed-performed.jpg',
    tell: 'Микро-утечки — игра желваков, побеление губ, фиксация взгляда',
    explanation:
      'Подавленный гнев под маской нейтральности всегда оставляет «утечки» (leakage) в трёх точках: ритмичное сокращение жевательных мышц (видимая «игра желваков»), побеление кожи над верхней губой от микро-напряжения AU23, едва заметное сужение глазной щели и снижение частоты моргания. Просто нейтральное лицо без этих утечек — это спокойствие, не подавление. По Хигиру, длительное подавление со временем формирует характерные борозды между бровями и плотную сжатую линию рта.',
    difficulty: 3,
  },
];
