"use client";

import { useState } from "react";

export default function StrategySettings() {
  const [mode, setMode] = useState("best");
  const [stakeMode, setStakeMode] = useState("fixed");
  const [stake, setStake] = useState("1.00");
  const [ticks, setTicks] = useState("5");
  return <div className="panel">
    <div className="panel-head"><div><h3 className="panel-title">Entry configuration</h3><div className="panel-subtitle">Draft settings · not connected to execution</div></div><span className="status-tag pending">DRAFT</span></div>
    <div className="form-grid">
      <div className="field"><label>Execution policy</label><select value={mode} onChange={e => setMode(e.target.value)}><option value="best">Best qualifying signal</option><option value="independent">Independent strategies</option></select><span className="field-help">Independent mode still shares account-wide risk limits.</span></div>
      <div className="field"><label>Stake mode</label><select value={stakeMode} onChange={e => setStakeMode(e.target.value)}><option value="fixed">Fixed stake (default)</option><option value="calculated">Calculated stake (later phase)</option></select></div>
      <div className="field"><label>Fixed stake (account currency)</label><input value={stake} onChange={e => setStake(e.target.value)} inputMode="decimal" disabled={stakeMode !== "fixed"}/><span className="field-help">Validated against Deriv's proposal and configured limits when integrated.</span></div>
      <div className="field"><label>Entry duration (ticks)</label><input value={ticks} onChange={e => setTicks(e.target.value)} inputMode="numeric"/><span className="field-help">Availability and valid duration depend on contract type.</span></div>
    </div>
    <div className="callout" style={{ marginTop: 17 }}>Saved values currently exist only in this browser component. Database persistence and live order execution are not implemented.</div>
    <div className="tiny muted" style={{ marginTop: 10 }}>Selected: {mode === "best" ? "Best qualifying signal" : "Independent strategies"} · {stakeMode === "fixed" ? `Fixed stake ${stake}` : "Calculated stake"}</div>
  </div>;
}
