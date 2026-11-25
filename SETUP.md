# Nexoventia — owner setup

## Connected services
- GitHub repository: https://github.com/temporerygmail-sketch/ismailtrader_official
- Proposed live app: https://temporerygmail-sketch.github.io/ismailtrader_official/
- Supabase project: `nexoventia-trading-hub`
- Project ref: `dbsgvcfvlnhwecyfsxib`
- Region: `ap-south-1` (Mumbai)
- Supabase URL: `https://dbsgvcfvlnhwecyfsxib.supabase.co`

The live database has these migrations applied:
1. `nexoventia_initial_schema`
2. `tighten_rls_and_fk_indexes`
3. `signup_username_and_member_notifications`
4. `add_initial_balance_setting`
5. `enforce_aal2_for_enrolled_mfa_users`

`schema.sql` is a canonical schema snapshot for review/fresh setup, not a script to blindly rerun against a populated database. The active project already contains the 31 challenge dates and user-data tables. Do not run destructive DDL without a backup.

## 1. Create the owner account and promote it

1. Open the app and create an account with your own email, full name and username.
2. Confirm your email if confirmation is enabled, then sign in once to create your profile.
3. Open Supabase Dashboard → SQL Editor. Replace the placeholder below with your exact owner email and run:

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

4. Sign out of Nexoventia and sign in again. Your new session token contains the trusted `app_metadata.role=admin` claim, and Admin Control should appear.

**Important:** promote only your own owner account. Updating the visible `profiles.role` alone is not sufficient. The database uses the trusted Supabase `app_metadata` claim to authorize admin actions. Never give owner credentials to members.

## 2. Configure Supabase Auth URLs and email

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://temporerygmail-sketch.github.io/ismailtrader_official/`
- Add the exact same URL to Redirect URLs.

The built-in email sender is intended for light testing. For reliable account confirmation and password reset at community scale, configure a verified SMTP provider under Supabase Auth. Keep SMTP credentials server-side; never put them in `app.js`.

## 3. Enable Google sign-in

The Google button is in the app, but cannot work until you provide credentials:

1. In Google Cloud Console create an OAuth Client ID of type Web application.
2. Add Authorized JavaScript origin: `https://temporerygmail-sketch.github.io`
3. Add Authorized redirect URI: `https://dbsgvcfvlnhwecyfsxib.supabase.co/auth/v1/callback`
4. Supabase Dashboard → Authentication → Sign In / Providers → Google: enable Google and enter the Client ID and Client Secret.
5. In Supabase URL Configuration, make sure the app URL is on the Redirect URLs allow-list.

Keep the Client Secret in Supabase provider settings only. Do not commit it to GitHub or paste it into frontend files.

## 4. Two-factor authentication

A member can enable an authenticator app in Settings. Nexoventia displays a QR code/manual secret, then verifies a six-digit TOTP. On a subsequent sign-in, an enrolled account is asked for an authenticator code. The database additionally requires an AAL2 session for users with a verified factor.

Use the backup authenticator option to enrol a second device. This version does not claim to have tested recovery-code support; retain access to the second device and use the verified account-recovery process if both authenticators are lost.

## 5. GitHub Pages source and deployment

In GitHub repository Settings → Pages → Build and deployment, select **GitHub Actions** as Source.

The repository workflow runs JavaScript syntax validation, plan integrity checks, role/RLS assertions, auth/PWA checks and required-file checks before its GitHub Pages deployment job runs. The deployment job is configured to wait for validation on pushes to `main`.

The old branch-based Pages publisher must not remain the active Source if you want every deployment to pass through this validation workflow.

## 6. Install on Android / desktop

Open the deployed site in Chrome → browser menu → **Install app** or **Add to Home screen**. This creates a PWA shortcut/app-like window. It is not a signed native APK. Creating a native APK needs a separate Android packaging and signing workflow.

The service worker updates its app shell when the browser revisits/reloads while online; do not expect a silent instant update while the app is closed.

## 7. Notifications and online status

In-app notifications are saved in Supabase. Realtime updates appear while a session is connected. Browser notifications require permission and an available browser. Full background push when the app/browser is closed needs a push provider, VAPID keys and server-side delivery, which are not configured yet.

Online presence is heartbeat-based while the user has the app open; it does not prove that someone is actively reading the screen.

## 8. Finance baseline and challenge clarification

The app currently stores a provisional Day 1 starting reference of **$10**, inferred from the lower end of Day 1's target. Confirm or correct this in Admin Control using your actual opening balance before trusting P/L analytics.

Day 12 is saved unchanged as **$25–$43** and visibly flagged for your confirmation. No automatic correction is applied.

## 9. Safety and scope

- This is a shared record-keeping and educational/demo-signal app only.
- It does not log into Quotex, place trades, verify broker settlements or guarantee performance.
- Members read shared challenge/signal/withdrawal records, and can post only in Discussion Group.
- Updates and official/demo signal publishing and result recording are admin-only.
- Private messages are limited to a member and the admin; member-to-member DMs are rejected by database policies.
- No Supabase service-role key belongs in frontend code.
