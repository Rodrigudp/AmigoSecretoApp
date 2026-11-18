-- DB-04 tests: create_group_once and join_group. Run after `supabase db reset`:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/group_rpcs.test.sql
-- Runs in a transaction that is rolled back. Any failed check raises an exception (fails the run).
set plpgsql.check_asserts = on;
begin;

-- Runs a statement that must fail with a business error whose message is `expected`.
create function pg_temp.expect_err(q text, expected text) returns void language plpgsql as $$
declare msg text;
begin
  begin
    execute q;
  exception when others then
    get stacked diagnostics msg = message_text;
    if msg <> expected then
      raise exception 'expected error %, got % (%)', expected, msg, sqlstate;
    end if;
    return;
  end;
  raise exception 'expected error % but the statement succeeded: %', expected, q;
end $$;

do $$
declare
  r record; req uuid := gen_random_uuid(); gid uuid; inv text := 'invite_rpc_token_0123456789';
  admin1 text := repeat('a', 64); admin2 text := repeat('b', 64); n integer; i integer; pid uuid;
  ids uuid[] := '{}';
begin
  -- ===== create_group_once =====
  select * into r from public.create_group_once(req, 'Natal', 5000, current_date + 10, 'Casa', inv, admin1, now() + interval '70 days');
  assert r.was_replay = false, 'first call is not a replay';
  assert r.invite_token = inv, 'returns the invite token';
  gid := r.group_id;
  select count(*) into n from public.events where group_id = gid and type = 'group_created';
  assert n = 1, 'group_created event recorded once';

  -- same request, same data: same group, admin token rotated, no new event
  select * into r from public.create_group_once(req, 'Natal', 5000, current_date + 10, 'Casa', 'invite_other_0123456789012', admin2, now() + interval '70 days');
  assert r.was_replay = true and r.group_id = gid and r.invite_token = inv, 'replay returns the same group';
  assert (select admin_token_hash from public.groups where id = gid) = admin2, 'admin token hash rotated on replay';
  select count(*) into n from public.groups where create_request_id = req;
  assert n = 1, 'no duplicated group';
  select count(*) into n from public.events where group_id = gid and type = 'group_created';
  assert n = 1, 'no duplicated event on replay';

  -- same request, different data: conflict (also location null vs value)
  perform pg_temp.expect_err(format($q$select * from public.create_group_once(%L, 'Outro', 5000, current_date + 10, 'Casa', 'x_invite_0123456789012345', %L, now())$q$, req, admin1), 'IDEMPOTENCY_CONFLICT');
  perform pg_temp.expect_err(format($q$select * from public.create_group_once(%L, 'Natal', 5000, current_date + 10, null, 'x_invite_0123456789012345', %L, now())$q$, req, admin1), 'IDEMPOTENCY_CONFLICT');

  -- after 15 minutes: conflict
  update public.groups set created_at = now() - interval '16 minutes' where id = gid;
  perform pg_temp.expect_err(format($q$select * from public.create_group_once(%L, 'Natal', 5000, current_date + 10, 'Casa', 'x_invite_0123456789012345', %L, now())$q$, req, admin1), 'IDEMPOTENCY_CONFLICT');
  update public.groups set created_at = now() where id = gid;

  -- group already drawn: conflict
  update public.groups set status = 'drawn' where id = gid;
  perform pg_temp.expect_err(format($q$select * from public.create_group_once(%L, 'Natal', 5000, current_date + 10, 'Casa', 'x_invite_0123456789012345', %L, now())$q$, req, admin1), 'IDEMPOTENCY_CONFLICT');
  update public.groups set status = 'open' where id = gid;

  -- group already has a participant: conflict
  select * into r from public.join_group(inv, 'Primeiro', lpad('1', 64, '0'));
  perform pg_temp.expect_err(format($q$select * from public.create_group_once(%L, 'Natal', 5000, current_date + 10, 'Casa', 'x_invite_0123456789012345', %L, now())$q$, req, admin1), 'IDEMPOTENCY_CONFLICT');

  -- ===== join_group =====
  select * into r from public.join_group(inv, 'Ana', lpad('2', 64, '0'));
  assert r.display_name = 'Ana' and r.group_id = gid, 'first Ana keeps the name';
  assert r.expires_at = (select expires_at from public.groups where id = gid), 'returns expires_at';
  pid := r.participant_id;
  select * into r from public.join_group(inv, 'ana', lpad('3', 64, '0'));
  assert r.display_name = 'ana 2', 'case-insensitive suffix: ana -> "ana 2"';
  select * into r from public.join_group(inv, 'ANA', lpad('4', 64, '0'));
  assert r.display_name = 'ANA 3', 'ANA -> "ANA 3"';

  -- removed participants do not count
  update public.participants set removed_at = now() where id = pid;
  select * into r from public.join_group(inv, 'Ana', lpad('5', 64, '0'));
  assert r.display_name = 'Ana', 'removed "Ana" frees the plain name';
  select * into r from public.join_group(inv, 'ana', lpad('6', 64, '0'));
  assert r.display_name = 'ana 4', 'ana -> "ana 4" (ana, ana 2, ana 3 taken)';
  update public.participants set removed_at = now() where display_name = 'ana 2';
  select * into r from public.join_group(inv, 'ana', lpad('7', 64, '0'));
  assert r.display_name = 'ana 2', 'removed "ana 2" is reused';

  -- final name stays within 60 characters
  select * into r from public.join_group(inv, repeat('x', 40), lpad('8', 64, '0'));
  select * into r from public.join_group(inv, repeat('X', 40), lpad('9', 64, '0'));
  assert char_length(r.display_name) <= 60 and r.display_name = repeat('X', 40) || ' 2', 'long name suffix';

  -- invalid names
  perform pg_temp.expect_err(format($q$select * from public.join_group(%L, '   ', %L)$q$, inv, lpad('10', 64, '0')), 'INVALID_NAME');
  perform pg_temp.expect_err(format($q$select * from public.join_group(%L, %L, %L)$q$, inv, repeat('y', 41), lpad('10', 64, '0')), 'INVALID_NAME');

  -- participant_joined events
  select count(*) into n from public.events where group_id = gid and type = 'participant_joined';
  assert n = 9, 'participant_joined recorded per join';

  -- unknown or expired link
  perform pg_temp.expect_err(format($q$select * from public.join_group('nope_nope_nope_nope_nope', 'Bia', %L)$q$, lpad('11', 64, '0')), 'INVALID_LINK');
  update public.groups set expires_at = now() - interval '1 day' where id = gid;
  perform pg_temp.expect_err(format($q$select * from public.join_group(%L, 'Bia', %L)$q$, inv, lpad('11', 64, '0')), 'INVALID_LINK');
  update public.groups set expires_at = now() + interval '30 days' where id = gid;

  -- drawn group
  update public.groups set status = 'drawn' where id = gid;
  perform pg_temp.expect_err(format($q$select * from public.join_group(%L, 'Bia', %L)$q$, inv, lpad('11', 64, '0')), 'GROUP_CLOSED');
  update public.groups set status = 'open' where id = gid;

  -- 100 active participants: GROUP_FULL (removed ones do not count)
  select count(*) into n from public.participants where group_id = gid and removed_at is null;
  for i in n + 1 .. 100 loop
    insert into public.participants (group_id, display_name, access_token_hash)
    values (gid, 'Fill ' || i, lpad((1000 + i)::text, 64, '0'));
  end loop;
  perform pg_temp.expect_err(format($q$select * from public.join_group(%L, 'Bia', %L)$q$, inv, lpad('11', 64, '0')), 'GROUP_FULL');
  update public.participants set removed_at = now() where display_name = 'Fill 100';
  select * into r from public.join_group(inv, 'Bia', lpad('11', 64, '0'));
  assert r.display_name = 'Bia', 'a freed slot allows a new participant';

  raise notice 'DB-04 tests (logic): OK';
