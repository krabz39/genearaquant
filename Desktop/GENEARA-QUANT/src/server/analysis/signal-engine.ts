import type { TradeSignal } from "@/types/trading";

export function rankSignals(signals: TradeSignal[]) {
  return [...signals].sort((a, b) => b.score - a.score);
}

export function selectBestSignal(signals: TradeSignal[]) {
  return rankSignals(signals)[0] ?? null;
}
