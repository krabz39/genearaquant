const API_BASE = 'https://api.derivws.com';
export async function derivGet<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { headers: { authorization: `Bearer ${token}`, accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Deriv API request failed (${response.status})`);
  return body as T;
}
