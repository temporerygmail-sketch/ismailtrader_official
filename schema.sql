-- Nexoventia Trading Hub schema
-- Supabase project: qxqdicbhsnrjibwgypyi
-- Apply once to a fresh Supabase project. All financial and signal content is shared read-only to members.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Member',
  username text unique,
  avatar_path text,
  bio text not null default '',
  role text not null default 'member' check (role in ('admin','moderator','member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_nexoventia_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_name text;
  v_username text;
  v_candidate text;
  v_suffix integer := 0;
begin
  v_name := coalesce(nullif(new.raw_user_meta_data->>'full_name',''),nullif(new.raw_user_meta_data->>'name',''),split_part(coalesce(new.email,''),'@',1),'Member');
  v_username := nullif(lower(new.raw_user_meta_data->>'username'),'');
  if v_username is not null then
    v_candidate := v_username;
    while exists(select 1 from public.profiles p where p.username=v_candidate) loop
      v_suffix := v_suffix + 1;
      v_candidate := left(v_username,greatest(3,23-length(v_suffix::text))) || '_' || v_suffix::text;
    end loop;
  end if;
  insert into public.profiles(id,display_name,username) values(new.id,v_name,v_candidate) on conflict(id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_nexoventia_user() from public, anon, authenticated;
create trigger on_nexoventia_user_created after insert on auth.users for each row execute function public.handle_new_nexoventia_user();

create table public.challenge_days (
  day_no integer primary key check(day_no between 1 and 31),
  calendar_date date not null unique,
  is_rest_day boolean not null default false,
  target_min numeric(12,2),
  target_max numeric(12,2),
  planned_withdrawal numeric(12,2) not null default 0,
  phase text not null,
  note text not null default '',
  constraint challenge_target_pair check ((is_rest_day and target_min is null and target_max is null) or (not is_rest_day and target_min >= 0 and target_max >= target_min))
);

create table public.day_closes (
  day_no integer primary key references public.challenge_days(day_no),
  closing_balance numeric(12,2) not null check(closing_balance >= 0),
  note text not null default '',
  closed_by uuid not null references public.profiles(id),
  closed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.signals (
  id bigint generated always as identity primary key,
  feed text not null check(feed in ('official','demo')),
  day_no integer references public.challenge_days(day_no),
  pair text not null,
  timeframe text not null default '1m',
  direction text not null check(direction in ('UP','DOWN')),
  amount numeric(12,2) not null check(amount > 0),
  issued_at timestamptz not null default now(),
  expiry_at timestamptz not null,
  before_path text not null,
  after_path text,
  outcome text not null default 'pending' check(outcome in ('pending','win','loss','refund')),
  result_note text not null default '',
  issued_by uuid not null references public.profiles(id),
  result_at timestamptz,
  updated_at timestamptz not null default now(),
  check(expiry_at > issued_at)
);

create table public.withdrawals (
  id bigint generated always as identity primary key,
  amount numeric(12,2) not null check(amount > 0),
  day_no integer references public.challenge_days(day_no),
  receipt_path text,
  note text not null default '',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.app_state (
  key text primary key,
  value jsonb not null default 'null'::jsonb,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id bigint generated always as identity primary key,
  channel text not null check(channel in ('updates','official','demo','discussion')),
  user_id uuid not null references public.profiles(id),
  body text not null default '' check(char_length(body) <= 10000),
  attachments jsonb not null default '[]'::jsonb,
  reply_to bigint references public.messages(id),
  edited_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.private_messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null references public.profiles(id),
  recipient_id uuid not null references public.profiles(id),
  body text not null check(char_length(body) between 1 and 10000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check(sender_id <> recipient_id)
);

create table public.user_presence (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  is_online boolean not null default false,
  last_seen timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  kind text not null default 'announcement',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  entity text not null,
  entity_id text,
  action text not null,
  created_at timestamptz not null default now()
);

create index signals_issued_at_idx on public.signals(issued_at desc);
create index signals_feed_issued_at_idx on public.signals(feed,issued_at desc);
create index withdrawals_created_at_idx on public.withdrawals(created_at desc);
create index messages_channel_created_idx on public.messages(channel,created_at desc);
create index private_messages_pair_idx on public.private_messages(sender_id,recipient_id,created_at desc);
create index notifications_user_created_idx on public.notifications(user_id,created_at desc);
create index presence_last_seen_idx on public.user_presence(last_seen desc);

alter table public.profiles enable row level security;
alter table public.challenge_days enable row level security;
alter table public.day_closes enable row level security;
alter table public.signals enable row level security;
alter table public.withdrawals enable row level security;
alter table public.app_state enable row level security;
alter table public.messages enable row level security;
alter table public.private_messages enable row level security;
alter table public.user_presence enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

create policy "profiles visible to authenticated members" on public.profiles for select to authenticated using(true);
create policy "members update own basic profile" on public.profiles for update to authenticated using(id=(select auth.uid()) and role='member') with check(id=(select auth.uid()) and role='member');
create policy "admins manage profiles" on public.profiles for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));

create policy "challenge calendar visible to members" on public.challenge_days for select to authenticated using(true);
create policy "admins manage challenge calendar" on public.challenge_days for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));

create policy "day closes visible to members" on public.day_closes for select to authenticated using(true);
create policy "admins manage day closes" on public.day_closes for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));

