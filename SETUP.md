# Nexoventia — Owner setup

## Connected services
- GitHub repository: https://github.com/temporerygmail-sketch/ismailtrader_official
- Live app: https://temporerygmail-sketch.github.io/ismailtrader_official/
- Supabase project: \`nexoventia-trading-hub\`
- Supabase project ref: \`dbsgvcfvlnhwecyfsxib\`
- Supabase region: \`ap-south-1\` (Mumbai)
- Supabase URL: \`https://dbsgvcfvlnhwecyfsxib.supabase.co\`

The database schema is in \`schema.sql\` and has already been applied to this connected project through recorded migrations. Do not run the complete schema again against the live database unless you are deliberately rebuilding a fresh project.

## 1. Activate your owner account

1. Open the live app and create your account using your own email and username.
2. Confirm the email if email confirmation is enabled, then sign in once so the profile is created.
3. Open Supabase Dashboard → SQL Editor and run this query after replacing the email with the exact email you used to sign up:

\`\`\`sql
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where lower(email) = lower('YOUR-LOGIN-EMAIL@example.com');

update public.profiles
set role = 'admin', updated_at = now()
where id = (
  select id from auth.users
  where lower(email) = lower('YOUR-LOGIN-EMAIL@example.com')
);
\`\`\`

4. Sign out of Nexoventia and sign in again. The new session token will contain the trusted admin role and the Admin Control section will appear.

**Important:** promote only your own owner account. Do not promote a member. Database permissions use the trusted \`app_metadata.role\` claim; changing only the profile's visible role is not enough.

## 2. Configure email sign-up and redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: \`https://temporerygmail-sketch.github.io/ismailtrader_official/\`
- Add that exact URL under Redirect URLs.
- Add \`http://localhost:*\` only if you use local development.

Supabase's default email sender is intended for limited testing. For reliable multi-user signup and password resets, configure a verified SMTP provider in Supabase. Never put SMTP credentials in frontend files.

## 3. Enable Google sign-in

The app already has a Google sign-in button, but the provider cannot work until you create credentials:

1. Open Google Cloud Console and create a Web application OAuth client.
2. Add this Authorized JavaScript origin:
   \`https://temporerygmail-sketch.github.io\`
3. Add this Authorized redirect URI:
   \`https://dbsgvcfvlnhwecyfsxib.supabase.co/auth/v1/callback\`
4. In Supabase Dashboard → Authentication → Sign In / Providers → Google, enable Google and paste the Client ID and Client Secret.
5. In Supabase → Authentication → URL Configuration, set the Site URL and Redirect URL to the live app URL above.

Keep the Google Client Secret inside Supabase's provider settings. Do not commit it to GitHub or paste it into \`app.js\`.

## 4. GitHub Pages deployment

The repository includes a GitHub Actions workflow. In GitHub repository Settings → Pages → Build and deployment, select **GitHub Actions** as the Source.

The workflow runs:
- JavaScript syntax validation.
- Challenge schedule and withdrawal integrity checks.
- Day 12 preservation and Day 31 target/withdrawal checks.
- RLS declaration, role-boundary, auth, PWA and required-file checks.
- GitHub Pages deployment only after validation passes on \`main\`.

The live URL is not considered updated until the Pages deployment job succeeds.

## 5. Install on Android

Open the live app in Chrome → browser menu → **Install app** or **Add to Home screen**. This installs the responsive PWA. New frontend files are picked up by the service worker during a later visit/reload while online.

This is not a signed native APK. A signed APK needs a separate Android packaging and signing build.

## 6. Notifications and online status

In-app notifications are stored in Supabase and shared realtime changes appear while a session is connected. Browser notifications require permission and an available browser. WhatsApp-style push alerts while the app/browser is fully closed require a separate push provider, VAPID keys and server-side delivery; these are not configured yet.

Online presence is heartbeat-based while a member has the app open. It does not guarantee that the person is actively looking at the screen.

## 7. Security and scope

- Members can read the shared challenge, signal archives and withdrawal ledger.
- Members can post only in Discussion Group. Updates and signal publishing/outcome recording are admin-only.
- Member-to-member private messaging is blocked by database policies. Private messages are limited to member ↔ admin.
- The private media bucket requires an authenticated session.
- The frontend contains a publishable Supabase key only. Never place a service-role key in browser code.
- Signal and financial information are manual records. The app does not connect to Quotex, execute trades, independently verify broker outcomes or provide trading recommendations.
