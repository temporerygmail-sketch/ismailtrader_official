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

const days = [...schema.matchAll(/^\((\d+),'(2026-12-\d{2})',(true|false),(null|\d+),(null|\d+),(\d+),'([^']*)','([^']*)',(true|false),'([^']*)'\),?$/gm)]
  .map(m => ({
    day:Number(m[1]), date:m[2], rest:m[3]==="true",
    min:m[4]==="null"?null:Number(m[4]), max:m[5]==="null"?null:Number(m[5]),
    withdrawal:Number(m[6]), clarification:m[9]==="true"
  }));

assert.equal(days.length,31,"31 calendar records required");
assert.deepEqual(days.map(d=>d.day),Array.from({length:31},(_,i)=>i+1),"Days must be sequential");
assert.deepEqual(days.filter(d=>d.rest).map(d=>d.day),[14,21,28],"Rest days must be 14, 21 and 28");
assert.equal(days.filter(d=>!d.rest).length,28,"28 active days required");
assert.equal(days.filter(d=>d.withdrawal>0).length,9,"Nine planned withdrawals required");
assert.equal(days.reduce((sum,d)=>sum+d.withdrawal,0),226,"Planned withdrawals must total $226");
assert.deepEqual(
  {min:days[11].min,max:days[11].max,flag:days[11].clarification},
  {min:25,max:43,flag:true},
  "Day 12 must be preserved as $25–$43 and flagged"
);
assert.deepEqual(
  {min:days[30].min,max:days[30].max,withdrawal:days[30].withdrawal},
  {min:98,max:112,withdrawal:82},
  "Day 31 target and withdrawal must be preserved"
);

assert.match(schema,/create schema if not exists private/i);
assert.match(schema,/create or replace function private\.is_admin\(\)[\s\S]*security definer/i);
assert.match(schema,/revoke all on function private\.is_admin\(\) from public, anon/i);
assert.equal((schema.match(/public\.is_admin\(\)/g)||[]).length,0,"No public admin RPC helper");
const rlsTables=["profiles","challenge_days","day_closes","signals","withdrawals","app_state","messages","private_messages","user_presence","notifications","activity_logs"];
for(const table of rlsTables) {
  assert.match(schema,new RegExp("alter table public\\."+table+" enable row level security","i"),table+" RLS must be enabled");
}
assert.match(schema,/channel='discussion' or \(select private\.is_admin\(\)\)/i,"Members may post only in Discussion");
assert.match(schema,/role='member'[\s\S]*role='admin'/i,"Private messaging must be member-to-admin only");
assert.match(schema,/values\('nexoventia-media','nexoventia-media',false/i,"Media bucket must be private");
assert.match(schema,/create trigger notify_signal_events/i,"Signals must trigger notifications");

assert.match(app,/https:\/\/qxqdicbhsnrjibwgypyi\.supabase\.co/,"Frontend must use the connected Supabase project");
assert.doesNotMatch(app,/dbsgvcfvlnhwecyfsxib|service_role|sb_secret_/i,"No obsolete project or privileged key may ship");
assert.match(app,/sb_publishable_[A-Za-z0-9_-]+/,"Publishable key required");
assert.match(app,/signInWithPassword/,"Email/password login required");
assert.match(app,/signUp\(/,"Signup required");
assert.match(app,/provider:"google"/,"Google OAuth entry point required");
assert.match(app,/resetPasswordForEmail/,"Password reset required");
assert.match(app,/supabase\.auth\.mfa\.listFactors/,"TOTP factor listing required");
assert.match(app,/supabase\.auth\.mfa\.verify/,"TOTP verification required");
assert.match(app,/supabase\.auth\.mfa\.enroll/,"TOTP enrollment required");
assert.match(app,/Nexoventia Backup/,"Backup authenticator enrollment required");
assert.doesNotMatch(app,/recoveryCodes/i,"Unsupported recovery-code API must not be used");
assert.match(app,/state\.isAdmin=state\.profile\?\.role==="admin"/,"UI and RLS admin role model must match");
assert.match(app,/async function sendChatMessage/,"Discussion sender must be async");
assert.match(app,/function renderCommunity/,"Community view required");
assert.match(app,/Quetex Official Signals/,"Official signal room required");
assert.match(app,/Market Checking/,"Demo signal room required");
assert.match(app,/function renderGlobalSearchResults/,"Global search required");
assert.match(app,/function resultModal/,"Signal result workflow required");
assert.match(app,/startingBalanceForm/,"Admin starting balance editor required");
assert.match(app,/r\.net_result==null\?0:Number\(r\.net_result\)/,"Unknown P/L must remain excluded");
assert.match(app,/nexoventia-media/,"Private media upload required");

assert.match(html,/id="app"/,"App mount required");
assert.match(css,/prefers-reduced-motion/,"Reduced-motion support required");
assert.ok(sw.includes("nexoventia-shell-v4"),"PWA cache must be versioned");
assert.equal(manifest.display,"standalone","PWA must be installable as standalone");
assert.match(readme,/qxqdicbhsnrjibwgypyi/,"README project ref must match");
assert.doesNotMatch(readme,/dbsgvcfvlnhwecyfsxib/,"README must not contain the old project");
assert.match(setup,/qxqdicbhsnrjibwgypyi/,"Setup project ref must match");
assert.match(setup,/set role = 'admin'/,"Owner setup must promote profile role");
assert.doesNotMatch(setup,/raw_app_meta_data|app_metadata\.role/,"Setup role model must match private helper");

console.log("NEXOVENTIA VALIDATION PASSED");
console.log("31 days; 28 active; 3 rest; nine withdrawals = $226; Day 12 preserved; RLS, profile-role admin, auth/MFA, notifications, media and PWA checks passed.");
