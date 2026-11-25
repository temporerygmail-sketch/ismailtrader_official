# Nexoventia - deployment and Supabase setup

Website: https://temporerygmail-sketch.github.io/ismailtrader_official/

The frontend is hosted on GitHub Pages. The source project does not include a Supabase project URL or public key, so login and database features require setup.

## 1. Connect Supabase
1. Create or open a project at https://supabase.com/.
2. In Project Settings -> API, copy the Project URL and the publishable/anon public key.
3. Open the website and paste both values into its setup panel. They are stored in that browser's local storage.
4. Never use a service_role key, secret key, or database password in the browser.

## 2. Create the database
1. Open Supabase SQL Editor -> New query.
2. Open schema.sql in this repository, copy all its SQL, and run it once on a fresh project.
3. It creates app tables, profile trigger, row-level security policies, media storage bucket, and realtime publication entries.

## 3. Configure authentication URLs
In Supabase Authentication -> URL Configuration:
- Site URL: https://temporerygmail-sketch.github.io/ismailtrader_official/
- Add the same URL to the allowed redirect URLs.

For Google sign-in, enable Google under Authentication -> Providers -> Google, and configure the provider callback URL as shown by Supabase in your Google OAuth client.

## 4. Make your account admin
1. Create your account on the website and confirm your email if email confirmation is enabled.
2. In Supabase SQL Editor, replace the email below and run:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
```

## Notes
- GitHub Pages hosts only the frontend. Supabase provides auth, database, storage, and realtime services.
- Preview mode displays the login UI only. Login, signup, Google OAuth, chat, signals, withdrawals, and dashboard data need the Supabase setup above.
- schema.sql contains no project credentials. Run it once only; do not repeatedly run it without checking existing tables, policies, triggers, and realtime publication membership.
