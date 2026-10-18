
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { decryptToken } from '@/lib/deriv/crypto';
import { derivGet } from '@/lib/deriv/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DerivAccountRow = Record<string, unknown>;

type DerivAccountsResponse = {
  data?: DerivAccountRow[];
  accounts?: DerivAccountRow[];
};

function isVirtualAccount(row: DerivAccountRow): boolean {
  if (typeof row.is_virtual === 'boolean') {
    return row.is_virtual;
  }

  const accountType = String(row.account_type ?? '').toLowerCase();

  return (
    accountType.includes('demo') ||
    accountType.includes('virtual')
  );
}

export async function GET() {
  try {
    // 1. Authenticate the Geneara Quant user.
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401 },
      );
    }

    // 2. Retrieve this user's connected Deriv accounts.
    const admin = createSupabaseAdmin();

    const { data: connections, error: connectionError } = await admin
      .from('gq_deriv_connections')
      .select(
        'id, token_ciphertext, token_iv, token_tag, status',
      )
      .eq('user_id', user.id)
      .eq('status', 'connected')
      .order('created_at', { ascending: false });

    if (connectionError) {
      return NextResponse.json(
        { error: 'connection_lookup_failed' },
        { status: 500 },
      );
    }

    if (!connections?.length) {
      return NextResponse.json(
        {
          accounts: [],
          connected: false,
          message: 'No connected Deriv account was found.',
        },
        {
          headers: { 'Cache-Control': 'no-store' },
        },
      );
    }

    // 3. Retrieve accounts from each connected Deriv connection.
    const accountMap = new Map<string, Record<string, unknown>>();
    let successfulConnections = 0;
    let failedConnections = 0;

    for (const connection of connections) {
      try {
        const token = decryptToken({
          ciphertext: connection.token_ciphertext,
          iv: connection.token_iv,
          tag: connection.token_tag,
        });

        const response =
          await derivGet<DerivAccountsResponse>(
            '/trading/v1/options/accounts',
            token,
          );

        const rows = response.data ?? response.accounts ?? [];

        successfulConnections += 1;

        for (const row of rows) {
          const accountId = String(
            row.account_id ?? row.id ?? '',
          );

          if (!accountId) {
            continue;
          }

          accountMap.set(accountId, {
            user_id: user.id,
            connection_id: connection.id,
            deriv_account_id: accountId,
            account_type: String(row.account_type ?? ''),
            currency: String(row.currency ?? ''),
            display_name: String(
              row.display_name ?? row.account_name ?? accountId,
            ),
            is_virtual: isVirtualAccount(row),
            last_synced_at: new Date().toISOString(),
          });
        }
      } catch {
        // Never expose tokens or raw upstream error responses.
        failedConnections += 1;
      }
    }

    // 4. Distinguish a failed sync from a successful empty response.
    if (successfulConnections === 0) {
      return NextResponse.json(
        {
          error: 'deriv_sync_failed',
          connected: true,
          message:
            'The saved connection could not retrieve accounts. Reconnect Deriv and try again.',
        },
        {
          status: 502,
          headers: { 'Cache-Control': 'no-store' },
        },
      );
    }

    const accounts = [...accountMap.values()];

    // 5. Persist verified account records.
    if (accounts.length > 0) {
      const { error: persistenceError } = await admin
        .from('gq_deriv_accounts')
        .upsert(accounts, {
          onConflict: 'user_id,deriv_account_id',
        });

      if (persistenceError) {
        return NextResponse.json(
          { error: 'account_persistence_failed' },
          { status: 500 },
        );
      }
    }

    // 6. Return account details without exposing credentials.
    return NextResponse.json(
      {
        accounts: accounts.map(
          ({
            user_id,
            connection_id,
            ...account
          }) => account,
        ),
        connected: true,
        synced_at: new Date().toISOString(),
        partial_sync: failedConnections > 0,
        message:
          failedConnections > 0
            ? 'Some connections could not be synced.'
            : accounts.length > 0
              ? 'Accounts synced from Deriv.'
              : 'Deriv connected, but no account records were returned.',
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch {
    // Do not expose internal errors, credentials, or upstream responses.
    return NextResponse.json(
      { error: 'internal_server_error' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
}
