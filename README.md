# NEXOVENTIA — Trading Operations Hub

NEXOVENTIA is a responsive, installable Progressive Web App for a shared December 2026 challenge ledger, educational signal records, withdrawal evidence, community and admin operations.

## Live app

https://temporerygmail-sketch.github.io/ismailtrader_official/

## Included modules

- December 1–31, 2026 challenge plan: 28 active days and rest days on December 14, 21 and 28.
- Original target ranges and nine planned withdrawals totalling **$226**. Day 12 remains **$25–$43** and is flagged for owner clarification.
- Owner-entered actual day closes. Planned targets never overwrite the actual balance.
- Shared official and demo signal archives with pair, timeframe, direction, amount, issue/expiry time, before screenshot, Win/Loss/Refund result and after screenshot.
- Dashboard with Today, Weekly and All signal snapshots, registered account count, withdrawal totals, recorded P/L, profit/loss days and actual balance history.
- Read-only shared challenge, signal notes and withdrawal receipt pages for members.
- Four community destinations: Quetex Updates, Quetex Official Signals, Market Checking · Demo Signals and Discussion Group.
- Members can post messages and supported media only in Discussion Group. Updates and both signal feeds are admin-published.
- Private messages are restricted to member ↔ admin; member-to-member DMs are blocked by database policies.
- Owner-only online-member list, individual member inbox, shared next-session countdown and audit history.
- Email/password signup and login, password reset, email confirmation, Google OAuth entry point and TOTP MFA with backup authenticator enrollment.
- Supabase Realtime, private media storage, notifications, dark/light theme and PWA installation.

## Stack and connected services

- Frontend: HTML, CSS and JavaScript.
- Hosting: GitHub Pages, with GitHub Actions validation before deployment.
- Backend: Supabase Auth, PostgreSQL, Row Level Security, Storage and Realtime.
- GitHub repository: https://github.com/temporerygmail-sketch/ismailtrader_official
- Supabase project: `qxqdicbhsnrjibwgypyi`
- Region: `ap-southeast-2` (Sydney)
- Project URL: `https://qxqdicbhsnrjibwgypyi.supabase.co`

The browser uses only the Supabase publishable key. No service-role or secret key is included in frontend code.

## Owner setup

Read [SETUP.md](./SETUP.md) before inviting members. Create your account first, then promote your own profile to admin in Supabase SQL Editor using the owner email. The app and RLS policies both use `public.profiles.role` through the private `private.is_admin()` helper.

## Important limitations

- This is a manual record-keeping and educational demo-signal workspace. It does not connect to Quotex, execute orders, fetch broker balances, independently verify broker outcomes or promise returns.
- The initial **$10** opening-balance reference is provisional until the owner confirms the actual starting balance.
- Outcomes are entered by the owner and are not independently verified market results.
- Google sign-in requires the owner to configure a Google OAuth Client ID and Client Secret in Supabase.
- Supabase's default email sender is suitable for limited testing; dependable signup and password-reset delivery needs verified SMTP.
- In-app/realtime and browser notifications work while the browser/app is available. Push delivery while fully closed needs a push provider and VAPID credentials.
- Android users can install the PWA from Chrome. This repository does not contain a signed native APK.
- GitHub Pages and Supabase free tiers have quotas and service limits; they are not unlimited.

## Validation

Run `npm run check` to validate JavaScript syntax, all 31 plan records, withdrawal totals, project configuration, least-privilege/RLS expectations, MFA policy files, auth hooks, PWA assets and required UI behaviours.
