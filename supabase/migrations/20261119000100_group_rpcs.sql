-- DB-04 · Transactional RPCs for create-group (idempotent) and join-group (RF01, RF03, RN04, RN07, RN09)
-- Called by the server with the service role via `rpc`. Business errors use errcode P0001 and a stable
-- message code that the adapters translate: IDEMPOTENCY_CONFLICT, INVALID_LINK, GROUP_CLOSED, GROUP_FULL, INVALID_NAME.
-- Rollback: supabase/rollback/20261119000100_group_rpcs.down.sql

-- create_group_once ---------------------------------------------------------
create or replace function public.create_group_once(
  p_request_id       uuid,
  p_name             text,
  p_max_value_cents  integer,
  p_exchange_date    date,
  p_location         text,
  p_invite_token     text,
  p_admin_token_hash text,
  p_expires_at       timestamptz
)
returns table (group_id uuid, invite_token text, was_replay boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
#variable_conflict use_column
declare
  v_group public.groups%rowtype;
  v_rows  integer;
begin
  insert into public.groups as g
    (name, max_value_cents, exchange_date, location, invite_token, admin_token_hash, expires_at, create_request_id)
  values
    (p_name, p_max_value_cents, p_exchange_date, p_location, p_invite_token, p_admin_token_hash, p_expires_at, p_request_id)
  on conflict (create_request_id) do nothing
  returning g.* into v_group;
  get diagnostics v_rows = row_count;

  if v_rows = 1 then
    insert into public.events (group_id, type) values (v_group.id, 'group_created');
    return query select v_group.id, v_group.invite_token, false;
    return;
  end if;

  -- Repeated requestId: lock the existing group row (also serializes concurrent retries).
  select g.* into v_group from public.groups g where g.create_request_id = p_request_id for update;

  if not found
     or v_group.created_at < now() - interval '15 minutes'
     or v_group.status <> 'open'
     or v_group.name <> p_name
     or v_group.max_value_cents <> p_max_value_cents
     or v_group.exchange_date <> p_exchange_date
     or v_group.location is distinct from p_location
     or exists (select 1 from public.participants p where p.group_id = v_group.id)
  then
    raise exception using errcode = 'P0001', message = 'IDEMPOTENCY_CONFLICT';
  end if;

  -- Same request, same data, nothing happened yet: rotate the admin token and return the same group.
  update public.groups g set admin_token_hash = p_admin_token_hash where g.id = v_group.id;
  return query select v_group.id, v_group.invite_token, true;
end;
$$;

-- join_group ----------------------------------------------------------------
create or replace function public.join_group(
  p_invite_token      text,
  p_display_name      text,
  p_access_token_hash text
)
returns table (participant_id uuid, display_name text, group_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
#variable_conflict use_column
declare
  v_group     public.groups%rowtype;
  v_base      text := btrim(p_display_name);
  v_candidate text;
  v_n         integer := 1;
  v_id        uuid;
begin
  if v_base is null or char_length(v_base) not between 1 and 40 then
    raise exception using errcode = 'P0001', message = 'INVALID_NAME';
  end if;

  select g.* into v_group from public.groups g where g.invite_token = p_invite_token for update;

  if not found or v_group.expires_at <= now() then
    raise exception using errcode = 'P0001', message = 'INVALID_LINK';
  end if;
  if v_group.status <> 'open' then
    raise exception using errcode = 'P0001', message = 'GROUP_CLOSED';
  end if;
  if (select count(*) from public.participants p where p.group_id = v_group.id and p.removed_at is null) >= 100 then
    raise exception using errcode = 'P0001', message = 'GROUP_FULL';
  end if;

  -- RN07: case-insensitive suffix ("Ana", "Ana 2", ...), removed participants do not count.
  v_candidate := v_base;
  while exists (
    select 1 from public.participants p
     where p.group_id = v_group.id and p.removed_at is null and lower(p.display_name) = lower(v_candidate)
  ) loop
    v_n := v_n + 1;
    v_candidate := v_base || ' ' || v_n;
  end loop;

  insert into public.participants (group_id, display_name, access_token_hash)
  values (v_group.id, v_candidate, p_access_token_hash)
  returning id into v_id;

  insert into public.events (group_id, type) values (v_group.id, 'participant_joined');

  return query select v_id, v_candidate, v_group.id, v_group.expires_at;
end;
$$;

-- Only the server (service role) may call them.
revoke execute on function public.create_group_once(uuid, text, integer, date, text, text, text, timestamptz)
  from public, anon, authenticated;
revoke execute on function public.join_group(text, text, text) from public, anon, authenticated;
grant execute on function public.create_group_once(uuid, text, integer, date, text, text, text, timestamptz) to service_role;
grant execute on function public.join_group(text, text, text) to service_role;
