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
const migration = read("supabase/migrations/20261125105653_move_mfa_policy_helper_to_private_schema.sql");

const days = [...schema.matchAll(/^\((\d+),'(2026-12-\d{2})',(null|\d+),(null|\d+),(\d+),(true|false),(true|false),'([^']*)'\)[;,]?$/gm)]
  .map(m => ({
    day:Number(m[1]), date:m[2],
    min:m[3]==="null"?null:Number(m[3]), max:m[4]==="null"?null:Number(m[4]),
    withdrawal:Number(m[5]), rest:m[6]==="true", clarification:m[7]==="true"
  }));

assert.equal(days.length,31,"31 calendar records required");
assert.deepEqual(days.map(d=>d.day),Array.from({length:31},(_,i)=>i+1),"Days must be sequential");
assert.deepEqual(days.filter(d=>d.rest).map(d=>d.day),[14,21,28],"Rest days must be 14, 21 and 28");
assert.equal(days.filter(d=>!d.rest).length,28,"28 active days required");
assert.equal(days.filter(d=>d.withdrawal>0).length,9,"Nine planned withdrawals required");
assert.equal(days.reduce((sum,d)=>sum+d.withdrawal,0),226,"Planned withdrawals must total $226");
assert.deepEqual({min:days[11].min,max:days[11].max,flag:days[11].clarification},{min:25,max:43,flag:true},"Day 12 must remain $25–$43 and flagged");
assert.deepEqual({min:days[30].min,max:days[30].max,withdrawal:days[30].withdrawal},{min:98,max:112,withdrawal:82},"Day 31 target and withdrawal must be preserved");

assert.match(schema,/ACTIVE PROJECT: dbsgvcfvlnhwecyfsxib/);
assert.match(schema,/create or replace function public\.is_admin\(\)[\s\S]*security invoker/i);
assert.match(schema,/auth\.jwt\(\)[\s\S]*app_metadata/i);
assert.match(schema,/private\.mfa_session_allowed\(\)/i);
assert.match(migration,/create or replace function private\.mfa_session_allowed\(\)/i);
assert.match(migration,/as restrictive for all to authenticated/i);
assert.match(migration,/drop function if exists public\.mfa_session_allowed\(\)/i);
assert.match(schema,/channel='discussion' or public\.is_admin\(\)/i);
assert.match(schema,/recipient_id[\s\S]*role='admin'/i);
assert.match(schema,/nexoventia-media \(private/i);

const tables=["profiles","challenge_days","signals","withdrawals","day_closes","messages","private_messages","user_presence","app_state","notifications","activity_logs"];
for(const table of tables) {
  assert.match(schema,new RegExp("alter table public\\."+table+" enable row level security","i"),table+" RLS must be enabled");
}

assert.match(app,/https:\/\/dbsgvcfvlnhwecyfsxib\.supabase\.co/,"Frontend must target the active Supabase project");
assert.match(app,/sb_publishable_[A-Za-z0-9_-]+/,"Frontend must use a publishable key");
assert.doesNotMatch(app,/qxqdicbhsnrjibwgypyi|service_role|sb_secret_/i,"Obsolete project and privileged keys must not ship");
assert.match(app,/signInWithPassword/,"Email/password login required");
assert.match(app,/signUp\(/,"Signup required");
assert.match(app,/provider:"google"/,"Google OAuth entry point required");
assert.match(app,/resetPasswordForEmail/,"Password reset required");
assert.match(app,/supabase\.auth\.mfa\.listFactors/,"TOTP factor listing required");
assert.match(app,/supabase\.auth\.mfa\.verify/,"TOTP verification required");
assert.match(app,/supabase\.auth\.mfa\.enroll/,"TOTP enrollment required");
assert.match(app,/Nexoventia Backup/,"Backup authenticator enrollment required");
assert.doesNotMatch(app,/recoveryCodes/i,"Unsupported recovery-code endpoint must not be called");
assert.match(app,/state\.isAdmin=state\.profile\?\.role==="admin"\s*&&\s*state\.user\.app_metadata\?\.role==="admin"/,"UI must require matching profile and trusted app_metadata admin claims");
assert.match(app,/async function sendChatMessage/,"Discussion sender required");
assert.match(app,/function renderCommunity/,"Community view required");
assert.match(app,/Quetex Official Signals/,"Official signal room required");
assert.match(app,/Market Checking/,"Demo signal room required");
assert.match(app,/function renderSignalSnapshot/,"Daily, weekly and all-time dashboard summaries required");
assert.match(app,/data-action="new-update"/,"Admin update shortcut must open Updates");
assert.match(app,/Registered accounts/,"Account count must appear in the dashboard");
assert.match(app,/Profit days/,"Profit day metric required");
assert.match(app,/PRE-WITHDRAWAL TARGET/,"Challenge page must distinguish pre-withdrawal targets.");
assert.match(app,/ACTUAL CLOSE AFTER WD/,"Challenge page must label post-withdrawal actual balance.");
assert.match(app,/function renderGlobalSearchResults/,"Global search required");
assert.match(app,/function resultModal/,"Signal result flow required");
assert.match(app,/startingBalanceForm/,"Admin starting balance editor required");
assert.match(app,/r\.net_result==null\?0:Number\(r\.net_result\)/,"Unknown P/L must remain excluded");
assert.match(app,/nexoventia-media/,"Private media integration required");

assert.match(html,/id="app"/,"App mount required");
assert.match(css,/prefers-reduced-motion/,"Reduced-motion support required");
assert.match(css,/signal-snapshot/,"Dashboard snapshot design required");
assert.ok(sw.includes("nexoventia-shell-v5"),"PWA shell cache must be versioned");
assert.equal(manifest.display,"standalone","PWA must be installable as standalone");
assert.match(readme,/dbsgvcfvlnhwecyfsxib/,"README must document active project");
assert.doesNotMatch(readme,/qxqdicbhsnrjibwgypyi/,"README must not contain old project");
assert.match(setup,/dbsgvcfvlnhwecyfsxib/,"Setup must document active project");
assert.match(setup,/raw_app_meta_data/,"Owner setup must set trusted app_metadata role");
assert.match(setup,/set role = 'admin'/,"Owner setup must promote profile role");
assert.doesNotMatch(setup,/qxqdicbhsnrjibwgypyi/,"Setup must not contain old project");

console.log("NEXOVENTIA VALIDATION PASSED");
console.log("31 dates; 28 active; 3 rest; 9 planned withdrawals = $226; Day 12 preserved; active Supabase project, RLS/MFA, auth, community, dashboard and PWA checks passed.");
