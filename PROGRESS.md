# Progress Log

## v0.6 — 2026-04-27 (high + medium priority sweep)

Большой батч из 5 функциональных PR, закрывающий весь high-priority блок (кроме отложенного real-face гибрида) и весь medium-priority блок из roadmap'а.

### PR #12 — AI-judge режим
- Свободный текстовый ответ вместо MCQ — пользователь описывает эмоцию словами, Gemini 2.5 Flash оценивает с partial credit
- Возвращает: score 0-100, verdict, foundMarkers, missedMarkers, guidance
- POST `/api/judge` — первый runtime AI-зависимый route. Намеренное нарушение принципа "AI только в build-time" (документировано как осознанное исключение)
- Toggle "MCQ / Текст" в header `/train`, persist в localStorage
- Cmd/Ctrl+Enter submits из textarea
- Storage: AnswerRecord гейт `mode: 'mcq' | 'free'` чтобы free-answers не пачкали confusion matrix
- 800-char hard cap на user text, score>=80 → correct, 50-79 → partial

### PR #13 — Cloud sync через Supabase
- Опциональная cross-device синхронизация. Без env vars — graceful degradation в localStorage-only режим (без auth UI)
- localStorage остаётся primary store, cloud — debounced backup (5 сек)
- На sign-in: `reconcileOnSignIn()` сравнивает по total attempts, last-write-wins
- Email/password auth (без Google OAuth для MVP — отложено)
- `/account` page (sign in/up/dashboard), `AuthBadge` в header всех страниц
- SQL миграция: 1 таблица `progress` + RLS policies + auto-bump trigger
- Schema: `byCategory`, `authenticity`, `byCard`, `recentAnswers` — всё в едином jsonb

### PR #14 — Per-pair breakdown + Confusion heatmap
- В `/progress` добавлен per-pair authenticity breakdown с tells, color-coded accuracy bars, счётчиком unseen pairs
- Top-5 confusion список заменён на N×N heatmap (десктоп only, mobile fallback к списку)
- Heatmap: диагональ green-tinted (правильные), off-diagonal rust-red (путаницы), opacity ∝ count
- Vertical-text column headers, hover tooltip с деталями
- Новые helpers: `authenticityPerPair`, `confusionMatrix`, `emotionsTouched`

### PR #15 — Per-card SM-2 spaced repetition
- Заменили per-emotion эвристику на классический SM-2 на уровне карточки
- Каждая карточка имеет свой `eFactor` (default 2.5, floor 1.3) и `interval`
- Quality mapping: wrong=0, partial=2, correct=4. q<3 сбрасывает в 1; q≥3 растит interval
- pickNextCard приоритет: due card → unseen → due emotion (fallback) → random
- Storage backward-compat: старые данные получают `byCard: {}` при чтении

### PR #16 — 4 контентные страницы
- `/facs` — глоссарий 16 Action Units с описанием мышц + кросс-культурная оговорка
- `/about` — позиционирование, источники, стек, дисклеймер
- `/faq` — 10 типовых вопросов
- `/physiognomy-vs-science` — где наука (FACS), где не наука (Лафатер, Ломброзо), красные линии
- Footer лендинга переписан с 4 колонками ссылок
- Sitemap расширен 4 новыми URL

### Build state
- 12 routes (было 8 в v0.5)
- 1 dynamic route (`/api/judge`), 11 static
- Bundle size в норме, по prerender stats всё OK
- Production: https://emo-training.vercel.app

### Pending user actions
- Включить Vercel Analytics на dashboard (один клик)
- Опционально: добавить `NEXT_PUBLIC_SUPABASE_*` env vars в Preview scope (сейчас только Production)

---

## v0.5 — 2026-04-26 (authenticity persistence + SR + dashboard)

«Part C-lite» — глубина к существующему /authenticity без дублирования его как Tier IV в /train.

### Контент
- **+4 новые пары** (теперь 10 всего): disgust (AU9 vs AU10-only), smile (Дюшенновская vs социальная — explicit), shame (с покраснением vs выученная поза), suppressed-anger (реальные leakage vs имитация спокойствия)
- 8 новых картинок через Nano Banana (~$0.32), все сжаты mozjpeg q82

### Storage v3
- Новый slice `authenticity: Partial<Record<string, AuthenticityPairStats>>` на Progress
- `recordAuthenticityAnswer({pairId, isCorrect, timeMs})` — запись + SR scheduling
- `authenticityTotals(p)`, `authenticityDueRanked(p)` — derivatives
- SR такой же как в основном тренажёре: wrong=4, correct streak 1=12, 2=24, 3=40, 4+=60
- Полностью backward-compat — старые данные получают `authenticity: {}` при чтении

