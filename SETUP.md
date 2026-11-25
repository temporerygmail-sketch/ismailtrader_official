# Owner setup

## 1. Supabase is already provisioned
Project: nexoventia-trading-hub
Region: ap-south-1 (Mumbai)
Project ref: dbsgvcfvlnhwecyfsxib

The SQL schema is committed in schema.sql and the same schema has already been applied to the connected Supabase project.

## 2. Promote the owner account
1. Open the website and create your account with the email you want to own Nexoventia.
2. Confirm the email, then sign in.
3. In Supabase Dashboard → SQL Editor, run the following query after replacing the email with your own exact login email:

    update auth.users
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
    where email = 'YOUR-LOGIN-EMAIL@example.com';

    update public.profiles
    set role = 'admin'
    where id = (select id from auth.users where email = 'YOUR-LOGIN-EMAIL@example.com');

4. Sign out and sign in again. The fresh session token will include the admin role. Do not give this admin email/password to members.

## 3. Google login (optional)
Google OAuth cannot be enabled without credentials from the owner:
1. Create a Web OAuth client in Google Cloud Console.
2. Add the site origin https://temporerygmail-sketch.github.io to Authorized JavaScript origins.
3. Add the Supabase callback URL https://dbsgvcfvlnhwecyfsxib.supabase.co/auth/v1/callback to Authorized redirect URIs.
4. In Supabase → Authentication → Sign In / Providers → Google, enable Google and paste the Client ID and Client Secret.
5. In Supabase → Authentication → URL Configuration, set Site URL to https://temporerygmail-sketch.github.io/ismailtrader_official/ and add that exact URL to Redirect URLs.

## 4. Email signup
In Supabase → Authentication → URL Configuration, allow the GitHub Pages URL above. Email confirmation uses Supabase's configured mail delivery; production-grade custom SMTP is recommended if you expect many users.

## 5. GitHub Pages
The repo contains a GitHub Actions workflow. In repository Settings → Pages, set Source to GitHub Actions. Every push to main runs JavaScript/static checks and publishes the app.

## 6. Install on Android
Open the live site in Chrome → browser menu → Install app or Add to Home screen. This is an installable PWA, not a signed APK. A native APK would require a separate Android packaging/signing process.

## Notes
- Members can read shared records but cannot publish official/demo signals, alter withdrawals, close challenge days, or manage roles.
- Members can post only in Discussion Group. Direct messages are routed to/from the admin; member-to-member DMs are blocked in RLS.
- Browser notifications depend on notification permission and the browser being available. Full background push alerts require a separately configured push provider/VAPID keys and are not claimed as enabled here.
- Media objects are private and require an authenticated session.
