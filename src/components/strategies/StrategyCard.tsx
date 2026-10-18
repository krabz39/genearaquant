'use client';

import { useState } from 'react';

export type StrategyCardProps = {
  name: string;
  description: string;
  symbol: string;
  defaultEnabled?: boolean;
};

export default function StrategyCard({
  name,
  description,
  symbol,
  defaultEnabled = false,
}: StrategyCardProps) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  function toggleEnabled() {
    setEnabled((current) => !current);
  }

  return (
    <div className="strategy-row">
      <div className="strategy-symbol" aria-hidden="true">
        {symbol}
      </div>

      <div className="strategy-meta">
        <div className="strategy-name">{name}</div>
        <div className="strategy-desc">{description}</div>

        <div className="tiny muted" style={{ marginTop: 6 }}>
          Local UI setting only · not persisted · no orders placed
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${enabled ? 'Disable' : 'Enable'} ${name}`}
        className={`switch${enabled ? ' on' : ''}`}
        onClick={toggleEnabled}
      >
        <span aria-hidden="true" />
      </button>
    </div>
  );
}