-- NEXOVENTIA Trading Operations Hub — production reference snapshot
-- ACTIVE PROJECT: dbsgvcfvlnhwecyfsxib
-- Region: ap-south-1 (Mumbai)
-- This file documents the LIVE database security model and December plan.
-- It is NOT a standalone migration. Do not run it blindly on production.
-- Live migration history is maintained by Supabase.

-- Trusted admin authorization: only app_metadata is used (not user_metadata).
create or replace function public.is_admin()
returns boolean
language sql stable security invoker
set search_path = ''
as $function$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$function$;

-- MFA helper lives outside exposed schemas.
-- create schema if not exists private;
-- The live helper is private.mfa_session_allowed(), SECURITY DEFINER,
-- with EXECUTE granted only to authenticated users.
-- It requires aal2 when the current user has a verified TOTP factor.
-- All MFA policies are AS RESTRICTIVE FOR ALL TO authenticated.
-- This is an extra condition; permissive room/table rules do not override MFA.

-- Live public tables. RLS is enabled on every table listed below.
-- Reference: alter table public.profiles enable row level security;
-- Reference: alter table public.challenge_days enable row level security;
-- Reference: alter table public.signals enable row level security;
-- Reference: alter table public.withdrawals enable row level security;
-- Reference: alter table public.day_closes enable row level security;
-- Reference: alter table public.messages enable row level security;
-- Reference: alter table public.private_messages enable row level security;
-- Reference: alter table public.user_presence enable row level security;
-- Reference: alter table public.app_state enable row level security;
-- Reference: alter table public.notifications enable row level security;
-- Reference: alter table public.activity_logs enable row level security;

-- Shared read model:
-- profiles, challenge_days, signals, withdrawals, day_closes and messages
-- are readable to signed-in members under authenticated RLS policies.
-- Actual writes to signals, withdrawals, day_closes, challenge_days, app_state,
-- updates-channel messages and administrative notifications are owner-only.

-- Community posting check (exact logical condition used by the live policy):
-- channel='discussion' or public.is_admin()
-- Members can post only in Discussion Group. Quetex Updates is admin-only.

-- Private messages route:
-- A member may send only when recipient_id resolves to a profile with role='admin'.
-- An admin may send to an individual member. Member-to-member DMs are denied.
-- The live RLS condition checks recipient_id against profiles.role='admin'.

-- Media:
-- Bucket: nexoventia-media (private; 50 MB per object).
-- Allowed types: JPEG, PNG, WebP, GIF, MP4, WebM, MP3, PDF.
-- Uploads are scoped to the signed-in user's folder; admins may manage shared media.
-- Signed URLs are used for private media display.

-- Realtime publication:
-- signals, withdrawals, day_closes, messages, private_messages, app_state, notifications.
-- Notification trigger: create trigger notify_signal_events after insert or update on public.signals.

-- December 2026 challenge plan.
-- Columns: day_no, calendar_date, target_min, target_max, planned_withdrawal,
--          is_rest_day, clarification_needed, admin_note.
-- Original user-provided values are retained exactly.
(1,'2026-12-01',10,13,0,false,false,''),
(2,'2026-12-02',13,17,0,false,false,''),
(3,'2026-12-03',17,22,0,false,false,''),
(4,'2026-12-04',22,28,11,false,false,''),
(5,'2026-12-05',17,22,0,false,false,''),
(6,'2026-12-06',22,28,0,false,false,''),
(7,'2026-12-07',28,35,13,false,false,''),
(8,'2026-12-08',22,28,0,false,false,''),
(9,'2026-12-09',28,35,0,false,false,''),
(10,'2026-12-10',35,43,15,false,false,''),
(11,'2026-12-11',28,35,0,false,false,''),
(12,'2026-12-12',25,43,0,false,true,'User confirmation required: original range $25-$43.'),
(13,'2026-12-13',43,52,17,false,false,''),
(14,'2026-12-14',null,null,0,true,false,'Rest day'),
(15,'2026-12-15',35,43,0,false,false,''),
(16,'2026-12-16',43,52,0,false,false,''),
(17,'2026-12-17',52,62,19,false,false,''),
(18,'2026-12-18',43,52,0,false,false,''),
(19,'2026-12-19',52,62,0,false,false,''),
(20,'2026-12-20',62,73,21,false,false,''),
(21,'2026-12-21',null,null,0,true,false,'Rest day'),
(22,'2026-12-22',52,62,0,false,false,''),
(23,'2026-12-23',62,73,0,false,false,''),
(24,'2026-12-24',73,85,23,false,false,''),
(25,'2026-12-25',62,73,0,false,false,''),
(26,'2026-12-26',73,85,0,false,false,''),
(27,'2026-12-27',85,98,25,false,false,''),
(28,'2026-12-28',null,null,0,true,false,'Rest day'),
(29,'2026-12-29',73,85,0,false,false,''),
(30,'2026-12-30',85,98,0,false,false,''),
(31,'2026-12-31',98,112,82,false,false,'');

-- Totals: 31 dates; 28 active days; 3 rest days; 9 planned withdrawals = $226.
-- Day 12 is intentionally not normalized to another target range.
-- Day 31 withdrawal is $82; remaining $30 is only a conditional result if its actual close is $112.
