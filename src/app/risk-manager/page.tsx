
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type RiskForm = {
  hourly_profit_mode: 'amount' | 'percent';
  hourly_profit_target: string;
  hourly_loss_limit: string;
  daily_loss_limit: string;
  max_consecutive_losses: string;
  max_open_contracts: string;
  cooldown_seconds: string;
};

const initialForm: RiskForm = {
  hourly_profit_mode: 'amount',
  hourly_profit_target: '',
  hourly_loss_limit: '',
  daily_loss_limit: '',
  max_consecutive_losses: '3',
  max_open_contracts: '1',
  cooldown_seconds: '0',
};

export default function RiskManager() {
  const [form, setForm] = useState<RiskForm>(initialForm);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadRiskSettings() {
      try {
        const response = await fetch('/api/risk', {
          cache: 'no-store',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || 'Could not load risk settings',
          );
        }

        if (!active) return;

        if (result.risk) {
          const risk = result.risk;

          setForm({
            hourly_profit_mode:
              risk.hourly_profit_mode === 'percent'
                ? 'percent'
                : 'amount',
            hourly_profit_target:
              risk.hourly_profit_target == null
                ? ''
                : String(risk.hourly_profit_target),
            hourly_loss_limit:
              risk.hourly_loss_limit == null
                ? ''
                : String(risk.hourly_loss_limit),
            daily_loss_limit:
              risk.daily_loss_limit == null
                ? ''
                : String(risk.daily_loss_limit),
            max_consecutive_losses:
              risk.max_consecutive_losses == null
                ? ''
                : String(risk.max_consecutive_losses),
            max_open_contracts: String(
              risk.max_open_contracts ?? 1,
            ),
            cooldown_seconds: String(
              risk.cooldown_seconds ?? 0,
            ),
          });
        }
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : 'Could not load risk settings',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadRiskSettings();

    return () => {
      active = false;
    };
  }, []);

  function updateField<K extends keyof RiskForm>(
    key: K,
    value: RiskForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      const parseOptionalNumber = (value: string) => {
        if (value.trim() === '') return null;

        const number = Number(value);

        if (!Number.isFinite(number)) {
          throw new Error('Enter valid numeric risk limits.');
        }

        return number;
      };

      const body = {
        hourly_profit_mode: form.hourly_profit_mode,
        hourly_profit_target: parseOptionalNumber(
          form.hourly_profit_target,
        ),
        hourly_loss_limit: parseOptionalNumber(
          form.hourly_loss_limit,
        ),
        daily_loss_limit: parseOptionalNumber(
          form.daily_loss_limit,
        ),
        max_consecutive_losses: parseOptionalNumber(
          form.max_consecutive_losses,
        ),
        max_open_contracts: Number(form.max_open_contracts),
        cooldown_seconds: Number(form.cooldown_seconds),
      };

      const response = await fetch('/api/risk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Save failed');
      }

      setMessage(
        'Risk settings saved. These settings do not unlock order execution.',
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Save failed',
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

      <h1>Risk manager</h1>

      <p className="muted">
        Risk limits are stored per user. Limits are not considered
        enforcement until the worker enforces and tests them before
        every order.
      </p>

      <form className="panel formGrid" onSubmit={save}>
        <label>
          Hourly profit target mode
          <select
            value={form.hourly_profit_mode}
            onChange={(event) =>
              updateField(
                'hourly_profit_mode',
                event.target.value as RiskForm['hourly_profit_mode'],
              )
            }
          >
            <option value="amount">Fixed amount</option>
            <option value="percent">Percentage</option>
          </select>
        </label>

        <label>
          Hourly profit target
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.hourly_profit_target}
            onChange={(event) =>
              updateField('hourly_profit_target', event.target.value)
            }
            placeholder="Optional"
          />
        </label>

        <label>
          Hourly loss limit
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.hourly_loss_limit}
            onChange={(event) =>
              updateField('hourly_loss_limit', event.target.value)
            }
            placeholder="Optional"
          />
        </label>

        <label>
          Daily loss limit
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.daily_loss_limit}
            onChange={(event) =>
              updateField('daily_loss_limit', event.target.value)
            }
            placeholder="Optional"
          />
        </label>

        <label>
          Maximum consecutive losses
          <input
            type="number"
            min="1"
            max="100"
            step="1"
            value={form.max_consecutive_losses}
            onChange={(event) =>
              updateField(
                'max_consecutive_losses',
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Maximum open contracts
          <input
            type="number"
            min="1"
            max="100"
            step="1"
            required
            value={form.max_open_contracts}
            onChange={(event) =>
              updateField('max_open_contracts', event.target.value)
            }
          />
        </label>

        <label>
          Cooldown seconds
          <input
            type="number"
            min="0"
            max="86400"
            step="1"
            required
            value={form.cooldown_seconds}
            onChange={(event) =>
              updateField('cooldown_seconds', event.target.value)
            }
          />
        </label>

        <button
          className="primary"
          type="submit"
          disabled={busy || loading}
        >
          {loading
            ? 'Loading settings…'
            : busy
              ? 'Saving…'
              : 'Save risk settings'}
        </button>
      </form>

      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}

      <div className="warning">
        LIVE TRADING LOCKED — settings alone do not authorize execution.
      </div>
    </main>
  );
}
