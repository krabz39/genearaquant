import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';

function key() {
  const raw = process.env.DERIV_TOKEN_ENCRYPTION_KEY;
  if (!raw || !/^[a-fA-F0-9]{64}$/.test(raw)) throw new Error('DERIV_TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as 64 hex characters');
  return Buffer.from(raw, 'hex');
}
export function encryptToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return { ciphertext: ciphertext.toString('base64'), iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64') };
}
export function decryptToken(input: { ciphertext: string; iv: string; tag: string }) {
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(input.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(input.tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(input.ciphertext, 'base64')), decipher.final()]).toString('utf8');
}
export function pkceChallenge(verifier: string) { return createHash('sha256').update(verifier).digest('base64url'); }