create policy "signals visible to members" on public.signals for select to authenticated using(true);
create policy "admins manage signals" on public.signals for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));

create policy "withdrawals visible to members" on public.withdrawals for select to authenticated using(true);
create policy "admins manage withdrawals" on public.withdrawals for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));

create policy "app state visible to members" on public.app_state for select to authenticated using(true);
create policy "admins manage app state" on public.app_state for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));

create policy "members read community posts" on public.messages for select to authenticated using(true);
create policy "only discussion members or admins may post" on public.messages for insert to authenticated with check(user_id=(select auth.uid()) and (channel='discussion' or (select public.is_admin())));
create policy "admins delete messages" on public.messages for delete to authenticated using((select public.is_admin()));

create policy "admin and member read their private conversation" on public.private_messages for select to authenticated using(sender_id=(select auth.uid()) or recipient_id=(select auth.uid()));
create policy "private messages only between admin and member" on public.private_messages for insert to authenticated with check(sender_id=(select auth.uid()) and (((select public.is_admin()) and exists(select 1 from public.profiles p where p.id=recipient_id and p.role='member')) or (not (select public.is_admin()) and exists(select 1 from public.profiles p where p.id=recipient_id and p.role='admin'))));
create policy "recipient marks private message read" on public.private_messages for update to authenticated using(recipient_id=(select auth.uid())) with check(recipient_id=(select auth.uid()));

create policy "users update own presence" on public.user_presence for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "admins view all presence" on public.user_presence for select to authenticated using((select public.is_admin()));

create policy "users read global or own notices; admins read all" on public.notifications for select to authenticated using(user_id is null or user_id=(select auth.uid()) or (select public.is_admin()));
create policy "admins create notifications" on public.notifications for insert to authenticated with check((select public.is_admin()));
create policy "users mark own notices read" on public.notifications for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

create policy "admins read activity logs" on public.activity_logs for select to authenticated using((select public.is_admin()));
create policy "admins insert activity logs" on public.activity_logs for insert to authenticated with check((select public.is_admin()));

create or replace function public.nexoventia_audit_row()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_row jsonb;
  v_actor uuid;
  v_id text;
begin
  v_row := case when TG_OP='DELETE' then to_jsonb(OLD) else to_jsonb(NEW) end;
  v_actor := coalesce((select auth.uid()),nullif(coalesce(v_row->>'updated_by',v_row->>'created_by',v_row->>'closed_by',v_row->>'issued_by',v_row->>'user_id'),'')::uuid);
  v_id := coalesce(v_row->>'id',v_row->>'day_no',v_row->>'key');
  insert into public.activity_logs(actor_id,entity,entity_id,action) values(v_actor,TG_TABLE_NAME,v_id,lower(TG_OP));
  if TG_OP='DELETE' then return OLD; end if;
  return NEW;
end;
$$;
revoke all on function public.nexoventia_audit_row() from public,anon,authenticated;
create trigger audit_signal_rows after insert or update or delete on public.signals for each row execute function public.nexoventia_audit_row();
create trigger audit_withdrawal_rows after insert or update or delete on public.withdrawals for each row execute function public.nexoventia_audit_row();
create trigger audit_day_close_rows after insert or update or delete on public.day_closes for each row execute function public.nexoventia_audit_row();

