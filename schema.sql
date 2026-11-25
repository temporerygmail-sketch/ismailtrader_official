-- Run once in Supabase: SQL Editor > New query > paste > Run
create table profiles(id uuid primary key references auth.users on delete cascade,name text,role text not null default 'member',created_at timestamptz default now());
create function is_admin() returns boolean language sql security definer stable set search_path=public as $$select exists(select 1 from profiles where id=auth.uid() and role='admin')$$;
create function new_user() returns trigger language plpgsql security definer set search_path=public as $$begin insert into profiles(id,name) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'name',''),new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)));return new;end$$;
create trigger on_signup after insert on auth.users for each row execute function new_user();

create table signals(id bigint generated always as identity primary key,pair text not null,direction text not null check(direction in('UP','DOWN')),amount numeric not null,expiry_at timestamptz not null,before_url text,after_url text,result text not null default 'pending' check(result in('pending','win','loss','refund')),created_at timestamptz default now());
create table withdrawals(id bigint generated always as identity primary key,amount numeric not null,image_url text,created_at timestamptz default now());
create table day_closes(day_no int primary key check(day_no between 1 and 31),closed_balance numeric not null,created_at timestamptz default now());
create table messages(id bigint generated always as identity primary key,channel text not null check(channel in('updates','official','demo','discussion')),user_id uuid not null default auth.uid() references profiles(id),body text,image_url text,created_at timestamptz default now());
create table settings(k text primary key,v text);

alter table profiles enable row level security;alter table signals enable row level security;alter table withdrawals enable row level security;alter table day_closes enable row level security;alter table messages enable row level security;alter table settings enable row level security;

create policy r on profiles for select to authenticated using(true);
create policy r on signals for select to authenticated using(true);create policy w on signals for all to authenticated using(is_admin()) with check(is_admin());
create policy r on withdrawals for select to authenticated using(true);create policy w on withdrawals for all to authenticated using(is_admin()) with check(is_admin());
create policy r on day_closes for select to authenticated using(true);create policy w on day_closes for all to authenticated using(is_admin()) with check(is_admin());
create policy r on settings for select to authenticated using(true);create policy w on settings for all to authenticated using(is_admin()) with check(is_admin());
create policy r on messages for select to authenticated using(true);
create policy i on messages for insert to authenticated with check(user_id=auth.uid() and (channel='discussion' or is_admin()));
create policy d on messages for delete to authenticated using(is_admin());

insert into storage.buckets(id,name,public) values('media','media',true);
create policy mr on storage.objects for select using(bucket_id='media');
create policy mw on storage.objects for insert to authenticated with check(bucket_id='media' and is_admin());

alter publication supabase_realtime add table signals,withdrawals,day_closes,messages,settings;

-- After you sign up once in the app, make yourself admin (put your email):
-- update profiles set role='admin' where id=(select id from auth.users where email='YOUR_EMAIL');
