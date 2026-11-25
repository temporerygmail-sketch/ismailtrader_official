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
const aclMigration = read("supabase/migrations/20261125111417_tighten_browser_role_privileges.sql");
const mfaMigration = read("supabase/migrations/20261125105653_move_mfa_policy_helper_to_private_schema.sql");

const matches = [...schema.matchAll(/^\((\d+),'(2026-12-\d{2})',(null|\d+),(null|\d+),(\d+),(true|false),(true|false),'([^']*)'\)[;,]?$/gm)];
const days = matches.map(m => ({
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
assert.deepEqual(days.filter(d=>d.withdrawal>0).map(d=>[d.day,d.withdrawal]),[[4,11],[7,13],[10,15],[13,17],[17,19],[20,21],[24,23],[27,25],[31,82]],"All nine withdrawals must match the original plan");
assert.equal(days.reduce((sum,d)=>sum+d.withdrawal,0),226,"Planned withdrawals must total $226");
assert.deepEqual({min:days[11].min,max:days[11].max,flag:days[11].clarification},{min:25,max:43,flag:true},"Day 12 remains $25–$43 and flagged");
assert.deepEqual({min:days[30].min,max:days[30].max,withdrawal:days[30].withdrawal},{min:98,max:112,withdrawal:82},"Day 31 target and withdrawal are unchanged");

assert.match(schema,/Project ref: dbsgvcfvlnhwecyfsxib/i);
assert.match(schema,/REGION: ap-south-1/);
assert.match(schema,/public\.is_admin\(\)/);
assert.match(schema,/auth\.jwt\(\)[\s\S]*app_metadata/);
assert.match(schema,/private\.mfa_session_allowed\(\)/);
assert.match(schema,/channel='discussion'[\s\S]*public\.is_admin\(\)/);
assert.match(schema,/recipient_id[\s\S]*role='admin'/);
assert.match(schema,/nexoventia-media \(not public/i);
assert.match(schema,/TRUNCATE is revoked from anon and authenticated/i);
assert.match(schema,/profiles\.role is not updateable through the browser/i);
assert.doesNotMatch(schema,/qxqdicbhsnrjibwgypyi|ap-southeast-2|audit_log/i);

const rlsTables=["profiles","challenge_days","signals","withdrawals","day_closes","messages","private_messages","user_presence","app_state","notifications","activity_logs"];
for(const table of rlsTables) assert.match(schema,new RegExp("\\b"+table+"\\b","i"),table+" must be documented");

assert.match(aclMigration,/revoke all privileges on all tables in schema public from anon, authenticated/i);
assert.match(aclMigration,/revoke all privileges on all sequences in schema public from anon, authenticated/i);
assert.match(aclMigration,/revoke execute on all functions in schema public from anon, authenticated/i);
assert.match(aclMigration,/grant execute on function public\.is_admin\(\) to authenticated/i);
assert.match(aclMigration,/grant update \(display_name, username, avatar_path, bio, updated_at\)/i);
assert.match(aclMigration,/grant update \(read_at\) on public\.private_messages/i);
assert.doesNotMatch(aclMigration,/audit_log|grant all|truncate to/i);

assert.match(mfaMigration,/create or replace function private\.mfa_session_allowed\(\)/i);
assert.match(mfaMigration,/security definer[\s\S]*set search_path = ''/i);
assert.match(mfaMigration,/auth\.mfa_factors/);
assert.match(mfaMigration,/auth\.jwt\(\)[\s\S]*aal2/);
assert.match(mfaMigration,/as restrictive for all to authenticated/i);
assert.match(mfaMigration,/nexoventia_media_require_aal2_when_mfa_enrolled/);

assert.match(app,/https:\/\/dbsgvcfvlnhwecyfsxib\.supabase\.co/,"Frontend targets the active Supabase project");
assert.match(app,/sb_publishable_[A-Za-z0-9_-]+/,"Frontend uses a publishable key");
assert.doesNotMatch(app,/qxqdicbhsnrjibwgypyi|service_role|sb_secret_/i,"No stale project ref or server secret may ship");
assert.match(app,/signInWithPassword/,"Email/password login required");
assert.match(app,/signUp\(/,"Signup required");
assert.match(app,/provider:\s*"google"/,"Google OAuth entry point required");
assert.match(app,/resetPasswordForEmail/,"Password reset required");
assert.match(app,/supabase\.auth\.mfa\.getAuthenticatorAssuranceLevel/,"AAL2 challenge required");
assert.match(app,/supabase\.auth\.mfa\.listFactors/,"TOTP factor listing required");
assert.match(app,/supabase\.auth\.mfa\.challenge/,"TOTP challenge required");
assert.match(app,/supabase\.auth\.mfa\.verify/,"TOTP verification required");
assert.match(app,/supabase\.auth\.mfa\.enroll/,"TOTP enrollment required");
assert.match(app,/Nexoventia Backup/,"Backup authenticator enrollment required");
assert.match(app,/state\.isAdmin=state\.profile\?\.role==="admin"\s*&&\s*state\.user\.app_metadata\?\.role==="admin"/,"UI requires both profile and trusted app_metadata admin claims");
assert.match(app,/function renderSignalSnapshot/,"Daily/weekly/all-time signal summaries required");
assert.match(app,/renderSignalSnapshot\("Today","today"\)/,"Daily signal snapshot required");
assert.match(app,/renderSignalSnapshot\("This week","week"\)/,"Weekly signal snapshot required");
assert.match(app,/renderSignalSnapshot\("All time","all"\)/,"Lifetime signal snapshot required");
assert.match(app,/Registered accounts/,"Registered account count required");
assert.match(app,/Profit days/,"Profit-day metric required");
assert.match(app,/data-action="new-update"/,"Admin update shortcut required");
assert.match(app,/PRE-WITHDRAWAL TARGET/,"Target must be labelled pre-withdrawal");
assert.match(app,/ACTUAL CLOSE AFTER WD/,"Actual balance must be labelled post-withdrawal");
assert.match(app,/function renderChallenge/,"Challenge page required");
assert.match(app,/function renderSignalFeed/,"Shared signal notes page required");
assert.match(app,/function renderTransactions/,"Withdrawal history page required");
assert.match(app,/function renderCommunity/,"Community page required");
assert.match(app,/function renderInbox/,"Member/admin private inbox required");
assert.match(app,/function renderNotifications/,"Notification centre required");
assert.match(app,/function renderAnalytics/,"Analytics page required");
assert.match(app,/function renderAdmin/,"Admin Control page required");
assert.match(app,/function renderSettings/,"Settings page required");
assert.match(app,/function resultModal/,"Signal result and after-proof workflow required");
assert.match(app,/startingBalanceForm/,"Owner starting-balance control required");
assert.match(app,/next_signal_at/,"Shared next-session countdown required");
assert.match(app,/nexoventia-media/,"Private media integration required");
assert.doesNotMatch(app,/Risk Manager|data-page="risk"/i,"Risk Manager module must remain removed");
assert.match(app,/Asia\/Karachi/,"Pakistan timezone required");

assert.match(html,/id="app"/,"App mount required");
assert.match(html,/logo\.svg/,"Nexoventia logo required");
assert.match(css,/prefers-reduced-motion/,"Reduced-motion support required");
assert.match(css,/@keyframes drift/,"Ambient background motion required");
assert.match(css,/signal-snapshot/,"Dashboard snapshot design required");
assert.match(css,/@media\(max-width:560px\)/,"Small-phone responsive rules required");
assert.ok(sw.includes("nexoventia-shell-v5"),"PWA cache version required");
assert.equal(manifest.display,"standalone","Standalone PWA display required");
assert.match(readme,/dbsgvcfvlnhwecyfsxib/,"README documents active Supabase project");
assert.doesNotMatch(readme,/qxqdicbhsnrjibwgypyi|ap-southeast-2/,"README has no stale Supabase ref");
assert.match(readme,/PRE-WITHDRAWAL|before withdrawal/i,"README explains target timing");
assert.match(setup,/dbsgvcfvlnhwecyfsxib/,"Setup documents active Supabase project");
assert.match(setup,/raw_app_meta_data/,"Owner setup sets trusted auth app metadata");
assert.match(setup,/set role = 'admin'/,"Owner setup promotes profile");
assert.match(setup,/Google Client ID and Client Secret/,"Google provider setup documented");
assert.doesNotMatch(setup,/qxqdicbhsnrjibwgypyi|ap-southeast-2/,"Setup has no stale Supabase ref");

console.log("NEXOVENTIA VALIDATION PASSED");
console.log("31 dates; 28 active; 3 rest; 9 withdrawals = $226; Day 12 preserved; Day 31 pre/post-withdrawal math; active Supabase project; RLS/MFA/least-privilege grants; auth; community; dashboard; and PWA checks passed.");
