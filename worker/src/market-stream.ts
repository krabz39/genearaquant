export type TickEvent = { symbol: string; epoch: number; quote: number };
export function handleTick(_tick: TickEvent) {
  // Add schema validation, sequence handling, stale-data detection and persistence before strategies.
}
