-- DB-APP-01 rollback · Removes push registrations and reminder marks.
drop trigger groups_revoke_push_tokens on public.groups;
drop trigger participants_revoke_push_tokens on public.participants;
drop function public.revoke_organizer_push_tokens();
drop function public.revoke_participant_push_tokens();
drop function public.unregister_push_tokens(text, text);
drop function public.register_push_token(uuid, text, text, text, text);
drop table public.push_reminders_sent;
drop table public.push_tokens;
