# NEXOVENTIA — Trading Operations Hub

A responsive, installable Progressive Web App for the shared December 2026 challenge plan, official/demo signal records, withdrawal receipts, day closes, community and analytics.

## Live app
https://temporerygmail-sketch.github.io/ismailtrader_official/

## Connected backend
- Supabase project: `nexoventia-trading-hub`
- Project ref: `dbsgvcfvlnhwecyfsxib`
- Region: `ap-south-1` (Mumbai)
- URL: `https://dbsgvcfvlnhwecyfsxib.supabase.co`

The frontend uses only the Supabase publishable key. A service-role or secret key is not shipped to the browser.

## Included workflows
- Email/password registration and login, email confirmation, forgot-password flow, Google OAuth option (requires owner configuration).
- Optional TOTP authenticator, login challenge and backup authenticator enrollment. A verified factor requires an AAL2 session at the database policy layer.
- The original 31-day schedule: 28 active days, rest days 14, 21 and 28, nine planned withdrawals totalling $226.
- Day 12 stays exactly $25–$43 and is flagged for clarification; the app does not silently correct it.
- Admin-only Official Signals and Demo Signals creation, after-expiry Win/Loss/Refund result entry and before/after screenshots.
- Shared read-only Notes, demo signal history and withdrawal receipt timeline for members.
- Owner-only actual day-close entry; next day opening follows the previous recorded close.
- Dashboard, challenge calendar, official notes, demo board, withdrawals, analytics, in-app notifications, community, private admin inbox, online-member view and settings.
- Members can post in Discussion Group only. Admin posts Quotex Updates and publishes official/demo signal records.
- Direct messages are member ↔ admin only; member-to-member DMs are blocked by database policies.
- Admin-set next-session countdown, activity log and private media storage.
- Realtime updates and installable PWA shell with offline app-shell fallback.

## Design / technology
Static HTML, CSS and JavaScript on GitHub Pages; Supabase Auth, Postgres, Row Level Security, Storage and Realtime; Supabase JS 2.119.2.

## First-time owner setup
Read [SETUP.md](./SETUP.md). The owner must register, then promote their own login to admin in the Supabase SQL editor. Google sign-in also requires a Google OAuth client ID and secret configured in Supabase.

## Notes and limitations
- This app is for record keeping and educational/demo-signal journaling. It does not connect to Quotex, execute trades, read a broker account, independently verify outcomes, or guarantee returns.
- The starting-balance reference is currently $10 as a provisional value inferred from Day 1's lower target. Confirm or correct it in Admin Control before relying on P/L analytics.
- Day 12 remains $25–$43 until the owner confirms the intended minimum.
- Browser notifications require permission and an available browser. True background push while the browser is closed needs a separately configured push provider/VAPID credentials.
- Google OAuth cannot work until owner credentials are supplied and configured.
- Android installation is through the PWA. This repository does not yet contain a signed native APK.
- The app is not considered production-ready for a large public community until SMTP, OAuth, GitHub Pages source settings, abuse moderation and load testing are configured.
