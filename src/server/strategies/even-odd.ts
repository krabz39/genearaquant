export function analyseParity(lastDigits: number[]) {
  if (lastDigits.length < 100) return { eligible: false, evenFrequency: null, oddFrequency: null, reason: "Insufficient sample" };
  if (lastDigits.some(d => !Number.isInteger(d) || d < 0 || d > 9)) throw new Error("Digits must be integers from 0 to 9.");
  const even = lastDigits.filter(d => d % 2 === 0).length / lastDigits.length;
  const odd = 1 - even;
  return { eligible: false, evenFrequency: even, oddFrequency: odd, reason: "Descriptive statistics only; no automatic digit entry is approved." };
}
