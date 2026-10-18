export type ContractProposalRequest = {
  symbol: string;
  contractType: string;
  duration: number;
  durationUnit: "t";
  amount: number;
  currency: string;
};

export function validateProposalInput(input: ContractProposalRequest) {
  if (!input.symbol.trim()) throw new Error("A market symbol is required.");
  if (!input.contractType.trim()) throw new Error("A contract type is required.");
  if (!Number.isInteger(input.duration) || input.duration < 1) throw new Error("Tick duration must be a positive integer.");
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("Stake must be greater than zero.");
  if (!input.currency.trim()) throw new Error("Account currency is required.");
  return input;
}
