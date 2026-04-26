<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (16.x) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project conventions

- **All UI strings in Russian.** Comments in code in English.
- `'use client'` only for components that need state/effects/framer-motion. Default to RSC.
- localStorage key: `emo-training:progress:v1` — **don't bump the suffix**, use defensive merging in `getProgress` to handle schema additions.
- Image paths always `/training/<cardId>.jpg` — referenced from `src/data/training_set.ts`. The card id format is stable; new cards append, never renumber.
- **Don't add server routes that depend on AI keys** — runtime should stay key-less. AI is build-time only via `scripts/`.
- Tailwind 4: theme tokens are in `src/app/globals.css` under `@theme inline`. Use `bg-accent`, `text-ink-2`, etc. — not raw hex.
- When adding new emotions: update `EmotionId` union, `EMOTIONS` map, `confusedWith` arrays of related emotions, AND `image-prompts.ts`, AND `training_set.ts`.
- When adding new training cards (no new emotion): add to `image-prompts.ts` AND `training_set.ts` together. Run `npm run generate:images -- --only <cardId>` then `npm run compress:images`.
- Etical disclaimer block on landing is **load-bearing** — don't remove without explicit user approval. It scopes the product as a learning tool, not a diagnostic.
- Display serif must support **Cyrillic** — currently `Source Serif 4`. If switching, verify with `npm run build` (TS will fail if subset doesn't exist).

## Editing rules

- **Always run `npm run build` before commit** — Next.js 16 catches type errors only in build, not dev. Dev compilation can pass while build fails.
- Use the worktree at `C:\Users\Admin\Documents\GitHub\emo-training` directly — there's no separate worktree pattern in this project (single repo, single branch `main`).
- Conventional commits with scope: `feat(train):`, `fix(progress):`, `chore(deps):`, etc.
- Always include `Co-Authored-By: Claude Opus ... <noreply@anthropic.com>` trailer when Claude wrote the commit.

## Deploy

- Vercel autodeploys from `main` push. **No env vars in production** — runtime is key-less.
- Manual force: `vercel --prod --yes` from repo root.
- Sanity-check after deploy:
  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" https://emo-training.vercel.app
  curl -s -o /dev/null -w "%{http_code}\n" https://emo-training.vercel.app/train
  curl -s -o /dev/null -w "%{http_code}\n" https://emo-training.vercel.app/sitemap.xml
  ```

## Image generation pipeline

1. Add card to `scripts/image-prompts.ts` AND `src/data/training_set.ts` (same card id).
2. Set `GOOGLE_GENAI_API_KEY` in `.env.local` (gitignored).
3. Run `npm run generate:images -- --only <cardId> --force` (or no `--only` for all new ones).
4. Visually review the generated JPG in `public/training/`. If diagnostic AU markers (asymmetry for contempt, AU1 for sadness, etc.) are missed, refine the prompt and re-roll with `--force`.
5. Run `npm run compress:images` to bring file size down (~250 KB target).
6. Commit both the prompt change and the new compressed JPG.

## What NOT to do

- Don't remove `Source Serif 4` without verifying replacement supports Cyrillic.
- Don't bump `localStorage` schema version — write migrations in `getProgress`.
- Don't add Plausible/PostHog without explicit user approval (privacy-by-default is a stated value).
- Don't hard-code API keys in source. Anything secret goes in `.env.local`.
- Don't introduce a backend without explicit decision — current architecture intentionally avoids it.
