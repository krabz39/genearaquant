'use client';

import { useState } from 'react';

export default function EmergencyStop() {
  const [stopped, setStopped] = useState(true);

  return (
    <section className="panel" aria-labelledby="emergency-control-title">
      <div className="panel-head">
        <div>
          <h3 className="panel-title" id="emergency-control-title">
            Emergency control
          </h3>

          <div className="panel-subtitle">Preview-only local state</div>
        </div>

        <span className="status-tag off">NO EXECUTION</span>
      </div>

      <button
        className="button button-danger"
        type="button"
        onClick={() => setStopped(true)}
        style={{ width: '100%' }}
        aria-label="Stop new entries in the preview interface"
      >
        Stop new entries
      </button>

      <div className="tiny muted" role="status" style={{ marginTop: 12 }}>
        Status: {stopped ? 'Stopped by default' : 'Preview state only'}
      </div>

      <p className="tiny muted">
        This control changes only local interface state. It does not send a
        stop command to a trading worker or cancel existing orders.
      </p>
    </section>
  );
}