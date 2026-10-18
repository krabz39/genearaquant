export async function submitOrder(): Promise<never> {
  throw new Error("Order execution is intentionally disabled in the starter.");
}
