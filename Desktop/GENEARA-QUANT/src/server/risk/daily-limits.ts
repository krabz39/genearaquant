export function evaluateDailyLoss(realizedLoss: number, maximumDailyLoss: number) {
  if (realizedLoss < 0 || maximumDailyLoss <= 0) throw new Error("Use non-negative realized loss and a positive limit.");
  return { stopEntries: realizedLoss >= maximumDailyLoss, remaining: Math.max(0, maximumDailyLoss - realizedLoss) };
}
