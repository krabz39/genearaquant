export function analyseMatchesDiffers(lastDigits: number[], targetDigit: number) {
  if (!Number.isInteger(targetDigit) || targetDigit < 0 || targetDigit > 9) throw new Error("Target digit must be 0–9.");
  if (lastDigits.length < 100) return { eligible: false, matchFrequency: null, reason: "Insufficient sample" };
  const matches = lastDigits.filter(d => d === targetDigit).length / lastDigits.length;
  return { eligible: false, matchFrequency: matches, reason: "Descriptive statistics only; validate any proposed edge out-of-sample." };
}