insert into public.challenge_days(day_no,calendar_date,is_rest_day,target_min,target_max,planned_withdrawal,phase,note) values
(1,'2026-12-01',false,10,13,0,'Phase 1','Day 1 target'),
(2,'2026-12-02',false,13,17,0,'Phase 1','Day 2 target'),
(3,'2026-12-03',false,17,22,0,'Phase 1','Day 3 target'),
(4,'2026-12-04',false,22,28,11,'Phase 1','Day 4 target; planned withdrawal $11'),
(5,'2026-12-05',false,17,22,0,'Phase 1','Day 5 target after withdrawal'),
(6,'2026-12-06',false,22,28,0,'Phase 1','Day 6 target'),
(7,'2026-12-07',false,28,35,13,'Phase 1','Day 7 target; planned withdrawal $13'),
(8,'2026-12-08',false,22,28,0,'Phase 1','Day 8 target'),
(9,'2026-12-09',false,28,35,0,'Phase 1','Day 9 target'),
(10,'2026-12-10',false,35,43,15,'Phase 1','Day 10 target; planned withdrawal $15'),
(11,'2026-12-11',false,28,35,0,'Phase 1','Day 11 target'),
(12,'2026-12-12',false,25,43,0,'Phase 1','Original $25–$43 entry; clarification pending'),
(13,'2026-12-13',false,43,52,17,'Phase 1','Day 13 target; planned withdrawal $17'),
(14,'2026-12-14',true,null,null,0,'Rest','Rest day'),
(15,'2026-12-15',false,35,43,0,'Phase 2','Day 15 target'),
(16,'2026-12-16',false,43,52,0,'Phase 2','Day 16 target'),
(17,'2026-12-17',false,52,62,19,'Phase 2','Day 17 target; planned withdrawal $19'),
(18,'2026-12-18',false,43,52,0,'Phase 2','Day 18 target'),
(19,'2026-12-19',false,52,62,0,'Phase 2','Day 19 target'),
(20,'2026-12-20',false,62,73,21,'Phase 2','Day 20 target; planned withdrawal $21'),
(21,'2026-12-21',true,null,null,0,'Rest','Rest day'),
(22,'2026-12-22',false,52,62,0,'Phase 3','Day 22 target'),
(23,'2026-12-23',false,62,73,0,'Phase 3','Day 23 target'),
(24,'2026-12-24',false,73,85,23,'Phase 3','Day 24 target; planned withdrawal $23'),
(25,'2026-12-25',false,62,73,0,'Phase 3','Day 25 target'),
(26,'2026-12-26',false,73,85,0,'Phase 3','Day 26 target'),
(27,'2026-12-27',false,85,98,25,'Phase 3','Day 27 target; planned withdrawal $25'),
(28,'2026-12-28',true,null,null,0,'Rest','Rest day'),
(29,'2026-12-29',false,73,85,0,'Final Phase','Day 29 target'),
(30,'2026-12-30',false,85,98,0,'Final Phase','Day 30 target'),
(31,'2026-12-31',false,98,112,82,'Final Phase','Day 31 target; planned withdrawal $82; intended remaining balance $30');

insert into public.app_state(key,value) values
('next_signal_at','null'::jsonb),
('challenge_start_date','"2026-12-01"'::jsonb),
('challenge_timezone','"Asia/Karachi"'::jsonb);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('nexoventia-media','nexoventia-media',false,52428800,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','audio/mpeg','audio/webm','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=52428800,allowed_mime_types=excluded.allowed_mime_types;
create policy "authenticated users read shared nexoventia media" on storage.objects for select to authenticated using(bucket_id='nexoventia-media');
create policy "authenticated users upload own nexoventia media" on storage.objects for insert to authenticated with check(bucket_id='nexoventia-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "admins delete shared nexoventia media" on storage.objects for delete to authenticated using(bucket_id='nexoventia-media' and (select public.is_admin()));

grant usage on schema public to authenticated;
grant select,update on public.profiles to authenticated;
grant select on public.challenge_days to authenticated;
grant select,insert,update,delete on public.day_closes,public.signals,public.withdrawals,public.app_state to authenticated;
grant select,insert,delete on public.messages to authenticated;
grant select,insert on public.private_messages to authenticated;
grant update(read_at) on public.private_messages to authenticated;
grant select,insert,update on public.user_presence,public.notifications to authenticated;
grant select,insert on public.activity_logs to authenticated;
grant usage,select on all sequences in schema public to authenticated;

do $$
begin
  begin alter publication supabase_realtime add table public.signals; exception when duplicate_object then null; when undefined_object then null; end;
  begin alter publication supabase_realtime add table public.withdrawals; exception when duplicate_object then null; when undefined_object then null; end;
  begin alter publication supabase_realtime add table public.day_closes; exception when duplicate_object then null; when undefined_object then null; end;
  begin alter publication supabase_realtime add table public.messages; exception when duplicate_object then null; when undefined_object then null; end;
  begin alter publication supabase_realtime add table public.private_messages; exception when duplicate_object then null; when undefined_object then null; end;
  begin alter publication supabase_realtime add table public.app_state; exception when duplicate_object then null; when undefined_object then null; end;
  begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; when undefined_object then null; end;
end $$;
