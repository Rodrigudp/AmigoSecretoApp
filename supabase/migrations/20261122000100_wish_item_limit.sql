-- LST-02 · Enforce max 20 wish_items per participant under concurrent inserts.
-- Rollback: supabase/rollback/20261122000100_wish_item_limit.down.sql

create or replace function public.enforce_wish_item_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Serialize inserts for the same participant (CONTRATOS.md: concurrent addOwn).
  perform 1 from public.participants where id = new.participant_id for update;
  if (
    select count(*)::int
    from public.wish_items
    where participant_id = new.participant_id
  ) >= 20 then
    raise exception 'WISH_LIST_FULL' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists wish_items_limit_trg on public.wish_items;
create trigger wish_items_limit_trg
  before insert on public.wish_items
  for each row
  execute function public.enforce_wish_item_limit();

revoke execute on function public.enforce_wish_item_limit() from public, anon, authenticated;

comment on function public.enforce_wish_item_limit() is
  'LST-02 / RN-LST-01: at most 20 wish_items per participant, safe under concurrent inserts.';
