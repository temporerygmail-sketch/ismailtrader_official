-- NEXOVENTIA Trading Operations Hub — production reference snapshot
-- ACTIVE PROJECT: qxqdicbhsnrjibwgypyi
-- Region: ap-southeast-2 (Sydney)
-- This file documents the connected LIVE database model and December plan.
-- It is a reference snapshot, NOT a standalone migration. Do not execute it
-- against an existing database. Supabase migration history is the DDL source of truth.
--
-- Authorization:
-- Admin checks use private.is_admin(), a SECURITY DEFINER helper in the
-- non-exposed private schema. It reads public.profiles.role='admin'.
-- User-editable auth metadata is never an authorization source. Members
-- cannot change their own role; only an existing admin can promote a profile.
--
-- MFA:
-- private.mfa_session_allowed() checks auth.mfa_factors. Users with a verified
-- factor must hold a JWT with aal='aal2'. Users without a verified factor may
-- use their normal authenticated session. Restrictive AAL2 policies cover all
-- public application tables and the private nexoventia-media storage bucket.
--
-- Public tables with Row Level Security enabled:
-- profiles, challenge_days, signals, withdrawals, day_closes, messages,
-- private_messages, user_presence, app_state, notifications, activity_logs,
-- audit_log. The live private schema also contains private.is_admin() and
-- private.mfa_session_allowed().
--
-- Shared read model:
-- challenge calendar, official/demo signal records, day closes, withdrawal
-- receipts, community posts and notifications are shared read-only to signed-in
-- members. Only the admin can publish signals/updates, record outcomes,
-- withdrawals, day closes and shared app state.
--
-- Community posting condition: channel='discussion' OR private.is_admin().
-- Members can post only in Discussion Group. Quetex Updates and both signal
-- rooms are admin-published.
--
-- Private inbox:
-- A member may send only to a profile whose role is admin. Admins can message
-- an individual member. Member-to-member DMs are blocked by RLS.
--
-- Media:
-- Bucket: nexoventia-media (private; 50 MB per object).
-- Allowed types include JPEG, PNG, WebP, GIF, MP4, WebM, MP3, PDF.
-- Uploads are scoped to the signed-in user's folder; authenticated members
-- can read the shared archive, subject to MFA AAL2 enforcement when enrolled.
--
-- Realtime publication:
-- signals, withdrawals, day_closes, messages, private_messages, app_state,
-- notifications. Database triggers create shared notifications and audit rows.
--
-- Least-privilege browser ACLs:
-- REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
-- REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
-- REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
-- Then the connected project grants only the operations needed by the frontend.
-- Neither anon nor authenticated has TRUNCATE privileges. New objects created
-- by the postgres migration owner do not inherit blanket browser-role grants.
--
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
-- Day 31's $98-$112 target is pre-withdrawal. After the $82 withdrawal, the remaining actual account close is $16-$30; at the $112 target it is $30.
