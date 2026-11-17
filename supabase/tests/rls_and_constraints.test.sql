-- DB-01/DB-02 tests. Run after `supabase db reset`:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_and_constraints.test.sql
-- Everything runs in a transaction that is rolled back. Any failed check raises an exception.
begin;

do $$
declare
  g uuid; g2 uuid; req uuid; d uuid; d2 uuid; other uuid;
  p_ids uuid[] := '{}'; pid uuid; n integer; failed boolean; t text;
begin
  insert into public.groups (name, max_value_cents, exchange_date, admin_token_hash, invite_token, expires_at, create_request_id)
  values ('Test', 5000, current_date + 10, repeat('a', 64), 'invite_test_token_0123456789', now() + interval '70 days', gen_random_uuid())
  returning id into g;
  insert into public.groups (name, max_value_cents, exchange_date, admin_token_hash, invite_token, expires_at, create_request_id)
  values ('Other', 5000, current_date + 10, repeat('b', 64), 'invite_other_token_0123456789', now() + interval '70 days', gen_random_uuid())
  returning id into g2;

  -- invite token must look like >= 128-bit base64url
  failed := false;
  begin
    insert into public.groups (name, max_value_cents, exchange_date, admin_token_hash, invite_token, expires_at, create_request_id)
    values ('Bad', 5000, current_date, repeat('c', 64), 'short', now(), gen_random_uuid());
  exception when check_violation then failed := true; end;
  assert failed, 'short invite_token must be rejected';

  -- create-group idempotency: create_request_id is unique
  select create_request_id into req from public.groups where id = g;
  failed := false;
  begin
    insert into public.groups (name, max_value_cents, exchange_date, admin_token_hash, invite_token, expires_at, create_request_id)
    values ('Dup', 5000, current_date, repeat('d', 64), 'invite_dup_token_0123456789', now(), req);
  exception when unique_violation then failed := true; end;
  assert failed, 'duplicate create_request_id must be rejected';

  failed := false;
  begin
    insert into public.groups (name, max_value_cents, exchange_date, admin_token_hash, invite_token, expires_at)
    values ('NoReq', 5000, current_date, repeat('e', 64), 'invite_noreq_token_0123456789', now());
  exception when not_null_violation then failed := true; end;
  assert failed, 'create_request_id is required';

  -- 100 participants are accepted
  for i in 1..100 loop
    insert into public.participants (group_id, display_name, access_token_hash)
    values (g, 'P' || i, lpad(i::text, 64, '0')) returning id into pid;
    p_ids := p_ids || pid;
  end loop;

  -- the 101st is rejected (RN09)
  failed := false;
  begin
    insert into public.participants (group_id, display_name, access_token_hash)
    values (g, 'P101', lpad('101', 64, '0'));
  exception when check_violation then failed := true; end;
  assert failed, 'RN09: 101st participant must be rejected';

  -- a removed participant frees a slot
  update public.participants set removed_at = now() where id = p_ids[1];
  insert into public.participants (group_id, display_name, access_token_hash)
  values (g, 'P101', lpad('101', 64, '0'));

  -- participant of another group
  insert into public.participants (group_id, display_name, access_token_hash)
  values (g2, 'Outsider', lpad('999', 64, '0')) returning id into other;

  -- wish_items: only https URLs
  failed := false;
  begin insert into public.wish_items (participant_id, title, url) values (p_ids[2], 'x', 'javascript:alert(1)');
  exception when check_violation then failed := true; end;
  assert failed, 'wish_items.url must reject javascript:';
  failed := false;
  begin insert into public.wish_items (participant_id, title, affiliate_url) values (p_ids[2], 'x', 'http://shop.example/a');
  exception when check_violation then failed := true; end;
  assert failed, 'wish_items.affiliate_url must reject http:';
  insert into public.wish_items (participant_id, title, url) values (p_ids[2], 'ok', 'https://shop.example/a');
  insert into public.wish_items (participant_id, title, store) values (p_ids[2], 'amz', 'amazon');
  failed := false;
  begin insert into public.wish_items (participant_id, title, store) values (p_ids[2], 'x', 'other');
  exception when check_violation then failed := true; end;
  assert failed, 'wish_items.store must be amazon, mercadolivre or null';

  -- RN02 constraints
  insert into public.draws (group_id, version) values (g, 1) returning id into d;
  insert into public.draws (group_id, version) values (g2, 1) returning id into d2;
  insert into public.events (group_id, type) values (g, 'test');

  failed := false;
  begin insert into public.pairs (group_id, draw_id, giver_id, receiver_id) values (g, d, p_ids[2], p_ids[2]);
  exception when check_violation then failed := true; end;
  assert failed, 'RN02: giver <> receiver';

  insert into public.pairs (group_id, draw_id, giver_id, receiver_id) values (g, d, p_ids[2], p_ids[3]);

  failed := false;
  begin insert into public.pairs (group_id, draw_id, giver_id, receiver_id) values (g, d, p_ids[2], p_ids[4]);
  exception when unique_violation then failed := true; end;
  assert failed, 'RN02: giver unique per draw';

  failed := false;
  begin insert into public.pairs (group_id, draw_id, giver_id, receiver_id) values (g, d, p_ids[5], p_ids[3]);
  exception when unique_violation then failed := true; end;
  assert failed, 'RN02: receiver unique per draw';

  -- pairs must stay inside one group (composite FKs)
  failed := false;
  begin insert into public.pairs (group_id, draw_id, giver_id, receiver_id) values (g, d, p_ids[6], other);
  exception when foreign_key_violation then failed := true; end;
  assert failed, 'pairs: receiver from another group must be rejected';
  failed := false;
  begin insert into public.pairs (group_id, draw_id, giver_id, receiver_id) values (g, d2, p_ids[6], p_ids[7]);
  exception when foreign_key_violation then failed := true; end;
  assert failed, 'pairs: draw from another group must be rejected';

  -- RN08 purge: deleting the group keeps the events with a null group_id
  delete from public.groups where id = g;
  select count(*) into n from public.events where type = 'test' and group_id is null;
  assert n = 1, 'events must survive group deletion with group_id null';

  -- anon and authenticated read nothing from any table
  foreach t in array array['groups', 'participants', 'wish_items', 'draws', 'pairs', 'events'] loop
    set local role anon;
    failed := false;
    begin execute format('select count(*) from public.%I', t);
    exception when insufficient_privilege then failed := true; end;
    reset role;
    assert failed, format('anon must not read %s', t);

    set local role authenticated;
    failed := false;
    begin execute format('select count(*) from public.%I', t);
    exception when insufficient_privilege then failed := true; end;
    reset role;
    assert failed, format('authenticated must not read %s', t);
  end loop;

  -- every public table has RLS enabled and forced
  select count(*) into n from pg_class c join pg_namespace s on s.oid = c.relnamespace
   where s.nspname = 'public' and c.relkind = 'r' and not (c.relrowsecurity and c.relforcerowsecurity);
  assert n = 0, 'all public tables must have RLS enabled and forced';

  raise notice 'DB-01/DB-02 tests: OK';
end $$;

rollback;
