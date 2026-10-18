export type BarrierObservation = { quote: number; epoch: number };
export function evaluateBarrier(observations: BarrierObservation[], barrier: number, direction: "touch" | "no-touch") {
  if (!Number.isFinite(barrier)) throw new Error("Barrier must be finite.");
  if (!observations.length) return { touched: false, eligible: false, reason: "No observations" };
  const touched = observations.some(o => o.quote === barrier);
  return { touched, eligible: false, reason: `Historical observation only (${direction}); contract-specific barrier and payout rules must be verified.` };
}
