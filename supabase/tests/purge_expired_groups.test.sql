-- OPS-02 tests: purge_expired_groups (RN08, RNF05)
-- Run with: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/purge_expired_groups.test.sql
-- Runs in a transaction that is rolled back. Any failed check raises an exception.
set plpgsql.check_asserts = on;
begin;

do $$
declare
  expired_gid uuid;
  active_gid  uuid;
  expired_pid uuid;
  active_pid  uuid;
  expired_ev_id uuid;
  active_ev_id  uuid;
  purged_count integer;
  n integer;
begin
  -- 1. Setup: create expired group (expires_at in the past)
  insert into public.groups (
    name, max_value_cents, exchange_date, location, invite_token, admin_token_hash, expires_at, create_request_id
  ) values (
    'Grupo Vencido',
    5000,
    current_date - 70,
    'Online',
    'invite_expired_0123456789',
    repeat('1', 64),
    now() - interval '10 days',
    gen_random_uuid()
  ) returning id into expired_gid;

  -- Add participant to expired group
  insert into public.participants (
    group_id, display_name, access_token_hash
  ) values (
    expired_gid, 'Participante Vencido', repeat('2', 64)
  ) returning id into expired_pid;

  -- Add wish item for participant in expired group
  insert into public.wish_items (
    participant_id, title
  ) values (
    expired_pid, 'Livro'
  );

  -- Add event linked to expired group
  insert into public.events (
    group_id, type
  ) values (
    expired_gid, 'group_created'
  ) returning id into expired_ev_id;

  -- 2. Setup: create active group (expires_at in the future)
  insert into public.groups (
    name, max_value_cents, exchange_date, location, invite_token, admin_token_hash, expires_at, create_request_id
  ) values (
    'Grupo Ativo',
    6000,
    current_date + 10,
    'Sala 1',
    'invite_active_01234567890',
    repeat('3', 64),
    now() + interval '70 days',
    gen_random_uuid()
  ) returning id into active_gid;

  -- Add participant to active group
  insert into public.participants (
    group_id, display_name, access_token_hash
  ) values (
    active_gid, 'Participante Ativo', repeat('4', 64)
  ) returning id into active_pid;

  -- Add event linked to active group
  insert into public.events (
    group_id, type
  ) values (
    active_gid, 'group_created'
  ) returning id into active_ev_id;

  -- 3. Execute purge
  select public.purge_expired_groups() into purged_count;

  -- 4. Verify outcomes
  assert purged_count = 1, format('expected 1 purged group, got %s', purged_count);

  -- Expired group must be deleted
  select count(*) into n from public.groups where id = expired_gid;
  assert n = 0, 'expired group was not deleted';

  -- Participants of expired group must be deleted (cascade)
  select count(*) into n from public.participants where group_id = expired_gid;
  assert n = 0, 'participants of expired group were not cascaded';

  -- Wish items of expired group participants must be deleted (cascade)
  select count(*) into n from public.wish_items where participant_id = expired_pid;
  assert n = 0, 'wish items of expired group were not cascaded';

  -- Event of expired group must still exist, but group_id must be NULL (ON DELETE SET NULL)
  select count(*) into n from public.events where id = expired_ev_id and group_id is null;
  assert n = 1, 'event of expired group did not have group_id set to null';

  -- Active group must still exist
  select count(*) into n from public.groups where id = active_gid;
  assert n = 1, 'active group was mistakenly deleted';

  -- Participant of active group must still exist
  select count(*) into n from public.participants where id = active_pid;
  assert n = 1, 'active group participant was mistakenly deleted';

  -- Event of active group must still exist with its group_id intact
  select count(*) into n from public.events where id = active_ev_id and group_id = active_gid;
  assert n = 1, 'active group event was mistakenly modified';

  -- Running purge again when no expired groups remain must return 0
  select public.purge_expired_groups() into purged_count;
  assert purged_count = 0, format('expected 0 purged groups on second run, got %s', purged_count);
end $$;

rollback;
