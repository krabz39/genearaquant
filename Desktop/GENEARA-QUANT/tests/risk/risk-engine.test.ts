import { describe, expect, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateRisk } from "../../src/server/risk/risk-engine";

describe("evaluateRisk", () => {
  it("blocks entries while trading is disabled", () => {
    const result = evaluateRisk({ tradingEnabled: false, accountMode: "demo", hourlyProfit: 0, hourlyTarget: 3, hourlyLoss: 0, hourlyLossLimit: 5, dailyLoss: 0, dailyLossLimit: 10, consecutiveLosses: 0, maxConsecutiveLosses: 3, proposedStake: 1, maxStake: 1, openExposure: 0, maxExposure: 2 });
    assert.equal(result.allowed, false);
    assert.ok(result.reasons.includes("Trading is disabled"));
  });
});
