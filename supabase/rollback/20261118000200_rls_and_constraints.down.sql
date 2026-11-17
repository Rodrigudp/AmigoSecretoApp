-- Rollback of 20261118000200_rls_and_constraints.sql (manual, dev/staging only)
drop trigger if exists participants_max_100 on public.participants;
drop function if exists public.enforce_max_participants();
alter table public.pairs
  drop constraint if exists pairs_no_self,
  drop constraint if exists pairs_receiver_unique,
  drop constraint if exists pairs_pkey;
alter table public.groups       no force row level security;
alter table public.participants no force row level security;
alter table public.wish_items   no force row level security;
alter table public.draws        no force row level security;
alter table public.pairs        no force row level security;
alter table public.events       no force row level security;
alter table public.groups       disable row level security;
alter table public.participants disable row level security;
alter table public.wish_items   disable row level security;
alter table public.draws        disable row level security;
alter table public.pairs        disable row level security;
alter table public.events       disable row level security;
