# NEXOVENTIA — Trading Operations Hub

A responsive, installable PWA for the shared December 2026 challenge plan, official/demo signal archive, withdrawal receipts, admin-controlled balance closes, community and analytics.

## Live site
https://temporerygmail-sketch.github.io/ismailtrader_official/

## Features
- Supabase email/password signup, login, password reset and Google OAuth button (Google provider credentials require owner setup).
- Shared December 1–31, 2026 challenge calendar: 28 active days, three rest days, original target ranges and withdrawal plan preserved.
- Day 12 remains recorded as $25–$43 pending clarification.
- Admin-only official/demo signal publishing and post-expiry Win/Loss/Refund recording with before/after images.
- Shared read-only official signal archive, demo signal archive and withdrawal history for members.
- Admin-only actual day-close input; the next opening balance is derived from the previous known close.
- Four community spaces: Quetex Updates, Quetex Official Signals, Market Checking · Demo Signals and Discussion Group.
- Discussion Group supports member text, image, GIF, video, audio/voice-note and file attachments. Only admin may post in Updates or signal channels.
- Private messages are limited to member ↔ admin. Admin can see online presence and message individual members.
- Today, weekly, 15-day and all-time analytics; shared next-session countdown; PWA installation and theme settings.
- Supabase RLS, private media bucket, audit log and Realtime updates.

## Stack
Static HTML/CSS/JavaScript on GitHub Pages; Supabase Auth, Postgres, RLS, Storage and Realtime; pinned `@supabase/supabase-js` ESM.

## Database
The connected project is `qxqdicbhsnrjibwgypyi`. The fresh-project schema is documented in `schema.sql` and `supabase/migrations/20261125153000_nexoventia_core.sql`.

## Important limitations
- The app is a record-keeping and educational demo-signal tool only. It does not connect to Quotex, execute orders, verify the broker's outcome or guarantee returns.
- Google sign-in needs the owner to configure OAuth credentials in Supabase.
- Full background push notifications need a separately configured push provider.
- Android installation currently uses the PWA, not a signed native APK.

Owner setup instructions: see [SETUP.md](SETUP.md).
