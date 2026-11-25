# NEXOVENTIA — Trading Hub

A responsive, installable web app for keeping a shared 31-day challenge log, educational/demo signal records, withdrawals, community messages and analytics.

## Live site
https://temporerygmail-sketch.github.io/ismailtrader_official/

## What is included
- Supabase email/password authentication and Google OAuth button (Google provider requires owner credentials).
- Shared December 1–31, 2026 plan, including three rest days and the unmodified Day 12 $25–$43 entry flagged for clarification.
- Admin-only official/demo signal publishing and outcome recording (win/loss/refund) with before/after evidence.
- Read-only member signal notes and withdrawal ledger.
- Admin-only balance close entry; next day's opening balance is carried from the previous recorded close.
- Four community spaces: Updates, Official Signals, Market Checking — Demo Signals, and Discussion Group.
- Discussion Group supports member messages and media attachments. Private messages are limited to member→admin and admin→individual member.
- Analytics filters, session countdown, online presence, settings, activity log and PWA install support.
- Supabase RLS and private media bucket; no service-role key is shipped to the browser.

## Technology
Static HTML/CSS/JavaScript deployed on GitHub Pages, Supabase Auth/Postgres/Storage/Realtime, and pinned @supabase/supabase-js v2.119.2 via jsDelivr ESM.

## Safety and scope
This is a record-keeping and educational demo-signal tool only. It does not connect to Quotex, execute trades, place orders, verify market prices or guarantee returns. A displayed signal is a user-authored record, not a recommendation.

## First-time owner setup
See SETUP.md. The owner must promote their own account in the Supabase SQL editor after registering. A Google OAuth Client ID and Client Secret must be configured by the project owner before Google sign-in works.
