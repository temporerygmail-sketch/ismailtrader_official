# NEXOVENTIA — Trading Operations Hub

NEXOVENTIA is a responsive, installable Progressive Web App for a shared December 2026 challenge ledger, educational signal records, withdrawal evidence, community and admin operations.

## Live app and source

- App: https://temporerygmail-sketch.github.io/ismailtrader_official/
- GitHub: https://github.com/temporerygmail-sketch/ismailtrader_official
- Supabase project: `nexoventia-trading-hub`
- Supabase project ref: `qxqdicbhsnrjibwgypyi`
- Region: `ap-southeast-2` (Sydney)
- API URL: `https://qxqdicbhsnrjibwgypyi.supabase.co`

## Modules

- Main Dashboard: actual account balance, planned targets, withdrawals, signal performance, Today/Weekly/15 days/All summaries, registered account count, profit/loss/break-even days and next-session countdown.
- Challenge Plan: all 31 dates in December 2026; 28 active days and rest days on December 14, 21 and 28.
- Notes: shared official signal archive, before/after evidence, pair, timeframe, direction, demo amount, expiry and Win/Loss/Refund result.
- Transactions: shared withdrawal history and receipt images.
- Community: Quetex Updates, Quetex Official Signals, Market Checking · Demo Signals and Discussion Group.
- Inbox: member ↔ admin private messaging only. Members cannot DM one another.
- Analytics, Notifications, Profile, Settings, TOTP MFA and Admin Control.
- Admin-only tools: publish shared updates/signals, record signal results, add withdrawal receipts, close challenge days, edit the starting-balance baseline, set the next session time, view online members and privately message each member.

## Permissions

- Quetex Updates: admin publishes; members read.
- Quetex Official Signals: admin publishes and records outcomes; members read.
- Market Checking · Demo Signals: admin publishes; members read.
- Discussion Group: signed-in members and admin can post supported text/media.
- Private inbox: admin ↔ individual member only.
- Online directory: admin only.

Permissions are enforced in Supabase Row Level Security and database grants, not only by hiding UI controls.

## Challenge calculation rules

- Nine planned withdrawals total **$226**.
- Day 12 remains **$25–$43** pending owner clarification; it is not silently changed.
- **Pre-withdrawal target ranges** are balances before that day's withdrawal.
- Day-close entry is the actual balance **remaining after** withdrawal. The next day's opening balance uses that recorded actual close.
- Day 31 target is **$98–$112 before** the planned $82 withdrawal. At the $112 upper target, the remaining balance is $30. At $98, it is $16.
- The $10 starting-balance reference is provisional until the owner confirms the actual starting balance.

## Technology and security

- Frontend: HTML, CSS and JavaScript.
- Hosting: GitHub Pages with GitHub Actions validation and deployment.
- Backend: Supabase Auth, PostgreSQL, RLS, private Storage and Realtime.
- The browser uses a Supabase publishable key only. No service-role key or secret is bundled.
- TOTP-enrolled accounts require AAL2 under restrictive database policies.
- Browser table grants use least privilege; browser roles have no TRUNCATE access, and the profile role column is not browser-updateable.

## Owner setup

Read [SETUP.md](./SETUP.md) before inviting users. You must create the first account and promote that account to admin using the documented SQL in Supabase. Google OAuth and reliable SMTP delivery require owner-side provider configuration.

## Important limitations

- This is a manual record-keeping and educational demo-signal workspace. It does not connect to Quotex, execute orders, fetch broker balances, verify broker outcomes independently or promise returns.
- Signal outcomes are entered by the admin and are not independently verified market results.
- Google sign-in works only after a Google OAuth Client ID and Client Secret are configured in Supabase.
- Supabase's default email sender is suitable for limited testing; dependable email confirmation and password reset need verified SMTP.
- In-app/realtime and browser notifications work while the browser/app is available. Fully closed-app push delivery needs a push provider and VAPID credentials.
- Android users can install the PWA from Chrome. This repository does not contain a signed native Android APK.
- GitHub Pages and Supabase free tiers have quotas and service limits; they are not unlimited.

## Validation

Run `npm run check` for JavaScript syntax, complete plan integrity, active backend configuration, authentication hooks, least-privilege grants reference, RLS/MFA policies, community roles, dashboard features and PWA assets.
