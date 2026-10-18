export function startScheduler() {
  console.log("[worker] Scheduler scaffold started; no trades will be scheduled.");
  return { stop() { console.log("[worker] Scheduler stopped."); } };
}
