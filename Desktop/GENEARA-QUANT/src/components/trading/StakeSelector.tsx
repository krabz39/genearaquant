'use client';

import { useState } from 'react';

type StakeMode = 'fixed' | 'calculated';

export default function StakeSelector() {
  const [mode, setMode] = useState<StakeMode>('fixed');
  const [amount, setAmount] = useState('1.00');
  const [riskPct, setRiskPct] = useState('1');

  const stakeValue = Number(amount);
  const riskValue = Number(riskPct);

  const invalidStake =
    amount.trim() === '' ||
    !Number.isFinite(stakeValue) ||
    stakeValue <= 0;

  const invalidRisk =
    riskPct.trim() === '' ||
    !Number.isFinite(riskValue) ||
    riskValue <= 0 ||
    riskValue > 100;

  return (
    <div className="form-grid">
      <div className="field">
        <label htmlFor="stake-calculation">Stake calculation</label>

        <select
          id="stake-calculation"
          value={mode}
          onChange={(event) => setMode(event.target.value as StakeMode)}
        >
          <option value="fixed">Fixed stake (default)</option>
          <option value="calculated">
            Percentage-based (future integration)
          </option>
        </select>
      </div>

      {mode === 'fixed' ? (
        <div className="field">
          <label htmlFor="stake-amount">Stake per trade</label>

          <input
            id="stake-amount"
            type="number"
            min="0.01"
            step="any"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            aria-invalid={invalidStake}
          />

          {invalidStake && (
            <span className="field-help" role="alert">
              Enter a stake greater than zero.
            </span>
          )}
        </div>
      ) : (
        <div className="field">
          <label htmlFor="stake-risk-percentage">
            Configured risk percentage
          </label>

          <input
            id="stake-risk-percentage"
            type="number"
            min="0.01"
            max="100"
            step="any"
            required
            value={riskPct}
            onChange={(event) => setRiskPct(event.target.value)}
            inputMode="decimal"
            aria-invalid={invalidRisk}
          />

          {invalidRisk && (
            <span className="field-help" role="alert">
              Enter a percentage greater than zero and no greater than 100.
            </span>
          )}
        </div>
      )}

      <div className="field-help" style={{ gridColumn: '1 / -1' }}>
        These are UI-only values and are not saved or enforced. A server-side
        risk engine must validate each stake against the selected account,
        contract proposal, and exposure limits before any order is submitted.
      </div>
    </div>
  );
}