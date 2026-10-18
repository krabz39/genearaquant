import Link from 'next/link';
import { requireUserOrRedirect } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type TradeIntent = {
  id: string;
  status: string;
  contract_type: string;
  market_symbol: string | null;
  stake: number | string;
  duration_ticks: number;
  block_reason: string | null;
  created_at: string;
};

export default async function History() {
  const user = await requireUserOrRedirect();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('gq_trade_intents')
    .select(
      'id, status, contract_type, market_symbol, stake, duration_ticks, block_reason, created_at',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <main className="shell">
      <Link href="/dashboard" className="back">
        ← Workspace
      </Link>

      <h1>Trade history</h1>

      <p className="muted">
        Only persisted trade intents are listed. This version does not place
        orders.
      </p>

      {error ? (
        <p className="notice" role="alert">
          Unable to retrieve trade history. Please refresh and try again.
        </p>
      ) : !data?.length ? (
        <div className="empty">No trade records yet.</div>
      ) : (
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Status</th>
                <th>Contract</th>
                <th>Market</th>
                <th>Stake</th>
                <th>Ticks</th>
              </tr>
            </thead>

            <tbody>
              {(data as TradeIntent[]).map((trade) => (
                <tr key={trade.id}>
                  <td>
                    {trade.created_at
                      ? new Date(trade.created_at).toLocaleString()
                      : '—'}
                  </td>
                  <td>{trade.status}</td>
                  <td>{trade.contract_type}</td>
                  <td>{trade.market_symbol || '—'}</td>
                  <td>{trade.stake}</td>
                  <td>{trade.duration_ticks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!error && data?.some((trade) => trade.block_reason) && (
        <section className="panel">
          <h2>Execution blocks</h2>
          <p className="muted">
            The following records include reasons an order was blocked.
          </p>

          <ul>
            {(data as TradeIntent[])
              .filter((trade) => trade.block_reason)
              .map((trade) => (
                <li key={trade.id}>
                  <strong>{trade.contract_type}:</strong> {trade.block_reason}
                </li>
              ))}
          </ul>
        </section>
      )}

      <p className="muted">
        Historical trade intents are records, not proof that a trade was
        executed by Deriv.
      </p>
    </main>
  );
}