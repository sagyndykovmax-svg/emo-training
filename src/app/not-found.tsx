import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Emotion Training',
  description: 'Страница не найдена.',
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-bg text-ink">
      <div className="max-w-lg w-full">
        <div className="eyebrow mb-4">Не найдено</div>
        <h1 className="display text-[clamp(2.5rem,6vw,5rem)] mb-6 leading-tight">
          <span className="display-italic text-accent">404</span>. Такой страницы нет.
        </h1>
        <p className="text-ink-2 leading-relaxed mb-8">
          Возможно, вы перешли по устаревшей ссылке или ввели адрес с ошибкой.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="btn btn-primary">
            На главную
          </Link>
          <Link href="/train" className="btn btn-ghost">
            К тренировке
          </Link>
        </div>
      </div>
    </main>
  );
}
