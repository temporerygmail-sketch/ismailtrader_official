import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = name => readFileSync(new URL("../" + name, import.meta.url), "utf8");
const app = read("app.js");
const schema = read("schema.sql");
const html = read("index.html");
const css = read("styles.css");
const sw = read("sw.js");
const manifest = JSON.parse(read("manifest.webmanifest"));

const rows = [...schema.matchAll(/^\((\d+),'(2026-12-\d{2})',(true|false),(null|\d+),(null|\d+),(\d+),'([^']*)','([^']*)',(true|false),'([^']*)'\)(?:,|;)?$/gm)]
  .map(m => ({
    day: Number(m[1]), date: m[2], rest: m[3] === "true",
    min: m[4] === "null" ? null : Number(m[4]),
    max: m[5] === "null" ? null : Number(m[5]),
    withdrawal: Number(m[6]), phase: m[7], note: m[8],
    clarification: m[9] === "true", adminNote: m[10]
  }));

assert.equal(rows.length, 31, "Challenge plan must have 31 dated records");
assert.deepEqual(rows.map(x=>x.day),Array.from({length:31},(_,i)=>i+1),"Day numbers must be sequential 1–31");
assert.deepEqual(rows.filter(x=>x.rest).map(x=>x.day),[14,21,28],"Rest days must be 14, 21 and 28");
assert.equal(rows.filter(x=>!x.rest).length,28,"There must be 28 active days");
assert.equal(rows.filter(x=>x.withdrawal>0).length,9,"There must be nine planned withdrawals");
assert.equal(rows.reduce((sum,x)=>sum+x.withdrawal,0),226,"Planned withdrawals must total $226");
assert.deepEqual(
  {min:rows[11].min,max:rows[11].max,clarification:rows[11].clarification},
  {min:25,max:43,clarification:true},
  "Day 12 must remain $25–$43 and flagged for clarification"
);
assert.deepEqual(
  {min:rows[30].min,max:rows[30].max,withdrawal:rows[30].withdrawal},
  {min:98,max:112,withdrawal:82},
  "Day 31 must preserve $98–$112 and $82 withdrawal"
);

assert.match(schema,/create schema if not exists private/i,"Admin helper schema must not be part of exposed public API");
assert.match(schema,/create or replace function private\\.is_admin\\(\\)[\\s\\S]*security definer/i,"Admin checks must use a private helper");
assert.match(schema,/revoke all on function private\\.is_admin\\(\\) from public, anon/i,"Anonymous callers must not execute admin helper");
assert.equal((schema.match(/public\\.is_admin\\(\\)/g)||[]).length,0,"No policy may call an exposed public admin helper");

const rlsTables=["profiles","challenge_days","day_closes","signals","withdrawals","app_state","messages","private_messages","user_presence","notifications","activity_logs"];
for(const table of rlsTables){
  assert.match(schema,new RegExp("alter table public\\\\."+table+" enable row level security","i"),table+" must have RLS enabled");
}
assert.match(schema,/channel='discussion' or \\(select private\\.is_admin\\(\\)\\)/i,"Only members of Discussion may post; admin may publish other channels");
assert.match(schema,/recipient_id[\\s\\S]*role='member'[\\s\\S]*role='admin'/i,"Private messages must be restricted to admin ↔ member");
assert.match(schema,/values\\('nexoventia-media','nexoventia-media',false/i,"Media bucket must be private");
assert.match(schema,/create trigger notify_signal_events/i,"Signal events must create member notifications");
assert.equal(app.includes("service_role"),false,"Service-role secret must never ship to browser");
assert.match(app,/https:\\/\\/qxqdicbhsnrjibwgypyi\\.supabase\\.co/,"Frontend must use the connected Supabase project");
assert.match(app,/sb_publishable_/,"Frontend must use a publishable key");
assert.match(app,/signInWithOAuth\\(\\{provider:"google"/,"Google sign-in entry point must exist");
assert.match(app,/signInWithPassword/,"Email/password login must exist");
assert.match(app,/async function sendChatMessage/,"Discussion message handler must be async");
assert.match(app,/function renderGlobalSearchResults/,"Global search feature must be present");
assert.match(app,/function resultModal/,"Signal Win/Loss/Refund form must exist");
assert.match(app,/startingBalanceForm/,"Owner must be able to set starting balance baseline");
assert.match(app,/function renderCommunity/,"Community view must exist");
assert.match(app,/data-community-mode="discussion"/,"Discussion room navigation must exist");
assert.match(html,/id="app"/,"App mount must exist");
assert.match(css,/prefers-reduced-motion/,"Reduced-motion accessibility support must exist");
assert.match(sw,/fetch\\(request\\)[\\s\\S]*catch/,"Service worker must have offline fallback");
assert.equal(manifest.display,"standalone","PWA must use standalone display");

console.log("NEXOVENTIA VALIDATION PASSED");
console.log("31 days; 28 active; 3 rest; 9 withdrawals/$226; Day 12 unchanged; RLS, admin/member permissions, notifications, auth and PWA checks passed.");
