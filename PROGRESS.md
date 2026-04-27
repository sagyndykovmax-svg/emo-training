# Progress Log

## v0.8 — 2026-04-27 (polish + infra)

Маленький батч после v0.7: визуальное разнообразие в /authenticity, content-trim на /about, и operational fix для Supabase free-tier.

### PR #22 — Authenticity: 3 visual variants per pair
Адресует фидбек «при повторе пары — те же два лица». Каждая из 10 пар теперь имеет **3 визуальных variant'а** (varied age/gender/ethnicity), variant выбирается случайно при каждом показе. SR scheduling per pair-id остаётся.

- Schema: `variants: AuthenticityVariant[]` вместо плоских genuineImagePath/performedImagePath
- Content: 20 новых variants через Nano Banana, ~$0.80
- Re-roll auth-shame-genuine с softer blush ("subtle natural warmth, not theatrical") по фидбеку — было слишком красное лицо
- Bundle: public/training/ → 9.3 MB

### PR #23 — About-page trim
Убрал секцию "Стек и принципы" из /about — она была про инфраструктуру (стек, GitHub link, аналитика), что является noise для end users. Остались более важные секции: **Зачем** / **На чём построен (источники)** / **Часть экосистемы** / **Дисклеймер**. Tech-info по-прежнему доступна через GitHub link в footer.

### PR #24 — Vercel cron keep-alive для Supabase
Free-tier Supabase pauses проекты после 7 дней без API-активности. С низким трафиком (single-user MVP) это в какой-то момент молча сломало бы /account и cloud-sync. Решение:

- `/api/cron/keep-alive` route — Edge handler, пингует `${SUPABASE_URL}/auth/v1/health`, защищён CRON_SECRET от публичного abuse
- `vercel.json` — расписание `0 0 * * 1,4` (Monday + Thursday 00:00 UTC, ~3-day intervals, безопасный запас под 7-дневный порог)
- CRON_SECRET сгенерирован (`crypto.randomBytes(32).hex`) и добавлен в Vercel Production env vars автоматически через CLI
- Локально протестирован: curl без auth → 401, curl с bearer → 200 + Supabase health за ~1.5s
- Стоимость: $0 (Vercel Hobby даёт 2 cron jobs бесплатно)

### Build state
- 15 routes (с v0.7 +1: /api/cron/keep-alive)
- 12 static + 3 dynamic + 1 cron
- 58 unit tests, ~1 sec прогон

---

## v0.7 — 2026-04-27 (low-priority + tech-debt sweep)

Закрывает почти весь low-priority блок и tech-debt из roadmap. 4 PR в этой сессии (плюс этот docs).

