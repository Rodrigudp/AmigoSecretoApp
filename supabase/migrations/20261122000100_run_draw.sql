-- SRT-02 · Transactional RPC run_draw (RF08, RN01-RN04) + removal guard after the draw
-- Called by the server with the service role via `rpc`. Contract: docs/arquitetura/rpc-run-draw.md.
-- Business errors use errcode P0001 and a stable message code: INVALID_LINK, NOT_ENOUGH_PARTICIPANTS,
-- DRAW_MEMBERS_CHANGED, DRAW_NOT_READY, INVALID_INPUT (and GROUP_CLOSED from the removal trigger).
-- The pairs come from the domain (drawPairs, ADR-003) as two parallel arrays; the RPC validates and writes.
-- It never returns pairs.
-- Rollback: supabase/rollback/20261122000100_run_draw.down.sql

create or replace function public.run_draw(
  p_group_id         uuid,
  p_admin_token_hash text,
  p_expected_version integer,
  p_givers           uuid[],
  p_receivers        uuid[]
)
returns table (draw_version integer, status text, drawn_at timestamptz, was_replay boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
#variable_conflict use_column
declare
  v_group   public.groups%rowtype;
  v_active  uuid[];
  v_count   integer;
  v_version integer;
  v_draw_id uuid;
  v_at      timestamptz;
begin
  if p_group_id is null or p_admin_token_hash is null
     or p_expected_version is null or p_expected_version < 0
     or p_givers is null or p_receivers is null
     or cardinality(p_givers) <> cardinality(p_receivers)
     or cardinality(p_givers) > 100
  then
    raise exception using errcode = 'P0001', message = 'INVALID_INPUT';
  end if;

  -- Serialize with join_group, with other run_draw calls and with the removal trigger.
  select g.* into v_group
    from public.groups g
   where g.id = p_group_id and g.admin_token_hash = p_admin_token_hash
     for update;
  if not found or v_group.expires_at <= now() then
    raise exception using errcode = 'P0001', message = 'INVALID_LINK';
  end if;

  -- Same operation repeated (double click, lost response): return the persisted draw, write nothing.
  if v_group.draw_version = p_expected_version + 1 then
    select d.created_at into v_at
      from public.draws d
     where d.group_id = v_group.id and d.invalidated_at is null;
    if not found then
      raise exception using errcode = 'P0001', message = 'DRAW_NOT_READY';
    end if;
    return query select v_group.draw_version, 'drawn'::text, v_at, true;
    return;
  end if;
  if v_group.draw_version <> p_expected_version then
    raise exception using errcode = 'P0001', message = 'DRAW_NOT_READY';
  end if;

  select coalesce(array_agg(p.id order by p.id), '{}'::uuid[]) into v_active
    from public.participants p
   where p.group_id = v_group.id and p.removed_at is null;
  v_count := cardinality(v_active);
  if v_count < 3 then
    raise exception using errcode = 'P0001', message = 'NOT_ENOUGH_PARTICIPANTS';
  end if;

  -- Shape of the pairs: no nulls, no repeats, nobody draws themselves, givers = receivers.
  if exists (select 1 from unnest(p_givers) x where x is null)
     or exists (select 1 from unnest(p_receivers) x where x is null)
     or (select count(distinct x) from unnest(p_givers) x) <> cardinality(p_givers)
     or (select count(distinct x) from unnest(p_receivers) x) <> cardinality(p_receivers)
     or exists (select 1 from unnest(p_givers, p_receivers) as t(g, r) where t.g = t.r)
     or (select array_agg(x order by x) from unnest(p_givers) x)
        is distinct from (select array_agg(x order by x) from unnest(p_receivers) x)
  then
    raise exception using errcode = 'P0001', message = 'INVALID_INPUT';
  end if;

  -- The group changed between the read and the commit: the app rereads, recalculates and retries.
  if (select array_agg(x order by x) from unnest(p_givers) x) is distinct from v_active then
    raise exception using errcode = 'P0001', message = 'DRAW_MEMBERS_CHANGED';
  end if;

  update public.draws d set invalidated_at = now()
   where d.group_id = v_group.id and d.invalidated_at is null;

  v_version := v_group.draw_version + 1;
  insert into public.draws (group_id, version) values (v_group.id, v_version)
  returning id, created_at into v_draw_id, v_at;

  insert into public.pairs (group_id, draw_id, giver_id, receiver_id)
  select v_group.id, v_draw_id, t.g, t.r
    from unnest(p_givers, p_receivers) as t(g, r);

  update public.groups g set status = 'drawn', draw_version = v_version where g.id = v_group.id;

  insert into public.events (group_id, type) values (v_group.id, 'draw_performed');

  return query select v_version, 'drawn'::text, v_at, false;
end;
$$;

revoke execute on function public.run_draw(uuid, text, integer, uuid[], uuid[]) from public, anon, authenticated;
grant execute on function public.run_draw(uuid, text, integer, uuid[], uuid[]) to service_role;

-- Removal guard: a participant cannot be removed once the group is drawn (their pair would dangle).
-- Takes the group row FOR SHARE, so it serializes with run_draw (FOR UPDATE) and closes the window
-- between the status check and the update in the app (BE-03 review note).
create or replace function public.forbid_remove_after_draw()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
begin
  if new.removed_at is not null and old.removed_at is null then
    select g.status into v_status from public.groups g where g.id = new.group_id for share;
    if v_status is distinct from 'open' then
      raise exception using errcode = 'P0001', message = 'GROUP_CLOSED';
    end if;
  end if;
  return new;
end;
$$;

create trigger participants_no_remove_after_draw
  before update of removed_at on public.participants
  for each row execute function public.forbid_remove_after_draw();

revoke all on function public.forbid_remove_after_draw() from public, anon, authenticated;
