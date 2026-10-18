-- GENEARA QUANT production-oriented schema. Namespaced to coexist with existing project tables.
create extension if not exists pgcrypto;

create table if not exists public.gq_deriv_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deriv_subject text,
  token_ciphertext text not null,
  token_iv text not null,
  token_tag text not null,
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  status text not null default 'connected' check (status in ('connected','expired','revoked','error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, deriv_subject)
);
create index if not exists gq_deriv_connections_user_idx on public.gq_deriv_connections(user_id);

create table if not exists public.gq_deriv_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null references public.gq_deriv_connections(id) on delete cascade,
  deriv_account_id text not null,
  account_type text,
  currency text,
  display_name text,
  is_virtual boolean,
  is_selected boolean not null default false,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, deriv_account_id)
);
create index if not exists gq_deriv_accounts_user_idx on public.gq_deriv_accounts(user_id);

create table if not exists public.gq_strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.gq_deriv_accounts(id) on delete set null,
  name text not null check (length(trim(name)) between 1 and 80),
  contract_type text not null check (contract_type in ('RISE_FALL','OVER_UNDER','EVEN_ODD','MATCHES_DIFFERS','TOUCH_NO_TOUCH')),
  market_symbol text,
  duration_ticks integer not null check (duration_ticks between 1 and 10000),
  stake_mode text not null default 'fixed' check (stake_mode in ('fixed','calculated')),
  stake_amount numeric(18,8) not null check (stake_amount > 0),
  enabled boolean not null default false,
  parameters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists gq_strategies_user_idx on public.gq_strategies(user_id);

create table if not exists public.gq_risk_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  hourly_profit_mode text not null default 'amount' check (hourly_profit_mode in ('amount','percent')),
  hourly_profit_target numeric(18,8) check (hourly_profit_target is null or hourly_profit_target > 0),
  hourly_loss_limit numeric(18,8) check (hourly_loss_limit is null or hourly_loss_limit > 0),
  daily_loss_limit numeric(18,8) check (daily_loss_limit is null or daily_loss_limit > 0),
  max_consecutive_losses integer check (max_consecutive_losses is null or max_consecutive_losses > 0),
  max_open_contracts integer not null default 1 check (max_open_contracts between 1 and 100),
  cooldown_seconds integer not null default 0 check (cooldown_seconds between 0 and 86400),
  live_trading_approved boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.gq_trade_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.gq_deriv_accounts(id) on delete set null,
  strategy_id uuid references public.gq_strategies(id) on delete set null,
  idempotency_key text not null,
  status text not null default 'blocked' check (status in ('blocked','pending','submitted','open','won','lost','sold','error','cancelled')),
  contract_type text not null,
  market_symbol text,
  stake numeric(18,8) not null check (stake > 0),
  duration_ticks integer not null check (duration_ticks > 0),
  proposal_id text,
  contract_id text,
  buy_response jsonb,
  settlement jsonb,
  block_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, idempotency_key)
);
create index if not exists gq_trade_intents_user_created_idx on public.gq_trade_intents(user_id, created_at desc);

create table if not exists public.gq_risk_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  severity text not null default 'info' check (severity in ('info','warning','critical')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists gq_risk_events_user_created_idx on public.gq_risk_events(user_id, created_at desc);

create table if not exists public.gq_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  actor_type text not null check (actor_type in ('user','system','worker','admin')),
  action text not null,
  entity_type text,
  entity_id text,
  request_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists gq_audit_events_created_idx on public.gq_audit_events(created_at desc);

-- RLS: user-facing reads/writes are scoped to auth.uid(). Token columns are never
-- queried through the browser client; service-role access exists only server-side.
do $$ declare t text; begin
  foreach t in array array['gq_deriv_connections','gq_deriv_accounts','gq_strategies','gq_risk_settings','gq_trade_intents','gq_risk_events','gq_audit_events'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Connection secrets are accessible only to service-role/server code, never to authenticated browser clients.
revoke all on public.gq_deriv_connections from anon, authenticated;
grant select, insert, update, delete on public.gq_deriv_connections to service_role;

-- Account metadata and user-owned configurations.
drop policy if exists gq_accounts_select_own on public.gq_deriv_accounts;
create policy gq_accounts_select_own on public.gq_deriv_accounts for select to authenticated using (auth.uid() = user_id);
drop policy if exists gq_accounts_modify_own on public.gq_deriv_accounts;
create policy gq_accounts_modify_own on public.gq_deriv_accounts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists gq_strategies_all_own on public.gq_strategies;
create policy gq_strategies_all_own on public.gq_strategies for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists gq_risk_settings_all_own on public.gq_risk_settings;
create policy gq_risk_settings_all_own on public.gq_risk_settings for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists gq_trade_intents_select_own on public.gq_trade_intents;
create policy gq_trade_intents_select_own on public.gq_trade_intents for select to authenticated using (auth.uid() = user_id);
drop policy if exists gq_risk_events_select_own on public.gq_risk_events;
create policy gq_risk_events_select_own on public.gq_risk_events for select to authenticated using (auth.uid() = user_id);
drop policy if exists gq_audit_events_select_own on public.gq_audit_events;
create policy gq_audit_events_select_own on public.gq_audit_events for select to authenticated using (auth.uid() = user_id);

-- Do not grant client inserts/updates to audit logs or trade intents. Server-only service-role writes.
revoke insert, update, delete on public.gq_trade_intents from anon, authenticated;
revoke insert, update, delete on public.gq_risk_events from anon, authenticated;
revoke insert, update, delete on public.gq_audit_events from anon, authenticated;
grant all on public.gq_deriv_accounts, public.gq_strategies, public.gq_risk_settings, public.gq_trade_intents, public.gq_risk_events, public.gq_audit_events to service_role;
