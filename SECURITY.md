# Security model and known gaps

- Deriv OAuth callback validates state against an HTTP-only, short-lived cookie and binds the attempt to the current Supabase user. PKCE is used.
- Deriv tokens are AES-256-GCM encrypted with a server-only key before database persistence. Tokens are never returned to browser routes.
- User-owned configuration tables use RLS. Connection secrets are revoked from `anon` and `authenticated`; only server-side service role may access them.
- The service-role key bypasses RLS. Every service-role query must include a user_id predicate and must follow authentication.
- Access token refresh, OAuth disconnect/revocation, token-key rotation, cross-region recovery and incident response still need implementation before production launch.
- `gq_deriv_accounts` stores metadata only. Verify Deriv API response schema and pagination against your registered app before production.
- The OAuth scope is deliberately least-privilege-ish and must be reviewed against the exact APIs used.
- This release does not send orders. `/api/trading` always returns HTTP 423 and worker `canExecuteOrder()` always returns false.
- Do not set any environment flag expecting to unlock execution; implementation must be reviewed and changed explicitly in a later release.
