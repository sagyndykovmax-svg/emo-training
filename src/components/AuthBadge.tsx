'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/use-auth';

/**
 * Compact auth badge for page headers.
 *
 * - Configured + signed in: small "● email" link to /account
 * - Configured + signed out: "Войти" link to /account
 * - Not configured: renders nothing (cloud-sync disabled in this deployment)
 */
export function AuthBadge({ className = '' }: { className?: string }) {
  const { user, loading, configured } = useAuth();

  if (!configured) return null;
  if (loading) return null;

  if (!user) {
    return (
      <Link href="/account" className={`eyebrow hover:text-ink transition ${className}`}>
        Войти
      </Link>
    );
  }

  // Truncate email for display.
  const display = user.email
    ? user.email.length > 22
      ? `${user.email.slice(0, 19)}…`
      : user.email
    : 'Аккаунт';

  return (
    <Link
      href="/account"
      className={`flex items-center gap-2 text-xs text-ink-3 hover:text-ink transition ${className}`}
      title="Открыть аккаунт"
    >
      <span className="w-1.5 h-1.5 bg-success rounded-full" />
      <span className="hidden sm:inline">{display}</span>
    </Link>
  );
}
