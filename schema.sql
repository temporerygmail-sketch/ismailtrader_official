-- NEXOVENTIA Trading Operations Hub — LIVE DATABASE REFERENCE
-- ACTIVE PROJECT REF: dbsgvcfvlnhwecyfsxib
-- REGION: ap-south-1 (Mumbai)
-- Review snapshot only; DO NOT execute over the initialized production DB.
-- Supabase migration history is the DDL source of truth.
--
-- Applied production migrations:
-- 20261125101825 nexoventia_initial_schema
-- 20261125101849 tighten_rls_and_fk_indexes
-- 20261125102728 signup_username_and_member_notifications
-- 20261125103044 add_initial_balance_setting
-- 20261125104216 enforce_aal2_for_enrolled_mfa_users
-- 20261125105653 move_mfa_policy_helper_to_private_schema
-- 20261125111417 tighten_browser_role_privileges
--
-- Admin auth: public.is_admin() SECURITY INVOKER checks trusted
-- auth.jwt()->'app_metadata'->>'role'='admin'. UI also requires
-- profiles.role='admin'; user-editable user_metadata is not trusted.
-- MFA: private.mfa_session_allowed() SECURITY DEFINER lives in the
-- non-exposed private schema. Verified TOTP requires AAL2; restrictive MFA
-- policies cover application tables and private nexoventia-media storage.
--
-- RLS tables: profiles, challenge_days, signals, withdrawals, day_closes,
-- messages, private_messages, user_presence, app_state, notifications,
-- activity_logs.
-- Community insert policy: channel='discussion' OR public.is_admin(),
-- with user_id=auth.uid(). Members can post only in Discussion Group;
-- Updates and signal channels are admin-published.
-- Private DM policy checks recipient_id against a profile with role='admin'.
-- Members cannot message other members. Admin can DM each member.
-- Online directory is admin-only.
--
-- Least privilege: anon has no application table/sequence/function grants.
-- TRUNCATE is revoked from anon/authenticated. profiles.role cannot be
-- updated by browser clients. public.is_admin() execute is granted to auth.
-- Storage bucket nexoventia-media is private, 50 MB per object; signed URLs.
--
-- December 2026 challenge tuples:
-- (day,date,target_min,target_max,planned_withdrawal,rest,clarification,note)
-- Withdrawal-day targets are PRE-WITHDRAWAL. Actual close is remaining
-- balance AFTER withdrawal.
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
(12,'2026-12-12',25,43,0,false,true,'Original $25-$43 preserved; owner clarification required.'),
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
(31,'2026-12-31',98,112,82,false,false,'Pre-withdrawal target; actual close $16-$30.');
-- 31 dates; 28 active; 3 rest; 9 withdrawals total $226.
-- Day 12 unchanged. Day 31 $98-$112 before $82 withdrawal leaves $16-$30.
-- $30 remains only at the $112 upper pre-withdrawal target. $10 is provisional.
