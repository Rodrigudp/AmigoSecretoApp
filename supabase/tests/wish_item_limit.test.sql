-- LST-02 wish_items limit (20). Run after `supabase db reset`:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/wish_item_limit.test.sql
set plpgsql.check_asserts = on;
begin;

do $$
declare
  g uuid;
  p uuid;
  failed boolean;
  n integer;
begin
  insert into public.groups (
    name, max_value_cents, exchange_date, admin_token_hash, invite_token, expires_at, create_request_id
  )
  values (
    'Wish limit', 5000, current_date + 10, repeat('a', 64),
    'invite_wish_limit_token_012345', now() + interval '70 days', gen_random_uuid()
  )
  returning id into g;

  insert into public.participants (group_id, display_name, access_token_hash)
  values (g, 'Ana', repeat('1', 64))
  returning id into p;

  for i in 1..20 loop
    insert into public.wish_items (participant_id, title)
    values (p, 'Item ' || i);
  end loop;

  select count(*) into n from public.wish_items where participant_id = p;
  assert n = 20, 'exactly 20 wish_items must be accepted';

  failed := false;
  begin
    insert into public.wish_items (participant_id, title) values (p, 'Item 21');
  exception
    when raise_exception then
      if sqlerrm like '%WISH_LIST_FULL%' then
        failed := true;
      else
        raise;
      end if;
  end;
  assert failed, '21st wish_item must raise WISH_LIST_FULL';

  select count(*) into n from public.wish_items where participant_id = p;
  assert n = 20, 'count must stay at 20 after rejected insert';
end;
$$;

rollback;
