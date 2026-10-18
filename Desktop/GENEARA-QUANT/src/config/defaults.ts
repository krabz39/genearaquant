export const defaultTradingConfig = {
  executionPolicy: "best-signal" as const,
  stakeMode: "fixed" as const,
  fixedStake: 1,
  durationTicks: 5,
  hourlyTargetMode: "fixed" as const,
  hourlyProfitTarget: 3,
  hourlyLossLimit: 5,
  dailyLossLimit: 10,
  maxConsecutiveLosses: 3,
  liveTradingEnabled: false
} as const;