### `/authenticity` page rewrite
- `nextPair()` использует SR: most-overdue → unseen → random
- Каждый ответ persists в localStorage (больше не session-only)
- Header: total ответов + накопительная accuracy
- Пары которые путаешь — возвращаются через 4 ответа

### `/progress` dashboard
- Новая секция «Различение настоящего от фальши» (показывается если attempts > 0)
- Большая accuracy цифра + total + ссылка обратно
- Honest framing: «точность ниже общей по тренажёру естественна — подделать мимику легче, чем заметить»

### Что НЕ сделали (от изначальной Part C)
- Не интегрировали как Tier IV в /train — это создавало бы UX overlap с standalone /authenticity
- Не добавили per-pair breakdown в /progress (только агрегатные стат) — можно добавить в следующей итерации если usage оправдает

---

## v0.4 — 2026-04-26 (authenticity training)

Адресует предложение профайлера: «добавить что-то для отличия искренних эмоций от фальши». Реализовано двумя слоями в одном PR.

### Part A — Surface existing inauthenticity tells
- `src/data/inauthenticity_tells.json` — hand-extracted «Сигналы неискренности» из NotebookLM-разборов для 11 эмоций (7 базовых + ключевые Tier 2/3)
- Новое поле `inauthenticityTells?: string` в `EmotionMeta`, мерджится в `EMOTIONS` map при init
- В `FeedbackPanel` после каждого ответа теперь блок «🎭 Сигналы фальши» с диагностикой подделки текущей эмоции
- Каждая карточка основного тренажёра становится уроком по детекции лжи

### Part B — Новый режим `/authenticity`
- 6 пар genuine/performed: joy, sadness, anger, surprise, fear, contempt
- 12 новых картинок через Nano Banana (~$0.50)
- Side-by-side выбор A/B с рандомизированной стороной (genuine может быть слева или справа)
- После ответа — оба изображения остаются с тегами «Настоящее»/«Наигранное», подсвечен выбор пользователя, потом one-liner tell + параграф объяснения
- Циклит через пары в shuffled порядке; reshuffles на лупе
- Session accuracy в header (per-pair stats не персистится — это сейчас session-only режим)
- Новая секция «Различить настоящее» на лендинге с CTA в `/authenticity`
- Добавлено в sitemap.xml как priority 0.85

### Качество картинок (честный аудит)
| Пара | Genuine | Performed | Контраст |
|---|---|---|---|
| Joy | ✅ deep crow's feet | ✅ smooth eyes | strong |
| Sadness | ✅ AU1 visible | ⚠️ neutralнее ожидаемого | моderate |
| Anger | ✅ AU4+5+7 cohesive | ⚠️ subtle | moderate |
| Surprise | ⚠️ статика не передаёт timing | ⚠️ статика не передаёт timing | weak — отражено в copy |
| Fear | ✅ AU4+AU20 диагностические | ✅ clean arches | strong |
| Contempt | ⚠️ subtle асимметрия | ✅ симметричный smug smile | moderate |

Surprise pair — единственный фундаментально слабый из-за природы эмоции (статика не показывает длительность). В explanation честно об этом сказано.

---

## v0.3 — 2026-04-26 (отклик на внешний ревью)

Сессия после внешнего ревью продукта (UI/UX senior, маркетолог, психолог, профайлер, BE/FE, mobile + сторонний reviewer). Основные критические тезисы и наши ответы:

| Критика ревью | Действие |
|---|---|
| «60% bias на слабые = угадайка, не закрепляет навык» | **PR #2** — заменили на SM-2-lite spaced repetition |
| «Нет демо → нулевая конверсия в использование» | **PR #3** — interactive demo card на лендинге |
| «Нет пауз → 15+ карточек подряд = когнитивная усталость» | **PR #3** — pause modal на 15-й карточке за сессию |
| «Без аналитики ты слепой» | **PR #4** — Vercel Analytics + типизированный wrapper |
| «"Wrong" — слабая обратная связь, не обучает» | **PR #5** — контраст-блок (что подразумевал ваш выбор) + personal-pattern nudge на повторяющихся путаницах |

**Где не согласились:**
- «Реальные лица обязательно vs AI» → сохранили AI (current Nano Banana уже фотореалистичен и держит same-face consistency для пар), но real-face гибрид через Unsplash добавим в следующей сессии как опцию
- «Confusion heatmap» → отложили (19×19 на мобиле — боль; текущий top-5 list работает)

### Workflow
- PR #1 — Зафиксирован PR-флоу как стандарт (вместо direct push в main)
- Все последующие PR через feature-branch + review

### Изменения по файлам (cumulative)

**Алгоритм:**
- `src/lib/storage.ts` — добавлены `nextReviewAt`, `streak` в `CategoryStats`; `dueRanked()`, `dueForReview()`, `confusionCount()` хелперы
- `src/data/training_set.ts` — `pickNextCard` переписан с приоритетом due-for-review > unseen > random + recentCardIds фильтр

