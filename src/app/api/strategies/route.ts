
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z
  .object({
    name: z.string().trim().min(1).max(80),
    contract_type: z.enum([
      'RISE_FALL',
      'OVER_UNDER',
      'EVEN_ODD',
      'MATCHES_DIFFERS',
      'TOUCH_NO_TOUCH',
    ]),
    market_symbol: z.string().trim().max(50).nullable().optional(),
    duration_ticks: z.number().int().min(1).max(10000),
    stake_mode: z.enum(['fixed', 'calculated']).default('fixed'),
    stake_amount: z.number().finite().positive().max(100000),
    enabled: z.boolean().default(false),
    parameters: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

const responseHeaders = {
  'Cache-Control': 'no-store',
};

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401, headers: responseHeaders },
      );
    }

    const { data, error } = await supabase
      .from('gq_strategies')
      .select(
        'id,name,contract_type,market_symbol,duration_ticks,stake_mode,stake_amount,enabled,parameters,created_at,updated_at',
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'query_failed' },
        { status: 500, headers: responseHeaders },
      );
    }

    return NextResponse.json(
      { strategies: data ?? [] },
      { headers: responseHeaders },
    );
  } catch {
    return NextResponse.json(
      { error: 'internal_server_error' },
      { status: 500, headers: responseHeaders },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401, headers: responseHeaders },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'invalid_json' },
        { status: 400, headers: responseHeaders },
      );
    }

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'invalid_input',
          issues: parsed.error.issues,
        },
        { status: 400, headers: responseHeaders },
      );
    }

    const { data, error } = await supabase
      .from('gq_strategies')
      .insert({
        ...parsed.data,
        user_id: user.id,
      })
      .select(
        'id,name,contract_type,market_symbol,duration_ticks,stake_mode,stake_amount,enabled,parameters,created_at,updated_at',
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'save_failed' },
        { status: 500, headers: responseHeaders },
      );
    }

    return NextResponse.json(
      { strategy: data },
      { status: 201, headers: responseHeaders },
    );
  } catch {
    return NextResponse.json(
      { error: 'internal_server_error' },
      { status: 500, headers: responseHeaders },
    );
  }
}
