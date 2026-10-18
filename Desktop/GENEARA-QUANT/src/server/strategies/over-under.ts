export function analyseOverUnder(lastDigits: number[], barrier: number, side: "OVER" | "UNDER") {
  if (!Number.isInteger(barrier) || barrier < 0 || barrier > 9) throw new Error("Barrier must be an integer from 0 to 9.");
  if (lastDigits.length < 100) return { eligible: false, estimatedFrequency: null, reason: "Insufficient sample; requires validation" };
  if (lastDigits.some(d => !Number.isInteger(d) || d < 0 || d > 9)) throw new Error("Digits must be integers from 0 to 9.");
  const wins = lastDigits.filter(d => side === "OVER" ? d > barrier : d < barrier).length;
  const frequency = wins / lastDigits.length;
  return { eligible: false, estimatedFrequency: frequency, reason: "Frequency alone is not a predictive edge; compare against payout and out-of-sample tests." };
}
