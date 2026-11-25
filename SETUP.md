# Nexoventia — Owner setup

## Connected services

- GitHub repository: https://github.com/temporerygmail-sketch/ismailtrader_official
- Live app: https://temporerygmail-sketch.github.io/ismailtrader_official/
- Supabase project ref: `qxqdicbhsnrjibwgypyi`
- Supabase region: `ap-southeast-2` (Sydney)
- Supabase URL: `https://qxqdicbhsnrjibwgypyi.supabase.co`

The connected database already has its tables, Row Level Security policies, private media bucket, audit/notification triggers and Realtime publication changes. `schema.sql` is the canonical fresh-project reference; do not rerun it on the live database.

## 1. Create the owner account

1. Open the live app and create your account with your own email and username.
2. Verify your email if confirmation is enabled, then sign in once so your profile row is created.
3. In Supabase Dashboard → SQL Editor, replace the example email and run:

```sql
update public.profiles
set role = 'admin', updated_at = now()
where id = (
  select id
  from auth.users
  where lower(email) = lower('YOUR-OWNER-EMAIL@example.com')
);
```

4. Sign out and sign in again. Admin Control will then appear.

Only promote your own owner account. The UI and database both use `public.profiles.role`. The RLS role check uses the private, non-exposed `private.is_admin()` helper. Members cannot change their own role.

## 2. Configure email signup and redirects

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `https://temporerygmail-sketch.github.io/ismailtrader_official/`
- Add that exact URL under Redirect URLs.
- Add `http://localhost:*` only for local development.

The default Supabase email sender is suitable for limited testing. For dependable multi-user email verification and password resets, configure a verified SMTP provider. Do not store SMTP credentials in GitHub or frontend files.

## 3. Enable Google sign-in

The Google sign-in button is present, but it requires owner-provided OAuth credentials:

1. In Google Cloud Console, create an OAuth Client ID of type Web application.
2. Add Authorized JavaScript origin: `https://temporerygmail-sketch.github.io`.
3. Add Authorized redirect URI: `https://qxqdicbhsnrjibwgypyi.supabase.co/auth/v1/callback`.
4. In Supabase Dashboard → Authentication → Sign In / Providers → Google, enable Google and add the Client ID and Client Secret.
5. In Supabase → Authentication → URL Configuration, confirm the GitHub Pages URL is in Redirect URLs.

Keep the Google Client Secret inside Supabase provider settings. Do not commit it to GitHub.

## 4. Authenticator backup

In Settings, enroll a primary TOTP authenticator and then add a second device using **Add backup authenticator**. Keep the devices separate. At sign-in, choose a registered device and enter its six-digit code. Supabase Auth supports multiple factors but does not expose recovery-code APIs. If all registered devices are lost, contact the project owner for identity-verified recovery.

## 5. GitHub Pages deployment

Repository Settings → Pages must use **GitHub Actions** as the source. The repository validation workflow checks JavaScript syntax, challenge totals, RLS/schema assertions and required assets before it passes.

## 6. Install on Android

Open the live URL in Chrome → browser menu → **Install app** or **Add to Home screen**. This installs the PWA; it is not a signed native APK. A signed APK requires a separate Android packaging and signing build.

## 7. Notifications and online status

In-app/realtime notifications work while the app has an active connection. Browser notifications depend on browser availability and permission. Push while the app/browser is fully closed requires a separate push provider, VAPID keys and server-side delivery; these are not configured.

Online presence is heartbeat-based while the app is open. It indicates a recently connected session, not proof that the member is actively viewing the screen.

## 8. Security and scope

- Members can read the shared challenge plan, official signal archive, demo archive, day-close records and withdrawal history.
- Members can post only in Discussion Group. Quetex Updates and both signal feeds are admin-only.
- Private messaging is restricted to member ↔ admin. Member-to-member DMs are blocked by RLS.
- Media is stored in a private bucket and requires authentication.
- Balances, withdrawals and signal outcomes are manual records. Nexoventia does not connect to Quotex, execute trades, independently verify broker outcomes or promise returns. Binary options are high risk; this app is a record-keeping and educational tool, not trading advice.
