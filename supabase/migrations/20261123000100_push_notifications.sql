-- DB-APP-01 · Push registrations and idempotent reminders.
-- Rollback: supabase/rollback/20261123000100_push_notifications.down.sql

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  credential_hash text not null check (credential_hash ~ '^[0-9a-f]{64}$'),
  role text not null check (role in ('participant', 'organizer')),
  platform text not null check (platform in ('ios', 'android')),
  expo_push_token text not null check (
    char_length(expo_push_token) <= 200
    and expo_push_token ~ '^Expo(nent)?PushToken\[[A-Za-z0-9_-]+\]$'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (credential_hash, expo_push_token)
);
create index push_tokens_group_id_idx on public.push_tokens (group_id);

create table public.push_reminders_sent (
  group_id uuid not null references public.groups (id) on delete cascade,
  reminder_date date not null,
  sent_at timestamptz not null default now(),
  primary key (group_id, reminder_date)
);

alter table public.push_tokens enable row level security;
alter table public.push_tokens force row level security;
alter table public.push_reminders_sent enable row level security;
alter table public.push_reminders_sent force row level security;

revoke all on public.push_tokens, public.push_reminders_sent
  from public, anon, authenticated, service_role;
grant select, insert, update, delete on public.push_tokens, public.push_reminders_sent
  to service_role;

create function public.register_push_token(
  p_group_id uuid,
  p_credential_hash text,
  p_role text,
  p_platform text,
  p_expo_push_token text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  registered_id uuid;
  registered_at timestamptz;
begin
  -- Lock the same rows modified by rotation or removal before writing a token.
  perform 1 from public.groups g
  where g.id = p_group_id and g.expires_at > clock_timestamp()
    and (p_role = 'participant' or (p_role = 'organizer' and g.admin_token_hash = p_credential_hash))
  for share;
  if not found then
    raise exception using errcode = 'P0001', message = 'INVALID_LINK';
  end if;

  if p_role = 'participant' then
    perform 1 from public.participants p
    where p.group_id = p_group_id and p.access_token_hash = p_credential_hash and p.removed_at is null
    for share;
    if not found then
      raise exception using errcode = 'P0001', message = 'INVALID_LINK';
    end if;
  end if;

  -- Both RPCs serialize changes to the same credential, even before its first row exists.
  perform pg_advisory_xact_lock(hashtextextended(p_credential_hash, 0));
  registered_at := clock_timestamp();

  insert into public.push_tokens (
    group_id, credential_hash, role, platform, expo_push_token, created_at, updated_at
  )
  values (
    p_group_id, p_credential_hash, p_role, p_platform, p_expo_push_token,
    registered_at, registered_at
  )
  on conflict (credential_hash, expo_push_token) do update
    set group_id = excluded.group_id,
        role = excluded.role,
        platform = excluded.platform,
        updated_at = excluded.updated_at
  returning id into registered_id;

  delete from public.push_tokens
  where id in (
    select id
    from public.push_tokens
    where credential_hash = p_credential_hash
    order by (id = registered_id) desc, updated_at desc, created_at desc, id desc
    offset 5
  );

  return true;
end;
$$;

create function public.unregister_push_tokens(
  p_credential_hash text,
  p_expo_push_token text default null
)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  removed_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_credential_hash, 0));

  delete from public.push_tokens
  where credential_hash = p_credential_hash
    and (p_expo_push_token is null or expo_push_token = p_expo_push_token);

  get diagnostics removed_count = row_count;
  return removed_count;
end;
$$;

revoke all on function public.register_push_token(uuid, text, text, text, text),
  public.unregister_push_tokens(text, text) from public, anon, authenticated, service_role;
grant execute on function public.register_push_token(uuid, text, text, text, text),
  public.unregister_push_tokens(text, text) to service_role;

create function public.revoke_participant_push_tokens()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
begin
  delete from public.push_tokens
  where group_id = old.group_id and role = 'participant' and credential_hash = old.access_token_hash;
  return null;
end;
$$;

create function public.revoke_organizer_push_tokens()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
begin
  delete from public.push_tokens
  where group_id = old.id and role = 'organizer' and credential_hash = old.admin_token_hash;
  return null;
end;
$$;

create trigger participants_revoke_push_tokens
  after update of removed_at, access_token_hash on public.participants
  for each row
  when (old.access_token_hash is distinct from new.access_token_hash
    or (old.removed_at is null and new.removed_at is not null))
  execute function public.revoke_participant_push_tokens();

create trigger groups_revoke_push_tokens
  after update of admin_token_hash on public.groups
  for each row when (old.admin_token_hash is distinct from new.admin_token_hash)
  execute function public.revoke_organizer_push_tokens();

revoke all on function public.revoke_participant_push_tokens(), public.revoke_organizer_push_tokens()
  from public, anon, authenticated, service_role;
