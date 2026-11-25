-- NEXOVENTIA Trading Operations Hub — LIVE DATABASE REFERENCE
-- Active Supabase project ref: qxqdicbhsnrjibwgypyi
-- Region: ap-southeast-2 (Sydney)
--
-- IMPORTANT: This is a reference snapshot for review and validation.
-- It is not a standalone migration and must not be executed over production.
-- The live Supabase migration history is the DDL source of truth.
--
-- Applied live database migrations:
-- 20261125102742 nexoventia_trading_hub_core
-- 20261125102859 nexoventia_auth_permissions_and_audit
-- 20261125102932 nexoventia_private_message_reads_and_audit_fix
-- 20261125103557 move_admin_helper_to_private_schema
-- 20261125103743 tighten_write_policies_and_index_relations
-- 20261125104127 day12_clarification_and_shared_notifications
-- 20261125104217 index_legacy_audit_reference
-- 20261125110440 tighten_public_table_and_sequence_grants
-- 20261125110751 enforce_aal2_for_verified_mfa_users
--
-- Admin authorization:
-- private.is_admin() is SECURITY DEFINER in the non-exposed private schema,
-- has a pinned empty search_path, and checks public.profiles.role='admin'
-- for auth.uid(). Browser users cannot update their own role column.
-- The frontend reads the profile role; authorization remains enforced by RLS.
-- User-editable auth metadata is not an authorization source.
--
-- MFA:
-- private.mfa_session_allowed() is SECURITY DEFINER in the non-exposed
-- private schema, has a pinned empty search_path, and can be executed by
-- authenticated users only. Users with a verified TOTP factor require AAL2.
-- RESTRICTIVE policies apply to all 11 public application tables and the
-- private nexoventia-media storage bucket.
--
-- RLS-enabled public tables:
-- profiles, challenge_days, signals, withdrawals, day_closes, messages,
-- private_messages, user_presence, app_state, notifications, audit_log, activity_logs.
--
-- Shared access model:
-- Members can read the challenge calendar, official/demo signal records,
-- day closes, withdrawal receipts, shared room posts, and notifications.
-- Only the admin can create/update/delete signals, withdrawals, day closes,
-- and shared app state. Quetex Updates and both signal rooms are admin-only.
-- Members can insert messages only when channel='discussion'; admins can
-- publish to the Updates and signal rooms. Users may delete only their own
-- Discussion Group messages; admins can moderate.
-- Live WITH CHECK expression: channel='discussion' OR private.is_admin(),
-- combined with user_id=auth.uid().
--
-- Private inbox:
-- The private_messages_insert_admin_route policy checks recipient_id against
-- profiles.role='admin'. A member may send only to that admin profile;
-- admins may message individual members. Member-to-member DMs are blocked.
--
-- Presence:
-- Members upsert only their own user_presence row. The presence SELECT
-- policy exposes the online directory to the admin, while members see self.
--
-- Private media:
-- Storage bucket: nexoventia-media (not public; 50 MB per object).
-- Uploads are scoped to a user's folder; admin can manage shared signal and
-- withdrawal evidence. Signed URLs are used for private media display.
--
-- Least-privilege browser grants (migration 20261125111417):
-- anon has no table, sequence or public-function privileges.
-- authenticated receives only required table/column privileges.
-- TRUNCATE is revoked from anon and authenticated on every public table.
-- profiles.role is not updateable through the browser; profile edits are
-- limited to display_name, username, avatar_path, bio and updated_at.
-- private.is_admin() EXECUTE is granted to authenticated because RLS invokes it.
-- Trigger functions remain callable by their trigger owner, not browser roles.
--
-- Realtime publication includes signals, withdrawals, day_closes, messages,
-- private_messages, app_state and notifications.
-- Notification triggers broadcast signal/result, withdrawal, day-close and
-- Updates events to the member notification table.
--
-- December 2026 challenge schedule (reference data; not executable INSERT SQL)
-- Fields: day_no, calendar_date, target_min, target_max, planned_withdrawal,
-- is_rest_day, clarification_needed, admin_note.
-- Ranges on withdrawal days are pre-withdrawal targets. Day close is the
-- actual remaining account balance after that day's withdrawal.
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
(12,'2026-12-12',25,43,0,false,true,'Original $25-$43 entry preserved. Confirm later; do not auto-correct.'),
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
(31,'2026-12-31',98,112,82,false,false,'Pre-withdrawal target; actual post-withdrawal close is $16-$30.');
 
-- Totals: 31 calendar days; 28 active; 3 rest; 9 planned withdrawals = $226.
-- Day 12 remains $25-$43. Day 31 $112 minus $82 = $30 remaining, if that
-- upper pre-withdrawal target is reached. The app records only the actual close.
