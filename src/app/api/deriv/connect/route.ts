
import { NextResponse } from 'next/server';
import { createOAuthAttempt } from '@/lib/deriv/oauth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOKIE_PATH = '/api/deriv/callback';
const COOKIE_MAX_AGE = 600;

function redirectToApp(path: string, base: string) {
  const response = NextResponse.redirect(new URL(path, base));

  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Pragma', 'no-cache');

  return response;
}

export async function GET() {
  const base =
    process.env.APP_BASE_URL || 'http://localhost:3000';

  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return redirectToApp(
        '/login?next=%2Fdashboard',
        base,
      );
    }

    const attempt = createOAuthAttempt();

    const response = NextResponse.redirect(attempt.url);
    const secure = process.env.NODE_ENV === 'production';

    response.cookies.set(
      'gq_deriv_oauth_state',
      attempt.state,
      {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: COOKIE_PATH,
        maxAge: COOKIE_MAX_AGE,
      },
    );

    response.cookies.set(
      'gq_deriv_oauth_verifier',
      attempt.verifier,
      {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: COOKIE_PATH,
        maxAge: COOKIE_MAX_AGE,
      },
    );

    response.cookies.set(
      'gq_deriv_oauth_user',
      user.id,
      {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: COOKIE_PATH,
        maxAge: COOKIE_MAX_AGE,
      },
    );

    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch {
    return redirectToApp(
      '/settings?error=deriv_oauth_not_configured',
      base,
    );
  }
}
