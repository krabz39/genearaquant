"use client";

import { useState } from "react";

export default function StakeSelector() {
  const [mode, setMode] = useState("fixed");
  const [amount, setAmount] = useState("1.00");
  const [riskPct, setRiskPct] = useState("1");
  return <div className="form-grid">
    <div className="field"><label>Stake calculation</label><select value={mode} onChange={e => setMode(e.target.value)}><option value="fixed">Fixed stake (default)</option><option value="calculated">Percentage-based (future integration)</option></select></div>
    {mode === "fixed" ? <div className="field"><label>Stake per trade</label><input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal"/></div> : <div className="field"><label>Configured risk percentage</label><input value={riskPct} onChange={e => setRiskPct(e.target.value)} inputMode="decimal"/></div>}
    <div className="field-help" style={{ gridColumn: "1/-1" }}>UI-only values. A server-side risk engine must validate every stake against the selected account, contract proposal and exposure limits.</div>
  </div>;
}
