# Progress Log

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

## High priority — следующая сессия

### 0. Authenticity / fake-vs-genuine detection (новое — от профайлера)
**Зачем:** физиогномика и FACS в первую очередь о том, **что под маской**. Уже частично закрыто Duchenne vs социальная улыбка и suppressed_anger, но не выделено как отдельный модуль.

**Что есть в данных уже:**
- В `emotions_analysis.json` для каждой эмоции есть секция "Сигналы неискренности" — не surface'ится в UI
- Tier 2 пары Дюшенн vs социальная — частично работают
- Tier 3 suppressed anger — про подавленную мимику

**Подходы (по сложности):**

**A — surface existing data (1-2 часа):**
- Парсинг "Сигналы неискренности" из emotions_analysis.json в отдельное поле `inauthenticity_tells: string[]`
- Дополнительный блок в FeedbackPanel: "🎭 Сигналы фальши для этой эмоции"
- Опционально: страница /deception со сводным глоссарием universal tells (асимметрия, timing, leakage в нижней зоне)

**B — новый card mode "Найди настоящее" (3-5 часов):**
- Для 6-8 эмоций сгенерить ПАРНЫЕ карточки: одно лицо в двух выражениях (искреннее + натянутое)
- Новый формат вопроса: "Какая улыбка/гнев/удивление настоящие?" — выбор из 2 фото
- Использует Nano Banana same-face consistency (и так уже работает)
- Стоимость генерации: ~16 новых картинок × $0.04 = ~$0.65

**C — отдельный quiz-tier "Authenticity" (5-7 часов):**
- Полноценный 4-й уровень "Различение фальши" — после Tier 3
- 8-10 пар (искренняя/социальная улыбка, контролируемый/настоящий гнев, испуг/наигранный страх и т.п.)
- Спец-метрика "deception detection accuracy" в /progress

Рекомендую **A → B** в одном PR (малый surface-existing + один new mode), C — отдельной сессией.

### 1. Google auth + cloud progress sync
**Зачем:** сейчас прогресс хранится только в localStorage — теряется при смене устройства, очистке браузера, инкогнито. Для пользовательского retention критично иметь синк.

**Подходы:**
- **Supabase** (быстрее всего): Google OAuth из коробки, Postgres + Realtime, free tier 500 MB. Добавить `progress` таблицу с `user_id, json_blob`.
- **NextAuth.js + Postgres** (Neon/Vercel Postgres): стандарт для Next, больше кода но больше контроля.
- **Clerk** (самое быстрое UI): прекрасный UX, но vendor lock.

**Минимальная схема:**
```sql
create table progress (
  user_id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
```

Логика синка: при `recordAnswer` — debounce 5 сек, потом upload merged blob. На init — если онлайн и логинен, fetch и merge с локальным.

**Опасность:** конфликты при работе на 2 устройствах одновременно. MVP: last-write-wins с warning ("ваш прогресс с другого устройства новее, перезаписать?").

### 2. Demo карточка прямо на лендинге
**Зачем:** сейчас пользователь должен кликнуть "Начать" чтобы попробовать. Interactive preview одной карточки на лендинге = +20-30% conversion типично.

**Реализация:** маленький виджет с одним hardcoded portrait, 4 опциями, после ответа коротким разбором + CTA "Начать полную тренировку".

### 3. Pause / break suggestions
**Зачем:** после 15-20 карточек подряд внимание садится, точность падает, обучение деградирует.

**Реализация:** трек consecutive cards в одной сессии, после 15 показывать ненавязчивый dismissable nudge "Вы сделали 15 карточек подряд — рассмотрите 5-минутную паузу для лучшего удержания".

## Medium priority

### 4. Расширение базы знаний
- Добавить раздел "Истоки физиогномики" с критической оценкой школ (academic honesty)
- Глоссарий FACS Action Units на отдельной странице
- "Как определить когда ваше распознавание не работает" — culturally-bound emotions, autism spectrum, neurodivergence considerations

### 5. Confusion matrix визуализация в /progress
Сейчас confusion показывается списком ("X → путаете с Y, 3 раз"). Сделать heatmap-таблицу со всеми эмоциями × всеми эмоциями, цвет = частота путаницы.

### 6. Адаптивная сложность внутри тира
Сейчас `pickNextCard` использует 60% bias к слабым категориям. Сделать честную spaced repetition — показывать слабые чаще пропорционально (1-accuracy) с floor.

### 7. Аналитика
Plausible или PostHog. Слепая зона по реальному использованию — какие эмоции люди НИКОГДА не выбирают, на каких тирах массово отваливаются, среднее количество сессий до retention.

### 8. Error boundary
Один компонент-падение сейчас уроняет всю страницу. React Error Boundary вокруг `<TrainPage>` с fallback "Что-то пошло не так, перезагрузите".

## Low priority / nice-to-have

### 9. Mobile app via Capacitor
По примеру `face`. Для iOS App Store потребует disclaimers и review.

### 10. Видео-карточки
Короткие петли с микро-выражениями (1-2 сек). Качественное обучение с FACS требует динамики, не статики. Это серьёзная feature — нужен новый источник материала.

### 11. AI-judge свободного ответа
Пользователь пишет своё описание ("вижу контролируемый гнев — лёгкое напряжение челюсти, прямой холодный взгляд"). GPT-4o оценивает с partial credit, объясняет что упустил. Дороже но глубже учит, чем MCQ.

### 12. A/B карточки в одном кадре
Две версии одного лица — нужно выбрать "настоящую" эмоцию. Использовать same-face capability Nano Banana.

### 13. Кастомный домен
emo-training.vercel.app → что-то типа emoread.io или поддомен legacygroup или личный домен.

### 14. SEO content pages
- /о-проекте (about)
- /физиогномика-vs-наука (educational, для SEO + credibility)
- /faq

### 15. Социальная функциональность
- Делиться результатом своего теста (одна карточка + ваш ответ + правильный)
- Сравнение по leaderboard (опасно для серьёзности продукта)

## Tech debt / hygiene

- В `extract-knowledge.ts` есть код парсинга pair-секций который не использовался — удалить или оставить с TODO для следующей рекалибровки знаний
- `scripts/image-prompts.ts` имеет два батча с разной структурой (полные prompts vs compact) — унифицировать в `{ subjectPool, anatomicalCore, suffix }` для будущих расширений
- `next-env.d.ts` периодически модифицируется next dev'ом — добавлено в `.gitignore`? проверить
- Нет тестов вообще. Минимально — unit на `scoreAnswer`, `pickNextCard`, `recordAnswer` (storage логика).
- Нет CI на GitHub — добавить workflow с `npm run build` + `npm run lint` на PR

## Известные ограничения (для документации, не TODO)

1. **Картинки = AI-generated.** Не реальные люди в реальных эмоциональных состояниях. Это лучше academic licensed datasets для нашего use case (контроль, лицензии, разнообразие), но переход на real-world recognition требует дополнительной верификации навыка.
2. **Static не video.** FACS правильно работает с видео, не статикой. Это известное ограничение всех photo-based emotion trainers.
3. **Cultural bias.** Большинство prompts — Western faces. Нет верификации, что физиогномические маркеры работают одинаково кросс-культурно (научно — не работают полностью).
4. **Self-paced без accountability.** Без аккаунтов нельзя видеть % retention, drop-off, dau/mau.
