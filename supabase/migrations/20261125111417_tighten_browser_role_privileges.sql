-- Applied production migration 2026-11-25: least-privilege browser-role grants.
-- RLS is not a substitute for SQL privileges; in particular it does not block TRUNCATE.
begin;

revoke all privileges on all tables in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from anon, authenticated;

grant select on public.profiles, public.challenge_days, public.signals,
  public.withdrawals, public.day_closes, public.messages,
  public.private_messages, public.user_presence, public.app_state,
  public.notifications, public.activity_logs
to authenticated;

grant update (display_name, username, avatar_path, bio, updated_at)
  on public.profiles to authenticated;

grant insert, update, delete on public.day_closes, public.signals,
  public.withdrawals, public.app_state to authenticated;

grant insert, delete on public.messages to authenticated;

grant insert on public.private_messages to authenticated;
grant update (read_at) on public.private_messages to authenticated;

grant insert, update on public.user_presence to authenticated;

grant update (read_at) on public.notifications to authenticated;

grant execute on function public.is_admin() to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated;

commit;
