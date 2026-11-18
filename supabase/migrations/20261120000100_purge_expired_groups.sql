-- OPS-02 · Purge expired groups (RN08, RNF05)
-- Automatically deletes groups whose expires_at < now().
-- Cascading foreign keys remove participants, wish_items, draws, and pairs.
-- Foreign key events.group_id is ON DELETE SET NULL, preserving anonymous metric counters.
-- Returns the number of purged groups.
-- Rollback: supabase/rollback/20261120000100_purge_expired_groups.down.sql

create or replace function public.purge_expired_groups()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  with deleted as (
    delete from public.groups
    where expires_at < now()
    returning id
  )
  select count(*) into v_count from deleted;

  return v_count;
end;
$$;

comment on function public.purge_expired_groups() is
  'RN08: Purges groups past their expires_at (exchange_date + 60 days). Cascades to participants, wishlists, draws, and pairs. Events retain metrics with group_id = NULL.';

-- Revoke execution from public, anon, and authenticated. Only service_role / postgres may run it.
revoke execute on function public.purge_expired_groups() from public, anon, authenticated;
grant execute on function public.purge_expired_groups() to service_role;

-- Schedule daily at 03:00 America/Sao_Paulo (06:00 UTC) via pg_cron if available
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron with schema extensions;
    if exists (select 1 from information_schema.tables where table_schema = 'cron' and table_name = 'job') then
      perform cron.unschedule('purge-expired-groups')
      where exists (select 1 from cron.job where jobname = 'purge-expired-groups');
    end if;
    perform cron.schedule(
      'purge-expired-groups',
      '0 6 * * *',
      'select public.purge_expired_groups();'
    );
  end if;
exception
  when others then
    raise notice 'pg_cron could not be configured: %', sqlerrm;
end $$;
