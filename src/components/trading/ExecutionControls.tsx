'use client';

import { ShieldAlert, Square } from 'lucide-react';

export default function ExecutionControls() {
  return (
    <section className="panel" aria-labelledby="execution-controls-title">
      <div className="panel-head">
        <div>
          <h3 className="panel-title" id="execution-controls-title">
            Execution controls
          </h3>

          <div className="panel-subtitle">
            Trading is intentionally disabled in this release
          </div>
        </div>

        <ShieldAlert
          size={18}
          color="#DDC5A3"
          aria-hidden="true"
        />
      </div>

      <div className="callout" role="status">
        This control does not submit orders or stop a running worker. A
        production start/stop system must be enforced server-side and by the
        supervised execution worker, with persistent state and checks before
        every order.
      </div>

      <button
        className="button button-danger"
        type="button"
        style={{ marginTop: 15, width: '100%' }}
        disabled
        aria-describedby="execution-locked-status"
      >
        <Square size={13} aria-hidden="true" />
        Emergency stop — preview only
      </button>

      <div
        id="execution-locked-status"
        className="tiny muted"
        style={{ marginTop: 10 }}
      >
        Status: NOT ARMED · LIVE EXECUTION LOCKED
      </div>
    </section>
  );
}