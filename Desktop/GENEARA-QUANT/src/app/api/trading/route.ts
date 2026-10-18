
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
      .from('gq_trade_intents')
      .select(
        'id,account_id,strategy_id,status,contract_type,market_symbol,stake,duration_ticks,proposal_id,contract_id,block_reason,created_at,updated_at',
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { error: 'query_failed' },
        { status: 500, headers: responseHeaders },
      );
    }

    return NextResponse.json(
      {
        trades: data ?? [],
        execution_enabled: false,
      },
      { headers: responseHeaders },
    );
  } catch {
    return NextResponse.json(
      { error: 'internal_server_error' },
      { status: 500, headers: responseHeaders },
    );
  }
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'trading_locked',
      message:
        'Order execution is disabled pending production readiness approval.',
    },
    {
      status: 423,
      headers: responseHeaders,
    },
  );
}
