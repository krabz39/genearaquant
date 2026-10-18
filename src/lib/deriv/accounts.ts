export type DerivAccountSummary = {
  accountId: string;
  currency: string;
  isVirtual: boolean;
};

export async function listAuthorizedDerivAccounts(): Promise<DerivAccountSummary[]> {
  // Must be implemented using the authenticated user's securely stored Deriv authorization.
  return [];
}
