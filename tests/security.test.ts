import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptToken, decryptToken, pkceChallenge } from '../src/lib/deriv/crypto';
test('token encryption round-trips without storing plaintext',()=>{process.env.DERIV_TOKEN_ENCRYPTION_KEY='0123456789abcdef'.repeat(4);const token='sample-token-never-used-for-production';const encrypted=encryptToken(token);assert.notEqual(encrypted.ciphertext,Buffer.from(token).toString('base64'));assert.equal(decryptToken(encrypted),token);});
test('PKCE challenge is stable and URL safe',()=>{const challenge=pkceChallenge('verifier-sample');assert.match(challenge,/^[A-Za-z0-9_-]+$/);assert.equal(challenge,pkceChallenge('verifier-sample'));});
