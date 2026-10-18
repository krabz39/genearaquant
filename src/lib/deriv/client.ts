export type DerivConnectionState = "disconnected" | "connecting" | "connected" | "error";

export function assertDerivServerConfiguration() {
  if (!process.env.DERIV_APP_ID) throw new Error("DERIV_APP_ID is not configured.");
  // A server-side token must be loaded from secure storage at runtime; never from browser input.
  return true;
}

/** No live WebSocket is opened by the starter. Implement authenticated connection handling server-side. */
export async function createDerivConnection(): Promise<never> {
  throw new Error("Deriv connection is not implemented. Configure and test the official API flow first.");
}
