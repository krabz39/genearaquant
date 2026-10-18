import { randomBytes } from 'node:crypto';
import { pkceChallenge } from './crypto';

export const DERIV_AUTH_URL = 'https://auth.deriv.com/oauth2/auth';
export const DERIV_TOKEN_URL = 'https://auth.deriv.com/oauth2/token';
export function oauthConfig() {
  const clientId = process.env.DERIV_CLIENT_ID;
  const redirectUri = process.env.DERIV_REDIRECT_URI;
  if (!clientId || !redirectUri) throw new Error('Deriv OAuth is not configured');
  return { clientId, redirectUri };
}
export function createOAuthAttempt() {
  const { clientId, redirectUri } = oauthConfig();
  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(48).toString('base64url');
  const url = new URL(DERIV_AUTH_URL);
  url.searchParams.set('response_type','code');
  url.searchParams.set('client_id',clientId);
  url.searchParams.set('redirect_uri',redirectUri);
  url.searchParams.set('scope','trade');
  url.searchParams.set('state',state);
  url.searchParams.set('code_challenge',pkceChallenge(verifier));
  url.searchParams.set('code_challenge_method','S256');
  return { state, verifier, url: url.toString() };
}
export async function exchangeCode(code: string, verifier: string) {
  const { clientId, redirectUri } = oauthConfig();
  // Follow Deriv's documented authorization-code + PKCE exchange. Keep this request server-side.
  const body = new URLSearchParams({ grant_type:'authorization_code', client_id:clientId, code, code_verifier:verifier, redirect_uri:redirectUri });
  const response = await fetch(DERIV_TOKEN_URL, { method:'POST', headers:{'content-type':'application/x-www-form-urlencoded','accept':'application/json'}, body, cache:'no-store', signal: AbortSignal.timeout(15000) });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Deriv token exchange failed (${response.status})`);
  if (!payload || typeof payload !== 'object' || !('access_token' in payload) || typeof payload.access_token !== 'string') throw new Error('Deriv returned an invalid token response');
  return payload as { access_token:string; expires_in?:number; token_type?:string; scope?:string; refresh_token?:string; [key:string]:unknown };
}
