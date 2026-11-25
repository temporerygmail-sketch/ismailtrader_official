# NEXOVENTIA — Owner setup and deployment

## Connected services

- GitHub repository: https://github.com/temporerygmail-sketch/ismailtrader_official
- Live app: https://temporerygmail-sketch.github.io/ismailtrader_official/
- Supabase project: nexoventia-trading-hub
- Supabase project ref: dbsgvcfvlnhwecyfsxib
- Supabase region: ap-south-1 (Mumbai)
- Supabase API URL: https://dbsgvcfvlnhwecyfsxib.supabase.co

The active dbsgvcfvlnhwecyfsxib production database is already initialized with the December challenge and application tables with RLS enabled. The repository's schema.sql is an archived reference for the previous qxqdicbhsnrjibwgypyi project; never execute it. The active project's applied migrations are the schema source of truth.

## 1. Configure Supabase Auth

Open the Supabase project above, then go to **Authentication → URL Configuration**.

Set the **Site URL** to:

https://temporerygmail-sketch.github.io/ismailtrader_official/

Under **Redirect URLs**, add this exact URL and save:

https://temporerygmail-sketch.github.io/ismailtrader_official/

The app uses this address for email confirmation and password-reset redirects. Supabase rejects redirect destinations that are not on the allow list.

In **Authentication → Sign In / Providers → Email**, make sure:
- Email provider is enabled.
- Allow new users to sign up is enabled.
- Email confirmation can remain enabled. When enabled, users must click the confirmation link before their first sign-in.

After signup, check Inbox and Spam/Junk for the confirmation email. Important: Supabase's built-in sender only sends to addresses belonging to your Supabase organization's team and is limited to 2 emails per hour. It will not reliably send confirmations to ordinary member Gmail addresses. To let members register with their own email addresses, configure a verified SMTP provider in Supabase Auth. Keep SMTP credentials out of this repository and frontend files.

Google sign-in is currently hidden because the Google provider is not enabled in the connected Supabase project. Email/password is the supported login and signup method. Do not show Google as an available sign-in method until its OAuth Client ID and Secret are configured in Supabase.

## 2. Create your owner account

1. Open https://temporerygmail-sketch.github.io/ismailtrader_official/
2. Choose **Create an account**.
3. Enter your full name, a 3–24 character username (letters, numbers or underscores), email and a password of at least 8 characters.
4. Submit the form.
5. If email confirmation is enabled, open the confirmation email and click its link.
6. Return to the app and sign in with the same email and password.

The database trigger automatically creates your public.profiles row after Auth creates your account.

## 3. Promote your own account to admin

After your first account has been created and confirmed, open **Supabase Dashboard → SQL Editor** and run this SQL after replacing the placeholder with the exact email you registered:

```sql
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'admin')
where lower(email) = lower('YOUR-OWNER-EMAIL@example.com');

update public.profiles
set role = 'admin', updated_at = now()
where id = (
  select id from auth.users
  where lower(email) = lower('YOUR-OWNER-EMAIL@example.com')
);
```

Sign out completely, then sign in again. Admin Control should appear. The database helper public.is_admin() checks the trusted auth.users app_metadata role claim. The app also checks public.profiles.role. Both values must be set to admin; this SQL updates both.

Promote only your own account. User-editable metadata is not used for authorization. The profile role is protected from browser-side changes by database grants and Row Level Security. Never share your password, email confirmation link, authenticator code or owner session.

## 4. Install on Android and desktop

Open the app in Chrome → browser menu → **Install app** or **Add to Home screen**. This installs the Progressive Web App in its own app-like window. It is not a signed native APK. A signed APK requires separate Android packaging, signing and release work.

After deployment, refresh the app. If an old version remains visible, close the installed app and reopen it; on desktop, use Ctrl+Shift+R.

## 5. Notifications and online presence

In-app and Realtime notifications are stored in Supabase. Browser notifications need browser permission and an available browser/app session. Fully closed-app push requires a separate push delivery service and VAPID credentials; those are not configured here.

Online status uses a recent presence heartbeat while the app is open. It indicates a recent connection, not proof that the person is actively watching the screen.

## 6. Community permissions

- **Quetex Updates:** admin publishes; members view.
- **Quetex Official Signals:** admin publishes the pair, timeframe, direction, amount, expiry and before image; after expiry, the admin records Win/Loss/Refund and an after image. Members view the shared Notes archive.
- **Market Checking · Demo Signals:** removed from the app interface; existing historical rows, if any, are not deleted from the database.
- **Discussion Group:** signed-in users can post supported text and media (subject to file type/size limits).
- **Private inbox:** each member can message the admin; the admin can message each member. Members cannot message other members.
- **Online directory:** admin only.

These permissions are enforced by database Row Level Security and grants, not only by the interface.

## 7. Challenge and money rules

- Dates are December 1–31, 2026. Rest days are December 14, 21 and 28.
- Nine planned withdrawals total **$226**.
- Day 12 remains **$25–$43** pending your clarification; it is not changed automatically.
- On withdrawal days, the target range is the balance before withdrawal.
- At day end, the admin enters the actual remaining balance after the withdrawal. The app carries that actual close into the next day's opening balance.
- Day 31's **$98–$112** is before the **$82** withdrawal. If the balance reaches $112 before withdrawal, $30 remains after withdrawal; if it is $98, $16 remains.
- The initial **$10** starting balance is provisional. Confirm it against your actual account before relying on P/L.

## 8. Risk and service limits

This is a manual record-keeping and educational demo-signal app. It does not connect to Quotex, execute trades or guarantee outcomes. Binary options are high risk; the app is not financial advice.

GitHub Pages and Supabase can be used within free-tier quotas, but free service is not unlimited. Reliable SMTP and fully closed-app push notifications require owner-side configuration.