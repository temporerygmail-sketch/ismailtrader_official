import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const app = read("app.js");
const schema = read("schema.sql");
const html = read("index.html");
const css = read("styles.css");
const sw = read("sw.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const readme = read("README.md");
const setup = read("SETUP.md");

const activeProject = "dbsgvcfvlnhwecyfsxib";
assert.match(app, new RegExp("https://" + activeProject + "\\.supabase\\.co"), "Frontend must use the active Supabase project");
assert.match(app, /sb_publishable_[A-Za-z0-9_-]+/, "Browser must use a publishable key");
assert.doesNotMatch(app, /qxqdicbhsnrjibwgypyi|service_role|sb_secret_/, "Do not ship the former project URL or privileged secret keys");
assert.match(schema, new RegExp("ACTIVE PROJECT: " + activeProject), "Schema must document the active project");
assert.match(schema, /security invoker/i, "Admin check must use SECURITY INVOKER");
assert.match(schema, /auth\.jwt\(\).*app_metadata/is, "Admin role must come from trusted app_metadata");
assert.match(schema, /mfa_session_allowed/i, "MFA policy helper must be documented");
assert.match(schema, /as restrictive for all to authenticated/i, "MFA policy must be restrictive");
assert.match(schema, /channel='discussion' or public\.is_admin\(\)/i, "Members may post only in Discussion while Updates stays admin-only");
assert.match(schema, /recipient_id[\s\S]*role='admin'/i, "Member-to-member DMs must be blocked");

const rows = [...schema.matchAll(/^\((\d+),'2026-12-\d{2}',(null|\d+),(null|\d+),(\d+),(true|false),(true|false),/gm)]
  .map((m) => ({ day:Number(m[1]), min:m[2], max:m[3], withdrawal:Number(m[4]), rest:m[5]==="true", clarification:m[6]==="true" }));
assert.equal(rows.length,31,"Challenge must contain 31 calendar dates");
assert.deepEqual(rows.filter(r=>r.rest).map(r=>r.day),[14,21,28],"Rest days must be Day 14, 21 and 28");
assert.equal(rows.filter(r=>!r.rest).length,28,"Challenge must contain 28 active days");
assert.equal(rows.filter(r=>r.withdrawal>0).length,9,"There must be nine planned withdrawals");
assert.equal(rows.reduce((sum,r)=>sum+r.withdrawal,0),226,"Planned withdrawals must total $226");
assert.deepEqual(rows.find(r=>r.day===12),{day:12,min:"25",max:"43",withdrawal:0,rest:false,clarification:true},"Day 12 must remain $25–$43 and flagged");
assert.deepEqual(rows.find(r=>r.day===31),{day:31,min:"98",max:"112",withdrawal:82,rest:false,clarification:false},"Day 31 must remain $98–$112 with $82 withdrawal");

for (const table of ["profiles","challenge_days","signals","withdrawals","day_closes","messages","private_messages","user_presence","app_state","notifications","activity_logs"]) {
  assert.match(schema,new RegExp("alter table public\\." + table + " enable row level security","i"),table+" must have RLS enabled");
}
assert.match(app,/signInWithPassword/,"Email/password sign-in must be present");
assert.match(app,/signUp\(/,"Email signup must be present");
assert.match(app,/provider:"google"/,"Google OAuth option must be present");
assert.match(app,/resetPasswordForEmail/,"Password reset must be present");
assert.match(app,/renderMfaChallenge/,"TOTP challenge must be requested at login");
assert.match(app,/supabase\.auth\.mfa\.verify/,"TOTP login challenge must be verified");
assert.match(app,/supabase\.auth\.mfa\.enroll/,"TOTP enrollment must be available");
assert.match(app,/Nexoventia Backup/,"Backup TOTP enrollment must be supported");
assert.doesNotMatch(app,/mfa\.recoveryCodes/,"Do not call an unsupported experimental recovery-code API");
assert.match(app,/function renderGlobalSearchResults/,"Global search must be wired");
assert.match(app,/function resultModal/,"Signal result workflow must be present");
assert.match(app,/startingBalanceForm/,"Owner must be able to correct the provisional starting balance");
assert.match(app,/nexoventia-media/,"Private media bucket integration must be present");
assert.doesNotMatch(app,/TODAY'S TARGET/,"Apostrophe in display text must not break JavaScript strings");
assert.doesNotMatch(app,/async async function/,"No duplicate async declaration");
assert.match(html,/id="app"/,"App mount must exist");
assert.match(css,/prefers-reduced-motion/,"Reduced-motion support must exist");
assert.match(css,/\.panel/,"Panel design system must exist");
assert.match(sw,/nexoventia-shell-v3/,"Service worker cache must be versioned");
assert.match(sw,/fetch\(request\)/,"Service worker must use network-first requests");
assert.equal(manifest.display,"standalone","PWA must use standalone mode");
assert.match(readme,new RegExp(activeProject),"README must describe current Supabase project");
assert.match(setup,new RegExp(activeProject),"Setup guide must describe current Supabase project");
assert.match(setup,/raw_app_meta_data/,"Owner promotion guide must use trusted app_metadata role");

console.log("NEXOVENTIA VALIDATION PASSED");
console.log("31 dates; 28 active; 3 rest; nine withdrawals = $226; Day 12 preserved; current project config, RLS, MFA, auth, PWA and UI assertions passed.");
