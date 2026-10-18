import test from 'node:test'; import assert from 'node:assert/strict';
test('live order API remains locked',async()=>{const {POST}=await import('../src/app/api/trading/route');const response=await POST();assert.equal(response.status,423);const body=await response.json();assert.equal(body.error,'trading_locked');});
