-- Rollback for OPS-02: purge_expired_groups (RN08)

select cron.unschedule('purge-expired-groups');

drop function if exists public.purge_expired_groups();
