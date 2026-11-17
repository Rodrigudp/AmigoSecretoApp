-- DB-02 · RLS deny-by-default + business-rule constraints (RN02, RN09)
-- Rollback: supabase/rollback/20261118000200_rls_and_constraints.down.sql

-- RLS: enabled and FORCED on every table, with NO policies for anon/authenticated.
-- The app only reaches the database from the server with the service_role key (bypasses RLS).
alter table public.groups       enable row level security;
alter table public.participants enable row level security;
alter table public.wish_items   enable row level security;
alter table public.draws        enable row level security;
alter table public.pairs        enable row level security;
alter table public.events       enable row level security;

alter table public.groups       force row level security;
alter table public.participants force row level security;
alter table public.wish_items   force row level security;
alter table public.draws        force row level security;
alter table public.pairs        force row level security;
alter table public.events       force row level security;

-- Defense in depth: also revoke table privileges (default Supabase grants are broad).
revoke all on public.groups, public.participants, public.wish_items,
              public.draws, public.pairs, public.events
  from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- RN02: nobody draws themselves; everyone gives once and receives once per draw.
alter table public.pairs
  add constraint pairs_pkey primary key (draw_id, giver_id),
  add constraint pairs_receiver_unique unique (draw_id, receiver_id),
  add constraint pairs_no_self check (giver_id <> receiver_id);

-- RN09: at most 100 active participants per group.
create or replace function public.enforce_max_participants()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  active_count integer;
begin
  if new.removed_at is not null then
    return new;
  end if;
  -- serialize concurrent joins of the same group
  perform 1 from public.groups where id = new.group_id for update;
  select count(*) into active_count
    from public.participants
   where group_id = new.group_id
     and removed_at is null
     and id is distinct from new.id;
  if active_count >= 100 then
    raise exception 'group % is full (max 100 participants)', new.group_id
      using errcode = 'check_violation', constraint = 'participants_max_100';
  end if;
  return new;
end;
$$;

create trigger participants_max_100
  before insert or update of group_id, removed_at on public.participants
  for each row execute function public.enforce_max_participants();

revoke all on function public.enforce_max_participants() from public, anon, authenticated;
