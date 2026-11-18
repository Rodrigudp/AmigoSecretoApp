-- Rollback for OPS-02: purge_expired_groups (RN08)

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from information_schema.tables where table_schema = 'cron' and table_name = 'job') then
      perform cron.unschedule('purge-expired-groups')
      where exists (select 1 from cron.job where jobname = 'purge-expired-groups');
    end if;
  end if;
exception
  when others then
    raise notice 'pg_cron unschedule skipped: %', sqlerrm;
end $$;

drop function if exists public.purge_expired_groups();
