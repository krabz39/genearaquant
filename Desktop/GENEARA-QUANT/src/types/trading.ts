export type TradeStatus = "proposed" | "approved" | "submitted" | "open" | "won" | "lost" | "cancelled" | "rejected";
export type TradeSignal = {
  id: string;
  strategyId: string;
  symbol: string;
  contractType: string;
  durationTicks: number;
  score: number;
  rationale: string[];
};
export type RiskDecision = { allowed: boolean; reasons: string[] };
