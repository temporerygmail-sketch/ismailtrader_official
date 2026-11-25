# NEXOVENTIA — Trading Operations Hub

NEXOVENTIA is an installable, responsive Progressive Web App for a shared December 2026 challenge ledger, educational signal records, withdrawal evidence, community and admin operations.

## Live app

https://temporerygmail-sketch.github.io/ismailtrader_official/

## What is included

- December 1–31, 2026 challenge plan, with 28 active days and rest days on December 14, 21 and 28.
- Original target ranges and nine planned withdrawals totalling $226. Day 12 remains $25–$43 and requires owner clarification.
- Actual daily close records entered by the owner; actual balance never gets silently replaced by the planned target.
- Shared official and demo signal archives with pair, timeframe, direction, demo amount, issue/expiry time, before screenshot, Win/Loss/Refund result and after screenshot.
- Dashboard with daily, weekly and all-time signal snapshots, registered account count, withdrawal totals, recorded P/L, profit/loss days and actual balance history.
- Read-only shared challenge, signal notes and withdrawal receipt pages for members.
- Four community destinations: Quetex Updates, Quetex Official Signals, Market Checking · Demo Signals and Discussion Group.
- Members can post text/media only in Discussion Group. Updates and both signal feeds are admin-published.
- Private messages are restricted to member ↔ admin; member-to-member DMs are blocked by database policies.
- Owner-only online-member list, individual member inbox, shared next-session countdown and audit history.
- Email/password signup and login, password reset, Google OAuth entry point, email confirmation and TOTP MFA with backup authenticator enrollment.
- Supabase Realtime, private image/video/audio/file storage, notifications, dark/light theme and PWA installation.

## Stack

- Frontend: static HTML, CSS and JavaScript.
- Hosting: GitHub Pages, with validation-before-deployment using GitHub Actions.
- Backend: Supabase Auth, PostgreSQL, Row Level Security, Storage and Realtime.
- Supabase project: `nexoventia-trading-hub`
- Project ref: `dbsgvcfvlnhwecyfsxib`
- Region: `ap-south-1` (Mumbai)
- Project URL: `https://dbsgvcfvlnhwecyfsxib.supabase.co`

The browser uses only the Supabase publishable key. A service-role or secret key is never included in frontend code.

## Owner setup

Read [SETUP.md](./SETUP.md) before inviting members. The owner must create and verify an account, then promote their own account using the trusted `auth.users.raw_app_meta_data.role` claim and matching profile role in Supabase SQL Editor. Google sign-in needs OAuth credentials configured in Supabase.

## Important limitations

- This app is a manual record-keeping and educational demo-signal workspace. It does not connect to Quotex, execute orders, fetch broker balances, independently verify broker outcomes or promise returns.
- The $10 starting-balance baseline is provisional until the owner confirms the actual starting account balance.
- Signal outcomes are entered by the owner and are not independently verified market results.
- Supabase's default email sender is for light testing; dependable member signup/password reset requires a verified SMTP provider.
- Google sign-in remains unavailable until the owner configures a Google OAuth Client ID and Client Secret in Supabase.
- In-app/realtime and browser notifications are supported while the app/browser is active. Push delivery while fully closed needs a separate push provider and VAPID credentials.
- Android users can install the PWA from Chrome. This repository does not contain a signed native APK.
- Free hosting/database tiers have provider quotas and limits; they are not unlimited.

## Checks

Run `npm run check` to validate JavaScript syntax, challenge integrity, project configuration, RLS/security expectations, authentication hooks, PWA assets and required UI behaviours.
