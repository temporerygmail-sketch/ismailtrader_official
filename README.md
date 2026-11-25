# NEXOVENTIA — Trading Operations Hub

A responsive, installable Progressive Web App for a shared December 2026 challenge plan, official/demo signal records, withdrawal receipts, admin-controlled day closes, community and analytics.

## Live app
https://temporerygmail-sketch.github.io/ismailtrader_official/

## Included
- Supabase email/password signup and login, email confirmation, password reset, and a Google OAuth option that requires owner credentials.
- Shared December 1–31, 2026 calendar: 28 active days and rest days on 14, 21 and 28.
- Original target ranges and nine planned withdrawals preserved. Day 12 remains exactly $25–$43 and is flagged for clarification.
- Admin-only official and demo signal publishing, post-expiry Win/Loss/Refund outcome entry, and before/after screenshot evidence.
- Shared, read-only official signal archive, demo archive and withdrawal history for members.
- Admin-only actual day-close entry; the next day's opening balance carries forward from the last known close.
- Dashboard, challenge calendar, signal notes, demo board, withdrawals, analytics, notifications, community, private admin inbox and settings.
- Four rooms: Quotex Updates, QUOTEX_OFFICIAL SIGNALS, Market Checking · Demo Signals, and Discussion Group.
- Member posting is allowed only in Discussion Group. Updates and signal boards are admin-only.
- Member-to-member direct messages are blocked by database policies; private messages are limited to member ↔ admin.
- Admin-only online-member view and individual member inbox, shared next-session countdown and audit history.
- Private media storage, database row-level security, Realtime updates, and PWA installation.

## Technology
Static HTML/CSS/JavaScript hosted on GitHub Pages; Supabase Auth, Postgres, Row Level Security, Storage and Realtime; Supabase JS v2.119.2.

## Connected Supabase project
- Project: \`nexoventia-trading-hub\`
- Project ref: \`dbsgvcfvlnhwecyfsxib\`
- Region: \`ap-south-1\` (Mumbai)
- URL: \`https://dbsgvcfvlnhwecyfsxib.supabase.co\`

The browser uses only a Supabase publishable key. A service-role/secret key is never included in the frontend.

## Owner setup required
See [SETUP.md](./SETUP.md) before inviting members. The owner must register, promote their own account to admin in Supabase SQL Editor, and sign in again. Google sign-in needs a Google OAuth Client ID and Client Secret configured by the owner in Supabase.

## Limitations and scope
- This is a record-keeping and educational demo-signal app. It does not connect to Quotex, execute orders, read a broker account, independently verify broker outcomes, or promise returns.
- The $10 starting-balance baseline is provisional, inferred from the lower end of Day 1's target; the admin can correct it. It is not claimed to be your verified initial account balance.
- Full background push notifications require a separately configured push provider and VAPID credentials. Browser notifications depend on browser availability and permission.
- Android installation is through the PWA. This repository does not yet contain a signed native APK.
