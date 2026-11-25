# NEXOVENTIA — Owner setup and deployment

## Connected services

- GitHub repository: https://github.com/temporerygmail-sketch/ismailtrader_official
- GitHub Pages app: https://temporerygmail-sketch.github.io/ismailtrader_official/
- Supabase project: `nexoventia-trading-hub`
- Project ref: `dbsgvcfvlnhwecyfsxib`
- Region: `ap-south-1` (Mumbai)
- API URL: `https://dbsgvcfvlnhwecyfsxib.supabase.co`

The production database already contains the 31 challenge dates, shared record tables, Row Level Security policies, private media bucket, Realtime subscriptions, notifications and audit triggers. `schema.sql` is a reference snapshot, not a script to blindly run over a populated production database. Database migrations are applied through Supabase migration history.

## 1. Create your owner account

1. Open the app and create an account using your email, full name and a unique username.
2. Confirm the verification email if email confirmation is enabled.
3. Sign in once so Supabase creates your profile.
4. In Supabase Dashboard → SQL Editor, replace the placeholder email below with the exact owner email, then run:

```sql
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where lower(email) = lower('YOUR-OWNER-EMAIL@example.com');

update public.profiles
set role = 'admin', updated_at = now()
where id = (
  select id from auth.users
  where lower(email) = lower('YOUR-OWNER-EMAIL@example.com')
);
```

5. Sign out and sign in again so the refreshed JWT contains the trusted `app_metadata.role=admin` claim. Admin Control should then appear.

Promote only your own account. Authorization is enforced by the database using the trusted Supabase `app_metadata` claim; the user-editable `user_metadata` field is never used for admin authorization. Do not share your owner credentials.

## 2. Configure email confirmation and password reset

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `https://temporerygmail-sketch.github.io/ismailtrader_official/`
- Add that exact URL to Redirect URLs.
- Add `http://localhost:*` only if you use a local development server.

Supabase's default sender is suitable for limited testing. For dependable production confirmation and password-reset delivery, configure a verified SMTP provider in Supabase Auth. Keep SMTP credentials out of GitHub and frontend files.

## 3. Enable Google sign-in

The Google sign-in button is already in the app. It will work only after the owner configures OAuth credentials:

1. In Google Cloud Console, create an OAuth Client ID of type Web application.
2. Add Authorized JavaScript origin: `https://temporerygmail-sketch.github.io`.
3. Add Authorized redirect URI: `https://dbsgvcfvlnhwecyfsxib.supabase.co/auth/v1/callback`.
4. In Supabase Dashboard → Authentication → Sign In / Providers → Google, enable Google and add the Client ID and Client Secret.
5. Confirm that the GitHub Pages URL is in the Supabase Redirect URLs allow-list.

Keep the Google Client Secret in Supabase provider settings only. Never commit it to this repository or place it in browser JavaScript.

## 4. Authenticator security

A signed-in member can enrol an authenticator app in Settings. For backup, enrol a second separate authenticator device. The database requires an AAL2 session for accounts with a verified MFA factor. Supabase Auth does not provide recovery-code endpoints here; keep a second verified device available and use an identity-verified account recovery process if both devices are lost.

The MFA policy helper is in the non-exposed `private` schema. The production database has a restrictive MFA policy on all application tables and the private media bucket.

## 5. GitHub Pages deployment

In GitHub repository Settings → Pages → Build and deployment, choose **GitHub Actions** as the source.

The workflow runs `npm run check` and required-file checks first. The Pages deployment job runs only after validation passes. Each deployment from `main` publishes the validated static PWA.

## 6. Install on Android and desktop

Open the app URL in Chrome → browser menu → **Install app** or **Add to Home screen**. This installs the Progressive Web App in an app-like window. It is not a signed native Android APK. A signed APK requires a separate Android packaging, build and signing workflow.

The service worker checks for updated app assets when the app is revisited/reloaded while online. It does not silently update an app while the device is offline.

## 7. Notifications and online presence

In-app and Realtime notifications are stored in Supabase. Browser notifications need permission and an active browser/app session. Fully closed-app push notifications require a push provider, VAPID credentials and server-side delivery, which are not configured in this release.

Online status is based on a heartbeat while the app is open. It represents a recently connected session, not proof that someone is actively looking at the screen.

## 8. Community permissions

- Quetex Updates: only the admin can publish; members read.
- Quetex Official Signals: only the admin can publish signals and results; members view the shared archive.
- Market Checking · Demo Signals: only the admin can publish demo records; members view the shared archive.
- Discussion Group: signed-in members and the admin can post messages and supported media.
- Private inbox: member ↔ admin only. Members cannot DM one another.
- Online-member directory: admin only.

These permissions are enforced through database Row Level Security, not just hidden interface controls.

## 9. Challenge and financial record rules

- Dates are December 1–31, 2026. Rest days are December 14, 21 and 28.
- Nine planned withdrawals total $226.
- Day 12 remains $25–$43 pending clarification; do not silently change it.
- The initial $10 baseline is provisional. The owner should confirm the actual starting account balance before using it for P/L calculations.
- The owner enters only the actual closing balance at day end. Recorded withdrawals are separate. The next day's opening balance carries forward from the actual prior close.
- Corrections must be made as owner actions and reviewed against the audit history.
- No record in this app changes a Quotex account or executes a trade.

Binary options are high risk. Nexoventia is a manual record-keeping and educational tool, not financial advice, broker integration or a promise of returns.

## 10. Free-tier and production limitations

GitHub Pages and Supabase may be used on free tiers within their current quotas and service limits. Free plans are not unlimited. Reliable email at community scale, Google OAuth, and closed-app push notifications need the owner-side configuration described above.
