'use client';

/**
 * Top-level error boundary for the entire app (Next.js App Router convention).
 * Renders when any nested page or layout throws an unhandled error.
 *
 * Goals:
 *   - Don't show a blank page or React's default red overlay in production.
 *   - Give the user a calm Russian-language message + an obvious next step
 *     (reset the boundary or hard reload).
 *   - Log full error detail to the console for diagnostics — Vercel captures
 *     these in production logs.
 */

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-bg text-ink">
      <div className="max-w-lg w-full">
        <div className="eyebrow mb-4">Что-то сломалось</div>
        <h1 className="display text-[clamp(2rem,5vw,3.5rem)] mb-6 leading-tight">
          На странице произошла <span className="display-italic text-accent">ошибка</span>.
        </h1>
        <p className="text-ink-2 leading-relaxed mb-3">
          Это не ваша вина — что-то в нашем коде сработало не так. Прогресс сохранён в браузере, ничего не потеряно.
        </p>
        {error.digest && (
          <p className="text-xs text-ink-4 font-mono mb-8">
            ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={reset} className="btn btn-primary">
            Попробовать ещё раз
          </button>
          <Link href="/" className="btn btn-ghost">
            На главную
          </Link>
        </div>
        <p className="text-xs text-ink-3 mt-10 leading-relaxed">
          Если ошибка повторяется — напишите{' '}
          <a href="mailto:sagyndykovmax@gmail.com" className="text-accent hover:underline">
            sagyndykovmax@gmail.com
          </a>{' '}
          с описанием того, что вы делали. Указанный выше ID поможет найти причину в логах.
        </p>
      </div>
    </main>
  );
}
