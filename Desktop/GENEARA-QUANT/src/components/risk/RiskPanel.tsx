'use client';

import { useState } from 'react';

type TargetMode = 'fixed' | 'percent';

export default function RiskPanel() {
  const [targetMode, setTargetMode] = useState<TargetMode>('fixed');
  const [target, setTarget] = useState('3');
  const [hourlyLoss, setHourlyLoss] = useState('5');
  const [dailyLoss, setDailyLoss] = useState('10');
  const [maxLosses, setMaxLosses] = useState('3');

  const numericValues = [
    { label: 'Hourly target', value: target },
    { label: 'Hourly maximum loss', value: hourlyLoss },
    { label: 'Daily maximum loss', value: dailyLoss },
  ];

  const invalidValues = numericValues.filter(({ value }) => {
    const number = Number(value);
    return value.trim() === '' || !Number.isFinite(number) || number <= 0;
  });

  const lossThreshold = Number(maxLosses);
  const invalidLossThreshold =
    maxLosses.trim() === '' ||
    !Number.isInteger(lossThreshold) ||
    lossThreshold < 1 ||
    lossThreshold > 100;

  return (
    <section className="panel" aria-labelledby="portfolio-risk-title">
      <div className="panel-head">
        <div>
          <h3 className="panel-title" id="portfolio-risk-title">
            Portfolio risk limits
          </h3>
          <div className="panel-subtitle">
            Illustrative starting values only
          </div>
        </div>

        <span className="status-tag pending">NOT ENFORCED</span>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="target-mode">Hourly profit target mode</label>
          <select
            id="target-mode"
            value={targetMode}
            onChange={(event) =>
              setTargetMode(event.target.value as TargetMode)
            }
          >
            <option value="fixed">Fixed amount</option>
            <option value="percent">
              Percentage of hour-start balance
            </option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="hourly-target">
            {targetMode === 'fixed'
              ? 'Hourly target (account currency)'
              : 'Hourly target (%)'}
          </label>
          <input
            id="hourly-target"
            type="number"
            min="0.01"
            step="any"
            required
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            inputMode="decimal"
            aria-invalid={
              target.trim() === '' ||
              !Number.isFinite(Number(target)) ||
              Number(target) <= 0
            }
          />
        </div>

        <div className="field">
          <label htmlFor="hourly-loss">Hourly maximum loss</label>
          <input
            id="hourly-loss"
            type="number"
            min="0.01"
            step="any"
            required
            value={hourlyLoss}
            onChange={(event) => setHourlyLoss(event.target.value)}
            inputMode="decimal"
            aria-invalid={
              hourlyLoss.trim() === '' ||
              !Number.isFinite(Number(hourlyLoss)) ||
              Number(hourlyLoss) <= 0
            }
          />
        </div>

        <div className="field">
          <label htmlFor="daily-loss">Daily maximum loss</label>
          <input
            id="daily-loss"
            type="number"
            min="0.01"
            step="any"
            required
            value={dailyLoss}
            onChange={(event) => setDailyLoss(event.target.value)}
            inputMode="decimal"
            aria-invalid={
              dailyLoss.trim() === '' ||
              !Number.isFinite(Number(dailyLoss)) ||
              Number(dailyLoss) <= 0
            }
          />
        </div>

        <div className="field">
          <label htmlFor="max-losses">
            Consecutive-loss pause threshold
          </label>
          <input
            id="max-losses"
            type="number"
            min="1"
            max="100"
            step="1"
            required
            value={maxLosses}
            onChange={(event) => setMaxLosses(event.target.value)}
            inputMode="numeric"
            aria-invalid={invalidLossThreshold}
          />
        </div>
      </div>

      {(invalidValues.length > 0 || invalidLossThreshold) && (
        <p className="notice" role="status">
          Enter positive numeric limits and a whole-number loss threshold
          between 1 and 100.
        </p>
      )}

      <div className="callout" style={{ marginTop: 16 }}>
        These values are local drafts only. They are not saved or enforced by
        the server. A reached target should pause new entries only when the
        execution worker implements that rule; it does not guarantee profit or
        automatically close open contracts.
      </div>
    </section>
  );
}