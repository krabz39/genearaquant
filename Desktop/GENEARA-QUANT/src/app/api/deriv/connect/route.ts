import { NextResponse } from 'next/server';
import { createOAuthAttempt } from '@/lib/deriv/oauth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login?next=%2Fdashboard', process.env.APP_BASE_URL || 'http://localhost:3000'));
  try {
    const attempt = createOAuthAttempt();
    const response = NextResponse.redirect(attempt.url);
    const secure = process.env.NODE_ENV === 'production';
    response.cookies.set('gq_deriv_oauth_state', attempt.state, { httpOnly:true, secure, sameSite:'lax', path:'/api/deriv/callback', maxAge:600 });
    response.cookies.set('gq_deriv_oauth_verifier', attempt.verifier, { httpOnly:true, secure, sameSite:'lax', path:'/api/deriv/callback', maxAge:600 });
    response.cookies.set('gq_deriv_oauth_user', user.id, { httpOnly:true, secure, sameSite:'lax', path:'/api/deriv/callback', maxAge:600 });
    return response;
  } catch {
    return NextResponse.redirect(new URL('/settings?error=deriv_oauth_not_configured', process.env.APP_BASE_URL || 'http://localhost:3000'));
  }
}
