-- SRT-02 tests: run_draw and the removal guard. Run after `supabase db reset`:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/run_draw.test.sql
-- Runs in a transaction that is rolled back. Any failed check raises an exception (fails the run).
-- Concurrency (two simultaneous calls) is covered by tests/integration/run-draw-concurrency.test.ts.
set plpgsql.check_asserts = on;
begin;

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
  gid uuid; gid2 uuid; admin text := repeat('c', 64); other_admin text := repeat('d', 64);
  p uuid[] := '{}'; pid uuid; i integer; r record; n integer;
  rot uuid[];
begin
  insert into public.groups (name, max_value_cents, exchange_date, admin_token_hash, invite_token, expires_at, create_request_id)
  values ('Sorteio', 5000, current_date + 10, admin, 'invite_draw_token_0123456789', now() + interval '70 days', gen_random_uuid())
  returning id into gid;
  insert into public.groups (name, max_value_cents, exchange_date, admin_token_hash, invite_token, expires_at, create_request_id)
  values ('Outro', 5000, current_date + 10, other_admin, 'invite_draw_other_0123456789', now() + interval '70 days', gen_random_uuid())
  returning id into gid2;

  -- 2 active participants: not enough (also with empty arrays)
  for i in 1..2 loop
    insert into public.participants (group_id, display_name, access_token_hash)
    values (gid, 'P' || i, lpad(i::text, 64, '0')) returning id into pid;
    p := p || pid;
  end loop;
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 0, %L, %L)', gid, admin, p, p[2:2] || p[1:1]),
    'NOT_ENOUGH_PARTICIPANTS');
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 0, %L::uuid[], %L::uuid[])', gid, admin, '{}', '{}'),
    'NOT_ENOUGH_PARTICIPANTS');

  for i in 3..5 loop
    insert into public.participants (group_id, display_name, access_token_hash)
    values (gid, 'P' || i, lpad(i::text, 64, '0')) returning id into pid;
    p := p || pid;
  end loop;
  -- cyclic shift of the 5 participants: a valid single-cycle draw
  rot := p[2:5] || p[1:1];

  -- authorization and input validation
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 0, %L, %L)', gid, other_admin, p, rot), 'INVALID_LINK');
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 0, %L, %L)', gen_random_uuid(), admin, p, rot), 'INVALID_LINK');
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 0, %L, %L)', gid, admin, p, p[2:5]), 'INVALID_INPUT');  -- length mismatch
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 0, %L, %L)', gid, admin, p, p), 'INVALID_INPUT');       -- self pairs
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 0, %L, %L)', gid, admin, p,
    array[p[2], p[2], p[3], p[4], p[5]]), 'INVALID_INPUT');                                                                         -- repeated receiver
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 0, %L, %L)', gid, admin, p,
    array[p[2], p[3], p[4], p[5], gen_random_uuid()]), 'INVALID_INPUT');                                                            -- receivers differ from givers
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 0, %L, %L)', gid, admin,
    p[1:4] || p[1:1], rot), 'INVALID_INPUT');                                                                                       -- repeated giver
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, -1, %L, %L)', gid, admin, p, rot), 'INVALID_INPUT');
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 1, %L, %L)', gid, admin, p, rot), 'DRAW_NOT_READY');    -- stale version
  -- a valid-looking draw that misses one active participant
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 0, %L, %L)', gid, admin, p[1:4], p[2:4] || p[1:1]),
    'DRAW_MEMBERS_CHANGED');
  -- a participant that is not in the group
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 0, %L, %L)', gid, admin,
    p[1:4] || p[1:1], p[1:4] || p[1:1]), 'INVALID_INPUT');

  -- nothing was written by the failures
  assert (select count(*) from public.draws where group_id = gid) = 0, 'failures leave no draw';
  assert (select count(*) from public.pairs where group_id = gid) = 0, 'failures leave no pairs';
  assert (select status from public.groups where id = gid) = 'open', 'failures keep the group open';

  -- a removed participant is not part of the active set
  update public.participants set removed_at = now() where id = p[5];
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 0, %L, %L)', gid, admin, p, rot), 'DRAW_MEMBERS_CHANGED');
  update public.participants set removed_at = null where id = p[5];

  -- happy path
  select * into r from public.run_draw(gid, admin, 0, p, rot);
  assert r.draw_version = 1 and r.status = 'drawn' and r.was_replay = false and r.drawn_at is not null, 'first draw returns version 1';
  assert (select status from public.groups where id = gid) = 'drawn', 'group is drawn';
  assert (select draw_version from public.groups where id = gid) = 1, 'group draw_version is 1';
  select count(*) into n from public.pairs where group_id = gid;
  assert n = 5, 'five pairs recorded';
  assert (select count(distinct giver_id) from public.pairs where group_id = gid) = 5, 'everyone gives once';
  assert (select count(distinct receiver_id) from public.pairs where group_id = gid) = 5, 'everyone receives once';
  assert not exists (select 1 from public.pairs where giver_id = receiver_id), 'nobody draws themselves';
  assert (select giver_id from public.pairs where receiver_id = p[2]) = p[1], 'pair i = givers[i] -> receivers[i]';
  assert (select count(*) from public.events where group_id = gid and type = 'draw_performed') = 1, 'draw_performed recorded once';
  assert r.drawn_at = (select created_at from public.draws where group_id = gid and version = 1), 'drawn_at is the draw date';

  -- replay: same expected version, different pairs, nothing changes
  select * into r from public.run_draw(gid, admin, 0, p, p[3:5] || p[1:2]);
  assert r.draw_version = 1 and r.was_replay = true, 'repeat returns the persisted draw';
  assert (select count(*) from public.draws where group_id = gid) = 1, 'repeat creates no second draw';
  assert (select giver_id from public.pairs where receiver_id = p[2]) = p[1], 'repeat keeps the original pairs';
  assert (select count(*) from public.events where group_id = gid and type = 'draw_performed') = 1, 'repeat records no second event';

  -- stale confirmation after the draw exists
  perform pg_temp.expect_err(format('select * from public.run_draw(%L, %L, 3, %L, %L)', gid, admin, p, rot), 'DRAW_NOT_READY');

  -- removal guard: closed group
  perform pg_temp.expect_err(format('update public.participants set removed_at = now() where id = %L', p[1]), 'GROUP_CLOSED');
  assert (select removed_at from public.participants where id = p[1]) is null, 'participant stays after refused removal';

  -- redraw with the confirmed version: invalidates the previous draw, version 2
  select * into r from public.run_draw(gid, admin, 1, p, p[3:5] || p[1:2]);
  assert r.draw_version = 2 and r.was_replay = false, 'redraw creates version 2';
  assert (select count(*) from public.draws where group_id = gid and invalidated_at is null) = 1, 'one valid draw';
  assert (select invalidated_at from public.draws where group_id = gid and version = 1) is not null, 'version 1 invalidated';
  assert (select count(*) from public.pairs where group_id = gid) = 10, 'pairs of both versions kept';
  assert (select count(*) from public.pairs pr join public.draws d on d.id = pr.draw_id
           where d.group_id = gid and d.invalidated_at is null) = 5, 'five pairs in the valid draw';
  assert (select draw_version from public.groups where id = gid) = 2, 'group draw_version is 2';

  -- the other group is untouched
  assert (select status from public.groups where id = gid2) = 'open', 'other group stays open';
  assert (select count(*) from public.draws where group_id = gid2) = 0, 'other group has no draw';

  -- removal still works in an open group
  insert into public.participants (group_id, display_name, access_token_hash)
  values (gid2, 'Z', lpad('77', 64, '0')) returning id into pid;
  update public.participants set removed_at = now() where id = pid;
  assert (select removed_at from public.participants where id = pid) is not null, 'removal works in an open group';
end $$;

-- privileges: only service_role executes the RPC
do $$
begin
  assert has_function_privilege('service_role', 'public.run_draw(uuid,text,integer,uuid[],uuid[])', 'execute'), 'service_role executes run_draw';
  assert not has_function_privilege('anon', 'public.run_draw(uuid,text,integer,uuid[],uuid[])', 'execute'), 'anon cannot execute run_draw';
  assert not has_function_privilege('authenticated', 'public.run_draw(uuid,text,integer,uuid[],uuid[])', 'execute'), 'authenticated cannot execute run_draw';
end $$;

rollback;
