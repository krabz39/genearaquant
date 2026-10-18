import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/lib/deriv/oauth';
import { encryptToken } from '@/lib/deriv/crypto';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
function clearCookies(res: NextResponse) {
  for (const name of ['gq_deriv_oauth_state','gq_deriv_oauth_verifier','gq_deriv_oauth_user']) res.cookies.set(name, '', { path:'/api/deriv/callback', maxAge:0 });
  return res;
}
export async function GET(request: NextRequest) {
  const base = process.env.APP_BASE_URL || request.nextUrl.origin;
  const fail = (reason: string) => clearCookies(NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(reason)}`, base)));
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  if (request.nextUrl.searchParams.has('error')) return fail('deriv_consent_denied');
  const cookieState = request.cookies.get('gq_deriv_oauth_state')?.value;
  const verifier = request.cookies.get('gq_deriv_oauth_verifier')?.value;
  const expectedUser = request.cookies.get('gq_deriv_oauth_user')?.value;
  if (!code || !state || !cookieState || state !== cookieState || !verifier || !expectedUser) return fail('oauth_state_invalid');
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== expectedUser) return fail('app_session_changed');
  try {
    const tokenResponse = await exchangeCode(code, verifier);
    const encrypted = encryptToken(tokenResponse.access_token);
    const admin = createSupabaseAdmin();
    const expiresAt = tokenResponse.expires_in ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString() : null;
    // Deriv subject is optional until a verified identity endpoint is available. Unique nulls permit multiple connections.
    const { error } = await admin.from('gq_deriv_connections').insert({ user_id:user.id, deriv_subject:null, token_ciphertext:encrypted.ciphertext, token_iv:encrypted.iv, token_tag:encrypted.tag, token_expires_at:expiresAt, scopes:typeof tokenResponse.scope === 'string' ? tokenResponse.scope.split(' ').filter(Boolean) : ['trade'], status:'connected' });
    if (error) throw new Error('Could not persist Deriv connection');
    return clearCookies(NextResponse.redirect(new URL('/accounts?connected=1', base)));
  } catch {
    return fail('deriv_connection_failed');
  }
}