end $$;

-- ===== privileges =====
do $$
declare failed boolean;
begin
  set local role anon;
  failed := false;
  begin perform * from public.join_group('x', 'y', 'z');
  exception when insufficient_privilege then failed := true; end;
  assert failed, 'anon must not execute join_group';
  failed := false;
  begin perform * from public.create_group_once(gen_random_uuid(), 'n', 1, current_date, null, 'x', 'y', now());
  exception when insufficient_privilege then failed := true; end;
  assert failed, 'anon must not execute create_group_once';
  reset role;

  set local role authenticated;
  failed := false;
  begin perform * from public.join_group('x', 'y', 'z');
  exception when insufficient_privilege then failed := true; end;
  assert failed, 'authenticated must not execute join_group';
  failed := false;
  begin perform * from public.create_group_once(gen_random_uuid(), 'n', 1, current_date, null, 'x', 'y', now());
  exception when insufficient_privilege then failed := true; end;
  assert failed, 'authenticated must not execute create_group_once';
  reset role;

  -- the service role can execute them (security definer reaches the RLS-protected tables)
  set local role service_role;
  perform * from public.create_group_once(gen_random_uuid(), 'Service', 100, current_date + 5, null,
    'invite_service_token_0123456', repeat('f', 64), now() + interval '65 days');
  reset role;
  assert exists (select 1 from public.groups where name = 'Service'), 'service role created a group';

  raise notice 'DB-04 tests (privileges): OK';
end $$;

rollback;
