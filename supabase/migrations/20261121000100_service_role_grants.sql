-- DB-05 · Table privileges for the server role (BE-01)
-- auto_expose_new_tables is false, and DB-02 only revokes anon/authenticated,
-- so the Data API (service_role) could not read or write. RLS stays forced
-- with no policies; service_role bypasses it. anon and authenticated stay revoked.
-- OPS-02 adds no table, so there is nothing else to grant.
-- Rollback: supabase/rollback/20261121000100_service_role_grants.down.sql

grant select, insert, update, delete on
  public.groups,
  public.participants,
  public.wish_items,
  public.draws,
  public.pairs,
  public.events
to service_role;

-- Keys are uuid, so public has no sequences today. Grant anyway for any that exist.
grant usage, select on all sequences in schema public to service_role;
