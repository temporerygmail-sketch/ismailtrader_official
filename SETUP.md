# NEXOVENTIA — Owner setup and deployment

## Connected services

- GitHub repository: https://github.com/temporerygmail-sketch/ismailtrader_official
- Live GitHub Pages app: https://temporerygmail-sketch.github.io/ismailtrader_official/
- Supabase project ref: `qxqdicbhsnrjibwgypyi`
- Supabase region: `ap-southeast-2` (Sydney)
- Supabase API URL: `https://qxqdicbhsnrjibwgypyi.supabase.co`

The production database already contains the challenge dates, record tables, RLS policies, private media bucket, Realtime publication, notifications and audit triggers. `schema.sql` is a reference snapshot, not a migration to run over an existing database.

## 1. Create the owner account

1. Open the live app and create an account using your email, full name and username.
2. Confirm your email if verification is enabled.
3. Sign in once so the Auth trigger creates your `public.profiles` row.
4. In Supabase Dashboard → SQL Editor, replace the placeholder with the same owner email and run:

```sql
update public.profiles
set role = 'admin', updated_at = now()
where id = (
  select id
  from auth.users
  where lower(email) = lower('YOUR-OWNER-EMAIL@example.com')
);
```

5. Sign out and sign in again. Admin Control should now appear.

Only promote your own account. The database checks `public.profiles.role` through the private `private.is_admin()` helper. Members cannot promote themselves, and the app does not trust user-editable metadata for admin permissions. Never share your password or authenticator codes.

## 2. Configure email verification and password reset

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `https://temporerygmail-sketch.github.io/ismailtrader_official/`
- Add that exact URL to Redirect URLs.
- Add `http://localhost:*` only for local development.

The default Supabase sender is suitable for light testing. For dependable multi-user email confirmation and password-reset delivery, configure a verified SMTP provider in Supabase Auth. Keep SMTP credentials out of GitHub and frontend files.

## 3. Enable Google sign-in

The Google sign-in button is already in the app. It works only after owner-provided OAuth credentials are configured:

1. In Google Cloud Console, create an OAuth Client ID of type Web application.
2. Add Authorized JavaScript origin: `https://temporerygmail-sketch.github.io`.
3. Add Authorized redirect URI: `https://qxqdicbhsnrjibwgypyi.supabase.co/auth/v1/callback`.
4. In Supabase Dashboard → Authentication → Sign In / Providers → Google, enable Google and enter the Google Client ID and Client Secret.
5. Confirm the GitHub Pages URL is in the Supabase Redirect URLs allow-list.

Keep the Google Client Secret inside Supabase provider settings only. Never commit it to GitHub or add it to browser JavaScript.

## 4. Authenticator security

In Settings, enrol a primary TOTP authenticator. Enrol a second, separate authenticator as backup and store the devices separately. Once a factor is verified, the database requires an `aal2` session for application tables and the private media bucket. The login flow prompts for the six-digit code before loading the app.

Supabase does not provide recovery-code APIs in this implementation. Keep a second verified device available. If all registered devices are lost, use an identity-verified owner recovery process.

## 5. GitHub Pages deployment

In GitHub repository Settings → Pages → Build and deployment, choose **GitHub Actions** as the source.

The workflow runs JavaScript syntax, plan-integrity, RLS/security, auth/MFA and PWA checks before publishing. The deployment job runs only after validation succeeds.

## 6. Install on Android and desktop

Open the app URL in Chrome → browser menu → **Install app** or **Add to Home screen**. This installs the PWA in an app-like window. It is not a signed native Android APK; a signed APK requires a separate Android packaging and signing workflow.

The service worker activates new cached assets when the app is revisited/reloaded while online. It cannot update a device that remains offline.

## 7. Notifications and online presence

In-app and Realtime notifications are stored in Supabase. Browser notifications need permission and an active browser/app session. Fully closed-app push needs a push provider, VAPID credentials and server-side delivery, which are not configured.

Online status is heartbeat-based while the app is open. It indicates a recently connected session, not proof that someone is actively viewing the screen.

## 8. Community permissions

- **Quetex Updates:** only the admin can publish; members can read.
- **Quetex Official Signals:** only the admin can publish signals and outcomes; members view the shared archive.
- **Market Checking · Demo Signals:** only the admin can publish demo records; members view the shared archive.
- **Discussion Group:** signed-in members and the admin can post messages and supported media.
- **Private inbox:** member ↔ admin only. Members cannot DM one another.
- **Online-member directory:** admin only.

These rules are enforced by database Row Level Security, not only by hiding interface controls.

## 9. Challenge and financial-record rules

- Dates are December 1–31, 2026. Rest days are December 14, 21 and 28.
- Nine planned withdrawals total **$226**.
- Day 12 remains **$25–$43** pending clarification; it is not silently corrected.
- The initial **$10** balance reference is provisional. Confirm the actual opening amount before using it for P/L calculations.
- The admin enters the actual closing balance at day end. Recorded withdrawals are separate. The next day's opening balance carries forward from the actual previous close.
- Corrections are admin actions and are recorded in audit history.
- The app does not connect to Quotex or execute trades.

Binary options are high risk. Nexoventia is a manual record-keeping and educational tool, not financial advice, broker integration or a promise of returns.

## 10. Free-tier and production limitations

GitHub Pages and Supabase can be used on free tiers within their current quotas and limits. Free plans are not unlimited. Reliable email at scale, Google OAuth and fully closed-app push notifications require the owner-side configuration described above.
