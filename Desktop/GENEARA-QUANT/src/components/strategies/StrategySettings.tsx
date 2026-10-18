'use client';

import { useState } from 'react';

type ExecutionMode = 'best' | 'independent';
type StakeMode = 'fixed' | 'calculated';

export default function StrategySettings() {
  const [mode, setMode] = useState<ExecutionMode>('best');
  const [stakeMode, setStakeMode] = useState<StakeMode>('fixed');
  const [stake, setStake] = useState('1.00');
  const [ticks, setTicks] = useState('5');

  const stakeValue = Number(stake);
  const ticksValue = Number(ticks);

  const invalidStake =
    stake.trim() === '' ||
    !Number.isFinite(stakeValue) ||
    stakeValue <= 0;

  const invalidTicks =
    ticks.trim() === '' ||
    !Number.isInteger(ticksValue) ||
    ticksValue < 1 ||
    ticksValue > 10000;

  return (
    <section className="panel" aria-labelledby="entry-configuration-title">
      <div className="panel-head">
        <div>
          <h3 className="panel-title" id="entry-configuration-title">
            Entry configuration
          </h3>

          <div className="panel-subtitle">
            Draft settings · not connected to execution
          </div>
        </div>

        <span className="status-tag pending">DRAFT</span>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="execution-policy">Execution policy</label>

          <select
            id="execution-policy"
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as ExecutionMode)
            }
          >
            <option value="best">Best qualifying signal</option>
            <option value="independent">Independent strategies</option>
          </select>

          <span className="field-help">
            Independent mode still shares account-wide risk limits.
          </span>
        </div>

        <div className="field">
          <label htmlFor="stake-mode">Stake mode</label>

          <select
            id="stake-mode"
            value={stakeMode}
            onChange={(event) =>
              setStakeMode(event.target.value as StakeMode)
            }
          >
            <option value="fixed">Fixed stake (default)</option>
            <option value="calculated">Calculated stake (later phase)</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="fixed-stake">
            Fixed stake (account currency)
          </label>

          <input
            id="fixed-stake"
            type="number"
            min="0.01"
            step="any"
            value={stake}
            onChange={(event) => setStake(event.target.value)}
            inputMode="decimal"
            disabled={stakeMode !== 'fixed'}
            aria-invalid={stakeMode === 'fixed' && invalidStake}
          />

          {stakeMode === 'fixed' && invalidStake && (
            <span className="field-help" role="alert">
              Enter a valid stake greater than zero.
            </span>
          )}

          <span className="field-help">
            Stake limits must be checked against Deriv proposal data and
            server-enforced risk settings before execution.
          </span>
        </div>

        <div className="field">
          <label htmlFor="entry-duration">Entry duration (ticks)</label>

          <input
            id="entry-duration"
            type="number"
            min="1"
            max="10000"
            step="1"
            value={ticks}
            onChange={(event) => setTicks(event.target.value)}
            inputMode="numeric"
            aria-invalid={invalidTicks}
          />

          {invalidTicks && (
            <span className="field-help" role="alert">
              Enter a whole number between 1 and 10,000.
            </span>
          )}

          <span className="field-help">
            Valid duration depends on the selected contract type and market.
          </span>
        </div>
      </div>

      <div className="callout" style={{ marginTop: 17 }}>
        These values exist only in this browser component. They are not
        persisted to the database, and live order execution is not enabled.
      </div>

      <div className="tiny muted" style={{ marginTop: 10 }}>
        Selected:{' '}
        {mode === 'best'
          ? 'Best qualifying signal'
          : 'Independent strategies'}{' '}
        ·{' '}
        {stakeMode === 'fixed'
          ? `Fixed stake ${stake || '—'}`
          : 'Calculated stake'}
      </div>
    </section>
  );
}