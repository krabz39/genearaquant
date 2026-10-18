export type RecoveryState = { lastKnownOpenContractIds: string[]; lastReconciledAt: string | null };
export function buildRecoveryPlan(state: RecoveryState) {
  return { contractIdsToReconcile: [...new Set(state.lastKnownOpenContractIds)], shouldReconcile: true, previousReconciliation: state.lastReconciledAt };
}
