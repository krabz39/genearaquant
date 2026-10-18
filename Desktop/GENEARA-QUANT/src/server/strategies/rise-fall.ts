export type Tick = { epoch: number; quote: number };

export function analyseRiseFall(ticks: Tick[], lookback = 8) {
  if (ticks.length < lookback + 1) return { eligible: false, direction: null as "CALL" | "PUT" | null, score: 0, reason: "Insufficient ticks" };
  const window = ticks.slice(-(lookback + 1));
  const moves = window.slice(1).map((tick, i) => tick.quote - window[i].quote);
  const up = moves.filter(x => x > 0).length;
  const down = moves.filter(x => x < 0).length;
  const net = window[window.length - 1].quote - window[0].quote;
  const total = moves.reduce((sum, x) => sum + Math.abs(x), 0);
  if (!total || net === 0) return { eligible: false, direction: null as "CALL" | "PUT" | null, score: 0, reason: "No directional movement" };
  const direction = net > 0 ? "CALL" as const : "PUT" as const;
  const directionalShare = Math.max(up, down) / moves.length;
  const efficiency = Math.abs(net) / total;
  const score = Math.min(1, directionalShare * 0.6 + efficiency * 0.4);
  return { eligible: score >= 0.65, direction, score, reason: "Heuristic only; validate out-of-sample before use" };
}
