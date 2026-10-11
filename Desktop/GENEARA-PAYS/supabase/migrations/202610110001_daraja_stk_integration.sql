-- GENEARA PAY: Daraja STK Push integration foundation.
-- This migration adds payment-attempt/callback storage without replacing
-- existing GENEARA PAY tables. It deliberately does not assume the full
-- column layout of the existing public.transactions table.

create extension if not exists pgcrypto;

create table if not exists public.mpesa_stk_payments (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null,
  merchant_request_id text,
  checkout_request_id text unique,
  phone_number text not null,
  amount_kes numeric(14,2) not null check (amount_kes > 0),
  account_reference text not null,
  transaction_desc text not null default 'GENEARA PAY transfer',
  status text not null default 'initiating'
    check (status in (
      'initiating','pending','paid','failed','cancelled','unknown'
    )),
  result_code text,
  result_description text,
  mpesa_receipt_number text,
  transaction_date text,
  callback_payload jsonb,
  idempotency_key text not null unique,
  initiated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists mpesa_stk_payments_transaction_id_idx
  on public.mpesa_stk_payments(transaction_id);
create index if not exists mpesa_stk_payments_status_created_idx
  on public.mpesa_stk_payments(status, created_at desc);

create table if not exists public.mpesa_callback_events (
  id uuid primary key default gen_random_uuid(),
  checkout_request_id text,
  merchant_request_id text,
  event_type text not null default 'stk_callback',
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed boolean not null default false,
  processing_error text
);

create index if not exists mpesa_callback_events_checkout_idx
  on public.mpesa_callback_events(checkout_request_id);

alter table public.mpesa_stk_payments enable row level security;
alter table public.mpesa_callback_events enable row level security;

-- No public policies are created: only trusted server-side Edge Functions
-- using the Supabase secret/service key can read/write these tables.
revoke all on public.mpesa_stk_payments from anon, authenticated;
revoke all on public.mpesa_callback_events from anon, authenticated;

create or replace function public.set_mpesa_stk_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_mpesa_stk_updated_at on public.mpesa_stk_payments;
create trigger trg_mpesa_stk_updated_at
before update on public.mpesa_stk_payments
for each row execute function public.set_mpesa_stk_updated_at();