### PR #18 — Error boundary + GitHub CI + Google OAuth
- `app/error.tsx` — top-level App Router error boundary с calm RU-fallback, reset кнопкой и error.digest для диагностики
- `app/not-found.tsx` — proper 404 в визуале сайта вместо дефолта Next.js
- `.github/workflows/ci.yml` — npm ci + lint + build на каждый PR/push в main, stub env vars, 10-min timeout
- Google OAuth кнопка в `/account` (поверх email/password из PR #13). useAuth теперь триггерит reconcileOnSignIn на SIGNED_IN event — после OAuth-callback localStorage и cloud merge'атся автоматически

### PR #19 — Unit tests (vitest, 58 tests, ~1 sec)
- Setup: vitest + happy-dom + explicit MemoryStorage polyfill (jsdom/happy-dom integration в vitest 4.x ненадёжна для Storage). Mock cloud-sync.
- Coverage:
  - `scoring.ts` (8 tests) — scoreAnswer matrix, buildOptions invariants
  - `storage.ts` (40 tests) — recordAnswer, SM-2 механика, tier unlock, streaks, confusion analytics, authenticity, formatDuration, totals
  - `training_set.ts` (10 tests) — pickNextCard priority orchestration
- npm scripts: `test`, `test:watch`
- CI workflow обновлён в этом PR — добавлен `npm test` шаг

### PR #20 — Social sharing с динамическим OG-image
- `/api/og/result` (Edge runtime) — Next.js ImageResponse / Satori, генерит 1200×630 PNG из `{card, chosen, correct}` URL params. Левая половина — портрет, правая — outcome badge + английская транслитерация эмоции + branding
- `/share/result?card=X&chosen=Y&correct=Z` — server component с generateMetadata: динамические og:image / twitter:image указывают на /api/og/result. Невалидные params → fallback с CTA
- `ShareButton` в /train FeedbackPanel: navigator.share() на mobile, copy-to-clipboard на desktop, window.prompt() как last-resort
- Английские лейблы в OG потому что Satori bundled fonts только Latin — Cyrillic потребует подгрузки font binary (отложено)

### Build state
- 14 routes (с v0.6 +2: /share/result, /api/og/result)
- 11 static + 3 dynamic (/api/judge, /api/og/result, /share/result)
- 58 unit tests, ~1 sec прогон

### CI now runs
- `npm ci`
- `npm run lint`
- `npm test`
- `npm run build`

---

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

После v0.7 (PR #1-#21 смержены) почти весь roadmap закрыт. Осталось 3 крупных пункта, требующих внешних ресурсов или предварительных решений.

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

### High + Medium priority (v0.6)
- [x] **#3** AI-judge свободного ответа через Gemini 2.5 Flash (PR #12)
- [x] **#2** Google auth + Supabase cloud sync — email/password (PR #13)
- [x] **#4** Per-pair authenticity breakdown в `/progress` (PR #14)
- [x] **#5** Confusion matrix heatmap (PR #14)
- [x] **#6** True per-card SM-2 (PR #15)
- [x] **#7** Knowledge expansion — `/facs` глоссарий + cultural caveats (PR #16)
- [x] **#8** SEO content pages — `/about`, `/faq`, `/physiognomy-vs-science` (PR #16)

### Low + Tech-debt sweep (v0.7)
- [x] **#10** Error boundary + 404 страница (PR #18)
- [x] **#15** GitHub CI workflow с lint + test + build (PR #18 + #21)
- [x] **Google OAuth** поверх email/password (PR #18) — нужен Google Cloud Console setup от пользователя
- [x] **#14** Unit tests — 58 tests via vitest (PR #19)
- [x] **#13** Социальный sharing с динамическим OG image (PR #20)

### Polish + infra (v0.8)
- [x] Authenticity 3 visual variants per pair (PR #22) — закрывает фидбек «опять те же лица»
- [x] About-page trim (PR #23) — убрана инфраструктурная секция
- [x] Vercel cron keep-alive для Supabase free-tier (PR #24) — защита от 7-day inactivity pause

## ⏳ Осталось

### #1 Real-face гибрид (3-4 ч + content curation)
Curated Unsplash портретов (~20-30 шт) + опциональный режим `/real` или toggle в `/train`. Адресует главное возражение ревью: «AI-лица могут не переноситься в реальный мир».

**Блокер:** ручная курация фотографий с подтверждённой эмоциональной семантикой. Не scriptуется. Нужна сессия с временем на подбор.

### #11 Mobile app via Capacitor (4-6 ч + device testing)
По примеру `face`. Требует Android Studio для build/test, iOS device для тестирования. API routes (/api/judge, /api/og/result) не работают в static export — нужно завязать на production URL.

**Блокер:** доступ к Android Studio / iOS device для верификации, не делается полностью удалённо.

### #12 Видео-карточки (8+ ч + content pipeline)
Короткие петли (1-2 сек) с микро-выражениями. FACS правильно работает с видео, не статикой. Большая фича.

**Блокер:** нужен новый источник видео-материала (real video footage с лицензиями). Контентный, не технический вопрос.

### #9 Custom domain (~30 мин user-side)
Купить домен → настроить DNS → добавить в Vercel project settings → автоматический SSL. Кода менять не нужно (только обновить `metadataBase` в layout.tsx с `emo-training.vercel.app` на новый домен).

## 🔧 Tech debt / hygiene

- [ ] `scripts/image-prompts.ts` имеет 4 батча с разной структурой prompt'ов — унифицировать в `{ subjectPool, anatomicalCore, suffix }`
- [ ] `extract-knowledge.ts` имеет dead code для парсинга pair-секций — удалить или дописать для будущей рекалибровки знаний

## ⚠️ Известные ограничения (документация, не TODO)

1. **Картинки = AI-generated.** Лучше academic datasets по контролю/лицензиям/разнообразию, но перенос на real-world recognition требует дополнительной верификации. Часть закрывается через #1 (real-face hybrid).
2. **Static, не video.** FACS правильно работает с видео. Известное ограничение всех photo-based тренажёров. Адресуется через #12 (видео-карточки).
3. **Cultural bias.** Большинство prompts — western faces. Научно физиогномические маркеры работают НЕ одинаково кросс-культурно.
4. **Self-paced без accountability.** Без аккаунтов отчётность ограничена; cloud-sync через Supabase (PR #13) частично решает.

---

## Рекомендуемый порядок взятия

После v0.7 продукт в зрелом состоянии. Дальнейшие шаги — по сигналам:
- **Накопить ~1-2 недели реального usage** в Vercel Analytics → понять, какие функции работают, какие нет → data-driven приоритеты
- **#1 Real-face hybrid** — самый высокий потенциальный ROI, требует контентной курации
- **#11 Capacitor** — если усиливается сигнал что mobile UX узок и нужно нативное приложение
- **#12 Video cards** — амбициозный шаг к научному переносу навыка
