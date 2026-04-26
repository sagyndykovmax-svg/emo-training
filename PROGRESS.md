# Progress Log

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
