export type StakeConfig = { mode: "fixed" | "calculated"; fixedStake: number; balance: number; riskPercent: number; minStake: number; maxStake: number };
export function calculateStake(c: StakeConfig) {
  const raw = c.mode === "fixed" ? c.fixedStake : c.balance * c.riskPercent / 100;
  if (![raw, c.minStake, c.maxStake].every(Number.isFinite) || c.minStake <= 0 || c.maxStake < c.minStake) throw new Error("Invalid stake configuration.");
  if (raw < c.minStake || raw > c.maxStake) throw new Error("Calculated stake is outside configured bounds; reject rather than silently clamp.");
  return Math.round(raw * 100) / 100;
}
