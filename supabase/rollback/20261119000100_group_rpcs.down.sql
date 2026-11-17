-- Rollback of 20261119000100_group_rpcs.sql (manual, dev/staging only)
drop function if exists public.join_group(text, text, text);
drop function if exists public.create_group_once(uuid, text, integer, date, text, text, text, timestamptz);
