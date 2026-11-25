# NEXOVENTIA — Owner setup and deployment

## Connected services

- GitHub repository: https://github.com/temporerygmail-sketch/ismailtrader_official
- Live app: https://temporerygmail-sketch.github.io/ismailtrader_official/
- Supabase project: `nexoventia-trading-hub`
- Supabase ref: `qxqdicbhsnrjibwgypyi`
- Supabase region: `ap-southeast-2` (Sydney)
- API URL: `https://qxqdicbhsnrjibwgypyi.supabase.co`

The live Supabase database is already initialized with the December challenge, member profiles, signals, withdrawals, day closes, community, private inbox, notifications, presence and private media. All application tables have RLS enabled. Do not execute `schema.sql`: it is a reference snapshot, not a migration.

## 1. Create your owner account

1. Open the app and choose **Create account**.
2. Register with your full name, username, email and password.
3. Confirm your email if Supabase email confirmation is enabled.
4. Sign in once. The Auth trigger creates your `public.profiles` record.
5. In Supabase Dashboard → SQL Editor, replace the placeholder email with the exact email you registered and run:

```sql
update public.profiles
set role = 'admin', updated_at = now()
where id = (
  select id
  from auth.users
  where lower(email) = lower('YOUR-OWNER-EMAIL@example.com')
);
```

6. Sign out completely and sign in again. Admin Control will appear after the app reloads your updated profile role.

Promote only your own account. The database helper `private.is_admin()` checks `public.profiles.role = 'admin'` for the signed-in user. The role column is protected by database grants and Row Level Security; members cannot change their own role from the app. Do not rely on user-editable metadata for authorization. Do not share your password, authenticator code or owner session.

## 2. Configure email confirmation and password reset

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `https://temporerygmail-sketch.github.io/ismailtrader_official/`
- Add the exact URL above to Redirect URLs.
- Add `http://localhost:*` only if you use a local development server.

The default Supabase email sender is suitable for limited testing. For dependable confirmation and password-reset delivery, configure a verified SMTP provider in Supabase Auth. Keep SMTP credentials out of this repository and frontend files.

## 3. Enable Google sign-in

The Google button is already present. Google sign-in requires a Google Client ID and Client Secret from your own Google Cloud project:

1. In Google Cloud Console, create an OAuth Client ID of type **Web application**.
2. Add Authorized JavaScript origin: `https://temporerygmail-sketch.github.io`.
3. Add Authorized redirect URI: `https://qxqdicbhsnrjibwgypyi.supabase.co/auth/v1/callback`.
4. In Supabase Dashboard → Authentication → Sign In / Providers → Google, enable Google and enter the Client ID and Client Secret.
5. In Supabase Authentication → URL Configuration, ensure the GitHub Pages app URL is in Redirect URLs.

Keep the Google Client Secret in Supabase provider settings only. Never put it in `app.js`, GitHub or browser storage.

## 4. Authenticator security

In Settings, enroll your primary TOTP authenticator. Enroll a second authenticator app/device as a backup while you still have access to the first. The database enforces AAL2 for accounts with a verified factor. This setup does not issue separate recovery codes; losing both authenticators requires an identity-verified account recovery route.

## 5. GitHub Pages deployment

In GitHub repository Settings → Pages → Build and deployment, choose **GitHub Actions** as the source.

The custom workflow runs syntax and plan/security checks first. The Publish Pages job runs only when validation succeeds. The live app URL is:

`https://temporerygmail-sketch.github.io/ismailtrader_official/`

## 6. Install on Android and desktop

Open the app in Chrome → browser menu → **Install app** or **Add to Home screen**. This installs the Progressive Web App in its own app-like window. It is not a signed native APK. A signed APK would require a separate Android packaging, signing and release workflow.

The service worker checks for new app assets when the app is revisited/reloaded online. It cannot silently update a device while the device is offline.

## 7. Notifications and online presence

In-app and Realtime notifications are stored in Supabase. Browser notifications need browser permission and an available browser/app session. Fully closed-app push needs a separate push delivery service and VAPID credentials; those are not configured here.

Online status uses a recent presence heartbeat while the app is open. It indicates recent connection, not proof that the person is actively watching the screen.

## 8. Community permissions

- **Quetex Updates:** admin publishes; members view.
- **Quetex Official Signals:** admin publishes the pair, timeframe, direction, amount, expiry and before image; after expiry, the admin records Win/Loss/Refund and an after image. Members view the shared Notes archive.
- **Market Checking · Demo Signals:** admin publishes demo-learning records; members view.
- **Discussion Group:** signed-in users can post supported text and media (subject to file type/size limits).
- **Private inbox:** each member can message the admin; the admin can message each member. Members cannot message other members.
- **Online directory:** admin only.

These permissions are enforced by database Row Level Security and grants, not only by the interface.

## 9. Challenge and money rules

- Dates are December 1–31, 2026. Rest days are December 14, 21 and 28.
- Nine planned withdrawals total **$226**.
- Day 12 remains **$25–$43** pending your clarification; it is not changed automatically.
- On withdrawal days, the target range is the balance before withdrawal.
- At day end, the admin enters the actual remaining balance after the withdrawal. The app carries that actual close into the next day's opening balance.
- Day 31's **$98–$112** is before the **$82** withdrawal. If the balance reaches $112 before withdrawal, $30 remains after withdrawal; if it is $98, $16 remains.
- The initial **$10** starting balance is provisional. Confirm it against your actual account before relying on P/L.

## 10. Risk and service limits

This is a manual record-keeping and educational demo-signal app. It does not connect to Quotex, execute trades or guarantee outcomes. Binary options are high risk; the app is not financial advice.

GitHub Pages and Supabase can be used within free-tier quotas, but free service is not unlimited. Google OAuth, verified SMTP and fully closed-app push notifications require the owner configuration described above.
