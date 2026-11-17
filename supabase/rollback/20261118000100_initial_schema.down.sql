-- Rollback of 20261118000100_initial_schema.sql (manual: run only in dev/staging, destroys data)
drop table if exists public.events;
drop table if exists public.pairs;
drop table if exists public.draws;
drop table if exists public.wish_items;
drop table if exists public.participants;
drop table if exists public.groups;
-- pgcrypto is left installed on purpose (shared extension).
