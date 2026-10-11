# GENEARA PAY — Supabase + Daraja STK Push starter

## Included

- `supabase/config.toml`
- `supabase/migrations/202610110001_daraja_stk_integration.sql`
- `supabase/functions/initiate-stk/index.ts`
- `supabase/functions/mpesa-callback/index.ts`
- `supabase/functions/daraja-health/index.ts`
- `supabase/functions/.env.example`

This adds a Daraja STK attempt/callback foundation alongside existing tables. It does
not replace your current `transactions`, `exchange_rates`, `pricing_config`,
`mpesa_fee_bands`, `transaction_events`, or `audit_events` tables.

## Important schema alignment

`initiate-stk` expects the existing `public.transactions` table to have:
- `id` UUID
- an owner column named `user_id`, `customer_id`, or `profile_id`
- a status column named `status` or `transaction_status`
- a KES amount column named `total_kes`, `total_amount_kes`, `amount_kes`, or `amount`

The function only accepts transactions owned by the authenticated user and in a
pending-payment state. If your schema differs, adjust those field names before
testing. Do not allow a browser to choose the payable amount: create the transaction
and quote on the server first.

## 1. Apply the migration

From your project root, install/use the Supabase CLI, then link the existing project:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

If you already have migrations in your repository, retain them and add this migration
after the existing migrations. Do not replace your project migration history with this
starter migration.

## 2. Set secrets

In Supabase Dashboard → Edge Functions → Secrets, set:

- `DARAJA_BASE_URL` — sandbox: `https://sandbox.safaricom.co.ke`
- `DARAJA_CONSUMER_KEY`
- `DARAJA_CONSUMER_SECRET`
- `DARAJA_SHORTCODE`
- `DARAJA_PASSKEY`
- `DARAJA_TRANSACTION_TYPE` — normally `CustomerPayBillOnline` for a PayBill shortcode
- `DARAJA_CALLBACK_URL` — `https://YOUR_PROJECT_REF.supabase.co/functions/v1/mpesa-callback`
- `APP_ORIGIN` — your exact customer website origin

The function also needs the Supabase environment variables automatically provided by
Supabase, including `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY`. Never expose the service role key or Daraja secrets in
HTML, GitHub, or client-side JavaScript.

For local development, copy `.env.example` to `supabase/functions/.env`, replace the
placeholders, and do not commit that file.

## 3. Deploy functions

```bash
supabase functions deploy initiate-stk
supabase functions deploy mpesa-callback --no-verify-jwt
supabase functions deploy daraja-health
```

The callback must be reachable by Safaricom without a user login, so JWT verification
is disabled for that endpoint. The callback function validates the checkout request
against a payment attempt and handles duplicate terminal callbacks, but Daraja callbacks
should be treated as untrusted input until verified against the matching request,
amount, receipt and reconciliation process.

## 4. Check configuration

Open:

`https://YOUR_PROJECT_REF.supabase.co/functions/v1/daraja-health`

The response shows only whether each required secret is present. It does not expose
the secret values.

## 5. STK request payload

Invoke `initiate-stk` with an authenticated user's Supabase session:

```json
{
  "transaction_id": "EXISTING_TRANSACTION_UUID",
  "phone_number": "2547XXXXXXXX",
  "idempotency_key": "unique-request-key-at-least-12-chars"
}
```

Send an `Idempotency-Key` header too. The function returns a pending response when
Daraja accepts the STK request. This does **not** mean the customer has paid. Payment
is confirmed only after a matching successful callback.

## Before live money

1. Test with Daraja sandbox credentials and test phone numbers.
2. Confirm the exact transaction columns/status values in your current schema.
3. Add a server-side SQL RPC to atomically transition the existing transaction to paid
   only after the callback is verified, and write `transaction_events`/`audit_events`.
4. Reconcile successful callbacks with Daraja receipts and expected amounts.
5. Add rate limiting, monitoring, callback replay handling and failed/unknown-result
   recovery.
6. Complete Safaricom production approval and any applicable cross-border payment,
   AML/KYC, and licensing requirements before accepting real funds.

A public callback URL is necessary for Daraja, but a callback is not independently
authenticated merely because it arrives at that URL. Do not expose payment data publicly.
