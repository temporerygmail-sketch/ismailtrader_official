-- Enforce Supabase AAL2 when a member has a verified MFA factor.
-- The helper is private and SECURITY DEFINER; it does not expose auth.mfa_factors.
begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.mfa_session_allowed()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select case
    when exists (
      select 1
      from auth.mfa_factors f
      where f.user_id = (select auth.uid())
        and f.status = 'verified'
    )
    then coalesce((select auth.jwt() ->> 'aal') = 'aal2', false)
    else true
  end;
$function$;

revoke all on function private.mfa_session_allowed() from public, anon;
grant execute on function private.mfa_session_allowed() to authenticated;

drop policy if exists require_aal2_when_mfa_enrolled on public.profiles;
create policy require_aal2_when_mfa_enrolled on public.profiles
  as restrictive for all to authenticated
  using (private.mfa_session_allowed())
  with check (private.mfa_session_allowed());
drop policy if exists require_aal2_when_mfa_enrolled on public.challenge_days;
create policy require_aal2_when_mfa_enrolled on public.challenge_days
  as restrictive for all to authenticated
  using (private.mfa_session_allowed())
  with check (private.mfa_session_allowed());
drop policy if exists require_aal2_when_mfa_enrolled on public.signals;
create policy require_aal2_when_mfa_enrolled on public.signals
  as restrictive for all to authenticated
  using (private.mfa_session_allowed())
  with check (private.mfa_session_allowed());
drop policy if exists require_aal2_when_mfa_enrolled on public.withdrawals;
create policy require_aal2_when_mfa_enrolled on public.withdrawals
  as restrictive for all to authenticated
  using (private.mfa_session_allowed())
  with check (private.mfa_session_allowed());
drop policy if exists require_aal2_when_mfa_enrolled on public.day_closes;
create policy require_aal2_when_mfa_enrolled on public.day_closes
  as restrictive for all to authenticated
  using (private.mfa_session_allowed())
  with check (private.mfa_session_allowed());
drop policy if exists require_aal2_when_mfa_enrolled on public.messages;
create policy require_aal2_when_mfa_enrolled on public.messages
  as restrictive for all to authenticated
  using (private.mfa_session_allowed())
  with check (private.mfa_session_allowed());
drop policy if exists require_aal2_when_mfa_enrolled on public.private_messages;
create policy require_aal2_when_mfa_enrolled on public.private_messages
  as restrictive for all to authenticated
  using (private.mfa_session_allowed())
  with check (private.mfa_session_allowed());
drop policy if exists require_aal2_when_mfa_enrolled on public.user_presence;
create policy require_aal2_when_mfa_enrolled on public.user_presence
  as restrictive for all to authenticated
  using (private.mfa_session_allowed())
  with check (private.mfa_session_allowed());
drop policy if exists require_aal2_when_mfa_enrolled on public.app_state;
create policy require_aal2_when_mfa_enrolled on public.app_state
  as restrictive for all to authenticated
  using (private.mfa_session_allowed())
  with check (private.mfa_session_allowed());
drop policy if exists require_aal2_when_mfa_enrolled on public.notifications;
create policy require_aal2_when_mfa_enrolled on public.notifications
  as restrictive for all to authenticated
  using (private.mfa_session_allowed())
  with check (private.mfa_session_allowed());
drop policy if exists require_aal2_when_mfa_enrolled on public.activity_logs;
create policy require_aal2_when_mfa_enrolled on public.activity_logs
  as restrictive for all to authenticated
  using (private.mfa_session_allowed())
  with check (private.mfa_session_allowed());
drop policy if exists require_aal2_when_mfa_enrolled on public.audit_log;
create policy require_aal2_when_mfa_enrolled on public.audit_log
  as restrictive for all to authenticated
  using (private.mfa_session_allowed())
  with check (private.mfa_session_allowed());

drop policy if exists nexoventia_media_require_aal2_when_mfa_enrolled on storage.objects;
create policy nexoventia_media_require_aal2_when_mfa_enrolled on storage.objects
  as restrictive for all to authenticated
  using ((bucket_id <> 'nexoventia-media') or private.mfa_session_allowed())
  with check ((bucket_id <> 'nexoventia-media') or private.mfa_session_allowed());

drop function if exists public.mfa_session_allowed();

commit;
