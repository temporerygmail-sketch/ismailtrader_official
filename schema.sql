-- NEXOVENTIA — fresh-project schema
-- This is the consolidated reference schema for Supabase.
-- It has already been applied to project ref dbsgvcfvlnhwecyfsxib.
-- Run once only on a brand-new Supabase project. Never run in production without a backup.

create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean language sql stable security invoker set search_path=''
as $$ select coalesce((auth.jwt()->'app_metadata'->>'role')='admin',false); $$;
revoke all on function public.is_admin() from public,anon;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Member',
 username text unique,
 avatar_path text,
 bio text not null default '',
 role text not null default 'member' check(role in('member','admin','moderator')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$
declare v_name text;v_base text;v_username text;v_suffix text;v_attempt int:=0;
begin
 v_name:=coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'),''),nullif(trim(new.raw_user_meta_data->>'name'),''),split_part(coalesce(new.email,'member'),'@',1));
 v_base:=lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username',split_part(coalesce(new.email,'member'),'@',1)),'[^a-z0-9_]','','g'));
 if v_base='' then v_base:='member';end if;v_base:=left(v_base,17);v_username:=v_base;
 while exists(select 1 from public.profiles where username=v_username) loop
  v_attempt:=v_attempt+1;v_suffix:='_'||substr(replace(new.id::text,'-',''),1,6+least(v_attempt,4));v_username:=left(v_base,24-length(v_suffix))||v_suffix;
  if v_attempt>8 then v_username:='member_'||substr(replace(new.id::text,'-',''),1,12);exit;end if;
 end loop;
 insert into public.profiles(id,display_name,username) values(new.id,left(v_name,80),left(v_username,24)) on conflict(id) do nothing;
 return new;
end;$$;
revoke all on function public.handle_new_user() from public,anon,authenticated;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users for each row execute procedure public.handle_new_user();

create table if not exists public.challenge_days(
 day_no smallint primary key check(day_no between 1 and 31),
 calendar_date date not null unique,
 target_min numeric(12,2),
 target_max numeric(12,2),
 planned_withdrawal numeric(12,2) not null default 0 check(planned_withdrawal>=0),
 is_rest_day boolean not null default false,
 clarification_needed boolean not null default false,
 admin_note text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check((is_rest_day and target_min is null and target_max is null) or (not is_rest_day and target_min is not null and target_max is not null and target_min<=target_max))
);
insert into public.challenge_days(day_no,calendar_date,target_min,target_max,planned_withdrawal,is_rest_day,clarification_needed,admin_note) values
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
(12,'2026-12-12',25,43,0,false,true,'Original preserved as $25-$43; confirm minimum.'),
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
(31,'2026-12-31',98,112,82,false,false,'')
on conflict(day_no) do nothing;

create table if not exists public.signals(
 id uuid primary key default gen_random_uuid(),
 feed text not null default 'official' check(feed in('official','demo')),
 day_no smallint references public.challenge_days(day_no),
 pair text not null,
 timeframe text not null default '1m',
 direction text not null check(direction in('UP','DOWN')),
 amount numeric(12,2) not null check(amount>0),
 issued_at timestamptz not null default now(),
 expiry_at timestamptz not null,
 before_path text,
 after_path text,
 outcome text not null default 'pending' check(outcome in('pending','win','loss','refund')),
 result_note text not null default '',
 issued_by uuid not null references public.profiles(id),
 result_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(expiry_at>issued_at)
);
create index if not exists signals_feed_issued_idx on public.signals(feed,issued_at desc);
create index if not exists signals_day_idx on public.signals(day_no,issued_at desc);
create index if not exists signals_issued_by_idx on public.signals(issued_by);

create table if not exists public.withdrawals(
 id uuid primary key default gen_random_uuid(),
 day_no smallint references public.challenge_days(day_no),
 amount numeric(12,2) not null check(amount>0),
 receipt_path text,
 note text not null default '',
 created_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now()
);
create index if not exists withdrawals_created_idx on public.withdrawals(created_at desc);
create index if not exists withdrawals_day_idx on public.withdrawals(day_no);
create index if not exists withdrawals_created_by_idx on public.withdrawals(created_by);

create table if not exists public.day_closes(
 day_no smallint primary key references public.challenge_days(day_no),
 closing_balance numeric(12,2) not null check(closing_balance>=0),
 note text not null default '',
 closed_by uuid not null references public.profiles(id),
 closed_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists day_closes_closed_by_idx on public.day_closes(closed_by);

create table if not exists public.messages(
 id uuid primary key default gen_random_uuid(),
 channel text not null check(channel in('updates','discussion')),
 user_id uuid not null references public.profiles(id),
 body text not null default '',
 attachments jsonb not null default '[]'::jsonb,
 reply_to uuid references public.messages(id) on delete set null,
 created_at timestamptz not null default now(),
 edited_at timestamptz,
 check(char_length(body)<=5000)
);
create index if not exists messages_channel_created_idx on public.messages(channel,created_at desc);
create index if not exists messages_user_idx on public.messages(user_id);
create index if not exists messages_reply_to_idx on public.messages(reply_to);

create table if not exists public.private_messages(
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references public.profiles(id),
 recipient_id uuid not null references public.profiles(id),
 body text not null default '',
 attachments jsonb not null default '[]'::jsonb,
 read_at timestamptz,
 created_at timestamptz not null default now(),
 check(sender_id<>recipient_id),
 check(char_length(body)<=5000)
);
create index if not exists private_messages_pair_created_idx on public.private_messages(sender_id,recipient_id,created_at desc);
create index if not exists private_messages_recipient_idx on public.private_messages(recipient_id);

create table if not exists public.user_presence(
 user_id uuid primary key references public.profiles(id) on delete cascade,
 is_online boolean not null default false,
 last_seen timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.app_state(
 key text primary key,
 value jsonb not null default 'null'::jsonb,
 updated_by uuid references public.profiles(id),
 updated_at timestamptz not null default now()
);
create index if not exists app_state_updated_by_idx on public.app_state(updated_by);
insert into public.app_state(key,value) values('next_signal_at','null'::jsonb),('challenge_start','"2026-12-01"'::jsonb) on conflict(key) do nothing;

create table if not exists public.notifications(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 title text not null,
 body text not null default '',
 category text not null default 'general',
 read_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id,created_at desc);

create table if not exists public.activity_logs(
 id bigint generated always as identity primary key,
 actor_id uuid references public.profiles(id),
 entity text not null,
 entity_id text,
 action text not null,
 before_data jsonb,
 after_data jsonb,
 created_at timestamptz not null default now()
);
create index if not exists activity_logs_created_idx on public.activity_logs(created_at desc);
create index if not exists activity_logs_actor_idx on public.activity_logs(actor_id);

create or replace function public.write_activity_log()
returns trigger language plpgsql security definer set search_path=public
as $$
declare v_old jsonb;v_new jsonb;v_id text;
begin
 if tg_op<>'INSERT' then v_old:=to_jsonb(old);end if;
 if tg_op<>'DELETE' then v_new:=to_jsonb(new);end if;
 v_id:=coalesce(v_new->>'id',v_new->>'day_no',v_old->>'id',v_old->>'day_no');
 insert into public.activity_logs(actor_id,entity,entity_id,action,before_data,after_data)
 values(auth.uid(),tg_table_name,v_id,lower(tg_op),v_old,v_new);
 if tg_op='DELETE' then return old;else return new;end if;
end;$$;
revoke all on function public.write_activity_log() from public,anon,authenticated;
drop trigger if exists audit_signals on public.signals;
create trigger audit_signals after insert or update or delete on public.signals for each row execute procedure public.write_activity_log();
drop trigger if exists audit_withdrawals on public.withdrawals;
create trigger audit_withdrawals after insert or update or delete on public.withdrawals for each row execute procedure public.write_activity_log();
drop trigger if exists audit_day_closes on public.day_closes;
create trigger audit_day_closes after insert or update or delete on public.day_closes for each row execute procedure public.write_activity_log();

create or replace function public.create_member_notification()
returns trigger language plpgsql security definer set search_path=public
as $$
declare v_title text;v_body text;v_category text;v_actor uuid;
begin
 if tg_table_name='signals' then
  if tg_op='INSERT' then
   v_title:=case when new.feed='official' then 'New official signal' else 'New demo signal' end;
   v_body:=new.pair||' · '||new.direction||' · '||new.timeframe;v_category:='signal';v_actor:=new.issued_by;
  elsif tg_op='UPDATE' and new.outcome is distinct from old.outcome and new.outcome<>'pending' then
   v_title:='Signal result recorded';v_body:=new.pair||' · '||upper(new.outcome);v_category:='result';v_actor:=new.issued_by;
  else return new;end if;
 elsif tg_table_name='withdrawals' and tg_op='INSERT' then
  v_title:='Withdrawal record added';v_body:='$'||to_char(new.amount,'FM999999990.00');v_category:='withdrawal';v_actor:=new.created_by;
 elsif tg_table_name='day_closes' and (tg_op='INSERT' or (tg_op='UPDATE' and new.closing_balance is distinct from old.closing_balance)) then
  v_title:='Challenge day closed';v_body:='Day '||new.day_no||' · closing balance $'||to_char(new.closing_balance,'FM999999990.00');v_category:='challenge';v_actor:=new.closed_by;
 elsif tg_table_name='messages' and tg_op='INSERT' and new.channel='updates' then
  v_title:='Nexoventia update';v_body:=case when length(new.body)>140 then left(new.body,137)||'...' else new.body end;v_category:='announcement';v_actor:=new.user_id;
 else return new;end if;
 insert into public.notifications(user_id,title,body,category)
 select p.id,v_title,coalesce(v_body,''),v_category from public.profiles p where p.id is distinct from v_actor;
 return new;
end;$$;
revoke all on function public.create_member_notification() from public,anon,authenticated;
drop trigger if exists notify_signal_change on public.signals;
create trigger notify_signal_change after insert or update on public.signals for each row execute procedure public.create_member_notification();
drop trigger if exists notify_withdrawal_insert on public.withdrawals;
create trigger notify_withdrawal_insert after insert on public.withdrawals for each row execute procedure public.create_member_notification();
drop trigger if exists notify_day_close on public.day_closes;
create trigger notify_day_close after insert or update on public.day_closes for each row execute procedure public.create_member_notification();
drop trigger if exists notify_update_message on public.messages;
create trigger notify_update_message after insert on public.messages for each row execute procedure public.create_member_notification();

alter table public.profiles enable row level security;
alter table public.challenge_days enable row level security;
alter table public.signals enable row level security;
alter table public.withdrawals enable row level security;
alter table public.day_closes enable row level security;
alter table public.messages enable row level security;
alter table public.private_messages enable row level security;
alter table public.user_presence enable row level security;
alter table public.app_state enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using(true);
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
using(id=(select auth.uid()) or public.is_admin())
with check(public.is_admin() or (id=(select auth.uid()) and role='member'));

drop policy if exists challenge_read on public.challenge_days;
create policy challenge_read on public.challenge_days for select to authenticated using(true);
drop policy if exists challenge_admin_update on public.challenge_days;
create policy challenge_admin_update on public.challenge_days for update to authenticated using(public.is_admin()) with check(public.is_admin());

drop policy if exists signals_read on public.signals;
create policy signals_read on public.signals for select to authenticated using(true);
drop policy if exists signals_admin_insert on public.signals;
create policy signals_admin_insert on public.signals for insert to authenticated with check(public.is_admin() and issued_by=(select auth.uid()));
drop policy if exists signals_admin_update on public.signals;
create policy signals_admin_update on public.signals for update to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists signals_admin_delete on public.signals;
create policy signals_admin_delete on public.signals for delete to authenticated using(public.is_admin());

drop policy if exists withdrawals_read on public.withdrawals;
create policy withdrawals_read on public.withdrawals for select to authenticated using(true);
drop policy if exists withdrawals_admin_insert on public.withdrawals;
create policy withdrawals_admin_insert on public.withdrawals for insert to authenticated with check(public.is_admin() and created_by=(select auth.uid()));
drop policy if exists withdrawals_admin_update on public.withdrawals;
create policy withdrawals_admin_update on public.withdrawals for update to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists withdrawals_admin_delete on public.withdrawals;
create policy withdrawals_admin_delete on public.withdrawals for delete to authenticated using(public.is_admin());

drop policy if exists day_closes_read on public.day_closes;
create policy day_closes_read on public.day_closes for select to authenticated using(true);
drop policy if exists day_closes_admin_insert on public.day_closes;
create policy day_closes_admin_insert on public.day_closes for insert to authenticated with check(public.is_admin() and closed_by=(select auth.uid()));
drop policy if exists day_closes_admin_update on public.day_closes;
create policy day_closes_admin_update on public.day_closes for update to authenticated using(public.is_admin()) with check(public.is_admin());

drop policy if exists messages_read on public.messages;
create policy messages_read on public.messages for select to authenticated using(true);
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert to authenticated with check(user_id=(select auth.uid()) and (channel='discussion' or public.is_admin()));
drop policy if exists messages_update_own_discussion on public.messages;
create policy messages_update_own_discussion on public.messages for update to authenticated using(user_id=(select auth.uid()) and channel='discussion') with check(user_id=(select auth.uid()) and channel='discussion');
drop policy if exists messages_delete_admin_or_own on public.messages;
create policy messages_delete_admin_or_own on public.messages for delete to authenticated using(public.is_admin() or (user_id=(select auth.uid()) and channel='discussion'));

drop policy if exists private_messages_read_participants on public.private_messages;
create policy private_messages_read_participants on public.private_messages for select to authenticated using(sender_id=(select auth.uid()) or recipient_id=(select auth.uid()) or public.is_admin());
drop policy if exists private_messages_insert_admin_route on public.private_messages;
create policy private_messages_insert_admin_route on public.private_messages for insert to authenticated
with check(sender_id=(select auth.uid()) and (public.is_admin() or exists(select 1 from public.profiles p where p.id=recipient_id and p.role='admin')));
drop policy if exists private_messages_update_recipient on public.private_messages;
create policy private_messages_update_recipient on public.private_messages for update to authenticated using(recipient_id=(select auth.uid()) or public.is_admin()) with check(recipient_id=(select auth.uid()) or public.is_admin());

drop policy if exists presence_read_self_or_admin on public.user_presence;
create policy presence_read_self_or_admin on public.user_presence for select to authenticated using(user_id=(select auth.uid()) or public.is_admin());
drop policy if exists presence_insert_self on public.user_presence;
create policy presence_insert_self on public.user_presence for insert to authenticated with check(user_id=(select auth.uid()));
drop policy if exists presence_update_self on public.user_presence;
create policy presence_update_self on public.user_presence for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

drop policy if exists app_state_read on public.app_state;
create policy app_state_read on public.app_state for select to authenticated using(true);
drop policy if exists app_state_admin_insert on public.app_state;
create policy app_state_admin_insert on public.app_state for insert to authenticated with check(public.is_admin());
drop policy if exists app_state_admin_update on public.app_state;
create policy app_state_admin_update on public.app_state for update to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists app_state_admin_delete on public.app_state;
create policy app_state_admin_delete on public.app_state for delete to authenticated using(public.is_admin());

drop policy if exists notifications_read_own on public.notifications;
create policy notifications_read_own on public.notifications for select to authenticated using(user_id=(select auth.uid()) or public.is_admin());
drop policy if exists notifications_insert_admin on public.notifications;
create policy notifications_insert_admin on public.notifications for insert to authenticated with check(public.is_admin());
drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications for update to authenticated using(user_id=(select auth.uid()) or public.is_admin()) with check(user_id=(select auth.uid()) or public.is_admin());

drop policy if exists activity_logs_admin_read on public.activity_logs;
create policy activity_logs_admin_read on public.activity_logs for select to authenticated using(public.is_admin());

grant select on public.profiles,public.challenge_days,public.signals,public.withdrawals,public.day_closes,public.messages,public.private_messages,public.user_presence,public.app_state,public.notifications,public.activity_logs to authenticated;
grant insert,update,delete on public.profiles,public.challenge_days,public.signals,public.withdrawals,public.day_closes,public.messages,public.private_messages,public.user_presence,public.app_state,public.notifications to authenticated;
grant usage,select on all sequences in schema public to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('nexoventia-media','nexoventia-media',false,52428800,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','audio/mpeg','audio/webm','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists nexoventia_media_read on storage.objects;
create policy nexoventia_media_read on storage.objects for select to authenticated using(bucket_id='nexoventia-media');
drop policy if exists nexoventia_media_insert on storage.objects;
create policy nexoventia_media_insert on storage.objects for insert to authenticated
with check(bucket_id='nexoventia-media' and (public.is_admin() or (storage.foldername(name))[1]=(select auth.uid())::text));
drop policy if exists nexoventia_media_update on storage.objects;
create policy nexoventia_media_update on storage.objects for update to authenticated
using(bucket_id='nexoventia-media' and (public.is_admin() or owner_id=(select auth.uid())::text))
with check(bucket_id='nexoventia-media' and (public.is_admin() or owner_id=(select auth.uid())::text));
drop policy if exists nexoventia_media_delete on storage.objects;
create policy nexoventia_media_delete on storage.objects for delete to authenticated using(bucket_id='nexoventia-media' and (public.is_admin() or owner_id=(select auth.uid())::text));

do $$
begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='signals') then alter publication supabase_realtime add table public.signals;end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='withdrawals') then alter publication supabase_realtime add table public.withdrawals;end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='day_closes') then alter publication supabase_realtime add table public.day_closes;end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='messages') then alter publication supabase_realtime add table public.messages;end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='private_messages') then alter publication supabase_realtime add table public.private_messages;end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then alter publication supabase_realtime add table public.notifications;end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='app_state') then alter publication supabase_realtime add table public.app_state;end if;
 end if;
end $$;

-- After owner signup, promote your own login email via Supabase SQL Editor:
-- update auth.users set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb)||'{"role":"admin"}'::jsonb where email='YOUR-EMAIL';
-- update public.profiles set role='admin' where id=(select id from auth.users where email='YOUR-EMAIL');
