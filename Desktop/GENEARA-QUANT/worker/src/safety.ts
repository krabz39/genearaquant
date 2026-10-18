export function liveTradingEnabled(): boolean { return process.env.LIVE_TRADING_ENABLED === 'true'; }
export function assertExecutionDisabled(): never { throw new Error('Execution is disabled in this release.'); }
export function canExecuteOrder(): false { return false; }
