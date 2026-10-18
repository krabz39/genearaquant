export type MarketTick = { symbol: string; epoch: number; quote: number };
export function validateTick(tick: MarketTick) {
  if (!tick.symbol || !Number.isFinite(tick.epoch) || !Number.isFinite(tick.quote)) return false;
  return tick.quote > 0;
}
