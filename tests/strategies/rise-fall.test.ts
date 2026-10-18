import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyseRiseFall } from "../../src/server/strategies/rise-fall";

describe("analyseRiseFall", () => {
  it("does not produce a signal with insufficient ticks", () => {
    const result = analyseRiseFall([{ epoch: 1, quote: 100 }, { epoch: 2, quote: 101 }], 8);
    assert.equal(result.eligible, false);
  });
});
