# NEXOVENTIA — Trading Operations Hub

Responsive, installable Progressive Web App for the shared December 2026 challenge plan, signal history, withdrawal evidence, admin-controlled day closes, community and analytics.

## Live app

https://temporerygmail-sketch.github.io/ismailtrader_official/

## Main features

- Supabase email/password signup and login, email confirmation support, password reset, Google OAuth entry point, and TOTP authenticator MFA with multiple verified devices.
- Shared December 1–31, 2026 challenge calendar: 28 active days; rest days on December 14, 21 and 28.
- Nine planned withdrawals totalling $226. Day 12 remains $25–$43 and is flagged for clarification.
- Admin-only official/demo signal publishing and post-expiry Win/Loss/Refund outcome records with before/after screenshot evidence.
- Shared read-only signal archives, day-close history and withdrawal receipts.
- Admin-only closing-balance input. If the preceding close is missing, P/L stays unknown rather than being guessed.
- Dashboard, challenge calendar, signal notes, demo board, transactions, analytics, notifications, community, member-to-admin inbox and settings.
- Four shared rooms: Quetex Updates, Quetex Official Signals, Market Checking · Demo Signals, and Discussion Group.
- Members may post only in Discussion Group. Updates and both signal feeds are admin-only.
- Direct messages are restricted to member ↔ admin; member-to-member DMs are blocked by database policies.
- Admin-only online-member view, individual member inbox, shared next-session countdown and audit history.
- Private media storage, Supabase RLS, Realtime updates and PWA installation.

## Connected services

- Repository: https://github.com/temporerygmail-sketch/ismailtrader_official
- Supabase project ref: `qxqdicbhsnrjibwgypyi`
- Region: `ap-southeast-2` (Sydney)
- API URL: `https://qxqdicbhsnrjibwgypyi.supabase.co`

The browser uses only a publishable Supabase key. A service-role or secret key is not included in frontend files.

## Owner setup

Read [SETUP.md](./SETUP.md) before inviting members. The owner must create and verify an account, then set their own `public.profiles.role` to `admin` in the Supabase SQL Editor. Google sign-in requires owner-configured OAuth credentials.

## Important limitations

- This is a manual record-keeping and educational demo-signal app. It does not connect to Quotex, execute orders, fetch broker balances, independently verify broker outcomes or promise returns.
- The $10 starting-balance value is a provisional baseline; the owner can change it in Admin Control.
- Supabase TOTP MFA supports multiple factors but does not expose recovery-code APIs. Enroll a separate backup authenticator.
- Browser notifications depend on the browser/app being available. Fully closed-app push requires a separate push provider and VAPID credentials.
- Android installation is through Chrome PWA install. This repository does not yet include a signed native APK.
- Google OAuth and reliable production email delivery require owner-side provider/SMTP configuration in SETUP.md.
