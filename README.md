# NEXOVENTIA — Trading Operations Hub

Nexoventia is a responsive, installable Progressive Web App for the shared December 2026 challenge plan, official/demo signal archive, withdrawal evidence, admin-controlled day closes, community and analytics.

## Live app

https://temporerygmail-sketch.github.io/ismailtrader_official/

## App features

- Email/password signup and login, email confirmation, password reset, Google OAuth entry point, and TOTP authenticator MFA with factor selection.
- Shared December 1–31, 2026 challenge calendar: 28 active days and rest days on December 14, 21 and 28.
- Original target ranges and nine planned withdrawals preserved, totaling $226. Day 12 remains $25–$43 and is flagged for clarification.
- Admin-only official and demo signal publishing, post-expiry Win/Loss/Refund result entry, and before/after screenshot evidence.
- Shared read-only official signal archive, demo archive, day-close history and withdrawal receipts.
- Admin-only actual day-close input; the next day's opening balance carries forward only from a recorded close.
- Dashboard, challenge calendar, signal notes, demo board, transactions, analytics, notifications, community, member-to-admin inbox and settings.
- Four shared rooms: Quetex Updates, Quetex Official Signals, Market Checking · Demo Signals, and Discussion Group.
- Members can post only in Discussion Group. Updates and both signal channels are admin-only.
- Member-to-member direct messaging is blocked by database policies. Private messages are restricted to member ↔ admin.
- Admin-only online-member view, individual member inbox, shared next-session countdown and audit history.
- Private media storage, Supabase Row Level Security, Realtime updates and PWA installation.

## Stack and connected services

- Frontend: static HTML, CSS and JavaScript.
- Hosting: GitHub Pages.
- Backend: Supabase Auth, Postgres, Row Level Security, Storage and Realtime.
- Connected Supabase project ref: `qxqdicbhsnrjibwgypyi`.
- Supabase region: `ap-southeast-2` (Sydney).
- Project URL: `https://qxqdicbhsnrjibwgypyi.supabase.co`.

The browser uses only a Supabase publishable key. A service-role/secret key is never included in the frontend.

## Owner setup required

See [SETUP.md](./SETUP.md) before inviting members. The owner must register, verify their email, promote their own profile to admin in Supabase SQL Editor, and sign in again. Google sign-in requires a Google OAuth Client ID and Client Secret configured by the owner in Supabase.

## Limitations and scope

- This is a manual record-keeping and educational demo-signal app. It does not connect to Quotex, execute orders, read broker balances, independently verify broker outcomes, or promise returns.
- The $10 starting-balance baseline is provisional; it is not a verified broker balance. The owner can correct the baseline from Admin Control.
- Browser/realtime notifications depend on the app/browser being available. Fully closed-app push notifications require a separate push provider and VAPID credentials.
- Android can install the PWA from Chrome. This repository does not yet contain a signed native APK.
- Google OAuth and reliable production email delivery require owner-side provider/SMTP configuration described in SETUP.md.
