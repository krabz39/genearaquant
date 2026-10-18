# GENEARA QUANT — production-oriented foundation

**This repository is not certified or ready for unattended live trading.** It is a secure-by-default implementation foundation. Live order execution is hard-disabled in this release. A successful build does not mean broker access, OAuth registration, database deployment, risk controls, or live trading have been verified.

## Included

- Next.js App Router + TypeScript, premium Cocoa Noir / Amber Lux identity.
- Supabase cookie-based sessions, server-side auth checks, RLS-owned tables.
- Deriv OAuth 2.0 authorization-code flow with PKCE, state verification, server-side token exchange, AES-256-GCM token encryption.
- Server-side account discovery through Deriv's current REST API.
- Database-backed strategy and risk configuration with no seed/demo records.
- Persistent worker scaffold, safety gate and documented execution/reconciliation requirements.
- Unit tests for encryption, risk validation, and the live-trading kill switch.

## Requirements

- Node.js 22 LTS recommended; npm.
- Your existing Supabase project and permission to apply SQL migrations.
- A Deriv OAuth application registered at https://developers.deriv.com/.
- A persistent worker host (not a Vercel function) for continuous WebSocket tasks.

## 1. Configure Supabase

1. Open your existing project and verify it is the intended project before changing its schema.
2. Back up the database.
3. Apply `supabase/migrations/0001_production_schema.sql` in the Supabase SQL Editor or through your established migration workflow.
4. Do **not** run `seed.sql`; there are no seeded users, balances, trades, strategies, or risk settings.
5. Confirm RLS is enabled and policies are active. Never expose the service-role key to the browser.

The migration creates namespaced `gq_*` tables so it does not overwrite your existing project tables. Review it with your team before applying to a shared/production database.

## 2. Configure local environment

```bash
cp .env.example .env.local
npm install
npm run typecheck
npm test
npm run dev
```

Populate all values with real credentials. `DERIV_TOKEN_ENCRYPTION_KEY` must be 64 hex characters (32 random bytes). Generate it with `openssl rand -hex 32`. Do not commit `.env.local` or paste credentials into chats/issues.

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from Supabase Project Settings. `SUPABASE_SERVICE_ROLE_KEY` is server-only. The service role bypasses RLS; use it only in narrowly scoped server routes after authenticating and authorizing the user.

## 3. Configure Deriv OAuth

1. Register an OAuth app at https://developers.deriv.com/ and copy the registered OAuth client ID.
2. Add the exact callback URL to the registered redirect URLs. Local: `http://localhost:3000/api/deriv/callback`. Production: `https://YOUR_DOMAIN/api/deriv/callback`.
3. Set `DERIV_CLIENT_ID`, `DERIV_REDIRECT_URI`, `APP_BASE_URL`.
4. Use only scopes actually required by the features you enable. This foundation requests `trade` for account trading workflows; adjust to least privilege after verifying Deriv's current OAuth scope requirements.
5. Sign into GENEARA QUANT using Supabase Auth, then select **Connect Deriv**. State and PKCE verifier are stored in secure, HTTP-only cookies; callback verifies state before exchanging the one-time code.

Official docs: https://developers.deriv.com/docs/intro/oauth/ and https://developers.deriv.com/docs/workflows/ . Confirm endpoint and scope behavior in Deriv's current docs before launch.

## 4. Vercel deployment

- Import the repository into Vercel.
- Add all environment variables from `.env.example` in Vercel project settings (never add `DATABASE_URL` unless needed by a server-only feature; worker gets its own copy).
- Set `APP_BASE_URL` to the canonical HTTPS domain and `DERIV_REDIRECT_URI` to `https://YOUR_DOMAIN/api/deriv/callback`.
- Register that exact URI in the Deriv OAuth dashboard.
- Redeploy after changing variables.
- Add a custom-domain HTTPS check and verify Supabase Auth redirect settings.

Vercel is for request/response web endpoints. Do not run a permanent WebSocket market loop inside serverless routes.

## 5. Worker deployment

`worker/` is intentionally a separate process. Deploy to a persistent container/VM service with process supervision, restricted network access, secret injection, logs, and restart policy. Install its own dependencies from `worker/package.json`.

The worker currently runs a health/safety loop only; it does not place orders. Before implementing/activating execution, add and test: per-user authenticated worker leases, Deriv OTP/authenticated WebSocket connection lifecycle, subscription restore, proposal validation, idempotent buy intents, broker response persistence, open-contract reconciliation after restart, kill-switch enforcement immediately before every order, and duplicate/replay protection. Keep `LIVE_TRADING_ENABLED=false` until those gates are signed off.

## 6. Production readiness gates

- [ ] Existing Supabase project backed up; migration reviewed and applied.
- [ ] Supabase Auth email/redirect settings verified; signup/signin and signout tested.
- [ ] RLS tests prove one user cannot read/write another user's rows.
- [ ] Deriv OAuth tested with a separate test user; state mismatch and denied consent fail safely.
- [ ] Token encryption key rotation and revocation procedure documented.
- [ ] Account API verified against real authorized Deriv accounts; no account data is fabricated.
- [ ] Demo-only end-to-end proposal/buy/settlement/recovery tests completed.
- [ ] Risk limits tested for concurrency, timezone boundaries, partial failures and reconnects.
- [ ] Monitoring, alerting, backups, retention and incident response established.
- [ ] Legal, broker terms, and jurisdictional obligations reviewed.
- [ ] Independent security review and explicit go-live approval.

## API routes

- `GET /api/deriv/connect` — starts OAuth for authenticated app users.
- `GET /api/deriv/callback` — validates state, exchanges code server-side, encrypts token and stores the connection.
- `GET /api/deriv/accounts` — requests current account list from Deriv and persists metadata; never returns tokens.
- `GET/POST /api/strategies` — authenticated user's strategy settings.
- `GET/PUT /api/risk` — authenticated user's risk settings.
- `GET /api/health` — non-sensitive application status.

## Important limits

This repository is a production-oriented foundation, not a claim of completed production integration. Deriv's account APIs and WebSocket trade messages evolve; verify against the current official docs and sandbox/demo account before enabling any execution. The trade endpoint intentionally returns `423 Locked` even if a client attempts to submit an order. No API route in this version sends a buy order.
