
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Account = {
  id?: string;
  deriv_account_id: string;
  account_type?: string;
  currency?: string;
  display_name?: string;
  is_virtual?: boolean;
  last_synced_at?: string;
};

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function sync() {
    setBusy(true);
    setMessage('');

    try {
      const r = await fetch('/api/deriv/accounts', {
        cache: 'no-store',
      });

      const j = await r.json();

      if (!r.ok) {
        throw new Error(
          j.error === 'unauthorized'
            ? 'Sign in first.'
            : j.error || 'Account sync failed',
        );
      }

      setAccounts(j.accounts || []);

      setMessage(
        j.connected
          ? j.accounts?.length
            ? 'Accounts synced from Deriv.'
            : 'Deriv connected, but no account records were returned.'
          : 'No Deriv connection found. Connect your account first.',
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void sync();
  }, []);

  return (
    <main className="shell">
      <Link href="/dashboard" className="back">
        ← Workspace
      </Link>

      <h1>Deriv accounts</h1>

      <p className="muted">
        Account details are fetched from the authenticated Deriv API.
        No balances or account IDs are invented.
      </p>

      <div className="actions">
        <a className="primary" href="/api/deriv/connect">
          Connect Deriv
        </a>

        <button
          className="secondary"
          onClick={sync}
          disabled={busy}
          type="button"
        >
          {busy ? 'Syncing…' : 'Sync accounts'}
        </button>
      </div>

      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}

      <section className="accountList">
        {accounts.map((a) => (
          <article className="panel" key={a.deriv_account_id}>
            <div>
              <h3>{a.display_name || a.deriv_account_id}</h3>

              <p>
                {a.account_type || 'Account type not provided'} ·{' '}
                {a.currency || 'Currency not provided'}
              </p>

              <small>{a.deriv_account_id}</small>
            </div>

            <span className="pill">
              {a.is_virtual ? 'DEMO' : 'DERIV'}
            </span>
          </article>
        ))}

        {!accounts.length && !busy && (
          <div className="empty">
            No accounts to display yet. Connect Deriv and sync to retrieve
            accounts.
          </div>
        )}
      </section>
    </main>
  );
}
