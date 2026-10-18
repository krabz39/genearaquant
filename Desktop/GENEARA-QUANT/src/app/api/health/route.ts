
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const requiredConfiguration = {
    supabaseUrl: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    supabasePublishableKey: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
    derivClientId: Boolean(
      process.env.DERIV_CLIENT_ID,
    ),
    derivRedirectUri: Boolean(
      process.env.DERIV_REDIRECT_URI,
    ),
  };

  const configured = Object.values(
    requiredConfiguration,
  ).every(Boolean);

  return NextResponse.json(
    {
      status: 'ok',
      application: 'GENEARA QUANT',
      configuration: configured
        ? 'configured'
        : 'missing_required_configuration',
      checks: requiredConfiguration,
      trading_enabled: false,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
      },
    },
  );
}
