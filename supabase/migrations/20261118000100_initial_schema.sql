-- DB-01 · Initial schema (ARQUITETURA.md §4; RN08, RNF05)
-- Rollback: supabase/rollback/20261118000100_initial_schema.down.sql

create extension if not exists pgcrypto;

-- groups ---------------------------------------------------------------
create table public.groups (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (char_length(name) between 1 and 60),
  max_value_cents  integer not null check (max_value_cents > 0),
  exchange_date    date not null,
  location         text check (location is null or char_length(location) <= 120),
  admin_token_hash text not null unique check (admin_token_hash ~ '^[0-9a-f]{64}$'),
  invite_token     text not null unique check (invite_token ~ '^[A-Za-z0-9_-]{22,}$'),
  status           text not null default 'open' check (status in ('open', 'drawn')),
  draw_version     integer not null default 0 check (draw_version >= 0),
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null,
  create_request_id uuid not null unique
);
comment on column public.groups.create_request_id is 'Client-generated UUID v4 for create-group idempotency (GRP-02); deleted with the group in the RN08 purge.';
comment on column public.groups.admin_token_hash is 'SHA-256 hex of the admin token; the raw token only exists in the link.';
comment on column public.groups.invite_token is 'Invite capability token (shared with the whole group by design, ADR-002); not personal data.';
comment on column public.groups.expires_at is 'RN08: exchange_date + 60 days, computed at start of day in America/Sao_Paulo by the app; used by the purge job (OPS-02).';
create index groups_expires_at_idx on public.groups (expires_at);

-- participants ---------------------------------------------------------
create table public.participants (
  id                uuid primary key default gen_random_uuid(),
  group_id          uuid not null references public.groups (id) on delete cascade,
  display_name      text not null check (char_length(display_name) between 1 and 60),
  access_token_hash text not null unique check (access_token_hash ~ '^[0-9a-f]{64}$'),
  joined_at         timestamptz not null default now(),
  removed_at        timestamptz
);
create index participants_group_id_idx on public.participants (group_id);
-- ids must be targetable by composite FKs (pairs must stay inside one group)
create unique index participants_group_id_id_uidx on public.participants (group_id, id);

-- wish_items -----------------------------------------------------------
create table public.wish_items (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 120),
  url            text check (url is null or (char_length(url) <= 2048 and url ~* '^https://')),
  affiliate_url  text check (affiliate_url is null or (char_length(affiliate_url) <= 2048 and affiliate_url ~* '^https://')),
  note           text check (note is null or char_length(note) <= 500),
  store          text check (store in ('amazon', 'mercadolivre')), -- null = plain link (no affiliate badge)
  created_at     timestamptz not null default now()
);
create index wish_items_participant_id_idx on public.wish_items (participant_id);

-- draws ----------------------------------------------------------------
create table public.draws (
  id             uuid primary key default gen_random_uuid(),
  group_id       uuid not null references public.groups (id) on delete cascade,
  version        integer not null check (version >= 1),
  created_at     timestamptz not null default now(),
  invalidated_at timestamptz,
  unique (group_id, version),
  unique (group_id, id)
);
-- at most one valid draw per group
create unique index draws_one_active_per_group_uidx on public.draws (group_id) where invalidated_at is null;

-- pairs ----------------------------------------------------------------
-- RN02 constraints (unique giver/receiver, giver <> receiver) are added in DB-02.
-- group_id + composite FKs guarantee draw, giver and receiver all belong to the same group.
create table public.pairs (
  group_id    uuid not null,
  draw_id     uuid not null,
  giver_id    uuid not null,
  receiver_id uuid not null,
  foreign key (group_id, draw_id)     references public.draws (group_id, id)        on delete cascade,
  foreign key (group_id, giver_id)    references public.participants (group_id, id) on delete cascade,
  foreign key (group_id, receiver_id) references public.participants (group_id, id) on delete cascade
);
create index pairs_giver_id_idx on public.pairs (giver_id);
create index pairs_receiver_id_idx on public.pairs (receiver_id);

-- events ---------------------------------------------------------------
-- Metrics and affiliate clicks. No personal data (RNF05): no participant id, name or IP.
-- ON DELETE SET NULL: the RN08 purge detaches events from the group but keeps the anonymous
-- counters (type + date) for metrics.
create table public.events (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid references public.groups (id) on delete set null,
  type       text not null check (char_length(type) between 1 and 50),
  created_at timestamptz not null default now()
);
create index events_group_id_idx on public.events (group_id);
create index events_type_created_at_idx on public.events (type, created_at);