**UI:**
- `src/components/DemoCard.tsx` — новый
- `src/app/train/page.tsx` — pause modal, контраст-блок и personal-pattern в FeedbackPanel, analytics tracks
- `src/app/page.tsx` — DemoCard секция, analytics на CTAs
- `src/app/progress/page.tsx` — секция «Запланировано на повтор», analytics на reset

**Инфраструктура:**
- `src/lib/analytics.ts` — новый, типизированный wrapper над Vercel `track()` с EventMap
- `@vercel/analytics` подключён в layout
- 7 событий tracked: card_answered, tier_unlocked, demo_answered, cta_clicked, pause_shown, pause_offramp, progress_reset

### Что нужно от пользователя
- Активировать Vercel Analytics на dashboard (один клик)
- Сходить на https://emo-training.vercel.app — открыть пару страниц для первого event'а

---

## v0.2 — 2026-04-26

### Контент
- Расширили тренировочный сет с 32 → **70 карточек** (T1=28, T2=30, T3=12)
- Re-roll слабых картинок из v0.1 (страх, презрение, social vs Duchenne, sadness vs fatigue) с заострёнными промптами на диагностические AU
- Демографическое разнообразие в новых картинках: возраст 19-70, разные полы и этничности
- Сжали все картинки через mozjpeg q82 + ресайз до max 1024px: **105 MB → 5 MB** (-97 MB)
- Сгенерили `og-cover.jpg` 1200×630 для соцсетей

### Прогресс и отчёт
- **Storage v2:** трекаем `recentAnswers` (cap 200) для confusion matrix, tier-unlock timestamps, общее время тренировки. Backward-compat read из v1 shape.
- **/progress переписана как полноценный отчёт:** top stats (карточек, точность, уровень, streak, время), next-tier progress bar, strengths/weaknesses topic, top confusions ("X → путаете с Y"), per-tier breakdown, лучший streak, дата старта, среднее время на карточку.
- **/train header** показывает уровень + № карточки + 🔥 streak + thin progress bar + до открытия следующего уровня (на mobile).
- **Tier-unlock celebration модал** при открытии tier 2 или 3.

### Аудит-фиксы (P0+P1 из 6-persona audit)
- **Этический дисклеймер** на лендинге: "На что это и на что не" — клсли FACS-vs-pseudoscience, Ломброзо/Кречмер как исторический контекст не как руководство, явно "не детектор лжи / не научная диагностика".
- **Secondary CTA** на тёмной полосе перед футером.
- **Keyboard hotkeys** в /train: A-F (или 1-6) выбирают вариант ответа, Enter / → переходят к следующей карточке.
- **Sticky bottom CTA на мобиле** в фазе feedback (плюс iOS safe-area inset).
- **Permission-to-fail copy:** при ≥3 промахах подряд — "сложные категории требуют 5-10 проб", при ≥5 — "возьмите паузу".
- Mobile typography min-size, `.opt` min-height 48px (touch target), `:focus-visible` ringи на `.btn`.
- `robots.txt` + `sitemap.ts` (Next.js Metadata API).
- OpenGraph + Twitter card meta с og-cover.jpg.

### Стек-твики
- Display serif: `Newsreader` и `Fraunces` не поддерживают Cyrillic в next/font/google. Переключились на `Source Serif 4` (Adobe variable, opsz axis, кириллица).
- Добавлен `sharp` как dev dep + `npm run compress:images` скрипт (idempotent).

### Деплой
- Pushed to GitHub: `fdd0e0b feat(v0.2): expand to 70 cards, comprehensive report, audit fixes`
- Production: https://emo-training.vercel.app

---

## v0.1 — 2026-04-26 (initial scaffold)

- Next.js 16 + React 19 + TS + Tailwind 4 скаффолд в `C:\Users\Admin\Documents\GitHub\emo-training`
- 19 эмоций × 3 уровня taxonomy в `data/emotions.ts`
- Knowledge извлечена из NotebookLM Face notebook (18 PDF) → `emotions_analysis.json`
- 32 первоначальных тренировочных картинки сгенерированы через Nano Banana
- Editorial portrait дизайн: Source Serif 4 + Inter + warm paper bg + rust accent
- Тренировочный цикл с adaptive tier unlock через localStorage
- Pushed to GitHub: `8a71de4 feat: scaffold emo-training MVP`

---

# Roadmap

