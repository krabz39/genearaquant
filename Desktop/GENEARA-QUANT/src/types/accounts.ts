export type AccountMode = "demo" | "live";
export type ConnectedAccount = {
  id: string;
  providerAccountId: string;
  currency: string;
  mode: AccountMode;
  enabledForTrading: boolean;
};
