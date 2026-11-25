# Nexoventia — Owner setup

## Connected services

- GitHub repository: https://github.com/temporerygmail-sketch/ismailtrader_official
- Live app: https://temporerygmail-sketch.github.io/ismailtrader_official/
- Supabase project ref: `qxqdicbhsnrjibwgypyi`
- Supabase region: `ap-southeast-2` (Sydney)
- Supabase URL: `https://qxqdicbhsnrjibwgypyi.supabase.co`

The live database schema, Row Level Security policies, private media bucket, and realtime subscriptions have already been applied to this project. `schema.sql` is the canonical reference for creating a fresh project; do not rerun it on the live database.

## 1. Create the owner account

1. Open the live app and create your account with your own email and a unique username.
2. Verify the email if confirmation is enabled, then sign in once so Supabase creates your profile.
3. In Supabase Dashboard → SQL Editor, run this query after replacing the email with the exact address you used:

```sql
update public.profiles
set role = 'admin', updated_at = now()
where id = (
  select id
  from auth.users
  where lower(email) = lower('YOUR-LOGIN-EMAIL@example.com')
);
```

4. Sign out of Nexoventia and sign in again. The Admin Control section will then appear.

Only promote your own owner account. The database checks `profiles.role` through a private, non-exposed `private.is_admin()` helper. Members cannot change their own role.

## 2. Configure email signup and redirects

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `https://temporerygmail-sketch.github.io/ismailtrader_official/`
- Add that exact URL under Redirect URLs.
- Add `http://localhost:*` only for local development.

Supabase's default email sender is suitable for limited testing. For dependable multi-user signup and password resets, configure a verified SMTP provider in Supabase. Never put SMTP credentials in GitHub or frontend files.

## 3. Enable Google sign-in

The Google button is present in the app, but it will not work until you provide OAuth credentials:

1. In Google Cloud Console, create an OAuth Client ID of type Web application.
2. Add this Authorized JavaScript origin: `https://temporerygmail-sketch.github.io`.
3. Add this Authorized redirect URI: `https://qxqdicbhsnrjibwgypyi.supabase.co/auth/v1/callback`.
4. In Supabase Dashboard → Authentication → Sign In / Providers → Google, enable Google and paste the Client ID and Client Secret.
5. In Supabase → Authentication → URL Configuration, confirm that the GitHub Pages URL is in Redirect URLs.

The Google Client Secret must remain inside Supabase provider settings. Do not commit it to GitHub.

## 4. Authenticator backup

In Settings, enroll a primary TOTP authenticator and then add a second device using **Add backup authenticator**. Keep the two devices separate. At sign-in, choose the registered device and enter its six-digit code. Supabase Auth supports multiple enrolled factors but does not expose recovery-code APIs; if all enrolled devices are lost, contact the project owner for identity-verified recovery.

## 5. GitHub Pages deployment

Repository Settings → Pages must use **GitHub Actions** as the source. Each push to `main` runs the syntax and plan validation workflow. The Pages deployment job runs only after validation succeeds.

## 6. Install on Android

Open the live URL in Chrome → browser menu → **Install app** or **Add to Home screen**. This installs the Progressive Web App. It is not a signed native APK; a signed APK needs a separate Android packaging and signing build.

## 7. Notifications and online status

In-app and realtime notifications work while the app has an active connection. Browser notifications depend on browser availability and permission. WhatsApp-style push while the app/browser is fully closed requires a separate push provider, VAPID keys and server-side delivery; these are not configured yet.

Online presence is based on an app heartbeat. It shows that a session is recently connected, not proof that someone is actively looking at the screen.

## 8. Security and scope

- Members can read the shared challenge plan, official signal archive, demo archive, day closes and withdrawal history.
- Members can post only in Discussion Group. Quetex Updates and both signal rooms are admin-only.
- Private messages are restricted to member ↔ admin. Member-to-member DMs are blocked by database policies.
- Media is stored in a private bucket and requires authentication.
- Actual balances, withdrawals and signal results are manual records. Nexoventia does not connect to Quotex, execute trades, verify broker outcomes, or promise returns. Binary options are high risk; this app is a record-keeping and educational tool, not trading advice.
