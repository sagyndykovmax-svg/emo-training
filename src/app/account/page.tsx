'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/lib/use-auth';
import { reconcileOnSignIn } from '@/lib/cloud-sync';
import { totals, getProgress, formatDuration } from '@/lib/storage';

type Mode = 'signin' | 'signup';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, configured, signOut } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!configured) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div className="eyebrow mb-4">Аккаунт</div>
          <h1 className="display text-[clamp(2.25rem,5vw,4rem)] mb-6">
            Облачная синхронизация недоступна.
          </h1>
          <p className="text-ink-2 leading-relaxed mb-4">
            Эта установка тренажёра работает только с локальным прогрессом — администратор не настроил Supabase. Ваш прогресс хранится в этом браузере.
          </p>
          <p className="text-sm text-ink-3 leading-relaxed">
            Если вы развернули тренажёр сами и хотите включить синхронизацию — добавьте переменные{' '}
            <code className="text-accent font-mono">NEXT_PUBLIC_SUPABASE_URL</code> и{' '}
            <code className="text-accent font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> в окружение.
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="eyebrow text-ink-3">Загружаем</div>
      </main>
    );
  }

  if (user) {
    const t = totals(getProgress());
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <div className="eyebrow mb-4">Аккаунт</div>
          <h1 className="display text-[clamp(2.25rem,5vw,4rem)] mb-6">
            Вы вошли как{' '}
            <span className="display-italic">{user.email}</span>.
          </h1>
          <p className="text-ink-2 leading-relaxed mb-10 max-w-2xl">
            Прогресс автоматически сохраняется в облако каждые 5 секунд после изменений. Вы можете открыть тренажёр на любом устройстве с этим email — данные подтянутся.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-12 max-w-md">
            <Stat label="Карточек" value={t.attempts.toString()} />
            <Stat label="Точность" value={`${Math.round(t.accuracy * 100)}%`} />
            <Stat label="Время" value={formatDuration(getProgress().totalTimeMs)} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/train" className="btn btn-primary">
              К тренировке <span aria-hidden>→</span>
            </Link>
            <Link href="/progress" className="btn btn-ghost">
              Мой отчёт
            </Link>
            <button
              onClick={async () => {
                if (confirm('Выйти из аккаунта? Локальный прогресс на этом устройстве сохранится.')) {
                  await signOut();
                  router.push('/');
                }
              }}
              className="px-5 py-3 text-sm text-ink-3 hover:text-error transition"
            >
              Выйти
            </button>
          </div>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setInfo(null);
    if (password.length < 6) {
      setError('Пароль должен быть минимум 6 символов.');
      return;
    }
    setBusy(true);
    const sb = getSupabase();
    if (!sb) {
      setError('Supabase не настроен.');
      setBusy(false);
      return;
    }

    try {
      if (mode === 'signin') {
        const { error: signInErr } = await sb.auth.signInWithPassword({ email, password });
        if (signInErr) {
          setError(translateAuthError(signInErr.message));
          setBusy(false);
          return;
        }
        // Reconcile cloud and local on successful sign-in.
        const result = await reconcileOnSignIn();
        if (result === 'restored') {
          setInfo('Прогресс с другого устройства восстановлен.');
        } else if (result === 'uploaded') {
          setInfo('Локальный прогресс загружен в облако.');
        }
        setTimeout(() => router.push('/train'), 800);
      } else {
        const { data, error: signUpErr } = await sb.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined,
          },
        });
        if (signUpErr) {
          setError(translateAuthError(signUpErr.message));
          setBusy(false);
          return;
        }
        if (data.user && !data.session) {
          // Email confirmation flow — Supabase sent a verification link.
          setInfo('Проверьте почту — мы отправили ссылку для подтверждения email.');
          setBusy(false);
          return;
        }
        // Auto-confirmed flow (when email confirmation disabled in Supabase project settings).
        await reconcileOnSignIn();
        setInfo('Аккаунт создан. Прогресс будет сохраняться в облаке.');
        setTimeout(() => router.push('/train'), 800);
      }
    } catch (err) {
      setError((err as Error).message ?? 'Что-то пошло не так.');
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="max-w-md mx-auto px-4 sm:px-8 py-12 sm:py-20 w-full">
        <div className="eyebrow mb-4">Аккаунт</div>
        <h1 className="display text-[clamp(2.25rem,5vw,3.75rem)] mb-3">
          {mode === 'signin' ? 'Вход' : 'Регистрация'}
        </h1>
        <p className="text-sm text-ink-3 leading-relaxed mb-8">
          {mode === 'signin'
            ? 'Войдите чтобы синхронизировать прогресс между устройствами.'
            : 'Создайте аккаунт чтобы прогресс сохранялся в облаке. Это бесплатно.'}
        </p>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full p-3 border border-rule bg-bg text-ink focus:border-ink focus:outline-none text-[0.9375rem]"
              disabled={busy}
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full p-3 border border-rule bg-bg text-ink focus:border-ink focus:outline-none text-[0.9375rem]"
              disabled={busy}
              minLength={6}
            />
            {mode === 'signup' && (
              <p className="text-xs text-ink-3 mt-1">Минимум 6 символов.</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-error/10 border border-error/30 text-sm text-error">
              {error}
            </div>
          )}
          {info && (
            <div className="p-3 bg-success/10 border border-success/30 text-sm text-success">
              {info}
            </div>
          )}

          <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-50">
            {busy ? '…' : mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
            <span aria-hidden>→</span>
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
                setInfo(null);
              }}
              className="text-sm text-ink-3 hover:text-ink transition"
            >
              {mode === 'signin' ? 'Нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
            </button>
          </div>
        </motion.form>

        <div className="mt-12 pt-8 border-t border-rule">
          <p className="text-xs text-ink-4 leading-relaxed">
            Аккаунт нужен только для синхронизации прогресса между устройствами. Ваши ответы и статистика приватны и хранятся в зашифрованной БД (Supabase Postgres). Email используется только для входа — никаких рассылок.
          </p>
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-rule">
      <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2 sm:gap-3">
          <span className="text-ink-3">←</span>
          <span className="display text-base sm:text-xl">Emotion Training</span>
        </Link>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="display text-3xl tnum">{value}</div>
      <div className="eyebrow mt-1">{label}</div>
    </div>
  );
}

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid') && m.includes('credentials')) return 'Неверный email или пароль.';
  if (m.includes('email not confirmed')) return 'Email не подтверждён. Проверьте почту.';
  if (m.includes('user already registered')) return 'Такой email уже зарегистрирован.';
  if (m.includes('rate limit')) return 'Слишком много попыток. Подождите минуту.';
  if (m.includes('email')) return msg;
  return msg;
}
