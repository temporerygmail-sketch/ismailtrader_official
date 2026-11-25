import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const schema = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const sw = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const manifest = JSON.parse(readFileSync(new URL("../manifest.webmanifest", import.meta.url), "utf8"));

const dayRows = [...schema.matchAll(/^\((\d+),'2026-12-\d{2}',(null|\d+),(null|\d+),(\d+),(true|false),(true|false),/gm)]
  .map(match => ({ day: Number(match[1]), min: match[2], max: match[3], withdrawal: Number(match[4]), rest: match[5] === "true", clarification: match[6] === "true" }));

assert.equal(dayRows.length, 31, "The challenge must have 31 calendar rows");
assert.deepEqual(dayRows.filter(day => day.rest).map(day => day.day), [14, 21, 28], "Rest days must be 14, 21, and 28");
assert.equal(dayRows.filter(day => day.withdrawal > 0).length, 9, "There must be nine planned withdrawals");
assert.equal(dayRows.reduce((sum, day) => sum + day.withdrawal, 0), 226, "Planned withdrawal total must be $226");
assert.deepEqual(dayRows.find(day => day.day === 12), { day: 12, min: "25", max: "43", withdrawal: 0, rest: false, clarification: true }, "Day 12 must remain unchanged and flagged");
assert.deepEqual(dayRows.find(day => day.day === 31), { day: 31, min: "98", max: "112", withdrawal: 82, rest: false, clarification: false }, "Day 31 must preserve $98-$112 and $82 withdrawal");

const rlsTables = ["profiles","challenge_days","signals","withdrawals","day_closes","messages","private_messages","user_presence","app_state","notifications","activity_logs"];
for (const table of rlsTables) {
  assert.match(schema, new RegExp("alter table public\\." + table + " enable row level security", "i"), table + " must have RLS enabled");
}
assert.match(schema, /security invoker/i, "Admin check should use SECURITY INVOKER");
assert.match(schema, /auth\.jwt\(\).*app_metadata/i, "Admin role must use trusted app_metadata");
assert.match(schema, /channel='discussion' or public\.is_admin\(\)/i, "Only admins may post in Updates while members can post in Discussion");
assert.match(schema, /recipient_id.*role='admin'/is, "Member-to-member private messages must be blocked");
assert.equal(app.includes("service_role"), false, "A service-role secret must never ship to the browser");
assert.match(app, /sb_publishable_/, "The browser must use a publishable key");
assert.match(app, /signInWithOAuth\(\{provider:"google"/, "Google OAuth option must be present");
assert.match(app, /signInWithPassword/, "Email/password login must be present");
assert.match(app, /function renderGlobalSearchResults/, "Global search must be wired");
assert.match(app, /function resultModal/, "Signal result workflow must be present");
assert.match(app, /startingBalanceForm/, "Owner must be able to correct the provisional starting balance");
assert.match(html, /id="app"/, "App mount must exist");
assert.match(css, /prefers-reduced-motion/, "Reduced-motion accessibility support must exist");
assert.match(sw, /fetch\(request\).*catch/s, "Service worker must support network-first fetch with offline fallback");
assert.equal(manifest.display, "standalone", "PWA must use standalone display");

console.log("NEXOVENTIA VALIDATION PASSED");
console.log("31 challenge rows; 28 active; 3 rest; 9 withdrawals totaling $226; Day 12 preserved; RLS, role boundaries, auth, search, PWA and UI checks passed.");

// CI trigger verification commit.
