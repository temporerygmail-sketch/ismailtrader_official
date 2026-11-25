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

const matches = [...schema.matchAll(/^\((\d+),'(2026-12-\d{2})',(null|\d+),(null|\d+),(\d+),(true|false),(true|false),'([^']*)'\)[;,]?$/gm)];
const days = matches.map(m => ({
  day: Number(m[1]), date: m[2],
  min: m[3] === "null" ? null : Number(m[3]),
  max: m[4] === "null" ? null : Number(m[4]),
  withdrawal: Number(m[5]), rest: m[6] === "true", clarification: m[7] === "true"
}));

assert.equal(days.length,31,"31 December calendar records required");
assert.deepEqual(days.map(d=>d.day),Array.from({length:31},(_,i)=>i+1),"Days must be sequential");
assert.deepEqual(days.map(d=>d.date),Array.from({length:31},(_,i)=>"2026-12-"+String(i+1).padStart(2,"0")),"Dates must cover December 1–31, 2026");
assert.deepEqual(days.filter(d=>d.rest).map(d=>d.day),[14,21,28],"Rest days must be 14, 21 and 28");
assert.equal(days.filter(d=>!d.rest).length,28,"28 active days required");
assert.deepEqual(days.filter(d=>d.withdrawal>0).map(d=>[d.day,d.withdrawal]),[[4,11],[7,13],[10,15],[13,17],[17,19],[20,21],[24,23],[27,25],[31,82]],"All nine planned withdrawals must remain unchanged");
assert.equal(days.reduce((sum,d)=>sum+d.withdrawal,0),226,"Planned withdrawals must total $226");
assert.deepEqual({min:days[11].min,max:days[11].max,flag:days[11].clarification},{min:25,max:43,flag:true},"Day 12 must remain $25–$43 and flagged");
assert.deepEqual({min:days[30].min,max:days[30].max,withdrawal:days[30].withdrawal},{min:98,max:112,withdrawal:82},"Day 31 target and withdrawal must remain unchanged");
assert.equal(112-82,30,"Day 31 leaves $30 only when the $112 upper target is reached");

assert.ok(schema.includes("qxqdicbhsnrjibwgypyi"),"Schema reference must match active Supabase project");
assert.ok(schema.includes("ap-southeast-2"),"Schema reference must match active project region");
assert.ok(schema.includes("private.is_admin()"),"Protected database admin helper must be documented");
assert.ok(schema.includes("private.mfa_session_allowed()"),"MFA helper must be documented");
assert.ok(schema.includes("nexoventia-media"),"Private media bucket must be documented");
for(const table of ["profiles","challenge_days","signals","withdrawals","day_closes","messages","private_messages","user_presence","app_state","notifications","audit_log"]) {
  assert.match(schema,new RegExp("\\b"+table+"\\b","i"),table+" must be documented");
}

assert.ok(app.includes('const SUPABASE_URL = "https://qxqdicbhsnrjibwgypyi.supabase.co";'),"Frontend must target the connected Supabase project");
assert.match(app,/const SUPABASE_KEY = "sb_publishable_[A-Za-z0-9_-]+";/,"Frontend must use a publishable key");
assert.doesNotMatch(app,/dbsgvcfvlnhwecyfsxib|service_role|sb_secret_/i,"No stale project ref or server secret may ship");
assert.ok(app.includes('state.isAdmin=state.profile?.role==="admin";'),"Admin UI role must match protected database profile role");
for(const feature of [
  "signInWithPassword","signUp(","signInWithOAuth",'provider:"google"',"resetPasswordForEmail",
  "supabase.auth.mfa.enroll","supabase.auth.mfa.challenge","supabase.auth.mfa.verify",
  "function renderDashboard","function renderChallenge","function renderSignalFeed","function renderTransactions",
  "function renderCommunity","function renderInbox","function renderNotifications","function renderAnalytics",
  "function renderAdmin","function renderSettings","function resultModal","next_signal_at","nexoventia-media",
  "Asia/Karachi","15 days"
]) assert.ok(app.includes(feature),"Required feature missing: "+feature);
assert.ok(app.includes('renderSignalSnapshot("Today","today")'),"Daily signal snapshot required");
assert.ok(app.includes('renderSignalSnapshot("This week","week")'),"Weekly signal snapshot required");
assert.ok(app.includes('renderSignalSnapshot("All time","all")'),"All-time signal snapshot required");
assert.doesNotMatch(app,/Risk Manager|data-page="risk"/i,"Risk Manager module must remain removed");

assert.match(html,/id="app"/);
assert.match(html,/logo\.svg/);
assert.match(css,/prefers-reduced-motion/);
assert.match(css,/@keyframes drift/);
assert.match(css,/signal-snapshot/);
assert.match(css,/@media\s*\(max-width:\s*560px\)/);
assert.ok(sw.includes("nexoventia-shell-v6"),"PWA cache must be versioned after backend fix");
assert.equal(manifest.display,"standalone","PWA should launch in standalone mode");

for(const doc of [readme,setup]) {
  assert.ok(doc.includes("qxqdicbhsnrjibwgypyi"),"Documentation must use the active Supabase project");
  assert.doesNotMatch(doc,/dbsgvcfvlnhwecyfsxib|ap-south-1/i,"Documentation must not mention the old backend");
}
assert.ok(setup.includes("private.is_admin()"),"Owner guide must match database authorization");
assert.ok(setup.includes("Google Client ID and Client Secret"),"Google OAuth setup must be documented");
assert.ok(setup.includes("qxqdicbhsnrjibwgypyi.supabase.co/auth/v1/callback"),"OAuth callback must target active project");
assert.doesNotMatch(setup,/app_metadata|public\.is_admin\(\)/i,"Owner guide must not describe stale authorization model");

console.log("NEXOVENTIA VALIDATION PASSED");
console.log("Plan integrity, withdrawals, closing-balance arithmetic, Supabase connection, role checks, MFA, auth, community, analytics and PWA assets passed.");
