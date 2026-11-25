import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = name => readFileSync(new URL("../" + name, import.meta.url), "utf8");
const app = read("app.js");
const schema = read("schema.sql");
const html = read("index.html");
const css = read("styles.css");
const sw = read("sw.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const readme = read("README.md");
const setup = read("SETUP.md");
const aclMigration = read("supabase/migrations/20261125110440_tighten_public_table_and_sequence_grants.sql");
const mfaMigration = read("supabase/migrations/20261125110751_enforce_aal2_for_verified_mfa_users.sql");

const days = [...schema.matchAll(/^\((\d+),'(2026-12-\d{2})',(null|\d+),(null|\d+),(\d+),(true|false),(true|false),'([^']*)'\)[;,]?$/gm)]
  .map(m => ({
    day:Number(m[1]), date:m[2],
    min:m[3]==="null"?null:Number(m[3]),
    max:m[4]==="null"?null:Number(m[4]),
    withdrawal:Number(m[5]),
    rest:m[6]==="true",
    clarification:m[7]==="true"
  }));

assert.equal(days.length,31,"31 calendar records required");
assert.deepEqual(days.map(d=>d.day),Array.from({length:31},(_,i)=>i+1),"Days must be sequential");
assert.deepEqual(days.map(d=>d.date),Array.from({length:31},(_,i)=>`2026-12-${String(i+1).padStart(2,"0")}`),"Dates must be December 1–31, 2026");
assert.deepEqual(days.filter(d=>d.rest).map(d=>d.day),[14,21,28],"Rest days must be 14, 21 and 28");
assert.equal(days.filter(d=>!d.rest).length,28,"28 active days required");
assert.deepEqual(days.filter(d=>d.withdrawal>0).map(d=>[d.day,d.withdrawal]),[[4,11],[7,13],[10,15],[13,17],[17,19],[20,21],[24,23],[27,25],[31,82]],"All nine withdrawals must match the owner's plan");
assert.equal(days.reduce((sum,d)=>sum+d.withdrawal,0),226,"Planned withdrawals must total $226");
assert.deepEqual({min:days[11].min,max:days[11].max,flag:days[11].clarification},{min:25,max:43,flag:true},"Day 12 must remain $25–$43 and flagged");
assert.deepEqual({min:days[30].min,max:days[30].max,withdrawal:days[30].withdrawal},{min:98,max:112,withdrawal:82},"Day 31 target and withdrawal must be preserved");

assert.match(schema,/ACTIVE PROJECT: qxqdicbhsnrjibwgypyi/);
assert.match(schema,/ap-southeast-2/);
assert.match(schema,/private\.is_admin\(\)/);
assert.match(schema,/profiles\.role='admin'/);
assert.match(schema,/private\.mfa_session_allowed\(\)/);
assert.match(schema,/channel='discussion'[\s\S]*private\.is_admin\(\)/);
assert.match(schema,/recipient_id[\s\S]*role='admin'/);
assert.match(schema,/nexoventia-media \(private/i);
assert.match(schema,/REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated/i);
assert.match(schema,/Neither anon nor authenticated has TRUNCATE privileges/i);
assert.doesNotMatch(schema,/dbsgvcfvlnhwecyfsxib|ap-south-1/i);

const rlsTables=["profiles","challenge_days","signals","withdrawals","day_closes","messages","private_messages","user_presence","app_state","notifications","activity_logs","audit_log"];
for(const table of rlsTables) {
  assert.match(schema,new RegExp(table,"i"),table+" must be documented");
}

assert.match(aclMigration,/revoke all privileges on all tables in schema public from anon, authenticated/i);
assert.match(aclMigration,/revoke all privileges on all sequences in schema public from anon, authenticated/i);
assert.match(aclMigration,/revoke execute on all functions in schema public from anon, authenticated/i);
assert.match(aclMigration,/alter default privileges for role postgres in schema public/i);
assert.match(aclMigration,/grant usage, select on all sequences in schema public to authenticated/i);

assert.match(mfaMigration,/create or replace function private\.mfa_session_allowed\(\)/i);
assert.match(mfaMigration,/security definer[\s\S]*set search_path = ''/i);
assert.match(mfaMigration,/auth\.mfa_factors/);
assert.match(mfaMigration,/auth\.jwt\(\)[\s\S]*aal2/);
assert.match(mfaMigration,/as restrictive for all to authenticated/i);
assert.match(mfaMigration,/public\.audit_log/);
assert.match(mfaMigration,/nexoventia_media_require_aal2_when_mfa_enrolled/);

assert.match(app,/https:\/\/qxqdicbhsnrjibwgypyi\.supabase\.co/,"Frontend must use the connected Supabase project");
assert.match(app,/sb_publishable_[A-Za-z0-9_-]+/,"Frontend must use a publishable key");
assert.doesNotMatch(app,/dbsgvcfvlnhwecyfsxib|service_role|sb_secret_/i,"Obsolete project or privileged keys must not ship");
assert.match(app,/signInWithPassword/,"Email/password login required");
assert.match(app,/signUp\(/,"Signup required");
assert.match(app,/provider:\s*"google"/,"Google OAuth entry point required");
assert.match(app,/resetPasswordForEmail/,"Password reset required");
assert.match(app,/supabase\.auth\.mfa\.getAuthenticatorAssuranceLevel/,"MFA assurance-level challenge required");
assert.match(app,/supabase\.auth\.mfa\.listFactors/,"TOTP factor listing required");
assert.match(app,/supabase\.auth\.mfa\.challenge/,"TOTP challenge required");
assert.match(app,/supabase\.auth\.mfa\.verify/,"TOTP verification required");
assert.match(app,/supabase\.auth\.mfa\.enroll/,"TOTP enrollment required");
assert.match(app,/Nexoventia Backup/,"Backup authenticator enrollment required");
assert.match(app,/state\.isAdmin=state\.profile\?\.role==="admin"/,"Admin UI must use the live profiles.role model");
assert.doesNotMatch(app,/app_metadata\?\.role|service_role|sb_secret_/i,"Frontend must not use editable admin metadata or server secrets");
assert.match(app,/async function sendChatMessage/,"Discussion sender required");
assert.match(app,/function renderCommunity/,"Community view required");
assert.match(app,/Quetex Updates/,"Updates room required");
assert.match(app,/Quetex Official Signals/,"Official signal room required");
assert.match(app,/Market Checking/,"Demo signal room required");
assert.match(app,/Discussion Group/,"Open discussion room required");
assert.match(app,/async function sendPrivateMessage/,"Member-to-admin private inbox required");
assert.match(app,/function renderSignalSnapshot/,"Daily, weekly and all-time dashboard summaries required");
assert.match(app,/Registered accounts/,"Admin account count required");
assert.match(app,/Profit days/,"Profit-day metric required");
assert.match(app,/function renderGlobalSearchResults/,"Global search required");
assert.match(app,/function resultModal/,"Post-expiry signal result workflow required");
assert.match(app,/startingBalanceForm/,"Admin starting balance editor required");
assert.match(app,/next_signal_at/,"Shared signal-session countdown required");
assert.match(app,/nexoventia-media/,"Private media integration required");
assert.doesNotMatch(app,/Risk Manager|data-page="risk"/i,"Risk Manager module must stay removed");
assert.match(app,/Asia\/Karachi/,"Pakistan timezone required");

assert.match(html,/id="app"/,"App mount required");
assert.match(css,/prefers-reduced-motion/,"Reduced-motion support required");
assert.match(css,/@keyframes drift/,"Ambient motion design required");
assert.match(css,/@media\(max-width:560px\)/,"Small-screen responsive layout required");
assert.ok(sw.includes("nexoventia-shell-v5"),"PWA shell cache must be versioned");
assert.equal(manifest.display,"standalone","PWA must be installable as standalone");
assert.match(readme,/qxqdicbhsnrjibwgypyi/,"README must document active project");
assert.match(readme,/ap-southeast-2/,"README must document live project region");
assert.doesNotMatch(readme,/dbsgvcfvlnhwecyfsxib|raw_app_meta_data/,"README must not contain stale project/role configuration");
assert.match(setup,/qxqdicbhsnrjibwgypyi/,"Setup must document live Supabase project");
assert.match(setup,/set role = 'admin'/,"Owner setup must promote the profile role");
assert.match(setup,/private\.is_admin/,"Setup must document private role helper");
assert.match(setup,/Google Client ID and Client Secret/,"Google OAuth configuration must be documented");
assert.doesNotMatch(setup,/dbsgvcfvlnhwecyfsxib|raw_app_meta_data|app_metadata\.role/,"Setup must not use obsolete project or role model");

console.log("NEXOVENTIA VALIDATION PASSED");
console.log("31 dates; 28 active; 3 rest; nine withdrawals = $226; Day 12 preserved; live Supabase project, admin RLS, least-privilege ACL, MFA AAL2, auth, community, dashboard and PWA checks passed.");
