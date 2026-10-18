'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type Strategy = {
  id: string;
  name: string;
  contract_type: string;
  market_symbol: string | null;
  duration_ticks: number;
  stake_mode: string;
  stake_amount: number;
  enabled: boolean;
};

type StrategiesResponse = {
  strategies?: Strategy[];
  error?: string;
};

export default function Strategies() {
  const [rows, setRows] = useState<Strategy[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('RISE_FALL');
  const [symbol, setSymbol] = useState('');
  const [ticks, setTicks] = useState('5');
  const [stake, setStake] = useState('1');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/strategies', {
        cache: 'no-store',
      });

      const result = (await response.json()) as StrategiesResponse;

      if (!response.ok) {
        throw new Error(result.error || 'Could not load strategies.');
      }

      setRows(Array.isArray(result.strategies) ? result.strategies : []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not load strategies.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    const duration = Number(ticks);
    const stakeAmount = Number(stake);

    if (!Number.isInteger(duration) || duration < 1 || duration > 10000) {
      setMessage('Duration must be between 1 and 10,000 ticks.');
      return;
    }

    if (!Number.isFinite(stakeAmount) || stakeAmount < 0.01) {
      setMessage('Fixed stake must be at least 0.01.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({
          name: name.trim(),
          contract_type: type,
          market_symbol: symbol.trim() || null,
          duration_ticks: duration,
          stake_mode: 'fixed',
          stake_amount: stakeAmount,
          enabled: false,
          parameters: {},
        }),
      });

      const result = (await response.json()) as StrategiesResponse;

      if (!response.ok) {
        throw new Error(result.error || 'Could not save strategy.');
      }

      setName('');
      setSymbol('');
      setMessage('Strategy configuration saved disabled.');

      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Saving the strategy failed.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <Link href="/dashboard" className="back">
        ← Workspace
      </Link>

      <h1>Strategies</h1>

      <p className="muted">
        Create your own configurations. New strategies are saved disabled and
        do not place orders.
      </p>

      <form className="panel formGrid" onSubmit={create}>
        <label>
          Name
          <input
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Strategy name"
          />
        </label>

        <label>
          Contract type
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            {[
              'RISE_FALL',
              'OVER_UNDER',
              'EVEN_ODD',
              'MATCHES_DIFFERS',
              'TOUCH_NO_TOUCH',
            ].map((contractType) => (
              <option key={contractType} value={contractType}>
                {contractType}
              </option>
            ))}
          </select>
        </label>

        <label>
          Market symbol
          <input
            value={symbol}
            maxLength={40}
            onChange={(event) => setSymbol(event.target.value)}
            placeholder="Enter a symbol verified from Deriv"
          />
        </label>

        <label>
          Duration (ticks)
          <input
            type="number"
            min="1"
            max="10000"
            step="1"
            required
            value={ticks}
            onChange={(event) => setTicks(event.target.value)}
          />
        </label>

        <label>
          Fixed stake
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={stake}
            onChange={(event) => setStake(event.target.value)}
          />
        </label>

        <button className="primary" type="submit" disabled={busy || loading}>
          {busy ? 'Saving…' : 'Save disabled strategy'}
        </button>
      </form>

      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}

      <section className="accountList" aria-label="Saved strategies">
        {loading ? (
          <div className="empty">Loading strategies…</div>
        ) : rows.length > 0 ? (
          rows.map((strategy) => (
            <article className="panel" key={strategy.id}>
              <div>
                <h3>{strategy.name}</h3>

                <p>
                  {strategy.contract_type} ·{' '}
                  {strategy.market_symbol || 'No market selected'} ·{' '}
                  {strategy.duration_ticks} ticks
                </p>

                <small>
                  Stake {strategy.stake_amount} · {strategy.stake_mode}
                </small>
              </div>

              <span className="pill">
                {strategy.enabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </article>
          ))
        ) : (
          <div className="empty">No strategies saved yet.</div>
        )}
      </section>

      <p className="muted">
        Live execution remains locked. Saving or enabling a configuration in
        the interface must not bypass server-side authorization and risk checks.
      </p>
    </main>
  );
}