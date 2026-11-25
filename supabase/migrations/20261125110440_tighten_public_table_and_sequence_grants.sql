-- Applied to the connected Nexoventia Supabase project.
-- RLS does not protect TRUNCATE, so browser roles must not inherit blanket ACLs.
begin;

revoke all privileges on all tables in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from anon, authenticated;

-- Restore only the operations used by the browser client. RLS remains
-- responsible for the row/role restrictions on every operation below.
grant select, update on public.profiles to authenticated;
grant select on public.challenge_days to authenticated;

grant select, insert, update, delete
  on public.day_closes, public.signals, public.withdrawals, public.app_state
  to authenticated;

grant select, insert, delete on public.messages to authenticated;
grant select, insert on public.private_messages to authenticated;
grant update (read_at) on public.private_messages to authenticated;
grant select, insert, update, delete on public.user_presence to authenticated;
grant select, insert, update on public.notifications to authenticated;
grant select, insert on public.activity_logs to authenticated;
grant select, insert on public.audit_log to authenticated;

grant usage, select on all sequences in schema public to authenticated;

-- New objects created by the postgres migration owner do not inherit broad
-- browser-role privileges; future migrations must grant only what they need.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated;

commit;
