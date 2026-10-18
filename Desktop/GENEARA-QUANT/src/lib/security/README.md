Security implementation checklist:
- Encrypt Deriv tokens at rest using a vetted key-management approach.
- Never send provider tokens or privileged keys to the browser.
- Implement CSRF/state and PKCE validation for OAuth.
- Use strict per-user authorization and database RLS.
- Add rate limits and audit logs to sensitive endpoints.
- Keep live execution disabled until these are verified.
