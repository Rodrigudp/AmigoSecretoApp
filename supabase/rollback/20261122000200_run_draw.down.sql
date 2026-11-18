-- Rollback of 20261122000200_run_draw.sql (manual, dev/staging only)
drop trigger if exists participants_no_remove_after_draw on public.participants;
drop function if exists public.forbid_remove_after_draw();
drop function if exists public.run_draw(uuid, text, integer, uuid[], uuid[]);
