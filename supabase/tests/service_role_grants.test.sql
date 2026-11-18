-- DB-05 tests: service_role can use the six tables; anon and authenticated cannot.
-- Run with: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/service_role_grants.test.sql
-- Runs in a transaction that is rolled back. Any failed check raises an exception.
set plpgsql.check_asserts = on;
begin;

do $$
declare
  tables text[] := array[
    'groups', 'participants', 'wish_items', 'draws', 'pairs', 'events'
  ];
  granted text[] := array['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
  denied text[] := array[
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'
  ];
  t text;
  p text;
  r text;
  seq record;
  forced boolean;
begin
  foreach t in array tables loop
    select c.relforcerowsecurity into forced
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relname = t and c.relrowsecurity;
    assert forced, format('RLS is not forced on %s', t);

    -- SELECT/INSERT/UPDATE/DELETE are the DB-05 grants. The local image may
    -- already allow TRUNCATE/REFERENCES/TRIGGER; that set is not part of the card.
    foreach p in array granted loop
      assert has_table_privilege('service_role', format('public.%s', t), p),
        format('service_role lacks %s on %s', p, t);
    end loop;

    foreach r in array array['anon', 'authenticated'] loop
      foreach p in array denied loop
        assert not has_table_privilege(r, format('public.%s', t), p),
          format('%s still has %s on %s', r, p, t);
      end loop;
    end loop;
  end loop;

  for seq in
    select n.nspname as schema_name, c.relname as sequence_name
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'S'
  loop
    assert has_sequence_privilege(
      'service_role', format('%I.%I', seq.schema_name, seq.sequence_name), 'USAGE'
    ), format('service_role lacks USAGE on %s', seq.sequence_name);
    assert has_sequence_privilege(
      'service_role', format('%I.%I', seq.schema_name, seq.sequence_name), 'SELECT'
    ), format('service_role lacks SELECT on %s', seq.sequence_name);
    assert not has_sequence_privilege(
      'anon', format('%I.%I', seq.schema_name, seq.sequence_name), 'USAGE'
    ), format('anon has USAGE on %s', seq.sequence_name);
    assert not has_sequence_privilege(
      'authenticated', format('%I.%I', seq.schema_name, seq.sequence_name), 'USAGE'
    ), format('authenticated has USAGE on %s', seq.sequence_name);
  end loop;

  raise notice 'DB-05 tests (privilege catalog): OK';
end $$;

-- Live checks: missing GRANT is 42501, before RLS.
do $$
declare failed boolean;
begin
  set local role anon;
  failed := false;
  begin
    perform 1 from public.groups;
  exception when insufficient_privilege then
    failed := true;
  end;
  assert failed, 'anon must not select groups';
  reset role;

  set local role authenticated;
  failed := false;
  begin
    perform 1 from public.groups;
  exception when insufficient_privilege then
    failed := true;
  end;
  assert failed, 'authenticated must not select groups';
  reset role;

  set local role service_role;
  insert into public.groups (
    name, max_value_cents, exchange_date, invite_token, admin_token_hash,
    expires_at, create_request_id
  ) values (
    'Grant Check', 1000, current_date + 1, 'invite_grant_check_0123456',
    repeat('a', 64), now() + interval '60 days', gen_random_uuid()
  );
  update public.groups set location = 'Online' where name = 'Grant Check';
  delete from public.groups where name = 'Grant Check';
  reset role;

  raise notice 'DB-05 tests (live DML): OK';
end $$;

rollback;
