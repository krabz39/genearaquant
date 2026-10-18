export function evaluateHourlyLimits(input: { realizedProfit: number; profitTarget: number; realizedLoss: number; lossLimit: number }) {
  const stopEntries = input.realizedProfit >= input.profitTarget || input.realizedLoss >= input.lossLimit;
  return { stopEntries, reason: input.realizedProfit >= input.profitTarget ? "profit_target" : input.realizedLoss >= input.lossLimit ? "loss_limit" : null };
}
