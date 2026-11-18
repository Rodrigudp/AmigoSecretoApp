-- DB-APP-01 · Run on a migrated local database with psql -v ON_ERROR_STOP=1.
set plpgsql.check_asserts = on;
begin;

do $$
declare
  table_name text;
  function_name text;
  blocked_role text;
  privilege_name text;
begin
  foreach table_name in array array['public.push_tokens', 'public.push_reminders_sent']
  loop
    assert (
      select relrowsecurity and relforcerowsecurity
      from pg_class where oid = table_name::regclass
    ), 'RLS must be enabled and forced on ' || table_name;
    foreach blocked_role in array array['anon', 'authenticated']
    loop
      foreach privilege_name in array array[
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'
      ]
      loop
        assert not has_table_privilege(blocked_role, table_name, privilege_name);
      end loop;
    end loop;
  end loop;

  foreach function_name in array array[
    'public.register_push_token(uuid,text,text,text,text)',
    'public.unregister_push_tokens(text,text)'
  ]
  loop
    assert not has_function_privilege('anon', function_name, 'EXECUTE');
    assert not has_function_privilege('authenticated', function_name, 'EXECUTE');
    assert has_function_privilege('service_role', function_name, 'EXECUTE');
  end loop;
end;
$$;

set local role service_role;
do $$
declare
  test_group_id uuid;
  organizer_hash text := repeat('2', 64);
  participant_hash text := repeat('1', 64);
  first_device text := 'ExpoPushToken[device-1]';
  second_device text := 'ExpoPushToken[device-2]';
  first_id uuid;
  first_created_at timestamptz;
  inserted_count integer;
begin
  insert into public.groups (
    name, max_value_cents, exchange_date, admin_token_hash, invite_token, expires_at, create_request_id
  )
  values (
    'Push SQL test', 5000, current_date + 10, organizer_hash,
    'invite_push_test_token_12345', now() + interval '70 days', gen_random_uuid()
  )
  returning id into test_group_id;

  for i in 1..5 loop
    assert public.register_push_token(
      test_group_id, participant_hash, 'participant', 'ios', 'ExpoPushToken[device-' || i || ']'
    );
  end loop;
  select id, created_at into strict first_id, first_created_at
  from public.push_tokens
  where credential_hash = participant_hash and expo_push_token = first_device;

  assert public.register_push_token(test_group_id, organizer_hash, 'organizer', 'ios', second_device);
  assert public.register_push_token(test_group_id, participant_hash, 'participant', 'android', first_device);
  assert (select count(*) from public.push_tokens where credential_hash = participant_hash) = 5;
  assert public.register_push_token(
    test_group_id, participant_hash, 'participant', 'ios', 'ExponentPushToken[device-6]'
  );

  assert (select count(*) from public.push_tokens where credential_hash = participant_hash) = 5;
  assert exists (
    select 1 from public.push_tokens
    where id = first_id and platform = 'android' and created_at = first_created_at
      and updated_at >= created_at
  ), 're-registering must refresh the existing row and keep it in the latest five';
  assert not exists (
    select 1 from public.push_tokens
    where credential_hash = participant_hash and expo_push_token = second_device
  ), 'the least recently registered device must be removed';

  assert public.unregister_push_tokens(participant_hash, first_device) = 1;
  assert public.unregister_push_tokens(participant_hash, first_device) = 0;
  assert public.unregister_push_tokens(participant_hash) = 4;
  assert (select count(*) from public.push_tokens where credential_hash = organizer_hash) = 1;

  insert into public.push_reminders_sent (group_id, reminder_date)
  values (test_group_id, current_date);
  insert into public.push_reminders_sent (group_id, reminder_date)
  values (test_group_id, current_date) on conflict (group_id, reminder_date) do nothing;
  get diagnostics inserted_count = row_count;
  assert inserted_count = 0, 'only the first reminder claim must insert a row';
  insert into public.push_reminders_sent (group_id, reminder_date)
  values (test_group_id, current_date + 1);

  delete from public.groups where id = test_group_id;
  assert not exists (select 1 from public.push_tokens where group_id = test_group_id);
  assert not exists (select 1 from public.push_reminders_sent where group_id = test_group_id);
end;
$$;
reset role;

rollback;
