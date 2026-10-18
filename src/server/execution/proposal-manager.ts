import { validateProposalInput, type ContractProposalRequest } from "@/lib/deriv/contracts";
export function prepareProposalRequest(input: ContractProposalRequest) {
  return validateProposalInput(input);
}
/** Provider request deliberately omitted until the Deriv API schema and account authorization are configured. */
export async function requestProposal(_input: ContractProposalRequest): Promise<never> {
  throw new Error("Proposal requests are disabled until the authenticated Deriv client is implemented.");
}
