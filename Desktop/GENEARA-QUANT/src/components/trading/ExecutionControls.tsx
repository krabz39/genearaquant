"use client";

import { useState } from "react";
import { ShieldAlert, Square } from "lucide-react";

export default function ExecutionControls() {
  const [armed, setArmed] = useState(false);
  return <div className="panel">
    <div className="panel-head"><div><h3 className="panel-title">Execution controls</h3><div className="panel-subtitle">Trading is intentionally disabled in this starter</div></div><ShieldAlert size={18} color="#DDC5A3"/></div>
    <div className="callout">This control does not submit orders. A real start/stop system must be enforced server-side and by the supervised worker, not by a browser toggle.</div>
    <button className="button button-danger" style={{ marginTop: 15, width: "100%" }} onClick={() => setArmed(false)}><Square size={13}/> Emergency stop (preview)</button>
    <div className="tiny muted" style={{ marginTop: 10 }}>UI state: {armed ? "armed (not connected)" : "not armed"}</div>
  </div>;
}
