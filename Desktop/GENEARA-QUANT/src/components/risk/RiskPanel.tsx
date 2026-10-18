"use client";

import { useState } from "react";

export default function RiskPanel() {
  const [targetMode, setTargetMode] = useState("fixed");
  const [target, setTarget] = useState("3");
  const [hourlyLoss, setHourlyLoss] = useState("5");
  const [dailyLoss, setDailyLoss] = useState("10");
  const [maxLosses, setMaxLosses] = useState("3");
  return <div className="panel">
    <div className="panel-head"><div><h3 className="panel-title">Portfolio risk limits</h3><div className="panel-subtitle">Illustrative starting values only</div></div><span className="status-tag pending">NOT ENFORCED</span></div>
    <div className="form-grid">
      <div className="field"><label>Hourly profit target mode</label><select value={targetMode} onChange={e => setTargetMode(e.target.value)}><option value="fixed">Fixed amount</option><option value="percent">Percentage of hour-start balance</option></select></div>
      <div className="field"><label>{targetMode === "fixed" ? "Hourly target (account currency)" : "Hourly target (%)"}</label><input value={target} onChange={e => setTarget(e.target.value)} inputMode="decimal"/></div>
      <div className="field"><label>Hourly maximum loss</label><input value={hourlyLoss} onChange={e => setHourlyLoss(e.target.value)} inputMode="decimal"/></div>
      <div className="field"><label>Daily maximum loss</label><input value={dailyLoss} onChange={e => setDailyLoss(e.target.value)} inputMode="decimal"/></div>
      <div className="field"><label>Consecutive-loss pause threshold</label><input value={maxLosses} onChange={e => setMaxLosses(e.target.value)} inputMode="numeric"/></div>
    </div>
    <div className="callout" style={{ marginTop: 16 }}>A reached target pauses new entries; it does not guarantee profit or automatically close open contracts. Values here are drafts until server-side enforcement and database persistence are implemented.</div>
  </div>;
}
