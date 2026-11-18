-- OPS-02 tests: purge_expired_groups (RN08, RNF05)
-- Run with: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/purge_expired_groups.test.sql
-- Runs in a transaction that is rolled back. Any failed check raises an exception.
set plpgsql.check_asserts = on;
begin;

-- 1. Verify pg_cron job schedule
do $$
begin
  assert exists (
    select 1 from cron.job
    where jobname = 'purge-expired-groups'
      and schedule = '0 6 * * *'
  ), 'cron.job does not contain purge-expired-groups scheduled at 0 6 * * *';
end $$;

-- 2. Verify privileges (anon/authenticated must fail; service_role succeeds)
do $$
declare
  failed boolean;
begin
  set local role anon;
  failed := false;
  begin
    perform public.purge_expired_groups();
  exception when insufficient_privilege then
    failed := true;
  end;
  assert failed, 'anon must not execute purge_expired_groups';
  reset role;

  set local role authenticated;
  failed := false;
  begin
    perform public.purge_expired_groups();
  exception when insufficient_privilege then
    failed := true;
  end;
  assert failed, 'authenticated must not execute purge_expired_groups';
  reset role;
end $$;

-- 3. Test functional behavior & cascade
do $$
declare
  expired_open_gid  uuid;
  expired_drawn_gid uuid;
  active_gid        uuid;

  expired_open_pid  uuid;
  drawn_p1          uuid;
  drawn_p2          uuid;
  active_pid        uuid;

  drawn_draw_id     uuid;

  expired_ev_id     uuid;
  active_ev_id      uuid;

  purged_count      integer;
  n                 integer;
begin
  -- Setup A: expired group in 'open' status
  insert into public.groups (
    name, max_value_cents, exchange_date, location, invite_token, admin_token_hash, status, expires_at, create_request_id
  ) values (
    'Grupo Aberto Vencido',
    5000,
    current_date - 70,
    'Online',
    'invite_exp_open_012345678',
    repeat('1', 64),
    'open',
    now() - interval '10 days',
    gen_random_uuid()
  ) returning id into expired_open_gid;

  insert into public.participants (
    group_id, display_name, access_token_hash
  ) values (
    expired_open_gid, 'Participante Aberto Vencido', repeat('2', 64)
  ) returning id into expired_open_pid;

  insert into public.wish_items (
    participant_id, title
  ) values (
    expired_open_pid, 'Livro de Ficção'
  );

  insert into public.events (
    group_id, type
  ) values (
    expired_open_gid, 'group_created'
  ) returning id into expired_ev_id;

  -- Setup B: expired group in 'drawn' status with draws and pairs
  insert into public.groups (
    name, max_value_cents, exchange_date, location, invite_token, admin_token_hash, status, draw_version, expires_at, create_request_id
  ) values (
    'Grupo Sorteado Vencido',
    7500,
    current_date - 65,
    'Clube',
    'invite_exp_draw_012345678',
    repeat('3', 64),
    'drawn',
    1,
    now() - interval '5 days',
    gen_random_uuid()
  ) returning id into expired_drawn_gid;

  insert into public.participants (
    group_id, display_name, access_token_hash
  ) values (
    expired_drawn_gid, 'Sorteado 1', repeat('4', 64)
  ) returning id into drawn_p1;

  insert into public.participants (
    group_id, display_name, access_token_hash
  ) values (
    expired_drawn_gid, 'Sorteado 2', repeat('5', 64)
  ) returning id into drawn_p2;

  insert into public.draws (
    group_id, version
  ) values (
    expired_drawn_gid, 1
  ) returning id into drawn_draw_id;

  insert into public.pairs (
    group_id, draw_id, giver_id, receiver_id
  ) values
    (expired_drawn_gid, drawn_draw_id, drawn_p1, drawn_p2),
    (expired_drawn_gid, drawn_draw_id, drawn_p2, drawn_p1);

  -- Setup C: active group (expires_at in the future)
  insert into public.groups (
    name, max_value_cents, exchange_date, location, invite_token, admin_token_hash, status, expires_at, create_request_id
  ) values (
    'Grupo Ativo',
    6000,
    current_date + 10,
    'Sala 1',
    'invite_active_01234567890',
    repeat('6', 64),
    'open',
    now() + interval '70 days',
    gen_random_uuid()
  ) returning id into active_gid;

  insert into public.participants (
    group_id, display_name, access_token_hash
  ) values (
    active_gid, 'Participante Ativo', repeat('7', 64)
  ) returning id into active_pid;

  insert into public.wish_items (
    participant_id, title
  ) values (
    active_pid, 'Fone Bluetooth'
  );

  insert into public.events (
    group_id, type
  ) values (
    active_gid, 'group_created'
  ) returning id into active_ev_id;

  -- 4. Execute purge as service_role (tests security definer privilege and RLS bypass)
  set local role service_role;
  select public.purge_expired_groups() into purged_count;
  reset role;

  -- 5. Verify outcomes
  assert purged_count = 2, format('expected 2 purged groups, got %s', purged_count);

  -- Expired open group and its child records must be deleted
  select count(*) into n from public.groups where id = expired_open_gid;
  assert n = 0, 'expired open group was not deleted';

  select count(*) into n from public.participants where group_id = expired_open_gid;
  assert n = 0, 'participants of expired open group were not cascaded';

  select count(*) into n from public.wish_items where participant_id = expired_open_pid;
  assert n = 0, 'wish items of expired open group were not cascaded';

  -- Expired drawn group and its child records (participants, draws, pairs) must be deleted
  select count(*) into n from public.groups where id = expired_drawn_gid;
  assert n = 0, 'expired drawn group was not deleted';

  select count(*) into n from public.participants where group_id = expired_drawn_gid;
  assert n = 0, 'participants of expired drawn group were not cascaded';

  select count(*) into n from public.draws where group_id = expired_drawn_gid;
  assert n = 0, 'draws of expired drawn group were not cascaded';

  select count(*) into n from public.pairs where group_id = expired_drawn_gid;
  assert n = 0, 'pairs of expired drawn group were not cascaded';

  -- Events of expired groups must still exist with group_id set to NULL (ON DELETE SET NULL)
  select count(*) into n from public.events where id = expired_ev_id and group_id is null;
  assert n = 1, 'event of expired group did not have group_id set to null';

  -- Active group and all its records must be intact
  select count(*) into n from public.groups where id = active_gid;
  assert n = 1, 'active group was mistakenly deleted';

  select count(*) into n from public.participants where id = active_pid;
  assert n = 1, 'active group participant was mistakenly deleted';

  select count(*) into n from public.wish_items where participant_id = active_pid;
  assert n = 1, 'active group wish item was mistakenly deleted';

  select count(*) into n from public.events where id = active_ev_id and group_id = active_gid;
  assert n = 1, 'active group event was mistakenly modified';

  -- 6. Running purge again as service_role when no expired groups remain must return 0
  set local role service_role;
  select public.purge_expired_groups() into purged_count;
  reset role;
  assert purged_count = 0, format('expected 0 purged groups on second run, got %s', purged_count);
end $$;

rollback;
