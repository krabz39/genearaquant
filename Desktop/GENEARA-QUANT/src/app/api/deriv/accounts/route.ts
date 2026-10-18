import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { decryptToken } from '@/lib/deriv/crypto';
import { derivGet } from '@/lib/deriv/api';
export const runtime = 'nodejs';
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:'unauthorized' }, { status:401 });
  const admin = createSupabaseAdmin();
  const { data: connections, error } = await admin.from('gq_deriv_connections').select('id,token_ciphertext,token_iv,token_tag,status').eq('user_id',user.id).eq('status','connected').order('created_at',{ascending:false});
  if (error) return NextResponse.json({ error:'connection_lookup_failed' },{status:500});
  if (!connections?.length) return NextResponse.json({ accounts:[], connected:false });
  const accountMap = new Map<string, Record<string, unknown>>();
  for (const connection of connections) {
    try {
      const token = decryptToken({ciphertext:connection.token_ciphertext,iv:connection.token_iv,tag:connection.token_tag});
      const response = await derivGet<{data?: Array<Record<string, unknown>>; accounts?:Array<Record<string,unknown>>}>('/trading/v1/options/accounts', token);
      const rows = response.data ?? response.accounts ?? [];
      for (const row of rows) {
        const id = String(row.account_id ?? row.id ?? '');
        if (!id) continue;
        const record = { user_id:user.id, connection_id:connection.id, deriv_account_id:id, account_type:String(row.account_type ?? ''), currency:String(row.currency ?? ''), display_name:String(row.display_name ?? row.account_name ?? id), is_virtual:typeof row.is_virtual === 'boolean' ? row.is_virtual : String(row.account_type ?? '').toLowerCase().includes('demo'), last_synced_at:new Date().toISOString() };
        accountMap.set(id, record);
      }
    } catch {
      // Do not leak tokens or raw upstream responses. Continue so one expired connection doesn't hide others.
    }
  }
  const accounts = [...accountMap.values()];
  if (accounts.length) {
    const { error: upsertError } = await admin.from('gq_deriv_accounts').upsert(accounts, { onConflict:'user_id,deriv_account_id' });
    if (upsertError) return NextResponse.json({ error:'account_persistence_failed' },{status:500});
  }
  return NextResponse.json({ accounts:accounts.map(({token_ciphertext,...a})=>a), connected:true, synced_at:new Date().toISOString() }, { headers:{'cache-control':'no-store'} });
}
