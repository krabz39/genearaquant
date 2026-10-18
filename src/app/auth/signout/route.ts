
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.redirect(
        new URL('/login?error=signout_failed', request.url),
        303,
      );
    }

    const response = NextResponse.redirect(
      new URL('/login', request.url),
      303,
    );

    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch {
    return NextResponse.redirect(
      new URL('/login?error=signout_failed', request.url),
      303,
    );
  }
}
