export type RiskSnapshot = {
  tradingEnabled: boolean;
  accountMode: "demo" | "live";
  hourlyProfit: number;
  hourlyTarget: number;
  hourlyLoss: number;
  hourlyLossLimit: number;
  dailyLoss: number;
  dailyLossLimit: number;
  consecutiveLosses: number;
  maxConsecutiveLosses: number;
  proposedStake: number;
  maxStake: number;
  openExposure: number;
  maxExposure: number;
};

export function evaluateRisk(s: RiskSnapshot) {
  const reasons: string[] = [];
  if (!s.tradingEnabled) reasons.push("Trading is disabled");
  if (s.hourlyProfit >= s.hourlyTarget) reasons.push("Hourly profit target reached");
  if (s.hourlyLoss >= s.hourlyLossLimit) reasons.push("Hourly loss limit reached");
  if (s.dailyLoss >= s.dailyLossLimit) reasons.push("Daily loss limit reached");
  if (s.consecutiveLosses >= s.maxConsecutiveLosses) reasons.push("Consecutive-loss limit reached");
  if (s.proposedStake <= 0 || s.proposedStake > s.maxStake) reasons.push("Stake outside permitted range");
  if (s.openExposure + s.proposedStake > s.maxExposure) reasons.push("Maximum exposure would be exceeded");
  if (s.accountMode === "live" && !s.tradingEnabled) reasons.push("Live trading not explicitly enabled");
  return { allowed: reasons.length === 0, reasons };
}
