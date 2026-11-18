-- DB-APP-01 rollback · Removes push registrations and reminder marks.
drop function public.unregister_push_tokens(text, text);
drop function public.register_push_token(uuid, text, text, text, text);
drop table public.push_reminders_sent;
drop table public.push_tokens;
