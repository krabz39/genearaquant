
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/lib/deriv/oauth';
import { encryptToken } from '@/lib/deriv/crypto';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOKIE_NAMES = [
  'gq_deriv_oauth_state',
  'gq_deriv_oauth_verifier',
  'gq_deriv_oauth_user',
];

function clearCookies(response: NextResponse) {
  for (const name of COOKIE_NAMES) {
    response.cookies.set(name, '', {
      path: '/api/deriv/callback',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Pragma', 'no-cache');

  return response;
}

export async function GET(request: NextRequest) {
  const base = process.env.APP_BASE_URL || request.nextUrl.origin;

  const fail = (reason: string) =>
    clearCookies(
      NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(reason)}`, base),
      ),
    );

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (request.nextUrl.searchParams.has('error')) {
    return fail('deriv_consent_denied');
  }

  const cookieState =
    request.cookies.get('gq_deriv_oauth_state')?.value;
  const verifier =
    request.cookies.get('gq_deriv_oauth_verifier')?.value;
  const expectedUser =
    request.cookies.get('gq_deriv_oauth_user')?.value;

  if (
    !code ||
    !state ||
    !cookieState ||
    state !== cookieState ||
    !verifier ||
    !expectedUser
  ) {
    return fail('oauth_state_invalid');
  }

  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || user.id !== expectedUser) {
      return fail('app_session_changed');
    }

    const tokenResponse = await exchangeCode(code, verifier);

    if (
      !tokenResponse ||
      typeof tokenResponse.access_token !== 'string' ||
      !tokenResponse.access_token.trim()
    ) {
      return fail('deriv_connection_failed');
    }

    const encrypted = encryptToken(tokenResponse.access_token);
    const admin = createSupabaseAdmin();

    const expiresAt =
      typeof tokenResponse.expires_in === 'number' &&
      Number.isFinite(tokenResponse.expires_in) &&
      tokenResponse.expires_in > 0
        ? new Date(
            Date.now() + tokenResponse.expires_in * 1000,
          ).toISOString()
        : null;

    const scopes =
      typeof tokenResponse.scope === 'string'
        ? tokenResponse.scope.split(' ').filter(Boolean)
        : ['trade'];

    const { error: insertError } = await admin
      .from('gq_deriv_connections')
      .insert({
        user_id: user.id,
        deriv_subject: null,
        token_ciphertext: encrypted.ciphertext,
        token_iv: encrypted.iv,
        token_tag: encrypted.tag,
        token_expires_at: expiresAt,
        scopes,
        status: 'connected',
      });

    if (insertError) {
      return fail('deriv_connection_failed');
    }

    return clearCookies(
      NextResponse.redirect(new URL('/accounts?connected=1', base)),
    );
  } catch {
    return fail('deriv_connection_failed');
  }
}
