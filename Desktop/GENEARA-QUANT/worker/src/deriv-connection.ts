export function startDerivConnection() {
  console.log("[worker] Deriv WebSocket is not configured; no connection opened.");
  return { stop() { console.log("[worker] Connection stop requested."); } };
}
