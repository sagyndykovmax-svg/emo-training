<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (16.x) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project conventions

- All UI strings in **Russian**.
- `'use client'` only for components that need state/effects/framer-motion.
- localStorage key: `emo-training:progress:v1` — bump suffix if schema changes.
- Image paths always `/training/<cardId>.jpg` — referenced from `src/data/training_set.ts`.
- Don't add server routes that depend on AI keys — runtime should stay key-less. AI is for build-time scripts only.
- Tailwind 4: theme tokens are in `src/app/globals.css` under `@theme inline`. Use `bg-accent`, `text-muted`, etc. — not raw hex.
- When adding new emotions: update `EmotionId` union, `EMOTIONS` map, `confusedWith` arrays of related emotions, AND `image-prompts.ts`.
