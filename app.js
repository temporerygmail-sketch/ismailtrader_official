import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.2/+esm";

const SUPABASE_URL = "https://qxqdicbhsnrjibwgypyi.supabase.co";
const SUPABASE_KEY = "sb_publishable_SwNW0kTerjBWjfTNl6s_zw_Ra5YxmB1";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
});

const app = document.getElementById("app");
const state = {
  session: null, user: null, profile: null, isAdmin: false, page: "dashboard",
  authMode: "login", authBusy: false, busy: false, loading: true,
  days: [], closes: [], signals: [], withdrawals: [], messages: [], profiles: [],
  presence: [], appState: {}, notifications: [], activePeriod: "today",
  communityMode: "discussion", selectedInboxUser: "", inboxMessages: [],
  replyTo: null, queuedFiles: [], mediaCache: {}, toastTimer: null,
  recording: null, recordingStream: null, theme: localStorage.getItem("nx-theme") || "dark",
  mfaFactor: null, mfaQr: "", mfaSecret: "", mfaPendingFactor: null, mfaChallengeId: null, mfaBusy: false, mfaFactors: [], globalSearch: ""
};
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const icons = {
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  chart:'<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 6-7"/>',
  wallet:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 8h18M16 14h.01"/>',
  notes:'<path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6"/>',
  message:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.2 2-2 2-2-1.2a8 8 0 0 1-1.4.6L15 21h-6l-.3-2.5a8 8 0 0 1-1.4-.6l-2 1.2-2-2 1.2-2a8 8 0 0 1-.6-1.4L1.5 13v-2l2.4-.7a8 8 0 0 1 .6-1.4l-1.2-2 2-2 2 1.2a8 8 0 0 1 1.4-.6L9 2.5h6l.3 2.5a8 8 0 0 1 1.4.6l2-1.2 2 2-1.2 2a8 8 0 0 1 .6 1.4l2.4.7v2l-2.4.7a8 8 0 0 1-.7 1.8Z"/>',
  shield:'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  upload:'<path d="M12 16V4m-4 4 4-4 4 4M4 18v2h16v-2"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  logout:'<path d="M10 17l5-5-5-5M15 12H3M21 3v18"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  close:'<path d="m18 6-12 12M6 6l12 12"/>',
  activity:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
  send:'<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>',
  trend:'<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>'
};
function icon(name, cls="") { return '<svg class="ico '+cls+'" viewBox="0 0 24 24" aria-hidden="true">'+(icons[name]||icons.activity)+'</svg>'; }
function esc(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function money(v) { return v == null || v === "" ? "—" : "$" + Number(v).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function localDate(d=new Date()) { return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Karachi",year:"numeric",month:"2-digit",day:"2-digit"}).format(d); }
function fmtDate(value, opts={dateStyle:"medium"}) { if(!value)return "—"; return new Intl.DateTimeFormat("en-US",{...opts,timeZone:"Asia/Karachi"}).format(new Date(value)); }
function fmtTime(value) { return value ? fmtDate(value,{hour:"2-digit",minute:"2-digit"}) : "—"; }
function relative(value) { if(!value)return "—"; const ms=Date.now()-new Date(value).getTime(); if(ms<60000)return "just now"; if(ms<3600000)return Math.floor(ms/60000)+" min ago"; if(ms<86400000)return Math.floor(ms/3600000)+" hr ago"; return Math.floor(ms/86400000)+" days ago"; }
function toast(message,type="success") { let box=$(".toast-stack"); if(!box){box=document.createElement("div");box.className="toast-stack";document.body.append(box)} const el=document.createElement("div");el.className="toast "+type;el.textContent=message;box.append(el);setTimeout(()=>el.remove(),4300); }
function showError(error) { console.error(error); toast(error?.message || "Something went wrong. Please try again.", "error"); }
function pakiDayNo() { const now=localDate(); return Math.floor((new Date(now+"T00:00:00Z")-new Date("2026-12-01T00:00:00Z"))/86400000)+1; }
function currentDayLabel() { const n=pakiDayNo(); if(n<1){const daysUntil=1-n;return "Challenge starts in "+daysUntil+" day"+(daysUntil===1?"":"s");} if(n>31)return "Challenge complete"; return "Day "+n+" · "+fmtDate("2026-12-"+String(n).padStart(2,"0")+"T12:00:00Z",{month:"short",day:"numeric",year:"numeric"}); }
function datePeriodStart(period) { const today=localDate(); const d=new Date(today+"T00:00:00Z"); if(period==="today")return today; if(period==="week"){d.setUTCDate(d.getUTCDate()-6);return d.toISOString().slice(0,10)} if(period==="15d"){d.setUTCDate(d.getUTCDate()-14);return d.toISOString().slice(0,10)} return "0000-01-01"; }
function filterDateRows(rows,field,period) { if(period==="all")return rows; const start=datePeriodStart(period); return rows.filter(r=>localDate(new Date(r[field]))>=start); }
function initials(name) { return (name||"NX").trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase(); }
function isImage(type) { return (type||"").startsWith("image/"); }
function isVideo(type) { return (type||"").startsWith("video/"); }
function isAudio(type) { return (type||"").startsWith("audio/"); }
function profileBy(id) { return state.profiles.find(p=>p.id===id) || (state.profile?.id===id?state.profile:null); }
function mediaUrl(path) {
  if(!path)return Promise.resolve("");
  if(state.mediaCache[path])return Promise.resolve(state.mediaCache[path]);
  return supabase.storage.from("nexoventia-media").createSignedUrl(path,3600).then(({data,error})=>{
    if(error){console.warn("Media link unavailable",error.message);return "";}
    state.mediaCache[path]=data.signedUrl;return data.signedUrl;
  });
}
function hydrateMedia(root=document) {
  $$("[data-media-path]",root).forEach(async el=>{
    const path=el.dataset.mediaPath;
    if(!path || el.dataset.hydrated==="1")return;
    el.dataset.hydrated="1";
    const url=await mediaUrl(path);
    if(!url){el.textContent="Private attachment unavailable";return;}
    if(el.tagName==="IMG" || el.tagName==="VIDEO" || el.tagName==="AUDIO")el.src=url;
    else {const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener";a.textContent=el.dataset.fileName||"Open attachment";el.replaceChildren(a);}
  });
}
async function uploadFile(file,folder="media") {
  if(!file) return null;
  if(file.size>50*1024*1024)throw new Error("Each file must be smaller than 50 MB.");
  const allowed=["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/webm","audio/mpeg","audio/webm","application/pdf"];
  if(!allowed.includes(file.type))throw new Error("This file type is not supported.");
  const clean=file.name.replace(/[^a-zA-Z0-9._-]/g,"_").slice(-70);
  const path=state.user.id+"/"+folder+"/"+crypto.randomUUID()+"-"+clean;
  const {error}=await supabase.storage.from("nexoventia-media").upload(path,file,{cacheControl:"3600",upsert:false,contentType:file.type});
  if(error)throw error;
  delete state.mediaCache[path];
  return {path,name:file.name,type:file.type,size:file.size};
}
function empty(title,body,iconName="activity") { return '<div class="empty">'+icon(iconName)+'<h3>'+esc(title)+'</h3><p>'+esc(body)+'</p></div>'; }
function pageHead(kicker,title,desc,action="") { return '<div class="page-head"><div><div class="eyebrow">'+esc(kicker)+'</div><h2>'+esc(title)+'</h2><p>'+esc(desc)+'</p></div>'+action+'</div>'; }
function metric(label,value,foot,ic="activity",tone="") { return '<div class="panel metric"><div class="metric-top"><div class="metric-label">'+esc(label)+'</div><div class="metric-icon">'+icon(ic)+'</div></div><div class="metric-value '+tone+'">'+value+'</div><div class="metric-foot">'+esc(foot||"Updated from shared records")+'</div></div>'; }
function periodTabs(active) { return '<div class="segmented" role="group" aria-label="Date filter">'+[['today','Today'],['week','Weekly'],['15d','15 days'],['all','All']].map(([v,t])=>'<button data-period="'+v+'" class="'+(active===v?"active":"")+'">'+t+'</button>').join("")+'</div>'; }

async function loadData() {
  if(!state.user)return;
  state.loading=true;
  try {
    const queries = await Promise.all([
      supabase.from("profiles").select("id,display_name,username,avatar_path,bio,role,created_at").order("created_at",{ascending:true}),
      supabase.from("challenge_days").select("*").order("day_no"),
      supabase.from("day_closes").select("*").order("day_no"),
      supabase.from("signals").select("*").order("issued_at",{ascending:false}).limit(400),
      supabase.from("withdrawals").select("*").order("created_at",{ascending:false}).limit(400),
      supabase.from("app_state").select("*"),
      supabase.from("notifications").select("*").order("created_at",{ascending:false}).limit(50)
    ]);
    const [profiles,days,closes,signals,withdrawals,appState,notifications]=queries;
    for(const q of queries)if(q.error)throw q.error;
    state.profiles=profiles.data||[];
    state.profile=state.profiles.find(p=>p.id===state.user.id)||state.profile;
    state.isAdmin=state.profile?.role==="admin";
    state.days=days.data||[];state.closes=closes.data||[];state.signals=signals.data||[];
    state.withdrawals=withdrawals.data||[];state.appState=Object.fromEntries((appState.data||[]).map(x=>[x.key,x.value]));
    state.notifications=notifications.data||[];
    if(state.isAdmin){
      const pr=await supabase.from("user_presence").select("*").order("last_seen",{ascending:false});
      if(!pr.error)state.presence=pr.data||[];
    }
  } catch(error){showError(error)}
  finally{state.loading=false;render();}
}
let realtimeChannel=null, presenceTimer=null, tickTimer=null, loadTimer=null;
function scheduleReload() { clearTimeout(loadTimer);loadTimer=setTimeout(()=>loadData(),450); }
function setupRealtime() {
  if(realtimeChannel)supabase.removeChannel(realtimeChannel);
  realtimeChannel=supabase.channel("nexoventia-live")
    .on("postgres_changes",{event:"*",schema:"public",table:"signals"},payload=>{if(payload.eventType==="INSERT")notify("New signal posted","A new "+(payload.new.feed||"official")+" record is available.");scheduleReload()})
    .on("postgres_changes",{event:"*",schema:"public",table:"withdrawals"},()=>scheduleReload())
    .on("postgres_changes",{event:"*",schema:"public",table:"day_closes"},()=>scheduleReload())
    .on("postgres_changes",{event:"*",schema:"public",table:"messages"},payload=>{if(payload.eventType==="INSERT"&&payload.new.user_id!==state.user.id)notify("New community message",payload.new.body||"An attachment was shared.");scheduleReload()})
    .on("postgres_changes",{event:"*",schema:"public",table:"private_messages"},payload=>{if(payload.eventType==="INSERT"&&payload.new.sender_id!==state.user.id)notify("New private message",payload.new.body||"An attachment was shared.");if(state.page==="inbox")loadInbox();})
    .on("postgres_changes",{event:"*",schema:"public",table:"app_state"},()=>scheduleReload())
    .on("postgres_changes",{event:"*",schema:"public",table:"notifications",filter:"user_id=eq."+state.user.id},()=>scheduleReload())
    .subscribe();
}
async function touchPresence(online=true) {
  if(!state.user)return;
  try{await supabase.from("user_presence").upsert({user_id:state.user.id,is_online:online,last_seen:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:"user_id"});}catch(e){console.debug(e)}
}
function startRuntime() {
  stopRuntime();touchPresence(true);presenceTimer=setInterval(()=>touchPresence(true),45000);
  tickTimer=setInterval(()=>{updateCountdowns();if(state.page==="inbox")loadInbox(false);},1000);
  window.addEventListener("pagehide",()=>touchPresence(false));
  setupRealtime();
}
function stopRuntime() {
  if(presenceTimer)clearInterval(presenceTimer);if(tickTimer)clearInterval(tickTimer);
  if(realtimeChannel)supabase.removeChannel(realtimeChannel);realtimeChannel=null;
}
function notify(title,body) {
  const enabled=localStorage.getItem("nx-notifications")==="yes";
  if(enabled&&"Notification"in window&&Notification.permission==="granted"&&document.visibilityState!=="visible"){
    try{new Notification(title,{body,icon:"./logo.svg",tag:"nexoventia-"+title})}catch(e){console.debug(e)}
  }else if(document.visibilityState==="visible"&&state.page!=="community"&&state.page!=="notes")toast(title+": "+body,"success");
}
async function authChanged(session) {
  state.session=session;state.user=session?.user||null;
  if(!session){stopRuntime();state.profile=null;state.isAdmin=false;state.mfaPendingFactor=null;state.mfaChallengeId=null;state.loading=false;render();return;}
  try{
    const {data:assurance,error:assuranceError}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if(assuranceError)throw assuranceError;
    const {data:factors,error:factorsError}=await supabase.auth.mfa.listFactors();
    if(factorsError)throw factorsError;
    state.mfaFactors=(factors?.totp||[]).filter(f=>f.status==="verified");
    if(assurance?.nextLevel==="aal2"&&assurance.currentLevel!=="aal2"&&state.mfaFactors.length){
      const verified=state.mfaFactors[0];
      const {data:challenge,error:challengeError}=await supabase.auth.mfa.challenge({factorId:verified.id});
      if(challengeError)throw challengeError;
      state.mfaPendingFactor=verified.id;state.mfaChallengeId=challenge.id;state.loading=false;renderMfaChallenge();return;
    }
  }catch(error){showError(error);state.loading=false;renderAuth();return;}
  state.mfaPendingFactor=null;state.mfaChallengeId=null;
  state.loading=true;render();
  await loadData();startRuntime();
}
async function renderMfaChallenge(){
  const factorOptions=state.mfaFactors.map(f=>'<option value="'+esc(f.id)+'" '+(f.id===state.mfaPendingFactor?"selected":"")+'>'+esc(f.friendly_name||"Authenticator device")+'</option>').join("");
  app.innerHTML='<div class="auth-page"><section class="auth-story"><div class="auth-logo"><img src="./logo.svg" alt=""><div><strong>NEXOVENTIA</strong><span>SECURE MEMBER ACCESS</span></div></div><div class="eyebrow" style="margin-top:54px">ADDITIONAL SECURITY CHECK</div><h1>Verify your<br><em>authenticator.</em></h1><p>Two-factor authentication is enabled for this account. Enter the current six-digit code from one of your registered authenticator devices.</p><div class="hero-chips"><span class="chip"><i class="chip-dot"></i> TOTP verification required</span><span class="chip">Private session</span></div><div class="auth-visual"></div></section><section class="auth-card-wrap"><div class="auth-card panel"><div class="auth-logo"><img src="./logo.svg" alt=""><div><strong>NEXOVENTIA</strong><span>SECOND FACTOR</span></div></div><div style="height:26px"></div><h2>Enter verification code</h2><p>Open the selected authenticator app and enter its current six-digit code. Do not share this code with anyone.</p>'+(state.mfaFactors.length>1?'<div class="field" style="margin-bottom:14px"><label>AUTHENTICATOR DEVICE</label><select id="mfaFactorSelect">'+factorOptions+'</select></div>':'')+'<form id="mfaLoginForm" class="auth-form"><div class="field"><label>6-DIGIT AUTHENTICATOR CODE</label><input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required placeholder="000000"></div><button class="btn-primary" type="submit">Verify and continue</button></form><div class="hint" style="margin-top:14px">Lost access to one device? Select another verified authenticator registered to your account. Keep at least two devices enrolled and stored separately. If all registered devices are lost, contact the project owner for identity-verified account recovery.</div></div></section></div>';
  $("#mfaFactorSelect")?.addEventListener("change",async e=>{
    const selected=e.target.value;
    try{
      const {data,error}=await supabase.auth.mfa.challenge({factorId:selected});
      if(error)throw error;
      state.mfaPendingFactor=selected;
      state.mfaChallengeId=data.id;
      toast("A new challenge was prepared for that authenticator.");
    }catch(error){showError(error)}
  });
  $("#mfaLoginForm")?.addEventListener("submit",async e=>{
    e.preventDefault();
    if(state.mfaBusy)return;
    const codeValue=String(new FormData(e.currentTarget).get("code")||"").trim();
    if(!/^[0-9]{6}$/.test(codeValue)){toast("Enter a valid six-digit authenticator code.","error");return;}
    state.mfaBusy=true;
    const button=e.currentTarget.querySelector("button");
    button.disabled=true;
    button.textContent="Verifying…";
    try{
      const {error}=await supabase.auth.mfa.verify({
        factorId:state.mfaPendingFactor,
        challengeId:state.mfaChallengeId,
        code:codeValue
      });
      if(error)throw error;
      state.mfaPendingFactor=null;
      state.mfaChallengeId=null;
      const {data,error:getError}=await supabase.auth.getSession();
      if(getError)throw getError;
      await authChanged(data.session);
    }catch(error){
      showError(error);
      button.disabled=false;
      button.textContent="Verify and continue";
    }finally{state.mfaBusy=false}
  });
}

supabase.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>authChanged(session),0)});

function renderAuth() {
  const signUp=state.authMode==="signup",forgot=state.authMode==="forgot";
  app.innerHTML='<div class="auth-page"><section class="auth-story"><div class="auth-logo"><img src="./logo.svg" alt="Nexoventia logo"><div><strong>NEXOVENTIA</strong><span>TRADING JOURNAL / COMMUNITY</span></div></div><div class="eyebrow" style="margin-top:54px">A PRIVATE OPERATIONS SPACE</div><h1>Track the plan.<br><em>Own the record.</em></h1><p>A shared challenge calendar, transparent signal history, withdrawal records and a moderated learning community — built for clarity, not hype.</p><div class="hero-chips"><span class="chip"><i class="chip-dot"></i> Private workspace</span><span class="chip">December 2026 challenge</span><span class="chip">Admin-controlled records</span></div><div class="auth-visual"></div></section><section class="auth-card-wrap"><div class="auth-card panel"><div class="auth-logo"><img src="./logo.svg" alt=""><div><strong>NEXOVENTIA</strong><span>SECURE MEMBER ACCESS</span></div></div><div style="height:26px"></div><h2>'+(forgot?"Reset your password":signUp?"Create your account":"Welcome back")+'</h2><p>'+(forgot?"Enter your registered email and we will send a reset link.":signUp?"Create your member profile to join the shared workspace.":"Sign in to view the shared challenge, signal journal and community.")+'</p><form class="auth-form" id="authForm">'+(signUp?'<div class="field"><label>FULL NAME</label><input name="full_name" required maxlength="80" autocomplete="name" placeholder="Your full name"></div><div class="field"><label>USERNAME</label><input name="username" required minlength="3" maxlength="24" pattern="[A-Za-z0-9_]+" placeholder="choose_username"></div>':'')+'<div class="field"><label>EMAIL ADDRESS</label><input name="email" type="email" required autocomplete="email" placeholder="you@example.com"></div>'+(forgot?"":'<div class="field"><label>PASSWORD</label><input name="password" type="password" required minlength="8" autocomplete="'+(signUp?"new-password":"current-password")+'" placeholder="At least 8 characters"></div>')+'<button class="btn-primary" type="submit" id="authSubmit">'+(forgot?"Send reset link":signUp?"Create account":"Sign in securely")+'</button></form>'+(forgot?"":'<div class="auth-or">OR CONTINUE WITH</div><button class="btn-subtle" id="googleAuth" style="width:100%">Continue with Google</button>')+'<div class="auth-links"><button class="text-link" data-auth-mode="'+(signUp?"login":"signup")+'">'+(signUp?"Already have an account? Sign in":"Create an account")+'</button>'+(forgot?'':'<button class="text-link" data-auth-mode="forgot">Forgot password?</button>')+'</div><div class="divider"></div><div class="hint">Your password is handled by Supabase Auth. Nexoventia never stores plain-text passwords or asks for your Quotex credentials.</div></div></section></div>';
  const form=$("#authForm");
  form.addEventListener("submit",async e=>{
    e.preventDefault();if(state.authBusy)return;state.authBusy=true;
    const fd=new FormData(form),email=String(fd.get("email")||"").trim(),password=String(fd.get("password")||"");
    const btn=$("#authSubmit");btn.disabled=true;btn.textContent="Please wait…";
    try{
      if(forgot){
        const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
        if(error)throw error;toast("Password reset email sent.");state.authMode="login";renderAuth();
      }else if(signUp){
        const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:String(fd.get("full_name")||"").trim(),username:String(fd.get("username")||"").trim().toLowerCase()},emailRedirectTo:location.origin+location.pathname}});
        if(error)throw error;
        if(data.session)await authChanged(data.session);else{toast("Account created. Check your email to confirm, then sign in.","success");state.authMode="login";renderAuth();}
      }else{
        const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;await authChanged(data.session);
      }
    }catch(err){showError(err)}finally{state.authBusy=false;const b=$("#authSubmit");if(b)b.disabled=false;}
  });
  $("#googleAuth")?.addEventListener("click",async()=>{
    try{const {error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+location.pathname}});if(error)throw error}
    catch(err){showError(err)}
  });
  $$("[data-auth-mode]").forEach(b=>b.addEventListener("click",()=>{state.authMode=b.dataset.authMode;renderAuth()}));
}
function navigation() {
  const items=[
    ["dashboard","Overview","grid"],["challenge","Challenge Plan","calendar"],["notes","Quetex Official Signals","notes"],
    ["demo","Market Checking · Demo Signals","chart"],["transactions","Withdrawals","wallet"],["community","Community","users"],
    ["analytics","Analytics","activity"],["notifications","Notifications","bell"],["inbox","Admin Inbox","message"],
    ...(state.isAdmin?[["admin","Admin Control","shield"]]:[]),["settings","Settings","settings"]
  ];
  return '<div class="nav-label">WORKSPACE</div><div class="nav-list">'+items.map(([id,label,ic])=>'<button class="nav-item '+(state.page===id?"active":"")+'" data-page="'+id+'">'+icon(ic)+'<span>'+label+'</span>'+(id==="notifications"&&state.notifications.some(n=>!n.read_at)?'<span class="nav-badge">'+state.notifications.filter(n=>!n.read_at).length+'</span>':"")+'</button>').join("")+'</div>';
}
function renderShell() {
  if(!state.profile){app.innerHTML='<div class="boot"><img src="./logo.svg" width="70"><p>PREPARING YOUR SECURE WORKSPACE…</p></div>';return;}
  if(!state.isAdmin&&state.page==="admin")state.page="dashboard";
  document.body.classList.toggle("light",state.theme==="light");
  const names={dashboard:["WORKSPACE","Dashboard"],challenge:["CHALLENGE / DECEMBER 2026","Challenge Plan"],notes:["OFFICIAL SIGNAL ARCHIVE","Quetex Official Signals"],demo:["PRACTICE ONLY","Market Checking · Demo Signals"],transactions:["MONEY MANAGER","Withdrawals"],community:["COMMUNITY","Community"],analytics:["PERFORMANCE","Analytics"],notifications:["ALERT CENTRE","Notifications"],inbox:["PRIVATE SUPPORT","Admin Inbox"],admin:["OWNER TOOLS","Admin Control"],settings:["PREFERENCES","Settings"]};
  const n=names[state.page]||names.dashboard;
  app.innerHTML='<div class="app-shell"><aside class="sidebar" id="sidebar"><div class="brand"><img src="./logo.svg" alt="Nexoventia"><div><div class="brand-name">NEXOVENTIA</div><div class="brand-sub">TRADING OPERATIONS</div></div></div>'+navigation()+'<div class="side-footer"><div class="status-pill"><i class="status-dot"></i> PRIVATE SESSION ACTIVE</div><div class="hint" style="padding:12px 4px 0">v1.0 · December challenge workspace</div></div></aside><main class="main"><header class="topbar"><div class="top-left"><button class="icon-btn mobile-menu" id="mobileMenu" aria-label="Open navigation">'+icon("menu")+'</button><div><div class="eyebrow">'+n[0]+'</div><div class="page-title">'+n[1]+'</div></div></div><div class="top-actions"><div class="search-wrap"><label class="search-box">'+icon("search")+'<input id="globalSearch" placeholder="Search this workspace" value="'+esc(state.globalSearch)+'"></label><div id="searchResults" class="search-results" hidden></div></div><button class="icon-btn" data-page="notifications" aria-label="Notifications">'+icon("bell")+'</button><button class="icon-btn" data-page="settings" aria-label="Settings">'+icon("settings")+'</button><div class="avatar" title="'+esc(state.profile.display_name)+'">'+(state.profile.avatar_path?'<img data-media-path="'+esc(state.profile.avatar_path)+'" alt="">':esc(initials(state.profile.display_name)))+'</div></div></header><section class="page" id="pageContent">'+renderPage()+'</section></main></div><nav class="mobile-nav">'+[["dashboard","Overview","grid"],["challenge","Plan","calendar"],["notes","Notes","notes"],["community","Community","users"],["analytics","Stats","chart"]].map(([id,t,ic])=>'<button data-page="'+id+'" class="'+(state.page===id?"active":"")+'">'+icon(ic)+'<span>'+t+'</span></button>').join("")+'</nav><div id="modal-root"></div>';
  document.title="Nexoventia · "+n[1];
  bindPageEvents();hydrateMedia();updateCountdowns();
  if(state.page==="inbox")loadInbox(false);
  if(state.page==="community")loadMessages(false);
  if(state.page==="notifications")markNotificationsSeen();
}
function renderGlobalSearchResults(){
  const root=$("#searchResults");
  if(!root)return;
  const q=(state.globalSearch||"").trim().toLowerCase();
  if(!q){root.hidden=true;root.innerHTML="";return;}
  const results=[];
  const add=(label,detail,page,mode="")=>results.push({label,detail,page,mode});
  for(const day of state.days){
    const hay=("day "+day.day_no+" "+day.calendar_date+" "+(day.is_rest_day?"rest day":"")).toLowerCase();
    if(hay.includes(q))add("Day "+day.day_no,day.calendar_date+" · "+(day.is_rest_day?"Rest day":money(day.target_min)+"–"+money(day.target_max)),"challenge");
  }
  for(const signal of state.signals){
    const hay=(signal.pair+" "+signal.direction+" "+signal.timeframe+" "+signal.outcome+" "+signal.day_no).toLowerCase();
    if(hay.includes(q))add(signal.pair+" · "+signal.direction,signal.feed.toUpperCase()+" · "+signal.outcome.toUpperCase()+" · "+fmtDate(signal.issued_at),signal.feed==="official"?"notes":"demo");
  }
  for(const withdrawal of state.withdrawals){
    const hay=(withdrawal.amount+" "+withdrawal.note+" "+withdrawal.day_no+" "+withdrawal.created_at).toLowerCase();
    if(hay.includes(q))add("Withdrawal "+money(withdrawal.amount),fmtDate(withdrawal.created_at)+" · "+fmtTime(withdrawal.created_at),"transactions");
  }
  for(const message of state.messages){
    if((message.body||"").toLowerCase().includes(q))add((message.body||"Community attachment").slice(0,64),fmtDate(message.created_at)+" · "+message.channel,"community",message.channel);
  }
  if(state.isAdmin){
    for(const member of state.profiles){
      if((member.display_name+" "+(member.username||"")).toLowerCase().includes(q))add(member.display_name+" · @"+(member.username||"member"),"Member account · open admin inbox","inbox");
    }
  }
  const shown=results.slice(0,10);
  root.hidden=false;
  root.innerHTML=shown.length?shown.map((item,i)=>'<button class="search-result" data-search-index="'+i+'"><span class="search-result-icon">'+icon("search")+'</span><span><strong>'+esc(item.label)+'</strong><small>'+esc(item.detail)+'</small></span>'+icon("arrow")+'</button>').join(""):'<div class="search-empty">No matching records found in the loaded workspace.</div>';
  $(".search-result",root).forEach((button,i)=>button.addEventListener("click",()=>{
    const item=shown[i];
    state.page=item.page;
    if(item.page==="community")state.communityMode=item.mode==="updates"?"updates":"discussion";
    if(item.page==="inbox"&&state.isAdmin){
      const member=state.profiles.find(p=>(p.display_name+" "+(p.username||"")).toLowerCase().includes(q));
      if(member)state.selectedInboxUser=member.id;
    }
    state.globalSearch="";
    render();
  }));
}
function render() { if(!state.user)renderAuth(); else renderShell(); }
function renderPage() {
  switch(state.page){
    case "dashboard":return renderDashboard();
    case "challenge":return renderChallenge();
    case "notes":return renderSignalFeed("official");
    case "demo":return renderSignalFeed("demo");
    case "transactions":return renderTransactions();
    case "community":return renderCommunity();
    case "analytics":return renderAnalytics();
    case "notifications":return renderNotifications();
    case "inbox":return renderInbox();
    case "admin":return renderAdmin();
    case "settings":return renderSettings();
    default:return renderDashboard();
  }
}
function closedFor(dayNo){return state.closes.find(c=>Number(c.day_no)===Number(dayNo));}
function withdrawalsForDay(dayNo){return state.withdrawals.filter(w=>Number(w.day_no)===Number(dayNo)).reduce((s,w)=>s+Number(w.amount),0);}
function pnlRows(){
  let carriedBalance=Number(state.appState.starting_balance ?? 10);
  let balanceKnown=true;
  const closeByDay=new Map(state.closes.map(c=>[Number(c.day_no),c]));
  const rows=[];
  for(const day of state.days){
    const close=closeByDay.get(Number(day.day_no));
    const withdrawn=withdrawalsForDay(day.day_no);
    if(close){
      const opening=balanceKnown?carriedBalance:null;
      const closing=Number(close.closing_balance);
      const netResult=opening===null?null:closing+withdrawn-opening;
      rows.push({...close,opening_balance:opening,withdrawn,net_result:netResult,calendar_date:day.calendar_date});
      carriedBalance=closing;
      balanceKnown=true;
    }else if(day.is_rest_day){
      if(balanceKnown&&withdrawn>0)carriedBalance-=withdrawn;
    }else{
      // An unclosed active day makes the next opening balance unknown.
      balanceKnown=false;
    }
  }
  return rows;
}
function rangeStats(period) {
  const pRows=filterDateRows(pnlRows(),"closed_at",period);
  const wRows=filterDateRows(state.withdrawals,"created_at",period);
  const sRows=filterDateRows(state.signals,"issued_at",period);
  const wins=sRows.filter(s=>s.outcome==="win").length,losses=sRows.filter(s=>s.outcome==="loss").length,refunds=sRows.filter(s=>s.outcome==="refund").length;
  const net=pRows.reduce((s,r)=>s+(r.net_result==null?0:Number(r.net_result)),0);
  const wd=wRows.reduce((s,w)=>s+Number(w.amount),0);
  const accuracy=(wins+losses)?wins/(wins+losses)*100:0;
  return {pRows,wRows,sRows,wins,losses,refunds,net,wd,accuracy};
}
function chartSvg(rows) {
  const values=rows.map(r=>Number(r.closing_balance));
  if(!values.length)return '<div class="chart-wrap">'+empty("No balance history yet","Your recorded day closes will build the shared balance chart.","chart")+'</div>';
  const w=760,h=200,pad=28,min=Math.min(...values,10),max=Math.max(...values,12),span=Math.max(1,max-min);
  const pts=values.map((v,i)=>[pad+(w-pad*2)*(values.length===1?.5:i/(values.length-1)),h-pad-(v-min)/span*(h-pad*2)]);
  const line=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
  const area=line+" L "+pts[pts.length-1][0]+" "+(h-pad)+" L "+pts[0][0]+" "+(h-pad)+" Z";
  return '<div class="chart-wrap"><svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Recorded balance history"><defs><linearGradient id="chartGradient" x1="0" x2="1"><stop stop-color="#9b7bff"/><stop offset="1" stop-color="#62e7dc"/></linearGradient><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#9b7bff"/><stop offset="1" stop-color="#62e7dc" stop-opacity="0"/></linearGradient></defs><path class="chart-grid" d="M'+pad+' 45H'+(w-pad)+'M'+pad+' 95H'+(w-pad)+'M'+pad+' 145H'+(w-pad)+'"/><path class="chart-area" d="'+area+'"/><path class="chart-line" d="'+line+'"/>'+pts.map(p=>'<circle class="chart-dot" cx="'+p[0]+'" cy="'+p[1]+'" r="4"/>').join("")+'<text x="'+pad+'" y="15" class="chart-label">'+money(min)+'</text><text x="'+(w-pad)+'" y="15" text-anchor="end" class="chart-label">'+money(max)+'</text><text x="'+pad+'" y="'+(h-4)+'" class="chart-label">DAY CLOSES</text><text x="'+(w-pad)+'" y="'+(h-4)+'" text-anchor="end" class="chart-label">'+values.length+' RECORDS</text></svg></div>';
}
function renderSignalSnapshot(label,period){
  const s=rangeStats(period);
  const total=s.sRows.length;
  const pending=total-s.wins-s.losses-s.refunds;
  return '<section class="panel panel-pad signal-snapshot"><div class="snapshot-head"><div class="eyebrow">'+esc(label)+'</div><span class="tag">'+esc(period==='15d'?'15 DAY':period.toUpperCase())+'</span></div><div class="snapshot-count">'+total+' <small>SIGNALS</small></div><div class="snapshot-results"><span class="snapshot-win">'+s.wins+' Wins</span><span class="snapshot-loss">'+s.losses+' Losses</span><span class="snapshot-refund">'+s.refunds+' Refunds</span><span class="snapshot-pending">'+pending+' Pending</span></div><div class="snapshot-foot"><span>Recorded win rate</span><strong>'+s.accuracy.toFixed(1)+'%</strong></div><div class="snapshot-foot"><span>Net recorded P/L</span><strong>'+money(s.net)+'</strong></div><div class="snapshot-foot"><span>Withdrawals</span><strong>'+money(s.wd)+'</strong></div></section>';
}
function renderDashboard() {
  const completed=state.closes.length,active=state.days.filter(d=>!d.is_rest_day).length;
  const latest=[...state.closes].sort((a,b)=>b.day_no-a.day_no)[0];
  const totalWd=state.withdrawals.reduce((s,w)=>s+Number(w.amount),0);
  const c=rangeStats(state.activePeriod);
  const winRate=c.accuracy.toFixed(1);
  const next=state.appState.next_signal_at;
  const current=pakiDayNo();
  const todayDay=state.days.find(d=>d.calendar_date===localDate());
  const target=todayDay?.is_rest_day?"Rest day":todayDay?money(todayDay.target_min)+" – "+money(todayDay.target_max):current<1?"Starts December 1":"Challenge ended";
  const upcoming=state.days.find(d=>d.day_no>Math.max(0,current)&&(!closedFor(d.day_no)));
  const lastWd=[...state.withdrawals].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];
  return '<div class="panel hero"><div class="hero-orbit"></div><div class="hero-core"><img src="./logo.svg" alt=""></div><div class="hero-content"><div class="eyebrow">WELCOME BACK · '+(state.isAdmin?"OWNER ACCESS":"MEMBER ACCESS")+'</div><h2>Good to see you, '+esc((state.profile.display_name||"Member").split(" ")[0])+'.</h2><p>Your shared challenge workspace is ready. View the official record, track the calendar and review outcomes without changing the source data.</p><div class="hero-chips"><span class="chip"><i class="chip-dot"></i> '+esc(currentDayLabel())+'</span><span class="chip">31 calendar days</span><span class="chip">28 active · 3 rest</span></div></div></div>'+
  '<div class="section-row"><div><h3>Signal performance snapshots</h3><p>Separate daily, weekly and lifetime totals from shared official outcomes</p></div><span class="tag">SHARED RECORDS</span></div>'+
  '<div class="grid grid-3 dashboard-snapshots">'+renderSignalSnapshot("Today","today")+renderSignalSnapshot("This week","week")+renderSignalSnapshot("All time","all")+'</div>'+
  '<div class="section-row"><div><h3>Challenge overview</h3><p>Shared records — all members see the same verified entries</p></div>'+periodTabs(state.activePeriod)+'</div>'+
  '<div class="grid grid-4">'+metric("Latest recorded balance",latest?money(latest.closing_balance):"Not set",latest?"Closed on "+fmtDate(latest.closed_at):"Admin has not submitted a day close","wallet")+
  metric("Recorded withdrawals",money(totalWd),state.withdrawals.length+" receipt record(s)","download","cyan")+
  metric("Net recorded result",money(c.net),"Selected period · includes recorded withdrawals","trend",c.net>=0?"positive":"negative")+
  metric("Signal accuracy",winRate+"%",c.wins+" wins · "+c.losses+" losses · refunds excluded","chart","violet")+'</div>'+
  '<div class="grid grid-3" style="margin-top:15px"><div class="panel panel-pad span-2"><div class="section-row" style="margin:0 0 10px"><div><h3>Balance trajectory</h3><p>Actual end-of-day balances entered by the owner</p></div><span class="tag">ACTUAL RECORD</span></div>'+chartSvg(pnlRows())+'</div><div class="panel panel-pad"><div class="eyebrow">TODAY&#39;S TARGET</div><div class="metric-value" style="font-size:23px;margin:16px 0">'+target+'</div><p class="panel-sub">'+(todayDay?.is_rest_day?"No challenge activity is scheduled today.":todayDay?"From the original December 2026 plan. Actual results may differ.":"Challenge calendar begins December 1, 2026.")+'</p><div class="divider"></div><div class="eyebrow">NEXT DAY TO COMPLETE</div><div style="font-size:21px;font-weight:800;margin-top:8px">'+(upcoming?"Day "+upcoming.day_no:"—")+'</div><p class="panel-sub">'+(upcoming?fmtDate(upcoming.calendar_date+"T12:00:00Z",{dateStyle:"long"}):"All challenge dates have a close record.")+'</p></div></div>'+
  '<div class="section-row"><div><h3>Challenge progress</h3><p>Day-close records submitted</p></div><span class="mono">'+completed+' / '+active+' active days</span></div>'+
  '<div class="panel panel-pad"><div class="progress-line"><span>RECORDED COMPLETION</span><strong>'+Math.round(completed/active*100)+'%</strong></div><div class="progress-track"><div class="progress-fill" style="width:'+(completed/active*100)+'%"></div></div><div class="grid grid-4" style="margin-top:17px"><div><div class="mono">Signals issued</div><div class="metric-value" style="font-size:22px">'+state.signals.length+'</div></div><div><div class="mono">Registered accounts</div><div class="metric-value" style="font-size:22px">'+state.profiles.length+'</div><div class="hint">All signed-up members</div></div><div><div class="mono">Last withdrawal</div><div style="font-size:16px;font-weight:800;margin-top:9px">'+(lastWd?money(lastWd.amount):"—")+'</div><div class="hint">'+(lastWd?fmtDate(lastWd.created_at)+" · "+relative(lastWd.created_at):"No receipt yet")+'</div></div><div><div class="mono">Upcoming countdown</div><div class="countdown" id="nextCountdown" style="margin-top:8px">—</div><div class="hint">Owner-set next session time</div></div></div></div>'+
  (function(){const rows=pnlRows().filter(r=>r.net_result!==null);const profit=rows.filter(r=>r.net_result>0).length;const loss=rows.filter(r=>r.net_result<0).length;const flat=rows.filter(r=>r.net_result===0).length;return '<div class="grid grid-3 dashboard-day-results" style="margin-top:15px">'+metric("Profit days",profit,"Closed days with positive recorded P/L","trend","positive")+metric("Loss days",loss,"Closed days with negative recorded P/L","activity","negative")+metric("Break-even days",flat,"Closed days with zero recorded P/L","calendar")+'</div>'})()+
  (state.isAdmin?'<div class="section-row"><div><h3>Owner quick actions</h3><p>These controls are visible only to your admin account</p></div></div><div class="inline-actions"><button class="btn-primary" data-page="admin">'+icon("shield")+' Open Admin Control</button><button class="btn-subtle" data-action="new-signal">'+icon("plus")+' Publish a signal</button><button class="btn-subtle" data-action="new-withdrawal">'+icon("upload")+' Add withdrawal</button></div>':"")+
  '<div class="alert info" style="margin-top:18px">Educational record only. Signal outcomes reflect entries made by the owner; they are not independent broker verification or a prediction of future results.</div>';
}
function renderChallenge() {
  const rows=state.days.map(d=>{
    const close=closedFor(d.day_no),wd=withdrawalsForDay(d.day_no);
    return '<tr><td><span class="day-number">'+d.day_no+'</span></td><td>'+fmtDate(d.calendar_date+"T12:00:00Z",{weekday:"short",month:"short",day:"numeric"})+'</td><td>'+(d.is_rest_day?'<span class="tag rest">REST</span>':money(d.target_min)+' – '+money(d.target_max))+'</td><td>'+money(d.planned_withdrawal)+'</td><td>'+(close?money(close.closing_balance):'<span class="mono">Not recorded</span>')+'</td><td>'+(wd?money(wd):"—")+'</td><td>'+(close?'<span class="tag done">CLOSED</span>':d.is_rest_day?'<span class="tag rest">REST DAY</span>':'<span class="tag pending">PENDING</span>')+'</td><td>'+(state.isAdmin?'<button class="btn-small btn-subtle" data-close-day="'+d.day_no+'">'+(close?"Edit close":"Close day")+'</button>':'—')+'</td></tr>';
  }).join("");
  const planWd=state.days.reduce((s,d)=>s+Number(d.planned_withdrawal),0);
  return pageHead("DECEMBER 2026 · 31 DAYS","Challenge Plan","Target ranges are balances before the planned withdrawal. Actual close is the amount remaining after the withdrawal; only the admin records it.",state.isAdmin?'<button class="btn-primary" data-action="close-current">Close a day</button>':"")+
  '<div class="grid grid-3">'+metric("Calendar days","31","December 1–31, 2026","calendar")+
  metric("Active / rest days","28 / 3","Day 14, 21 and 28 are rest days","clock")+
  metric("Planned withdrawals",money(planWd),"Nine original withdrawal targets","wallet")+'</div>'+
  '<div class="alert" style="margin:16px 0"><strong>Day 12 needs your confirmation.</strong> Your original note is saved as $25–$43. I have not changed it. Confirm later whether you intended $35–$43.</div><div class="alert info" style="margin:0 0 16px">Opening balance baseline is currently '+money(state.appState.starting_balance ?? 10)+' — provisionally inferred from Day 1’s $10 lower target. The admin can correct it if your actual starting balance is different.</div>'+
  '<div class="panel panel-pad"><div class="section-row" style="margin-top:0"><div><h3>Daily schedule</h3><p>All dates use Pakistan local date and time for display</p></div><span class="tag">SOURCE PLAN · LOCKED</span></div><div class="table-scroll"><table class="data-table"><thead><tr><th>DAY</th><th>DATE</th><th>PRE-WITHDRAWAL TARGET</th><th>PLAN WD</th><th>ACTUAL CLOSE AFTER WD</th><th>WITHDRAWN</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>'+
  '<div class="alert info" style="margin-top:16px">Balance carry-forward: the next day’s opening balance is the previous recorded day close. Day-close is the remaining account balance after any withdrawal recorded for that day. The app does not estimate or silently fill it.</div>';
}
function signalStats(feed,period) {
  const rows=filterDateRows(state.signals.filter(s=>s.feed===feed),"issued_at",period);
  const wins=rows.filter(s=>s.outcome==="win").length,losses=rows.filter(s=>s.outcome==="loss").length,refunds=rows.filter(s=>s.outcome==="refund").length,pending=rows.filter(s=>s.outcome==="pending").length;
  return {rows,wins,losses,refunds,pending,total:rows.length,accuracy:(wins+losses)?(wins/(wins+losses)*100):0};
}
function signalCard(s) {
  const ended=Date.now()>=new Date(s.expiry_at).getTime();
  const who=profileBy(s.issued_by);
  const result=s.outcome==="pending"?'<span class="tag pending">PENDING</span>':'<span class="tag '+s.outcome+'">'+s.outcome.toUpperCase()+'</span>';
  const before=s.before_path?'<div class="signal-image"><img data-media-path="'+esc(s.before_path)+'" alt="Before signal screenshot"><span>BEFORE</span></div>':'';
  const after=s.after_path?'<div class="signal-image"><img data-media-path="'+esc(s.after_path)+'" alt="After signal screenshot"><span>AFTER · '+esc(s.outcome.toUpperCase())+'</span></div>':'';
  const actions=state.isAdmin&&s.outcome==="pending"&&ended?'<button class="btn-primary btn-small" data-result-signal="'+s.id+'">Record outcome</button>':state.isAdmin&&s.outcome==="pending"?'<span class="tag pending">RESULT OPENS AFTER EXPIRY</span>':"";
  return '<article class="panel signal-card"><div class="signal-head"><div><div class="signal-pair">'+esc(s.pair)+'</div><div class="signal-meta"><span class="tag">'+esc(s.timeframe)+'</span><span class="tag">Amount '+money(s.amount)+'</span><span class="tag">'+(s.feed==="official"?"OFFICIAL RECORD":"DEMO RECORD")+'</span>'+(s.day_no?'<span class="tag">DAY '+s.day_no+'</span>':"")+'</div></div><div class="signal-direction '+(s.direction==="UP"?"up":"down")+'">'+s.direction+'</div></div><div class="signal-images">'+before+after+'</div><div class="signal-footer"><span>Issued '+fmtDate(s.issued_at,{month:"short",day:"numeric",year:"numeric"})+' · '+fmtTime(s.issued_at)+'</span><span>Expires '+fmtTime(s.expiry_at)+'</span>'+result+'</div>'+(s.result_note?'<div class="hint">'+esc(s.result_note)+'</div>':'')+'<div class="signal-footer"><span>Posted by '+esc(who?.display_name||"Nexoventia Admin")+'</span>'+actions+'</div></article>';
}
function renderSignalFeed(feed) {
  const period=state.activePeriod;
  const stats=signalStats(feed,period);
  const isOfficial=feed==="official";
  const title=isOfficial?"QUOTEX_OFFICIAL SIGNALS":"Market Checking · Demo Signals";
  const desc=isOfficial?"Read-only signal history shared with every member, including timestamps and result evidence.":"Educational market-checking practice records. No real trade is placed from this board.";
  return pageHead(isOfficial?"OFFICIAL RECORDS":"DEMO SIGNAL ROOM",title,desc)+
  '<div class="section-row" style="margin-top:0"><div><h3>Signal summary</h3><p>Historical outcomes; refunds excluded from the win-rate calculation</p></div>'+periodTabs(state.activePeriod)+'</div>'+
  '<div class="grid grid-4">'+metric("Total signals",stats.total,"In selected period","activity")+
  metric("Wins",stats.wins,"Owner-recorded outcomes","trend","positive")+
  metric("Losses",stats.losses,"Owner-recorded outcomes","activity","negative")+
  metric("Refunds",stats.refunds,stats.pending+" still pending","wallet","cyan")+'</div>'+
  '<div class="panel panel-pad" style="margin-top:15px"><div class="grid grid-2"><div><div class="mono">RECORDED ACCURACY</div><div class="metric-value violet">'+stats.accuracy.toFixed(1)+'%</div><div class="hint">Wins ÷ (Wins + Losses)</div></div><div><div class="mono">PENDING AFTER EXPIRY</div><div class="metric-value amber">'+stats.pending+'</div><div class="hint">Waiting for the admin to record a result and evidence</div></div></div></div>'+
  (state.isAdmin?'<div class="inline-actions" style="margin:16px 0"><button class="btn-primary" data-new-feed="'+feed+'">'+icon("plus")+' Publish '+(isOfficial?"official":"demo")+' record</button><span class="hint">Only your admin account can publish or update this board.</span></div>':'')+
  '<div class="section-row"><div><h3>Signal timeline</h3><p>Newest first · media evidence stored privately</p></div><span class="mono">'+stats.rows.length+' RECORDS</span></div>'+
  (stats.rows.length?'<div class="grid">'+stats.rows.map(signalCard).join("")+'</div>':empty("No signals recorded yet","When the admin publishes a signal, its pair, direction, time, amount and screenshots will appear here.","chart"))+
  '<div class="alert info" style="margin-top:16px">A result can only be entered after the expiry time. The admin must choose Win, Loss or Refund and may attach an after-screenshot. The board does not automatically verify the Quotex result.</div>';
}
function renderTransactions() {
  const period=state.activePeriod;
  const rows=filterDateRows(state.withdrawals,"created_at",period);
  const total=rows.reduce((s,w)=>s+Number(w.amount),0);
  const last=[...state.withdrawals].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];
  return pageHead("MONEY MANAGER · SHARED LEDGER","Withdrawals & Receipts","Members can view the shared withdrawal ledger. Only the admin can add or correct a receipt.",state.isAdmin?'<button class="btn-primary" data-action="new-withdrawal">'+icon("plus")+' Add withdrawal</button>':"")+
  '<div class="section-row" style="margin-top:0"><div><h3>Ledger overview</h3><p>Recorded withdrawals by date</p></div>'+periodTabs(state.activePeriod)+'</div>'+
  '<div class="grid grid-3">'+metric("Selected period",money(total),"Withdrawal amount in selected view","wallet")+
  metric("Total recorded",money(state.withdrawals.reduce((s,w)=>s+Number(w.amount),0)),state.withdrawals.length+" receipts saved","download")+
  metric("Last withdrawal",last?money(last.amount):"—",last?fmtDate(last.created_at)+" · "+fmtTime(last.created_at):"No withdrawal recorded yet","clock")+'</div>'+
  '<div class="section-row"><div><h3>Receipt timeline</h3><p>Images, amount and automatic Pakistan date/time</p></div><span class="tag">READ-ONLY FOR MEMBERS</span></div>'+
  (rows.length?'<div class="grid grid-2">'+rows.map(w=>{
    const day=state.days.find(d=>d.day_no===w.day_no);
    return '<div class="panel panel-pad"><div class="signal-head"><div><div class="metric-value" style="font-size:24px;margin:0">'+money(w.amount)+'</div><div class="hint">'+fmtDate(w.created_at,{dateStyle:"long"})+' · '+fmtTime(w.created_at)+'</div></div><span class="tag">WITHDRAWAL</span></div>'+(w.receipt_path?'<div class="signal-image" style="margin-top:14px"><img data-media-path="'+esc(w.receipt_path)+'" alt="Withdrawal receipt"><span>RECEIPT / PROOF</span></div>':'<div class="alert" style="margin-top:14px">No receipt image attached to this record.</div>')+'<div class="signal-footer" style="margin-top:12px"><span>'+(day?"Challenge Day "+day.day_no:"Date not linked to a challenge day")+'</span><span>Saved automatically</span></div>'+(w.note?'<p class="panel-sub">'+esc(w.note)+'</p>':'')+'</div>';
  }).join("")+'</div>':empty("No withdrawal receipts","The admin will add the amount and receipt image. The date and time are recorded automatically.","wallet"));
}
function getNextSessionMs() { const v=state.appState.next_signal_at;return v?new Date(v).getTime():null; }
function countdownText(ms) {
  if(!ms)return "NOT SET";
  let diff=ms-Date.now();if(diff<=0)return "READY";
  const h=Math.floor(diff/3600000),m=Math.floor(diff%3600000/60000),s=Math.floor(diff%60000/1000);
  return (h?String(h).padStart(2,"0")+":":"")+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
}
function updateCountdowns() {
  const el=$("#nextCountdown");if(el)el.textContent=countdownText(getNextSessionMs());
  const top=$("#countdownLarge");if(top)top.textContent=countdownText(getNextSessionMs());
  $$("[data-expiry-countdown]").forEach(x=>x.textContent=countdownText(new Date(x.dataset.expiryCountdown).getTime()));
}
function renderCommunity() {
  const mode=state.communityMode;
  const updates=mode==="updates";
  const title=updates?"Quetex Updates":"Discussion Group";
  const desc=updates?"Admin-only announcement room. Members can read and receive updates.":"Open group chat. Members can message, reply and share photos, videos, voice notes, GIFs, stickers and files.";
  const compose=updates&&!state.isAdmin?'<div class="alert info">This room is announcement-only. Only the Nexoventia admin can publish here.</div>':'<div class="chat-compose"><button class="icon-btn" id="attachFiles" title="Attach media">'+icon("image")+'</button><input id="chatFiles" type="file" accept="image/*,video/mp4,video/webm,audio/*,application/pdf" multiple><textarea id="chatText" placeholder="'+(updates?"Write an announcement…":"Write a message to the community…")+'"></textarea><button class="icon-btn" id="recordVoice" title="Record voice note">'+icon("mic")+'</button><button class="btn-primary" id="sendMessage" aria-label="Send message">'+icon("send")+'</button></div>';
  return pageHead("COMMUNITY · MODERATED ROOMS","Community","Four shared rooms. Members can post only in the Discussion Group; all other rooms are read-only for members.")+
  '<div class="panel chat-layout"><aside class="chat-rooms"><div class="eyebrow" style="padding:3px 8px 10px">COMMUNITY ROOMS</div>'+
  '<button class="room-btn '+(updates?"active":"")+'" data-community-mode="updates"><span class="room-avatar">'+icon("bell")+'</span><span><div class="room-title">Quetex Updates</div><div class="room-sub">ADMIN POSTS ONLY</div></span></button>'+
  '<button class="room-btn" data-page="notes"><span class="room-avatar">'+icon("chart")+'</span><span><div class="room-title">Quetex Official Signals</div><div class="room-sub">ADMIN SIGNALS · READ ONLY</div></span></button>'+
  '<button class="room-btn" data-page="demo"><span class="room-avatar">'+icon("activity")+'</span><span><div class="room-title">Market Checking · Demo Signals</div><div class="room-sub">ADMIN DEMO POSTS</div></span></button>'+
  '<button class="room-btn '+(!updates?"active":"")+'" data-community-mode="discussion"><span class="room-avatar">'+icon("users")+'</span><span><div class="room-title">Discussion Group</div><div class="room-sub">MEMBER CHAT OPEN</div></span></button>'+
  '<div class="divider"></div><div class="hint">Private messages are limited to member ↔ admin. Members cannot message one another privately.</div></aside>'+
  '<section class="chat-main"><header class="chat-header"><div><div class="panel-title">'+title+'</div><div class="hint">'+desc+'</div></div><span class="tag">'+(updates?"ADMIN ONLY":"ALL MEMBERS")+'</span></header><div class="chat-feed" id="chatFeed">'+empty("Loading messages","The newest messages will appear here.","message")+'</div>'+compose+'</section></div>';
}
async function loadMessages(showToast=true) {
  if(state.page!=="community"||!["updates","discussion"].includes(state.communityMode))return;
  const feed=$("#chatFeed");if(showToast&&feed)feed.innerHTML=empty("Loading messages","Connecting to the shared room.","clock");
  try{
    const mode=state.communityMode==="updates"?"updates":"discussion";
    const {data,error}=await supabase.from("messages").select("*").eq("channel",mode).order("created_at",{ascending:true}).limit(120);
    if(error)throw error;
    state.messages=data||[];
    const node=$("#chatFeed");if(!node)return;
    node.innerHTML=state.messages.length?state.messages.map(m=>{
      const p=profileBy(m.user_id),atts=Array.isArray(m.attachments)?m.attachments:[];
      return '<article class="message '+(m.user_id===state.user.id?"mine":"")+'"><div class="message-name">'+esc(p?.display_name||"Member")+(p?.role==="admin"?' · ADMIN':'')+'</div><div class="message-body">'+esc(m.body)+'</div>'+(atts.length?'<div class="message-media">'+atts.map(a=>{
        if(isImage(a.type))return '<img data-media-path="'+esc(a.path)+'" alt="'+esc(a.name)+'">';
        if(isVideo(a.type))return '<video controls playsinline data-media-path="'+esc(a.path)+'"></video>';
        if(isAudio(a.type))return '<audio controls data-media-path="'+esc(a.path)+'"></audio>';
        return '<span data-media-path="'+esc(a.path)+'" data-file-name="'+esc(a.name)+'" class="tag">'+icon("file")+' '+esc(a.name)+'</span>';
      }).join("")+'</div>':'')+'<div class="message-time">'+fmtDate(m.created_at,{month:"short",day:"numeric"})+' · '+fmtTime(m.created_at)+(m.edited_at?" · edited":"")+'</div><button class="text-link reply-btn" data-reply-message="'+m.id+'">Reply</button></article>';
    }).join(""):empty("No messages yet","Start the room with a helpful question, chart screenshot or learning note.","message");
    node.scrollTop=node.scrollHeight;hydrateMedia(node);
  }catch(error){if(showToast)showError(error)}
}
function renderInbox() {
  const admins=state.profiles.filter(p=>p.role==="admin");
  const recipients=state.isAdmin?state.profiles.filter(p=>p.id!==state.user.id):admins;
  if(!state.selectedInboxUser&&recipients.length)state.selectedInboxUser=state.isAdmin?recipients[0].id:admins[0]?.id||"";
  const selected=profileBy(state.selectedInboxUser);
  return pageHead("PRIVATE SUPPORT CHANNEL","Admin Inbox","Only the admin can privately contact individual members. Members can privately message the admin, never another member.")+
  '<div class="panel chat-layout"><aside class="chat-rooms"><div class="eyebrow" style="padding:3px 8px 10px">'+(state.isAdmin?"MEMBERS":"ADMIN SUPPORT")+'</div>'+(recipients.length?recipients.map(p=>'<button class="room-btn '+(p.id===state.selectedInboxUser?"active":"")+'" data-inbox-user="'+p.id+'"><span class="avatar">'+esc(initials(p.display_name))+'</span><span><div class="room-title">'+esc(p.display_name)+'</div><div class="room-sub">'+(p.role==="admin"?"NEXOVENTIA ADMIN":"MEMBER")+'</div></span></button>').join(""):empty("No admin registered","The owner account has not been activated yet.","lock"))+'</aside><section class="chat-main"><header class="chat-header"><div><div class="panel-title">'+esc(selected?.display_name||"Admin support")+'</div><div class="hint">Private one-to-one conversation</div></div><span class="tag">ADMIN ROUTED</span></header><div class="chat-feed" id="inboxFeed">'+empty("Loading messages","Private conversation will appear here.","message")+'</div><div class="chat-compose"><textarea id="inboxText" placeholder="Write a private message to the admin…"></textarea><button class="btn-primary" id="sendPrivate">'+icon("send")+'</button></div></section></div>';
}
async function loadInbox(showToast=true) {
  const feed=$("#inboxFeed");if(!feed)return;
  try{
    const other=state.selectedInboxUser;
    if(!other){feed.innerHTML=empty("Admin account is not set up","The Nexoventia owner needs to activate their account before private support can start.","lock");return;}
    const {data,error}=await supabase.from("private_messages").select("*").or("and(sender_id.eq."+state.user.id+",recipient_id.eq."+other+"),and(sender_id.eq."+other+",recipient_id.eq."+state.user.id+")").order("created_at",{ascending:true}).limit(120);
    if(error)throw error;
    state.inboxMessages=data||[];
    feed.innerHTML=state.inboxMessages.length?state.inboxMessages.map(m=>'<article class="message '+(m.sender_id===state.user.id?"mine":"")+'"><div class="message-name">'+esc(profileBy(m.sender_id)?.display_name||"Member")+'</div><div class="message-body">'+esc(m.body)+'</div><div class="message-time">'+fmtDate(m.created_at,{month:"short",day:"numeric"})+' · '+fmtTime(m.created_at)+'</div></article>').join(""):empty("No private messages yet","Use this channel to contact the Nexoventia admin.","message");
    feed.scrollTop=feed.scrollHeight;
    const unread=state.inboxMessages.filter(m=>m.recipient_id===state.user.id&&!m.read_at);
    for(const m of unread)await supabase.from("private_messages").update({read_at:new Date().toISOString()}).eq("id",m.id);
  }catch(error){if(showToast)showError(error)}
}
function renderNotifications() {
  return pageHead("ALERT CENTRE","Notifications","Security notices and shared workspace alerts.")+
  (state.notifications.length?'<div class="grid">'+state.notifications.map(n=>'<div class="panel panel-pad"><div class="signal-head"><div><div class="panel-title">'+esc(n.title)+'</div><p class="panel-sub">'+esc(n.body)+'</p><div class="hint" style="margin-top:9px">'+fmtDate(n.created_at,{dateStyle:"medium"})+' · '+fmtTime(n.created_at)+'</div></div><span class="tag '+(n.read_at?"":"pending")+'">'+(n.read_at?"READ":"NEW")+'</span></div></div>').join("")+'</div>':empty("You are all caught up","New signal posts, admin updates and security alerts will appear here.","bell"));
}
async function markNotificationsSeen() {
  const unread=state.notifications.filter(n=>!n.read_at);
  for(const n of unread)await supabase.from("notifications").update({read_at:new Date().toISOString()}).eq("id",n.id);
  if(unread.length){state.notifications=state.notifications.map(n=>({...n,read_at:n.read_at||new Date().toISOString()}));}
}
function renderAnalytics() {
  const s=rangeStats(state.activePeriod);
  const active=state.days.filter(d=>!d.is_rest_day).length;
  const completed=state.closes.length;
  const sorted=[...state.closes].sort((a,b)=>a.day_no-b.day_no);
  let best=null,worst=null;
  const pnl=pnlRows();
  pnl.filter(r=>r.net_result!=null).forEach(r=>{if(!best||r.net_result>best.net_result)best=r;if(!worst||r.net_result<worst.net_result)worst=r});
  return pageHead("PERFORMANCE INTELLIGENCE","Analytics","Historical records only. Win rate is calculated from recorded wins and losses; it is not a predictive accuracy score.")+
  '<div class="section-row" style="margin-top:0"><div><h3>Choose reporting window</h3><p>Daily, weekly, rolling 15-day and lifetime views</p></div>'+periodTabs(state.activePeriod)+'</div>'+
  '<div class="grid grid-4">'+metric("Net recorded P/L",money(s.net),"For selected window","trend",s.net>=0?"positive":"negative")+
  metric("Withdrawals",money(s.wd),s.wRows.length+" receipt(s)","wallet")+
  metric("Win / Loss",s.wins+" / "+s.losses,"Refunds: "+s.refunds,"activity")+
  metric("Win rate",s.accuracy.toFixed(1)+"%","Wins ÷ (wins + losses)","chart","violet")+'</div>'+
  '<div class="grid grid-2" style="margin-top:15px"><div class="panel panel-pad"><div class="section-row" style="margin:0 0 6px"><div><h3>Actual balance history</h3><p>Each mark comes from an admin day-close entry</p></div></div>'+chartSvg(sorted)+'</div><div class="panel panel-pad"><h3 class="panel-title">Challenge completion</h3><p class="panel-sub">28 active days; three rest days are not counted as missed closes.</p><div class="metric-value">'+completed+' / '+active+'</div><div class="progress-track"><div class="progress-fill" style="width:'+(completed/active*100)+'%"></div></div><div class="divider"></div><div class="grid grid-2"><div><div class="mono">BEST RECORDED DAY</div><div style="font-weight:800;margin-top:8px">'+(best?"Day "+best.day_no+" · "+money(best.net_result):"—")+'</div></div><div><div class="mono">LOWEST RECORDED DAY</div><div style="font-weight:800;margin-top:8px">'+(worst?"Day "+worst.day_no+" · "+money(worst.net_result):"—")+'</div></div></div></div></div>'+
  '<div class="section-row"><div><h3>Daily P/L breakdown</h3><p>Opening balance + net result − withdrawal = closing balance</p></div></div>'+
  (s.pRows.length?'<div class="panel table-scroll"><table class="data-table"><thead><tr><th>DAY</th><th>OPENING</th><th>WITHDRAWN</th><th>NET RESULT</th><th>CLOSING</th></tr></thead><tbody>'+s.pRows.map(r=>'<tr><td>Day '+r.day_no+'</td><td>'+money(r.opening_balance)+'</td><td>'+money(r.withdrawn)+'</td><td class="'+(r.net_result>=0?"positive":"negative")+'">'+money(r.net_result)+'</td><td>'+money(r.closing_balance)+'</td></tr>').join("")+'</tbody></table></div>':empty("No closing records","Analytics will populate as the admin closes each day.","chart"))+
  '<div class="alert info" style="margin-top:15px">A missing active-day close makes the next opening balance unknown. That day’s P/L stays blank until the owner records a verified close; no result is inferred from the target.</div>';
}
function renderAdmin() {
  if(!state.isAdmin)return empty("Admin only","This control room is restricted to the Nexoventia owner.","lock");
  const online=state.presence.filter(p=>p.is_online&&Date.now()-new Date(p.last_seen).getTime()<120000);
  const next=getNextSessionMs();
  const userRows=state.profiles.filter(p=>p.id!==state.user.id);
  const currentOpen=state.days.find(d=>d.calendar_date===localDate());
  return pageHead("OWNER ACCESS · PRIVATE","Admin Control","Publish shared records, close the day, manage the countdown and see online members.")+
  '<div class="grid grid-3">'+metric("Registered accounts",state.profiles.length,"Visible to the owner only","users")+
  metric("Currently online",online.length,"Presence updated while the app is open","activity","positive")+
  metric("Total withdrawals",money(state.withdrawals.reduce((s,w)=>s+Number(w.amount),0)),state.withdrawals.length+" receipt records","wallet")+'</div>'+
  '<div class="grid grid-3" style="margin-top:15px"><section class="panel panel-pad"><div class="eyebrow">STARTING BALANCE</div><h3 class="panel-title" style="margin:10px 0">Set the initial account amount</h3><p class="panel-sub">This is the Day 1 opening reference used only for recorded P/L calculations.</p><form id="startingBalanceForm" class="form-grid" style="margin-top:12px"><div class="field"><label>STARTING BALANCE (USD)</label><input name="amount" type="number" min="0" step=".01" required value="'+esc(state.appState.starting_balance ?? 10)+'"></div><div class="field" style="align-self:end"><button class="btn-primary" type="submit">Save baseline</button></div></form></section><section class="panel panel-pad"><div class="eyebrow">NEXT SIGNAL SESSION</div><div class="countdown" id="countdownLarge" style="font-size:36px;margin:15px 0">'+countdownText(next)+'</div><div class="hint">'+(next?"All members can see this shared countdown.":"No next session countdown has been set.")+'</div><form id="sessionForm" class="form-grid" style="margin-top:15px"><div class="field"><label>START IN (MINUTES)</label><input name="minutes" type="number" min="1" max="10080" required placeholder="e.g. 30"></div><div class="field" style="align-self:end"><button class="btn-primary" type="submit">Set shared countdown</button></div></form><button class="btn-subtle btn-small" id="clearCountdown" style="margin-top:9px">Clear countdown</button></section>'+
  '<section class="panel panel-pad"><div class="eyebrow">DAY CLOSE · '+(currentOpen?"DAY "+currentOpen.day_no:"CALENDAR")+'</div><h3 class="panel-title" style="margin:10px 0">Record actual closing balance</h3><p class="panel-sub">Enter the remaining account balance only. The next day carries this recorded close forward automatically.</p><button class="btn-primary" data-close-day="'+(currentOpen?.day_no||1)+'" style="margin-top:16px">Open day-close form</button><div class="divider"></div><div class="hint">Actual balance is never overwritten by the planned target. Corrections are preserved in the audit log.</div></section></div>'+
  '<div class="section-row"><div><h3>Quick publishing tools</h3><p>All signal actions are recorded in the shared archive</p></div></div><div class="inline-actions"><button class="btn-primary" data-new-feed="official">Publish official signal</button><button class="btn-subtle" data-new-feed="demo">Publish demo signal</button><button class="btn-subtle" data-action="new-withdrawal">Add withdrawal receipt</button><button class="btn-subtle" data-action="new-update">Post an update</button></div>'+
  '<div class="grid grid-2" style="margin-top:18px"><section class="panel panel-pad"><div class="section-row" style="margin:0 0 12px"><div><h3>Online members</h3><p>Only the owner can see the online member list</p></div><span class="tag">'+online.length+' ONLINE</span></div>'+(online.length?'<div class="online-list">'+online.map(p=>{const u=profileBy(p.user_id);return '<div class="online-user"><div class="avatar">'+esc(initials(u?.display_name))+'</div><div><strong style="font-size:11px">'+esc(u?.display_name||"Member")+'</strong><small>'+esc(u?.username||"")+' · '+relative(p.last_seen)+'</small></div><i class="online-indicator"></i><button class="btn-small btn-subtle" data-message-user="'+p.user_id+'">Message</button></div>'}).join("")+'</div>':empty("No members online","Online presence is updated when a member has the app open.","users"))+'</section>'+
  '<section class="panel panel-pad"><div class="section-row" style="margin:0 0 12px"><div><h3>Member directory</h3><p>Open a private admin conversation</p></div><span class="tag">'+userRows.length+' MEMBERS</span></div>'+(userRows.length?'<div class="online-list">'+userRows.slice(0,12).map(u=>'<div class="online-user"><div class="avatar">'+esc(initials(u.display_name))+'</div><div><strong style="font-size:11px">'+esc(u.display_name)+'</strong><small>@'+esc(u.username||"member")+'</small></div><button class="btn-small btn-subtle" data-message-user="'+u.id+'">DM</button></div>').join("")+'</div>':empty("No members yet","New accounts will appear here.","users"))+'</section></div>'+
  '<div class="section-row"><div><h3>Audit history</h3><p>Most recent admin changes to signals, withdrawals and day closes</p></div></div>'+
  '<div class="panel table-scroll"><table class="data-table"><thead><tr><th>WHEN</th><th>RECORD</th><th>ACTION</th><th>ACTOR</th></tr></thead><tbody id="auditRows"><tr><td colspan="4">Loading audit history…</td></tr></tbody></table></div>'+
  '<div class="alert info" style="margin-top:16px">Admin security: never share the owner login. Supabase policies enforce these controls on the database; hiding buttons in the interface is not the only protection.</div>';
}
async function loadAudit() {
  const el=$("#auditRows");if(!el||!state.isAdmin)return;
  const {data,error}=await supabase.from("activity_logs").select("id,entity,entity_id,action,created_at,actor_id").order("created_at",{ascending:false}).limit(30);
  if(error){el.innerHTML='<tr><td colspan="4">Audit history unavailable.</td></tr>';return;}
  el.innerHTML=data.length?data.map(a=>'<tr><td>'+fmtDate(a.created_at,{month:"short",day:"numeric"})+' '+fmtTime(a.created_at)+'</td><td>'+esc(a.entity)+' #'+esc(a.entity_id)+'</td><td><span class="tag">'+esc(a.action.toUpperCase())+'</span></td><td>'+esc(profileBy(a.actor_id)?.display_name||"Admin")+'</td></tr>').join(""):'<tr><td colspan="4">No audited changes yet.</td></tr>';
}
function renderSettings() {
  const p=state.profile;
  return pageHead("ACCOUNT / PREFERENCES","Settings","Manage your profile, appearance, notifications and account security.")+
  '<div class="grid grid-2"><section class="panel panel-pad"><div class="section-row" style="margin:0 0 15px"><div><h3>Public profile</h3><p>Members see your display name and username</p></div><span class="tag">'+(state.isAdmin?"ADMIN":"MEMBER")+'</span></div><form id="profileForm" class="form-grid"><div class="field full"><label>PROFILE PHOTO</label><input name="avatar" type="file" accept="image/png,image/jpeg,image/webp"></div><div class="field full"><label>DISPLAY NAME</label><input name="display_name" required maxlength="80" value="'+esc(p.display_name)+'"></div><div class="field full"><label>USERNAME</label><input name="username" required minlength="3" maxlength="24" pattern="[A-Za-z0-9_]+" value="'+esc(p.username||"")+'"></div><div class="field full"><label>BIO</label><textarea name="bio" maxlength="240">'+esc(p.bio||"")+'</textarea></div><div class="field full"><button class="btn-primary" type="submit">Save profile</button></div></form></section>'+
  '<section class="panel panel-pad"><h3 class="panel-title">Appearance</h3><p class="panel-sub">Choose the workspace theme for this device.</p><div class="inline-actions" style="margin-top:16px"><button class="btn-subtle" data-theme="dark">Dark terminal</button><button class="btn-subtle" data-theme="light">Light studio</button></div><div class="divider"></div><h3 class="panel-title">Notifications</h3><p class="panel-sub">Allow browser notifications while this browser is available. Offline push requires extra server configuration.</p><button class="btn-primary btn-small" id="enableNotifications" style="margin-top:12px">Enable browser notifications</button><div class="divider"></div><h3 class="panel-title">Install app</h3><p class="panel-sub">Add Nexoventia to your Android home screen or desktop app launcher.</p><button class="btn-subtle btn-small" id="installPwa" style="margin-top:12px">Install Nexoventia</button></section></div>'+
  '<div class="grid grid-2" style="margin-top:15px"><section class="panel panel-pad"><h3 class="panel-title">Password</h3><p class="panel-sub">Use a strong, unique password for your account.</p><form id="passwordForm" class="form-grid" style="margin-top:15px"><div class="field full"><label>NEW PASSWORD</label><input name="password" type="password" minlength="8" required placeholder="At least 8 characters"></div><div class="field full"><button class="btn-subtle" type="submit">Update password</button></div></form></section>'+
  '<section class="panel panel-pad"><h3 class="panel-title">Two-factor authentication</h3><p class="panel-sub">Use an authenticator app for an additional sign-in challenge, where Supabase MFA is enabled for this project.</p><div id="mfaArea" style="margin-top:14px">'+(state.mfaFactors.length?'<span class="tag done">TOTP MFA ACTIVE · '+state.mfaFactors.length+' DEVICE(S)</span><p class="hint" style="margin:10px 0">Keep at least two verified authenticator devices registered separately. Supabase supports multiple TOTP factors; it does not provide recovery-code APIs.</p><div class="inline-actions"><button class="btn-subtle btn-small" id="startMfa">Add backup authenticator</button></div>':'<button class="btn-subtle btn-small" id="startMfa">Set up authenticator</button>')+'</div></section></div>'+
  '<section class="panel panel-pad" style="margin-top:15px"><div class="signal-head"><div><h3 class="panel-title">Session & privacy</h3><p class="panel-sub">Your account uses Supabase Auth. Public clients never receive database service-role credentials.</p></div><button class="btn-danger btn-small" id="signOut">'+icon("logout")+' Sign out</button></div><div class="divider"></div><div class="grid grid-3"><div><div class="mono">ACCOUNT CREATED</div><strong style="display:block;margin-top:8px">'+fmtDate(p.created_at)+'</strong></div><div><div class="mono">LOGIN EMAIL</div><strong style="display:block;margin-top:8px;overflow-wrap:anywhere">'+esc(state.user.email)+'</strong></div><div><div class="mono">ROLE</div><strong style="display:block;margin-top:8px">'+(state.isAdmin?"Owner / Admin":"Member")+'</strong></div></div></section>'+
  '<div class="alert info" style="margin-top:15px">For account deletion or data export, contact the project owner first. Your personal message and session data are protected by row-level security.</div>';
}
let deferredInstall=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;});
function showModal(title,body) {
  const root=$("#modal-root");root.innerHTML='<div class="modal-backdrop" id="modalBackdrop"><div class="modal"><header class="modal-head"><h3>'+esc(title)+'</h3><button class="icon-btn" id="closeModal" aria-label="Close">'+icon("close")+'</button></header>'+body+'</div></div>';
  $("#closeModal").addEventListener("click",closeModal);
  $("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
}
function closeModal() { const r=$("#modal-root");if(r)r.innerHTML=""; }
function closeDayModal(dayNo) {
  const day=state.days.find(d=>d.day_no===Number(dayNo)),existing=closedFor(dayNo);
  if(!day)return;
  showModal("Record Day "+dayNo+" close",'<div class="alert info" style="margin-bottom:15px">Enter the actual amount remaining in the account after any withdrawal recorded for this day. This entry becomes the next day opening balance.</div><form id="closeDayForm" class="form-grid"><input type="hidden" name="day_no" value="'+dayNo+'"><div class="field full"><label>CALENDAR DATE</label><input disabled value="'+fmtDate(day.calendar_date+"T12:00:00Z",{dateStyle:"long"})+'"></div><div class="field full"><label>ACTUAL CLOSING BALANCE (USD)</label><input name="closing_balance" type="number" min="0" step=".01" required value="'+(existing?existing.closing_balance:"")+'" placeholder="Enter the balance you actually see"></div><div class="field full"><label>NOTE (OPTIONAL)</label><textarea name="note" placeholder="Optional day-close note">'+esc(existing?.note||"")+'</textarea></div><div class="field full"><button class="btn-primary" type="submit">Save actual day close</button></div></form>');
  $("#closeDayForm").addEventListener("submit",async e=>{
    e.preventDefault();const fd=new FormData(e.currentTarget),amount=Number(fd.get("closing_balance"));
    if(!Number.isFinite(amount)||amount<0){toast("Enter a valid non-negative balance.","error");return}
    const btn=e.currentTarget.querySelector("button");btn.disabled=true;
    try{
      const payload={day_no:Number(dayNo),closing_balance:amount,note:String(fd.get("note")||""),closed_by:state.user.id,closed_at:new Date().toISOString(),updated_at:new Date().toISOString()};
      const {error}=await supabase.from("day_closes").upsert(payload,{onConflict:"day_no"});if(error)throw error;
      closeModal();toast("Day "+dayNo+" close saved.");await loadData();
    }catch(err){showError(err);btn.disabled=false}
  });
}
function signalModal(feed) {
  const title=feed==="official"?"Publish Official Signal":"Publish Demo Signal";
  const dayOptions=state.days.map(d=>'<option value="'+d.day_no+'" '+(d.calendar_date===localDate()?"selected":"")+'>'+d.day_no+" · "+fmtDate(d.calendar_date+"T12:00:00Z",{month:"short",day:"numeric"})+(d.is_rest_day?" · REST":"")+'</option>').join("");
  showModal(title,'<div class="alert info" style="margin-bottom:14px">This creates an educational record only. It does not submit a trade to Quotex or verify market prices.</div><form id="signalForm" class="form-grid"><div class="field"><label>ASSET / PAIR</label><input name="pair" required maxlength="32" placeholder="EUR/USD"></div><div class="field"><label>TIMEFRAME</label><select name="timeframe"><option>1m</option><option>30s</option><option>2m</option><option>3m</option><option>5m</option><option>15m</option><option>1h</option></select></div><div class="field"><label>DIRECTION</label><select name="direction"><option value="UP">UP</option><option value="DOWN">DOWN</option></select></div><div class="field"><label>DEMO ENTRY AMOUNT (USD)</label><input name="amount" type="number" min=".01" step=".01" required placeholder="5.00"></div><div class="field"><label>EXPIRY AFTER (MINUTES)</label><input name="expiry" type="number" min="1" max="240" required value="1"></div><div class="field"><label>CHALLENGE DAY</label><select name="day_no"><option value="">Not linked</option>'+dayOptions+'</select></div><div class="field full"><label>BEFORE SCREENSHOT</label><input name="before" type="file" accept="image/png,image/jpeg,image/webp" required></div><div class="field full"><label>ADMIN NOTE (OPTIONAL)</label><textarea name="note" placeholder="Context / learning explanation"></textarea></div><div class="field full"><button class="btn-primary" type="submit">Publish shared signal record</button></div></form>');
  $("#signalForm").addEventListener("submit",async e=>{
    e.preventDefault();const fd=new FormData(e.currentTarget),btn=e.currentTarget.querySelector("button");
    const pair=String(fd.get("pair")||"").trim().toUpperCase(),amount=Number(fd.get("amount")),expiry=Number(fd.get("expiry")),file=fd.get("before");
    if(!pair||!Number.isFinite(amount)||amount<=0||!Number.isFinite(expiry)||expiry<1||!(file instanceof File)||!file.size){toast("Check the pair, amount, expiry and before screenshot.","error");return}
    btn.disabled=true;btn.textContent="Uploading evidence…";
    try{
      const uploaded=await uploadFile(file,"signals");
      const now=new Date();
      const payload={feed:feed,day_no:fd.get("day_no")?Number(fd.get("day_no")):null,pair,timeframe:String(fd.get("timeframe")),direction:String(fd.get("direction")),amount,issued_at:now.toISOString(),expiry_at:new Date(now.getTime()+expiry*60000).toISOString(),before_path:uploaded.path,outcome:"pending",result_note:String(fd.get("note")||""),issued_by:state.user.id};
      const {error}=await supabase.from("signals").insert(payload);if(error)throw error;
      closeModal();toast("Signal published to all members.");await loadData();
    }catch(err){showError(err);btn.disabled=false;btn.textContent="Publish shared signal record"}
  });
}
function resultModal(id) {
  const s=state.signals.find(x=>x.id===id);if(!s)return;
  if(Date.now()<new Date(s.expiry_at).getTime()){toast("Outcome entry unlocks after expiry.","error");return}
  showModal("Record signal outcome",'<div class="panel panel-pad" style="margin-bottom:15px"><div class="signal-pair">'+esc(s.pair)+' · '+s.direction+'</div><div class="hint">Issued '+fmtDate(s.issued_at)+' · Expired '+fmtTime(s.expiry_at)+'</div></div><form id="resultForm" class="form-grid"><div class="field full"><label>RESULT</label><select name="outcome" required><option value="win">Win</option><option value="loss">Loss</option><option value="refund">Refund</option></select></div><div class="field full"><label>AFTER SCREENSHOT</label><input name="after" type="file" accept="image/png,image/jpeg,image/webp" required></div><div class="field full"><label>RESULT NOTE (OPTIONAL)</label><textarea name="note" placeholder="Short explanation / review"></textarea></div><div class="field full"><button class="btn-primary" type="submit">Save result and after image</button></div></form>');
  $("#resultForm").addEventListener("submit",async e=>{
    e.preventDefault();const fd=new FormData(e.currentTarget),file=fd.get("after"),btn=e.currentTarget.querySelector("button");
    if(!(file instanceof File)||!file.size){toast("Please attach the after screenshot.","error");return}btn.disabled=true;btn.textContent="Saving result…";
    try{
      const media=await uploadFile(file,"signals");
      const {error}=await supabase.from("signals").update({outcome:String(fd.get("outcome")),after_path:media.path,result_note:String(fd.get("note")||""),result_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",id);
      if(error)throw error;closeModal();toast("Signal outcome saved.");await loadData();
    }catch(err){showError(err);btn.disabled=false;btn.textContent="Save result and after image"}
  });
}
function withdrawalModal() {
  const options=state.days.map(d=>'<option value="'+d.day_no+'" '+(d.calendar_date===localDate()?"selected":"")+'>'+d.day_no+" · "+fmtDate(d.calendar_date+"T12:00:00Z",{month:"short",day:"numeric"})+'</option>').join("");
  showModal("Add withdrawal receipt",'<div class="alert info" style="margin-bottom:14px">The date and Pakistan local time are captured automatically. This record is visible to every member and is not editable by members.</div><form id="withdrawForm" class="form-grid"><div class="field"><label>WITHDRAWAL AMOUNT (USD)</label><input name="amount" type="number" min=".01" step=".01" required placeholder="11.00"></div><div class="field"><label>CHALLENGE DAY</label><select name="day_no"><option value="">Not linked</option>'+options+'</select></div><div class="field full"><label>RECEIPT / SCREENSHOT</label><input name="receipt" type="file" accept="image/png,image/jpeg,image/webp"></div><div class="field full"><label>NOTE (OPTIONAL)</label><textarea name="note" placeholder="Optional withdrawal reference"></textarea></div><div class="field full"><button class="btn-primary" type="submit">Save withdrawal</button></div></form>');
  $("#withdrawForm").addEventListener("submit",async e=>{
    e.preventDefault();const fd=new FormData(e.currentTarget),amount=Number(fd.get("amount")),file=fd.get("receipt"),btn=e.currentTarget.querySelector("button");
    if(!Number.isFinite(amount)||amount<=0){toast("Enter a valid withdrawal amount.","error");return}btn.disabled=true;btn.textContent="Saving receipt…";
    try{
      let receipt=null;if(file instanceof File&&file.size)receipt=await uploadFile(file,"withdrawals");
      const {error}=await supabase.from("withdrawals").insert({amount,day_no:fd.get("day_no")?Number(fd.get("day_no")):null,receipt_path:receipt?.path||null,note:String(fd.get("note")||""),created_by:state.user.id});
      if(error)throw error;closeModal();toast("Withdrawal receipt saved.");await loadData();
    }catch(err){showError(err);btn.disabled=false;btn.textContent="Save withdrawal"}
  });
}
function bindPageEvents() {
  $$("[data-page]").forEach(el=>el.addEventListener("click",()=>{state.page=el.dataset.page;render();$("#sidebar")?.classList.remove("open")}));
  $$("[data-period]").forEach(el=>el.addEventListener("click",()=>{state.activePeriod=el.dataset.period;render()}));
  $$("[data-community-mode]").forEach(el=>el.addEventListener("click",()=>{state.communityMode=el.dataset.communityMode;render();loadMessages()}));
  $$("[data-inbox-user]").forEach(el=>el.addEventListener("click",()=>{state.selectedInboxUser=el.dataset.inboxUser;render();loadInbox()}));
  $$("[data-message-user]").forEach(el=>el.addEventListener("click",()=>{state.selectedInboxUser=el.dataset.messageUser;state.page="inbox";render();loadInbox()}));
  $$("[data-close-day]").forEach(el=>el.addEventListener("click",()=>closeDayModal(el.dataset.closeDay)));
  $("[data-new-feed]").forEach(el=>el.addEventListener("click",()=>signalModal(el.dataset.newFeed)));
  $("[data-action=new-update]").forEach(el=>el.addEventListener("click",()=>{state.communityMode="updates";state.page="community";render();loadMessages()}));
  $$("[data-result-signal]").forEach(el=>el.addEventListener("click",()=>resultModal(el.dataset.resultSignal)));
  $$("[data-action='new-signal']").forEach(el=>el.addEventListener("click",()=>signalModal("official")));
  $$("[data-action='new-withdrawal']").forEach(el=>el.addEventListener("click",withdrawalModal));
  $$("[data-action='close-current']").forEach(el=>el.addEventListener("click",()=>closeDayModal(Math.max(1,Math.min(31,pakiDayNo())))));
  $("#mobileMenu")?.addEventListener("click",()=>$("#sidebar")?.classList.toggle("open"));
  $("#globalSearch")?.addEventListener("input",e=>{state.globalSearch=e.target.value;renderGlobalSearchResults()});$("#globalSearch")?.addEventListener("focus",renderGlobalSearchResults);
  $("#startingBalanceForm")?.addEventListener("submit",async e=>{e.preventDefault();const amount=Number(new FormData(e.currentTarget).get("amount"));if(!Number.isFinite(amount)||amount<0){toast("Enter a valid starting balance.","error");return}const {error}=await supabase.from("app_state").upsert({key:"starting_balance",value:amount,updated_by:state.user.id,updated_at:new Date().toISOString()},{onConflict:"key"});if(error)showError(error);else{state.appState.starting_balance=amount;toast("Starting balance baseline updated.");await loadData()}});$("#sessionForm")?.addEventListener("submit",async e=>{
    e.preventDefault();const minutes=Number(new FormData(e.currentTarget).get("minutes"));if(!Number.isFinite(minutes)||minutes<1||minutes>10080){toast("Choose a time between 1 and 10,080 minutes.","error");return}
    const iso=new Date(Date.now()+minutes*60000).toISOString();
    const {error}=await supabase.from("app_state").upsert({key:"next_signal_at",value:JSON.stringify(iso),updated_by:state.user.id,updated_at:new Date().toISOString()},{onConflict:"key"});
    if(error)showError(error);else{state.appState.next_signal_at=iso;toast("Next-session countdown shared with all members.");updateCountdowns()}
  });
  $("#clearCountdown")?.addEventListener("click",async()=>{
    const {error}=await supabase.from("app_state").upsert({key:"next_signal_at",value:null,updated_by:state.user.id,updated_at:new Date().toISOString()},{onConflict:"key"});
    if(error)showError(error);else{state.appState.next_signal_at=null;toast("Countdown cleared.");updateCountdowns()}
  });
  $("#sendMessage")?.addEventListener("click",sendChatMessage);
  $("#chatText")?.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChatMessage()}});
  $("#attachFiles")?.addEventListener("click",()=>$("#chatFiles")?.click());
  $("#chatFiles")?.addEventListener("change",e=>{state.queuedFiles=Array.from(e.target.files||[]);toast(state.queuedFiles.length+" file(s) selected.")});
  $("#recordVoice")?.addEventListener("click",toggleVoiceRecording);
  $$(".reply-btn").forEach(b=>b.addEventListener("click",()=>{state.replyTo=b.dataset.replyMessage;toast("Reply target selected. Type your reply below.");$("#chatText")?.focus()}));
  $("#sendPrivate")?.addEventListener("click",sendPrivateMessage);
  $("#inboxText")?.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendPrivateMessage()}});
  $("#profileForm")?.addEventListener("submit",saveProfile);
  $("#passwordForm")?.addEventListener("submit",savePassword);
  $("#signOut")?.addEventListener("click",async()=>{await touchPresence(false);const {error}=await supabase.auth.signOut();if(error)showError(error);else toast("Signed out.")});
  $$("[data-theme]").forEach(b=>b.addEventListener("click",()=>{state.theme=b.dataset.theme;localStorage.setItem("nx-theme",state.theme);document.body.classList.toggle("light",state.theme==="light");toast("Theme updated.")}));
  $("#enableNotifications")?.addEventListener("click",enableNotifications);
  $("#installPwa")?.addEventListener("click",installPwa);
  $("#startMfa")?.addEventListener("click",startMfa);
  loadAudit();
}
async function sendChatMessage() {
  const input=$("#chatText");if(!input)return;
  const body=input.value.trim(),files=state.queuedFiles;
  if(!body&&!files.length){toast("Write a message or attach a file.","error");return}
  const send=$("#sendMessage");send.disabled=true;
  try{
    const uploaded=[];for(const f of files)uploaded.push(await uploadFile(f,"community"));
    const {error}=await supabase.from("messages").insert({channel:state.communityMode==="updates"?"updates":"discussion",user_id:state.user.id,body,attachments:uploaded,reply_to:state.replyTo});
    if(error)throw error;
    state.queuedFiles=[];state.replyTo=null;input.value="";$("#chatFiles").value="";
    await loadMessages(false);
  }catch(error){showError(error)}finally{if($("#sendMessage"))$("#sendMessage").disabled=false}
}
async function toggleVoiceRecording() {
  const btn=$("#recordVoice");if(!btn)return;
  if(state.recording){state.recording.stop();btn.textContent="Saving voice note…";return}
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){toast("Voice recording is not supported by this browser.","error");return}
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    const recorder=new MediaRecorder(stream);const chunks=[];
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    recorder.onstop=()=>{
      stream.getTracks().forEach(t=>t.stop());state.recording=null;state.recordingStream=null;
      const blob=new Blob(chunks,{type:recorder.mimeType||"audio/webm"});
      state.queuedFiles.push(new File([blob],"voice-note.webm",{type:blob.type}));
      if($("#recordVoice"))$("#recordVoice").innerHTML=icon("mic");
      toast("Voice note added. Press send to share it.");
    };
    recorder.start();state.recording=recorder;state.recordingStream=stream;btn.textContent="Stop recording";
  }catch(error){showError(error)}
}
async function sendPrivateMessage() {
  const input=$("#inboxText"),other=state.selectedInboxUser;
  if(!input||!other)return;
  const body=input.value.trim();if(!body){toast("Write a private message first.","error");return}
  const btn=$("#sendPrivate");btn.disabled=true;
  try{
    const {error}=await supabase.from("private_messages").insert({sender_id:state.user.id,recipient_id:other,body});
    if(error)throw error;input.value="";await loadInbox(false);
  }catch(error){showError(error)}finally{if($("#sendPrivate"))$("#sendPrivate").disabled=false}
}
async function saveProfile(e) {
  e.preventDefault();const fd=new FormData(e.currentTarget),btn=e.currentTarget.querySelector("button");btn.disabled=true;
  try{
    let avatar=state.profile.avatar_path;const file=fd.get("avatar");
    if(file instanceof File&&file.size){if(!file.type.startsWith("image/"))throw new Error("Choose a profile image.");avatar=(await uploadFile(file,"avatars")).path;}
    const display_name=String(fd.get("display_name")||"").trim(),username=String(fd.get("username")||"").trim().toLowerCase(),bio=String(fd.get("bio")||"").trim();
    const {error}=await supabase.from("profiles").update({display_name,username,bio,avatar_path:avatar,updated_at:new Date().toISOString()}).eq("id",state.user.id);
    if(error)throw error;toast("Profile updated.");await loadData();
  }catch(err){showError(err)}finally{btn.disabled=false}
}
async function savePassword(e) {
  e.preventDefault();const pass=new FormData(e.currentTarget).get("password");
  if(String(pass).length<8){toast("Use at least 8 characters.","error");return}
  const {error}=await supabase.auth.updateUser({password:String(pass)});
  if(error)showError(error);else{e.currentTarget.reset();toast("Password updated.")}
}
async function enableNotifications() {
  if(!("Notification"in window)){toast("This browser does not support notifications.","error");return}
  const result=await Notification.requestPermission();
  if(result==="granted"){localStorage.setItem("nx-notifications","yes");toast("Browser notifications enabled while the browser is available.")}
  else toast("Notification permission was not granted.","error");
}
async function installPwa() {
  if(deferredInstall){deferredInstall.prompt();const choice=await deferredInstall.userChoice;deferredInstall=null;toast(choice.outcome==="accepted"?"Install started.":"Install cancelled.");return}
  toast("In Chrome, open the browser menu and choose Install app or Add to Home screen.");
}
async function startMfa() {
  const area=$("#mfaArea");if(!area)return;
  try{
    const label=state.mfaFactors.length===0?"Nexoventia Primary":("Nexoventia Backup "+(state.mfaFactors.length));
    const {data,error}=await supabase.auth.mfa.enroll({factorType:"totp",friendlyName:label});
    if(error)throw error;
    state.mfaFactor=data.id;state.mfaQr=data.totp.qr_code;state.mfaSecret=data.totp.secret;
    area.innerHTML='<div class="alert info">Scan this code in an authenticator app, then enter the six-digit code to verify.</div><img style="width:170px;height:170px;background:white;padding:8px;border-radius:12px;margin:12px 0" src="data:image/svg+xml;utf8,'+encodeURIComponent(data.totp.qr_code)+'" alt="Authenticator QR code"><div class="hint">Manual key: '+esc(data.totp.secret)+'</div><form id="mfaVerify" class="form-grid" style="margin-top:12px"><div class="field"><label>6-DIGIT CODE</label><input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required></div><div class="field" style="align-self:end"><button class="btn-primary" type="submit">Verify authenticator</button></div></form>';
    $("#mfaVerify").addEventListener("submit",async e=>{
      e.preventDefault();const code=String(new FormData(e.currentTarget).get("code")||"");
      const {data:ch,error:chError}=await supabase.auth.mfa.challenge({factorId:state.mfaFactor});if(chError)throw chError;
      const {error:verifyError}=await supabase.auth.mfa.verify({factorId:state.mfaFactor,challengeId:ch.id,code});if(verifyError)throw verifyError;
      const {data:factors,error:factorError}=await supabase.auth.mfa.listFactors();
      if(factorError)throw factorError;
      state.mfaFactors=(factors?.totp||[]).filter(f=>f.status==="verified");
      toast("Authenticator verified. Add a second device as a backup.");
      area.innerHTML='<span class="tag done">TOTP MFA ACTIVE · '+state.mfaFactors.length+' DEVICE(S)</span><p class="hint" style="margin:10px 0">This authenticator is verified. Register a second device and keep it separate as a backup.</p><div class="inline-actions"><button class="btn-subtle btn-small" id="addBackupMfa">Add backup authenticator</button></div>';
      $("#addBackupMfa")?.addEventListener("click",startMfa);
    });
  }catch(error){showError(error);area.innerHTML='<button class="btn-subtle btn-small" id="startMfa">Retry authenticator setup</button>';$("#startMfa")?.addEventListener("click",startMfa)}
}
async function boot() {
  if("serviceWorker"in navigator){navigator.serviceWorker.register("./sw.js").catch(e=>console.warn("PWA service worker failed",e));}
  const {data,error}=await supabase.auth.getSession();
  if(error){showError(error);state.loading=false;renderAuth();return}
  if(data.session)await authChanged(data.session);else{state.loading=false;renderAuth();}
}
boot();
