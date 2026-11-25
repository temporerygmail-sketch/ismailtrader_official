# Nexoventia — owner setup

## Connected services
- GitHub repository: https://github.com/temporerygmail-sketch/ismailtrader_official
- Live site: https://temporerygmail-sketch.github.io/ismailtrader_official/
- Supabase project: qxqdicbhsnrjibwgypyi
- Supabase region: ap-southeast-2
- Database schema: `schema.sql` and `supabase/migrations/20261125153000_nexoventia_core.sql`

The app uses Supabase Auth, Postgres, Row Level Security, Realtime and a private Storage bucket. The browser receives only the Supabase publishable key. Never add a Supabase secret/service-role key to this repository.

## 1. Activate your owner account
1. Open the live site and create an account with your own email and a unique username.
2. Confirm your email and sign in once, so the profile row is created.
3. In Supabase Dashboard → SQL Editor, run this query with your exact email:

```sql
update public.profiles
set role = 'admin', updated_at = now()
where id = (select id from auth.users where lower(email) = lower('YOUR-LOGIN-EMAIL@example.com'));
```

4. Sign out and sign in again. The Admin Control section should become visible.

Do not promote any member account to admin. The owner role controls signal publishing, day-close and withdrawals, community announcements, online-member visibility and private member inboxes.

## 2. Configure email sign-up and redirect URLs
In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://temporerygmail-sketch.github.io/ismailtrader_official/`
- Add that exact URL under Redirect URLs.
- Add `http://localhost:*` only if you use local development.

Supabase's default email sender is intended for limited testing. For dependable multi-user sign-up and password resets, configure a verified SMTP provider. Do not put SMTP credentials in frontend files.

## 3. Enable Google sign-in
The app already contains the Google OAuth button, but it cannot work until the project owner supplies Google OAuth credentials:
1. Create a Web application OAuth client in Google Cloud Console.
2. Add Authorized JavaScript origin: `https://temporerygmail-sketch.github.io`
3. Add Authorized redirect URI: `https://qxqdicbhsnrjibwgypyi.supabase.co/auth/v1/callback`
4. In Supabase → Authentication → Sign In / Providers → Google, enable Google and enter the Client ID and Client Secret.
5. In Supabase → Authentication → URL Configuration, keep the live site URL above in Redirect URLs.

The OAuth client secret belongs only in Supabase's provider settings, never in GitHub.

## 4. GitHub Pages deployment
Repository Settings → Pages must use **GitHub Actions** as the source. Each push to `main` runs the JavaScript syntax check and required-file checks, then publishes the site. A successful GitHub Actions deployment is required before treating a commit as live.

## 5. Install on Android
Open the live site in Chrome → browser menu → **Install app** or **Add to Home screen**. This installs the responsive PWA and receives frontend updates when the service worker updates on a later visit/reload. It is not a signed native APK. A signed APK needs a separate Android packaging and signing build.

## 6. Notifications and online status
In-app/realtime notifications require the app to have an active connection. Browser notifications can appear while the browser is available and permission is granted. WhatsApp-style push while the app/browser is fully closed needs a push provider, VAPID keys and server-side delivery; this is not configured yet.

Online presence is heartbeat-based while a member has the app open. It is not a guarantee that the user is actively looking at the screen.

## 7. Security and product scope
- Members may read the shared challenge, official signal archive, demo archive and withdrawal ledger.
- Members may post only in Discussion Group. Updates and signal publishing/outcome recording are admin-only.
- Member-to-member private messaging is blocked in database policies. Private messaging is restricted to member ↔ admin.
- Images and attachments are stored in a private bucket and require an authenticated session.
- Financial and signal information is a manual record. The app does not connect to Quotex, execute trades, independently verify broker outcomes or promise returns. Binary options are high risk; use this system as a records/educational tool, not as a trading recommendation.
