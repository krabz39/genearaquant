
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z
  .object({
    hourly_profit_mode: z.enum(['amount', 'percent']),
    hourly_profit_target: z.number().positive().nullable(),
    hourly_loss_limit: z.number().positive().nullable(),
    daily_loss_limit: z.number().positive().nullable(),
    max_consecutive_losses: z
      .number()
      .int()
      .positive()
      .max(100)
      .nullable(),
    max_open_contracts: z.number().int().min(1).max(100),
    cooldown_seconds: z.number().int().min(0).max(86400),
  })
  .strict();

async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase: null,
      user: null,
    };
  }

  return {
    supabase,
    user,
  };
}

export async function GET() {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!supabase || !user) {
      return NextResponse.json(
        { error: 'unauthorized' },
        {
          status: 401,
          headers: { 'Cache-Control': 'no-store' },
        },
      );
    }

    const { data, error } = await supabase
      .from('gq_risk_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'query_failed' },
        {
          status: 500,
          headers: { 'Cache-Control': 'no-store' },
        },
      );
    }

    return NextResponse.json(
      { risk: data },
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch {
    return NextResponse.json(
      { error: 'internal_server_error' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!supabase || !user) {
      return NextResponse.json(
        { error: 'unauthorized' },
        {
          status: 401,
          headers: { 'Cache-Control': 'no-store' },
        },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'invalid_json' },
        { status: 400 },
      );
    }

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'invalid_input',
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('gq_risk_settings')
      .upsert(
        {
          ...parsed.data,
          user_id: user.id,
          live_trading_approved: false,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        },
      )
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'save_failed' },
        {
          status: 500,
          headers: { 'Cache-Control': 'no-store' },
        },
      );
    }

    return NextResponse.json(
      { risk: data },
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch {
    return NextResponse.json(
      { error: 'internal_server_error' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
}
