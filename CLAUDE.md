# Emotion Training — Claude Code guide

Тренажёр распознавания эмоций по выражению лица на основе физиогномической традиции и FACS Пола Экмана. Часть экосистемы инструментов самопознания (рядом с [face](https://github.com/sagyndykovmax-svg/face) и др.).

## Production

- **App:** https://emo-training.vercel.app
- **Repo:** https://github.com/sagyndykovmax-svg/emo-training
- **Vercel project:** `emo-training` (автодеплой из ветки `main`)
- **GitHub owner:** sagyndykovmax-svg

## Stack

| Слой | Технология |
|---|---|
| Framework | Next.js 16.2 (App Router, статическая генерация) |
| UI | React 19 + TypeScript 5 |
| Стили | Tailwind CSS 4 (PostCSS pipeline, токены через `@theme inline`) |
| Шрифты | Inter (sans), Source Serif 4 (display + чтение, кириллица) |
| Анимации | Framer Motion |
| Хранилище | localStorage v2 (`emo-training:progress:v1`) — без бэкенда |
| Генерация лиц | Google Nano Banana (`gemini-2.5-flash-image`) — только в build-time скриптах |
| Знания | NotebookLM custom report → `emotions_analysis.json` |
| Хостинг | Vercel (статика + edge) |

**Рантайм без AI.** Картинки и тексты бэкаются в репо. Никаких API-ключей в проде.

## Структура проекта

```
src/
  app/
    layout.tsx, globals.css   ← глобальные шрифты, palette, tokens
    page.tsx                  ← лендинг (editorial portrait layout)
    train/page.tsx            ← главный тренировочный цикл + tier celebration
    progress/page.tsx         ← полноценный отчёт со statistics
    sitemap.ts                ← Next.js Metadata API → /sitemap.xml
  data/
    emotions.ts               ← 19 эмоций × 3 уровня + FACS-маркеры
    emotions_analysis.json    ← глубокий разбор на каждую эмоцию (из NotebookLM)
    training_set.ts           ← 70 карточек: image_path → emotion_id, pickNextCard
  lib/
    storage.ts                ← Progress, recordAnswer, аналитика (streaks, confusion, strengths)
    scoring.ts                ← scoreAnswer (correct/partial/wrong) + buildOptions
scripts/
  image-prompts.ts            ← prompts на каждую карточку (детальные AU)
  generate-images.ts          ← Nano Banana CLI → public/training/*.jpg
  compress-images.ts          ← sharp mozjpeg q82 + max 1024px + og-cover.jpg
  extract-knowledge.ts        ← парсинг NotebookLM report → emotions_analysis.json
public/
  training/*.jpg              ← 70 сжатых лиц (~5 MB суммарно)
  og-cover.jpg                ← 1200×630 для соцсетей
  robots.txt, manifest.json, icon.svg
data/
  raw_knowledge/report.md     ← (gitignored) сырой NotebookLM отчёт
```

## Local dev

- **Порт:** `3010` (порт 3000 занят Arab Employment с агрессивным service worker — не использовать)
- `npm install`
- `npm run dev` → http://localhost:3010
- `npm run build` — обязательно прогнать перед коммитом, ловит TS-ошибки
- `npm run lint`
- `npm run compress:images` — после генерации новых картинок

### Генерация картинок (one-shot или батч)

Требует `GOOGLE_GENAI_API_KEY` с **enabled billing** на Google Cloud проекте.

```bash
# Положить ключ в .env.local (уже в .gitignore)
# Затем:
npm run generate:images                                      # все 70, скипнет существующие
npm run generate:images -- --only joy-1,sadness-2 --force    # только указанные с пересозданием
npm run generate:images -- --tier 1                          # только tier 1
npm run compress:images                                      # сжать после генерации
```

## Содержание / таксономия

- 19 эмоций распределены по 3 уровням
  - **Tier 1** (базовые 7 по Экману): joy, sadness, anger, fear, surprise, disgust, contempt
  - **Tier 2** (10 различительных): Дюшенновская vs социальная улыбка, страх vs удивление, контролируемый гнев vs презрение, грусть vs усталость, стыд vs вина
  - **Tier 3** (3 смешанных): nostalgia, suppressed_anger, anxiety
- 70 тренировочных карточек (по 2-4 на категорию)
- Знания: NotebookLM notebook `960d2264-94e2-4f92-aaa2-9fac4504635c` ("Face") + 18 PDF (Экман, Хигир, Велховер, Хэннер, Лафатер, Богданов, Дюрвиль, Тимоти Map, Розаль, Швар, Тиклл, Павлов и др.)

## Правила прогрессии

- Tier открывается когда **≥6 карточек пройдено с ≥70% точности**
- `pickNextCard` приоритезирует unseen карточки текущего unlocked-тира
- При наличии слабых эмоций — 60% шанс получить карточку из них
- localStorage cap на recentAnswers — последние 200 (для confusion matrix)

## Deploy

Auto-deploy через Vercel git integration:
1. `git push origin main` → Vercel автоматически билдит и деплоит
2. Манульный force: `cd <repo> && vercel --prod --yes`
3. Проверка после деплоя: `curl https://emo-training.vercel.app` ожидает 200

**Никаких env vars в Vercel не нужно** — рантайм без AI-вызовов.

## Гочи и решения, которые стоит знать

1. **Cyrillic + display serif:** `Newsreader` и `Fraunces` не имеют Cyrillic в `next/font/google`. Использовать `Source Serif 4` (Adobe, variable, opsz axis).
2. **Image gen требует billing:** Nano Banana free tier `limit: 0`. На Google Cloud project нужно включить billing (~$10 минимум, тратится центами).
3. **Image compression обязательна:** Nano Banana выдаёт 1.5 MB JPG. Без `compress:images` репо/CDN нагрузка раздуется в 20+ раз.
4. **Storage backward compat:** ключ `emo-training:progress:v1` намеренно не бампится — `getProgress()` мерджит со defaults, чтобы старые данные пользователей не терялись.
5. **`@/data/training_set.ts` и `image-prompts.ts` должны быть синхронны:** если добавил карточку в один — добавь в другой, иначе либо генерация без слота, либо слот без картинки.
6. **Tier 1 unlocked всегда:** в `recordAnswer` `unlockedThisTime` типизирован `2 | 3 | null` — celebration модал не показывается для Tier 1.
7. **Nano Banana и same-face consistency:** при генерации серии карточек одного типа модель часто использует одно и то же лицо (отлично для пар Дюшенн vs социальная). Не баг, фича.
8. **Etical disclaimer:** на лендинге есть секция "На что это и на что не". Не убирать без явного решения — это защита от позиционирования продукта как "детектора лжи" / scientific personality test.

## Связанные файлы

- `AGENTS.md` — Next.js 16 предупреждения для агентов
- `PROGRESS.md` — changelog + roadmap (что осталось сделать)
- `.claude/settings.json` — permissions для повторяемых команд
- `README.md` — public-facing описание для GitHub
