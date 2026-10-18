
import Link from 'next/link';
import { requireUserOrRedirect } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const user = await requireUserOrRedirect();
  const supabase = await createSupabaseServerClient();

  const [
    { count: accounts, error: accountsError },
    { count: strategies, error: strategiesError },
    { count: trades, error: tradesError },
    { data: risk, error: riskError },
  ] = await Promise.all([
    supabase
      .from('gq_deriv_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),

    supabase
      .from('gq_strategies')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),

    supabase
      .from('gq_trade_intents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),

    supabase
      .from('gq_risk_settings')
      .select('live_trading_approved')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  const countsFailed =
    Boolean(accountsError) ||
    Boolean(strategiesError) ||
    Boolean(tradesError);

  const riskStatus = riskError
    ? 'Approval status unavailable'
    : risk?.live_trading_approved
      ? 'Approval recorded; execution still locked'
      : 'Not approved';

  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/" className="eyebrow">
          GENEARA / QUANT
        </Link>

        <span>{user.email}</span>
      </header>

      <h1>Workspace</h1>

      <p className="muted">
        Your verified account and configuration summary. No demo data is
        generated.
      </p>

      {countsFailed && (
        <p className="notice" role="status">
          Some workspace statistics could not be loaded. Please refresh
          and try again.
        </p>
      )}

      <div className="stats">
        <article>
          <small>Connected accounts</small>
          <strong>{accountsError ? '—' : accounts ?? 0}</strong>
          <span>Synced from Deriv</span>
        </article>

        <article>
          <small>Strategies</small>
          <strong>{strategiesError ? '—' : strategies ?? 0}</strong>
          <span>Saved configurations</span>
        </article>

        <article>
          <small>Recorded trade intents</small>
          <strong>{tradesError ? '—' : trades ?? 0}</strong>
          <span>Persistent records</span>
        </article>

        <article>
          <small>Live execution</small>
          <strong>LOCKED</strong>
          <span>{riskStatus}</span>
        </article>
      </div>

      <section className="panel">
        <h2>Next steps</h2>

        <div className="linkGrid">
          <Link href="/accounts">
            Connect / sync Deriv accounts <b>→</b>
          </Link>

          <Link href="/strategies">
            Configure strategies <b>→</b>
          </Link>

          <Link href="/risk-manager">
            Set risk controls <b>→</b>
          </Link>

          <Link href="/trade-history">
            View recorded trade intents <b>→</b>
          </Link>

          <Link href="/settings">
            Connection settings <b>→</b>
          </Link>
        </div>
      </section>

      <form action="/auth/signout" method="post">
        <button className="textButton" type="submit">
          Sign out
        </button>
      </form>
    </main>
  );
}
