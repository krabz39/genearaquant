export type StrategyId = "rise-fall" | "over-under" | "even-odd" | "matches-differs" | "barriers" | "other";
export type ExecutionPolicy = "best-signal" | "independent";
export type StakeMode = "fixed" | "calculated";
export type StrategyConfig = {
  id: StrategyId;
  enabled: boolean;
  stakeMode: StakeMode;
  fixedStake: number;
  durationTicks: number;
};
