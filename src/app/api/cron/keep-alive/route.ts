/**
 * Supabase keep-alive cron — pings the auth health endpoint to register
 * activity, preventing the free-tier project from auto-pausing after
 * 7 days of inactivity.
 *
 * Schedule: see vercel.json `crons` — twice a week (Monday + Thursday)
 * gives a safe margin under the 7-day pause window.
 *
 * Auth: Vercel cron requests carry `Authorization: Bearer <CRON_SECRET>`.
 * Public requests without the secret are rejected — otherwise this endpoint
 * could be abused by anyone hitting the URL.
 *
 * Behaviour:
 *   - Returns 200 + JSON {status, supabase} on success.
 *   - Returns 401 if CRON_SECRET mismatch.
 *   - Returns 503 + body if Supabase unreachable (so the cron run is marked
 *     failed in Vercel logs and we get a notification).
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Auth check — only Vercel cron should call this in production.
  // Skip the check in dev (no CRON_SECRET set locally).
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json(
      { status: 'skipped', reason: 'supabase_not_configured' },
      { status: 200 },
    );
  }

  // Hit the auth health endpoint — counts as activity, doesn't read user data.
  const target = `${supabaseUrl}/auth/v1/health`;
  try {
    const start = Date.now();
    const res = await fetch(target, {
      headers: { apikey: anonKey },
      cache: 'no-store',
    });
    const ms = Date.now() - start;
    if (!res.ok) {
      return NextResponse.json(
        {
          status: 'error',
          supabase: { ok: false, code: res.status, ms, target },
        },
        { status: 503 },
      );
    }
    return NextResponse.json({
      status: 'ok',
      supabase: { ok: true, code: res.status, ms },
      ranAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        supabase: { ok: false, error: (err as Error).message, target },
      },
      { status: 503 },
    );
  }
}