Чистый список того, что осталось — после v0.6 (PR #1-#16 смержены).

## ✅ Закрыто

### Базовая инфраструктура (v0.1–v0.5)
- [x] PR-based git workflow (PR #1)
- [x] SM-2-lite spaced repetition (PR #2)
- [x] Demo карточка на лендинге (PR #3)
- [x] Pause modal после 15 карточек (PR #3)
- [x] Vercel Analytics + typed wrapper (PR #4)
- [x] Контраст-блок + personal-pattern (PR #5)
- [x] «Сигналы фальши» в FeedbackPanel (PR #7 Part A)
- [x] `/authenticity` standalone режим с 6 парами (PR #7 Part B)
- [x] +4 пары + persistence + SR + dashboard tile (PR #9)

### High + Medium priority sweep (v0.6)
- [x] **#3** AI-judge свободного ответа через Gemini 2.5 Flash (PR #12)
- [x] **#2** Google auth + Supabase cloud sync (PR #13) — email/password только, OAuth отложен
- [x] **#4** Per-pair authenticity breakdown в `/progress` (PR #14)
- [x] **#5** Confusion matrix heatmap (PR #14)
- [x] **#6** True per-card SM-2 (PR #15)
- [x] **#7** Knowledge expansion — `/facs` глоссарий + cultural caveats (PR #16)
- [x] **#8** SEO content pages — `/about`, `/faq`, `/physiognomy-vs-science` (PR #16)

## 🔴 High priority (отложено)

### 1. Real-face гибрид (3-4 ч)
Curated Unsplash портретов (~20-30 шт) + опциональный режим `/real` или toggle в `/train`. Адресует главное возражение ревью: «AI-лица могут не переноситься в реальный мир». Сохраняем AI для пар (same-face consistency), добавляем real для базовых эмоций.

**Задача требует контентной курации (нельзя scriptовать на 100%) — поэтому отложена. Когда возьмёмся — нужно time для подбора фотографий с подтверждённой эмоциональной семантикой.**

### Google OAuth (поверх PR #13 email/password)
Сейчас auth работает через email/password. Google OAuth — дополнительно ~10 мин setup в Google Cloud Console + добавление callback URL. Низко-висящий фрукт.

## 🟢 Low priority / nice-to-have

### 9. Custom domain (30 мин)

### 9. Custom domain (30 мин)
emo-training.vercel.app → что-то типа emoread.io или поддомен.

### 10. Error boundary (30 мин)
React Error Boundary вокруг `<TrainPage>` и `<AuthenticityPage>` с fallback. Сейчас один компонент-краш роняет страницу.

### 11. Mobile app via Capacitor (4-6 ч)
По примеру `face`. Для iOS App Store потребуются disclaimers и review.

### 12. Видео-карточки (8+ ч, большая фича)
Короткие петли с микро-выражениями (1-2 сек). Качественное обучение с FACS требует динамики, не статики. Нужен новый источник материала (real video footage с лицензиями).

### 13. Социальная функциональность (2 ч)
Делиться результатом одного теста (одна карточка + ваш ответ + правильный). Leaderboard сознательно НЕ делать — несовместимо с серьёзностью продукта.

## 🔧 Tech debt / hygiene

- [ ] **Unit tests** (2-3 ч) — минимум на `scoreAnswer`, `pickNextCard`, `recordAnswer`, `recordAuthenticityAnswer`. Сейчас тестов нет вообще
- [ ] **GitHub CI** (30 мин) — workflow с `npm run build` + `npm run lint` на каждый PR. Защищает main от broken коммитов навсегда
- [ ] `scripts/image-prompts.ts` имеет 4 батча с разной структурой prompt'ов — унифицировать в `{ subjectPool, anatomicalCore, suffix }`
- [ ] `extract-knowledge.ts` имеет dead code для парсинга pair-секций — удалить или дописать для будущей рекалибровки знаний

## ⚠️ Известные ограничения (документация, не TODO)

1. **Картинки = AI-generated.** Лучше academic datasets по контролю/лицензиям/разнообразию, но перенос на real-world recognition требует дополнительной верификации. Часть закрывается через #1 в High priority.
2. **Static, не video.** FACS правильно работает с видео. Известное ограничение всех photo-based тренажёров. Адресуется через #12 (видео-карточки).
3. **Cultural bias.** Большинство prompts — western faces. Научно физиогномические маркеры работают НЕ одинаково кросс-культурно. Каверы должны попасть в #7 (расширение базы знаний).
4. **Self-paced без accountability.** Без аккаунтов нельзя видеть retention/drop-off/dau-mau на уровне пользователя. Адресуется через #2 (Google auth) + Vercel Analytics дашборд.

---

## Рекомендуемый порядок взятия

**Самый высокий ROI:** #1 (real-face гибрид) — закрывает главное возражение ревью.
**Самое инфраструктурно важное:** #2 (Google auth) — без него весь прогресс теряется.
**Самый дешёвый win:** GitHub CI (30 мин) — защищает main от broken коммитов навсегда.

Остальное по запросу или по реальным сигналам из Vercel Analytics после накопления usage.
