"use client";

import { useState } from "react";

export default function EmergencyStop() {
  const [stopped, setStopped] = useState(true);
  return <div className="panel"><div className="panel-head"><div><h3 className="panel-title">Emergency control</h3><div className="panel-subtitle">Preview-only local state</div></div><span className="status-tag off">NO EXECUTION</span></div><button className="button button-danger" onClick={() => setStopped(true)} style={{ width: "100%" }}>Stop new entries</button><div className="tiny muted" style={{ marginTop: 12 }}>Status: {stopped ? "Stopped by default" : "Preview state only"}</div></div>;
}
