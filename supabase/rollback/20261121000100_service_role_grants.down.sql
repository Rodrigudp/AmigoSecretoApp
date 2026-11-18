-- Rollback for DB-05: service_role table and sequence privileges.

revoke select, insert, update, delete on
  public.groups,
  public.participants,
  public.wish_items,
  public.draws,
  public.pairs,
  public.events
from service_role;

revoke usage, select on all sequences in schema public from service_role;
